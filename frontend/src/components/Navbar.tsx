import React from 'react';
import { Shield, FileText, Download, ExternalLink, Menu, Activity } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  targetUrl?: string;
  projectName?: string;
  onOpenReport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  targetUrl = 'http://localhost:8888',
  projectName = 'API & Android Security Assessment Platform',
  onOpenReport
}) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight leading-tight">
              {projectName}
            </h1>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              August Batch Minor Project Assessment (100 Marks) • UNLOX / RIVOQUIX
            </p>
          </div>
        </div>
      </div>

      {/* Right: Lab Target Status & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Lab Target Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-gray-500 font-medium">Target Lab:</span>
          <span className="font-mono font-medium text-gray-800">{targetUrl}</span>
        </div>

        {/* Quick Report Download Buttons */}
        <div className="flex items-center gap-1.5">
          <a
            href="/api/reports/download-pdf"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors shadow-2xs"
            title="Download Official PDF Assessment Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </a>

          <a
            href="/api/reports/download-docx"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-2xs"
            title="Download Word DOCX Assessment Report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export DOCX</span>
          </a>
        </div>
      </div>
    </header>
  );
};

