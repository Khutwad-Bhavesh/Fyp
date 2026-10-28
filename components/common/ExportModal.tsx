"use client";

import React, { useState } from "react";
import { Download, FileText, Printer, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId?: string;
  siteName?: string;
}

export default function ExportModal({ isOpen, onClose, siteId, siteName }: ExportModalProps) {
  const [reportType, setReportType] = useState<"reports" | "attendance">("reports");
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const downloadCsv = () => {
    setIsExporting(true);
    const query = new URLSearchParams();
    query.set("type", reportType);
    query.set("format", "csv");
    if (siteId) query.set("siteId", siteId);

    window.location.href = `/api/export?${query.toString()}`;
    setTimeout(() => {
      setIsExporting(false);
      onClose();
    }, 1200);
  };

  const openPrintableReport = () => {
    const query = new URLSearchParams();
    query.set("type", reportType);
    query.set("format", "html");
    if (siteId) query.set("siteId", siteId);

    window.open(`/api/export?${query.toString()}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              Export Operational Reports
            </h3>
            <p className="text-xs text-slate-500">
              {siteName ? `Filtered for ${siteName}` : "Company-Wide Records (All Sites)"}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Select Dataset</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReportType("reports")}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  reportType === "reports"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                Daily Work Reports
                <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                  Waste processed, runtime, IoT flags
                </span>
              </button>
              <button
                type="button"
                onClick={() => setReportType("attendance")}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  reportType === "attendance"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                Digital Attendance
                <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                  Check-ins, GPS coords, selfies
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
              onClick={downloadCsv}
              disabled={isExporting}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download CSV Spreadsheet
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-slate-700 border-slate-300 hover:bg-slate-50 text-xs h-9"
              onClick={openPrintableReport}
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / PDF Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
