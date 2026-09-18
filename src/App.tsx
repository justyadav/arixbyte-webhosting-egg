/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileBrowser } from './components/FileBrowser';
import { EggSimulator } from './components/EggSimulator';
import { GuidesView } from './components/GuidesView';
import { ChecklistsView } from './components/ChecklistsView';
import { EGG_FILES, HOSTING_PLANS } from './data/eggFiles';
import { Cpu, Server, Shield, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('files');

  const handleDownloadEggJson = () => {
    const eggFile = EGG_FILES.find(f => f.path === 'egg-arixbyte-webhosting.json');
    if (!eggFile) return;
    const blob = new Blob([eggFile.content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'egg-arixbyte-webhosting.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onDownloadAll={handleDownloadEggJson} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'files' && <FileBrowser files={EGG_FILES} />}
        {activeTab === 'simulator' && <EggSimulator />}
        {activeTab === 'guides' && <GuidesView />}
        {(activeTab === 'plans' || activeTab === 'checklists') && <ChecklistsView />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        ArixByte Web Hosting Egg for Pterodactyl • Production-Ready Multi-Tenant Architecture
      </footer>
    </div>
  );
}
