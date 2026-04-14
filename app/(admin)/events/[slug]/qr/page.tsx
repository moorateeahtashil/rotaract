"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, QrCode, Copy, Download, RefreshCw, Check } from "lucide-react";
import Link from "next/link";

export default function AdminQRCodePage({ params }: { params: Promise<{ slug: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);
  const [qrCode, setQrCode] = useState<{ token: string; qr_data: string; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);

  // Resolve params once
  useState(() => {
    params.then(p => setResolvedParams(p));
  });

  const eventSlug = resolvedParams?.slug || "";

  const generateQR = async () => {
    if (!eventSlug) return;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug, expiryHours }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setQrCode(data);
    } catch (error: any) {
      console.error("Failed to generate QR:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/events">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-charcoal">QR Code for Event</h1>
              <p className="text-sm text-pewter">Generate and manage QR codes for attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Generate New QR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-rotary-blue" />
                Generate QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  QR Code Expires After (hours)
                </label>
                <input
                  type="number"
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(Number(e.target.value))}
                  min="1"
                  max="168"
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
                />
                <p className="text-xs text-pewter mt-1">Members must scan within this time period</p>
              </div>

              <Button onClick={generateQR} disabled={loading} className="bg-rotary-blue hover:bg-rotary-blue/90">
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <QrCode className="mr-2 h-4 w-4" />
                )}
                {loading ? "Generating..." : "Generate QR Code"}
              </Button>
            </CardContent>
          </Card>

          {/* QR Code Display */}
          {qrCode && (
            <>
              <Card className="border-rotary-blue/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="font-bold text-charcoal mb-2">Event QR Code</h3>
                    <p className="text-sm text-pewter mb-6">Display this QR code at the event entrance for members to scan</p>

                    {/* QR Code Display */}
                    <div className="bg-white p-8 rounded-lg inline-block border-4 border-rotary-blue mb-6">
                      <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
                        <QrCode className="h-32 w-32 text-rotary-blue" />
                      </div>
                    </div>

                    {/* Token */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-xs text-pewter mb-2">Manual Entry Token (for members who can't scan)</p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="text-sm font-mono bg-white px-3 py-2 rounded border border-border">
                          {qrCode.token}
                        </code>
                        <Button variant="ghost" size="sm" onClick={copyToken}>
                          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button variant="outline" onClick={copyToken}>
                        <Copy className="mr-2 h-4 w-4" /> Copy Token
                      </Button>
                      <Button variant="outline" onClick={generateQR}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Use</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Display this QR code at the event entrance or share it with attendees",
                    "Members will scan it using their member portal at /member/attendance",
                    "They can also manually enter the token if scanning fails",
                    "Each member can only mark attendance once per event",
                    "View attendance records in the Admin → Events section",
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-rotary-blue text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {i + 1}
                      </div>
                      <p className="text-sm text-charcoal">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
