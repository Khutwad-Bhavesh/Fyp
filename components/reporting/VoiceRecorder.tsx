"use client";

import React, { useState } from "react";
import { Mic, MicOff, Volume2, RotateCcw, Check, Sparkles } from "lucide-react";
import { useSpeechToText } from "@/src/hooks/useSpeechToText";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onTranscriptReady: (transcript: string) => void;
  initialTranscript?: string;
}

export default function VoiceRecorder({ onTranscriptReady, initialTranscript = "" }: VoiceRecorderProps) {
  const [lang, setLang] = useState("en-IN");
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechToText({ language: lang });

  const handleApply = () => {
    const fullText = (transcript + " " + interimTranscript).trim();
    if (fullText) {
      onTranscriptReady(fullText);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-emerald-100 text-emerald-700"}`}>
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-xs text-slate-800">Voice-to-Text Reporting</span>
            <p className="text-[10px] text-slate-500">Speak your daily report instead of manual typing</p>
          </div>
        </div>

        {/* Language selector */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          disabled={isListening}
          className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 focus:outline-emerald-500"
        >
          <option value="en-IN">English (India)</option>
          <option value="hi-IN">Hindi (हिंदी)</option>
          <option value="mr-IN">Marathi (मराठी)</option>
        </select>
      </div>

      {/* Transcript Box */}
      <div className="min-h-[70px] p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
        {transcript || interimTranscript ? (
          <div>
            <span>{transcript}</span>
            <span className="text-emerald-600 font-medium italic"> {interimTranscript}</span>
          </div>
        ) : (
          <span className="text-slate-400 italic">
            {isListening
              ? "Listening... Speak clearly about waste quantity, machine operation, or site status."
              : "Click the microphone button below to start voice reporting."}
          </span>
        )}
      </div>

      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

      {/* Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {isListening ? (
            <Button
              size="sm"
              variant="destructive"
              className="text-xs h-8 flex items-center gap-1.5 bg-red-600 hover:bg-red-700"
              onClick={stopListening}
            >
              <MicOff className="w-3.5 h-3.5" /> Stop Recording
            </Button>
          ) : (
            <Button
              size="sm"
              className="text-xs h-8 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={startListening}
            >
              <Mic className="w-3.5 h-3.5" /> Start Speaking
            </Button>
          )}

          {(transcript || interimTranscript) && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-8 text-slate-500 hover:text-slate-700"
              onClick={resetTranscript}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          )}
        </div>

        {(transcript || interimTranscript) && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 border-emerald-500 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
            onClick={handleApply}
          >
            <Check className="w-3.5 h-3.5" /> Append to Notes
          </Button>
        )}
      </div>
    </div>
  );
}
