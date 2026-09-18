import React, { useState } from 'react';
import { ProjectFile } from '../types';
import { FileCode, Copy, Check, Download, Folder, ChevronRight } from 'lucide-react';

interface FileBrowserProps {
  files: ProjectFile[];
}

export const FileBrowser: React.FC<FileBrowserProps> = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(files[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name.includes('/') ? selectedFile.name.split('/').pop()! : selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* File Tree Sidebar */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[calc(100vh-13rem)]">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-3 text-slate-300 font-semibold text-sm">
          <Folder className="w-4 h-4 text-sky-400" />
          <span>arixbyte-webhosting/</span>
        </div>
        <div className="space-y-1 overflow-y-auto flex-1 pr-1">
          {files.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition text-left ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span className="truncate">{file.path}</span>
                </div>
                <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          10 Complete Production Files
        </div>
      </div>

      {/* Code Viewer & Details */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-13rem)] overflow-hidden">
        {/* File Header */}
        <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-semibold text-white">{selectedFile.path}</span>
              <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase font-mono">{selectedFile.language}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{selectedFile.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs text-slate-300 leading-relaxed selection:bg-sky-500/30">
          <pre className="whitespace-pre">{selectedFile.content}</pre>
        </div>
      </div>
    </div>
  );
};
