import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Network,
  Bug,
  Server,
  KeyRound,
  ShieldCheck,
  Smartphone,
  SearchCode,
  FileCheck2,
  FolderLock,
  FileSpreadsheet,
  FileText,
  Settings,
  Lock,
  X
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'project-overview'
  | 'api-recon'
  | 'api-vulns'
  | 'crapi'
  | 'bola'
  | 'auth-matrix'
  | 'otp-security'
  | 'apk-analysis'
  | 'apk-leak'
  | 'integrated'
  | 'evidence'
  | 'vuln-reports'
  | 'final-report'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
  counts?: {
    endpoints?: number;
    vulns?: number;
    evidence?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpen,
  onClose,
  counts
}) => {
  const navItems: Array<{
    id: PageId;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    questionTag?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'project-overview', label: 'Project Overview', icon: <FolderGit2 className="w-4 h-4" /> },
    {
      id: 'api-recon',
      label: 'API Reconnaissance',
      icon: <Network className="w-4 h-4" />,
      badge: counts?.endpoints,
      questionTag: 'Q1 (15M)'
    },
    {
      id: 'api-vulns',
      label: 'API Vulnerability Assessment',
      icon: <Bug className="w-4 h-4" />,
      badge: counts?.vulns,
      questionTag: 'Q2 (15M)'
    },
    {
      id: 'crapi',
      label: 'crAPI Investigation',
      icon: <Server className="w-4 h-4" />,
      questionTag: 'Q3 (10M)'
    },
    {
      id: 'bola',
      label: 'BOLA Testing',
      icon: <KeyRound className="w-4 h-4" />,
      questionTag: 'Q4 (10M)'
    },
    {
      id: 'auth-matrix',
      label: 'Authorization Testing',
      icon: <ShieldCheck className="w-4 h-4" />,
      questionTag: 'Q5 (10M)'
    },
    {
      id: 'otp-security',
      label: 'OTP Security',
      icon: <Lock className="w-4 h-4" />,
      questionTag: 'Q6-Q7 (15M)'
    },
    {
      id: 'apk-analysis',
      label: 'Android APK Analysis',
      icon: <Smartphone className="w-4 h-4" />,
      questionTag: 'Q8 (10M)'
    },
    {
      id: 'apk-leak',
      label: 'APK Leak Investigation',
      icon: <SearchCode className="w-4 h-4" />,
      questionTag: 'Q9 (5M)'
    },
    {
      id: 'integrated',
      label: 'Integrated Assessment',
      icon: <FileCheck2 className="w-4 h-4" />,
      questionTag: 'Q10 (10M)'
    },
    {
      id: 'evidence',
      label: 'Evidence Manager',
      icon: <FolderLock className="w-4 h-4" />,
      badge: counts?.evidence
    },
    {
      id: 'vuln-reports',
      label: 'Vulnerability Reports',
      icon: <FileSpreadsheet className="w-4 h-4" />
    },
    {
      id: 'final-report',
      label: 'Final Report',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  const handleSelect = (id: PageId) => {
    onSelectPage(id);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              UNLOX ACADEMY
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 bg-white">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Assessment Modules
          </div>

          {navItems.map((item, idx) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.questionTag && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        isActive ? 'bg-blue-200/60 text-blue-800' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.questionTag}
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded-full font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-gray-200 bg-white text-[11px] text-gray-500">
          <div className="flex items-center justify-between">
            <span>Environment:</span>
            <span className="font-semibold text-gray-700">Authorized Lab</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px]">
            <span>Version:</span>
            <span className="font-mono text-gray-600">v1.0.0 (Production)</span>
          </div>
        </div>
      </aside>
    </>
  );
};

