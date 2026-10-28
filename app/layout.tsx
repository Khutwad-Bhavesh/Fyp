import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import { SiteProvider } from "@/src/context/SiteContext";
import { AttendanceProvider } from "@/src/context/AttendanceContext";
import { NotificationProvider } from "@/src/context/NotificationContext";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
  title: "Shuchithwam - Smart OWC Operations Monitoring & Management System",
  description:
    "Centralized digital operations, attendance verification, daily reporting, and IoT runtime validation for Organic Waste Converter sites. Client: Rajeshree Enviro Solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        <AuthProvider>
          <SiteProvider>
            <AttendanceProvider>
              <NotificationProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1 pb-12">{children}</main>
                  <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
                    <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <p>
                        &copy; 2026 <strong>Shuchithwam</strong> &bull; Rajeshree Enviro Solutions &bull; Vidyalankar Polytechnic
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Smart OWC Operations Monitoring and Management System
                      </p>
                    </div>
                  </footer>
                </div>
              </NotificationProvider>
            </AttendanceProvider>
          </SiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
