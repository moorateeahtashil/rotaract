"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, CameraOff, QrCode, CheckCircle2, XCircle } from "lucide-react";

// Pull the token out of a scanned string (raw token, or a URL with ?token=).
function parseToken(raw: string): string {
  const text = (raw || "").trim();
  try {
    const u = new URL(text);
    const t = u.searchParams.get("token");
    if (t) return t;
  } catch { /* not a URL */ }
  return text;
}

// Compact "check in to an event" widget for the member dashboard.
export function QuickScan() {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState("");
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lockRef = useRef(false);

  const submit = useCallback(async (token: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not check in");
      setResult({ ok: true, msg: data.message });
      toast({ variant: "success", title: "Checked in!", description: data.message });
      return true;
    } catch (e: any) {
      setResult({ ok: false, msg: e.message });
      toast({ variant: "destructive", title: "Check-in failed", description: e.message });
      return false;
    } finally { setBusy(false); }
  }, [toast]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  const start = useCallback(async () => {
    setCameraError(null); setResult(null);
    const Detector = (typeof window !== "undefined" && (window as any).BarcodeDetector) || null;
    if (!Detector) { setCameraError("Your browser can't scan in-page — use the code box below."); return; }
    if (!navigator.mediaDevices?.getUserMedia) { setCameraError("No camera available — use the code box below."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      const detector = new Detector({ formats: ["qr_code"] });
      lockRef.current = false;
      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes?.length && !lockRef.current) {
            lockRef.current = true;
            const token = parseToken(codes[0].rawValue || "");
            stop();
            if (token) await submit(token);
            return;
          }
        } catch { /* ignore between-frame errors */ }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setCameraError(e?.name === "NotAllowedError" ? "Camera permission denied — use the code box below." : "Couldn't start the camera.");
      stop();
    }
  }, [stop, submit]);

  useEffect(() => stop, [stop]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <QrCode className="h-5 w-5 text-rotary-blue" /> Check in to an event
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {result && (
          <div className={`flex items-center gap-2 text-sm rounded-lg p-2 ${result.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {result.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <span>{result.msg}</span>
          </div>
        )}

        <div className={`relative w-full max-w-xs mx-auto aspect-square rounded-xl overflow-hidden bg-black/90 ${scanning ? "" : "hidden"}`}>
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          <div className="pointer-events-none absolute inset-6 rounded-lg border-2 border-rotary-gold/80" />
        </div>

        {cameraError && <p className="text-xs text-red-600">{cameraError}</p>}

        <div className="flex flex-wrap items-center gap-2">
          {!scanning ? (
            <Button size="sm" onClick={start} disabled={busy} className="bg-rotary-blue hover:bg-rotary-blue/90">
              <Camera className="h-4 w-4 mr-1.5" /> Scan QR
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={stop}><CameraOff className="h-4 w-4 mr-1.5" /> Stop</Button>
          )}
          <form
            className="flex items-center gap-2 flex-1 min-w-[200px]"
            onSubmit={(e) => { e.preventDefault(); if (manual.trim()) submit(parseToken(manual)).then((ok) => ok && setManual("")); }}
          >
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="or enter event code"
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30"
            />
            <Button size="sm" type="submit" variant="outline" disabled={!manual.trim() || busy}>Go</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
