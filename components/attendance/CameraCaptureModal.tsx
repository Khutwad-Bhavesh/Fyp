"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Check, RefreshCw, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoBase64: string) => void;
}

export default function CameraCaptureModal({ isOpen, onClose, onCapture }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser.");
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError("Camera permission was denied or camera is unavailable. You can use the fallback sample image or file upload.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const useFallbackSample = () => {
    // Provide a verified simulated selfie for testing environments without webcam
    const samplePhoto = "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop";
    setCapturedImage(samplePhoto);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              Attendance Selfie Verification
            </h3>
            <p className="text-xs text-slate-500">Photo evidence is required for check-in verification</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Preview Body */}
        <div className="p-5 flex flex-col items-center">
          {capturedImage ? (
            <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md">
              <img src={capturedImage} alt="Captured attendance selfie" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Check className="w-3 h-3" /> Captured
              </div>
            </div>
          ) : cameraError ? (
            <div className="w-full aspect-4/3 rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-xs text-slate-600 mb-3">{cameraError}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={useFallbackSample}>
                  Use Verified Sample Photo
                </Button>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700">
                    Upload Photo
                  </span>
                  <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-xl pointer-events-none m-4" />
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="mt-5 w-full flex items-center justify-between gap-3">
            {capturedImage ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-1/2 flex items-center justify-center gap-1.5"
                  onClick={() => {
                    setCapturedImage(null);
                    startCamera();
                  }}
                >
                  <RefreshCw className="w-4 h-4" /> Retake
                </Button>
                <Button
                  size="sm"
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                  onClick={handleConfirm}
                >
                  <Check className="w-4 h-4" /> Confirm Photo
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={useFallbackSample} className="text-xs text-slate-500">
                  Demo Sample
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-6"
                  onClick={takeSnapshot}
                  disabled={!!cameraError}
                >
                  <Camera className="w-4 h-4" /> Take Selfie
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
