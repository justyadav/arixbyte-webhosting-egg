import React from 'react';
import { Server, Terminal, Shield, Cpu, Download, FileCode, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onDownloadAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onDownloadAll }) => {
  const tabs = [
    { id: 'files', label: 'Project Files', icon: FileCode },
    { id: 'simulator', label: 'Egg Config & Simulator', icon: Terminal },
    { id: 'guides', label: 'Docker & Pterodactyl Guide', icon: Server },
    { id: 'plans', label: 'Resource Limits', icon: Cpu },
    { id: 'checklists', label: 'Security & Testing', icon: Shield },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-500/15 border border-sky-500/30 p-2 rounded-xl text-sky-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight">ArixByte</span>
                <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-medium border border-sky-500/30">Pterodactyl Egg</span>
              </div>
              <p className="text-xs text-slate-400">Production Web Hosting Engine (PHP 8.4 • Nginx • Node.js • Laravel)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onDownloadAll}
              className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
            >
              <Download className="w-4 h-4" />
              <span>Export Egg JSON</span>
            </button>
          </div>
        </div>

        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
