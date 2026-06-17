"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, CheckCircle2, XCircle, QrCode, ArrowLeft, CameraOff } from "lucide-react";
import Link from "next/link";

// Extract the attendance token from raw scanned text. The QR encodes the raw
// token (e.g. "evt-abc123"), but we also tolerate a full URL with ?token=.
function parseToken(raw: string): string {
  const text = raw.trim();
  try {
    const url = new URL(text);
    const t = url.searchParams.get("token");
    if (t) return t;
  } catch {
    // not a URL — fall through
  }
  return text;
}

export default function AttendanceScannerPage() {
  const [lastScan, setLastScan] = useState<{ success: boolean; message: string; eventTitle?: string } | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lockRef = useRef(false); // prevents duplicate submits from rapid frames

  const markAttendance = useCallback(async (token: string) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark attendance");
      }

      setLastScan({ success: true, message: data.message, eventTitle: data.eventTitle });
      toast({ title: "Attendance Marked!", description: data.message });
      return true;
    } catch (error: any) {
      setLastScan({ success: false, message: error.message });
      toast({ title: "Scan Failed", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    const BarcodeDetectorClass = (typeof window !== "undefined" && (window as any).BarcodeDetector) || null;
    if (!BarcodeDetectorClass) {
      setCameraError("Your browser doesn't support in-page QR scanning. Please enter the code manually below.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access isn't available on this device. Please enter the code manually below.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new BarcodeDetectorClass({ formats: ["qr_code"] });
      lockRef.current = false;

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0 && !lockRef.current) {
            lockRef.current = true;
            const token = parseToken(codes[0].rawValue || "");
            stopCamera();
            if (token) await markAttendance(token);
            return;
          }
        } catch {
          // transient detect errors are safe to ignore between frames
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setCameraError(
        e?.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access or enter the code manually."
          : "Could not start the camera. Please enter the code manually below."
      );
      stopCamera();
    }
  }, [markAttendance, stopCamera]);

  // Clean up the camera when leaving the page
  useEffect(() => stopCamera, [stopCamera]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    const ok = await markAttendance(parseToken(manualToken));
    if (ok) setManualToken("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/member">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Event Attendance</h1>
          <p className="text-sm text-pewter">Scan the QR code at an event to mark your attendance</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl w-full">
        {/* Scan Result */}
        {lastScan && (
          <Card className={`mb-6 ${lastScan.success ? "border-green-500/30" : "border-red-500/30"}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {lastScan.success ? (
                  <CheckCircle2 className="h-10 w-10 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${lastScan.success ? "text-green-700" : "text-red-700"}`}>
                    {lastScan.success ? "Success!" : "Failed"}
                  </h3>
                  <p className="text-sm text-charcoal mb-2">{lastScan.message}</p>
                  {lastScan.eventTitle && (
                    <Badge variant="outline" className="text-xs">{lastScan.eventTitle}</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setLastScan(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Camera Scanner */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-rotary-blue" />
              Scan with Camera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black/90">
              <video
                ref={videoRef}
                className={`h-full w-full object-cover ${scanning ? "block" : "hidden"}`}
                playsInline
                muted
              />
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
                  <QrCode className="h-12 w-12 mb-2" />
                  <p className="text-sm">Camera is off</p>
                </div>
              )}
              {scanning && (
                <div className="pointer-events-none absolute inset-8 rounded-lg border-2 border-rotary-gold/80" />
              )}
            </div>

            {cameraError && (
              <p className="text-sm text-red-600 text-center">{cameraError}</p>
            )}

            <div className="flex justify-center">
              {!scanning ? (
                <Button onClick={startCamera} className="bg-rotary-blue hover:bg-rotary-blue/90" disabled={submitting}>
                  <Camera className="mr-2 h-4 w-4" /> Start Camera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline">
                  <CameraOff className="mr-2 h-4 w-4" /> Stop Camera
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-rotary-blue" />
              Enter Event Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-charcoal mb-2">
                  Enter the QR code token shown at the event
                </label>
                <input
                  id="token"
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="e.g., evt-abc123-def456"
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
                />
              </div>
              <Button type="submit" className="w-full bg-rotary-blue hover:bg-rotary-blue/90" disabled={!manualToken.trim() || submitting}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Attendance
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: "1", title: "Find the QR Code", desc: "Look for the event QR code displayed at the venue or shared by the organizer" },
                { step: "2", title: "Scan or Enter Code", desc: "Tap Start Camera and point at the QR code, or enter the token manually" },
                { step: "3", title: "Attendance Marked", desc: "Your attendance is recorded instantly. You'll see a confirmation message" },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-rotary-blue text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal text-sm">{item.title}</h4>
                    <p className="text-xs text-pewter">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
