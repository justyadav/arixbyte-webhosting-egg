import React, { useState } from 'react';
import { Play, RefreshCw, Terminal, CheckCircle2, Sliders, Server, Cpu, Database } from 'lucide-react';

export const EggSimulator: React.FC = () => {
  const [appType, setAppType] = useState('auto');
  const [serverPort, setServerPort] = useState('8080');
  const [documentRoot, setDocumentRoot] = useState('/home/container/public');
  const [startupCmd, setStartupCmd] = useState('');
  const [runComposer, setRunComposer] = useState(false);
  const [runNpm, setRunNpm] = useState(false);
  const [runBuild, setRunBuild] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setLogs([]);

    const simulationSteps = [
      `========================================================`,
      `  ArixByte Web Hosting Engine (Pterodactyl Edition)     `,
      `========================================================`,
      `[ArixByte] Server Port: ${serverPort}`,
      `[ArixByte] Configured App Type: ${appType}`,
      `[ArixByte] Document Root: ${documentRoot}`,
    ];

    if (appType === 'auto') {
      simulationSteps.push(`[ArixByte] Scanning repository structure...`);
      simulationSteps.push(`[ArixByte] Auto-detected application type: laravel (found artisan & composer.json)`);
    } else {
      simulationSteps.push(`[ArixByte] Using forced application type: ${appType}`);
    }

    simulationSteps.push(`[ArixByte] Ensuring directories /home/container/{public,logs,tmp,nginx,php} exist.`);

    if (runComposer || appType === 'laravel') {
      simulationSteps.push(`[ArixByte] Running composer install --no-dev --optimize-autoloader...`);
      simulationSteps.push(`[Composer] Generating optimized autoload files`);
    }

    if (runNpm || appType === 'node') {
      simulationSteps.push(`[ArixByte] Running npm install...`);
      simulationSteps.push(`[NPM] added 482 packages in 3.2s`);
      if (runBuild) {
        simulationSteps.push(`[ArixByte] Running npm run build...`);
        simulationSteps.push(`[Vite/Webpack] Compiled successfully for production.`);
      }
    }

    if (appType === 'laravel' || (appType === 'auto' && true)) {
      simulationSteps.push(`[ArixByte] Configuring Laravel environment cache...`);
      simulationSteps.push(`[Artisan] Configuration cache cleared & cached successfully.`);
      simulationSteps.push(`[Artisan] Routes cached successfully.`);
    }

    simulationSteps.push(`[ArixByte] Generating Nginx configuration for port ${serverPort}...`);
    simulationSteps.push(`[ArixByte] Starting PHP-FPM 8.4 service (unix:/run/php/php8.4-fpm.sock)...`);
    
    if (appType === 'node' && startupCmd) {
      simulationSteps.push(`[ArixByte] Starting Node.js application with command: ${startupCmd}`);
      simulationSteps.push(`[Node] App listening on port ${serverPort}`);
    } else {
      simulationSteps.push(`[ArixByte] Starting Nginx web server on 0.0.0.0:${serverPort}...`);
      simulationSteps.push(`[ArixByte] ArixByte Web Hosting is fully online and serving traffic!`);
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i < simulationSteps.length) {
        setLogs(prev => [...prev, simulationSteps[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 300);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 text-white font-semibold">
          <Sliders className="w-5 h-5 text-sky-400" />
          <span>Egg Variable Simulator</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Application Type (APP_TYPE)</label>
          <select
            value={appType}
            onChange={(e) => setAppType(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
          >
            <option value="auto">Auto-Detect (Recommended)</option>
            <option value="static">Static HTML/JS</option>
            <option value="php">Standard PHP</option>
            <option value="laravel">Laravel Framework</option>
            <option value="node">Node.js Application</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Server Port (${`SERVER_PORT`})</label>
          <input
            type="text"
            value={serverPort}
            onChange={(e) => setServerPort(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Document Root (DOCUMENT_ROOT)</label>
          <input
            type="text"
            value={documentRoot}
            onChange={(e) => setDocumentRoot(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
          />
        </div>

        {appType === 'node' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Startup Command (STARTUP_CMD)</label>
            <input
              type="text"
              value={startupCmd}
              onChange={(e) => setStartupCmd(e.target.value)}
              placeholder="npm start or node index.js"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={runComposer}
              onChange={(e) => setRunComposer(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span>Run Composer Install on Startup</span>
          </label>
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={runNpm}
              onChange={(e) => setRunNpm(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span>Run NPM Install on Startup</span>
          </label>
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={runBuild}
              onChange={(e) => setRunBuild(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span>Run NPM Build on Startup</span>
          </label>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white py-2.5 rounded-lg font-medium text-sm transition shadow-sm"
        >
          {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isSimulating ? 'Starting Container...' : 'Simulate Container Startup'}</span>
        </button>
      </div>

      {/* Terminal Output */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-13rem)] overflow-hidden">
        <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-sm font-semibold text-white">Pterodactyl Console Output</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-400">Wings Daemon Live</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs text-emerald-400/90 leading-relaxed selection:bg-sky-500/30">
          {logs.length === 0 ? (
            <div className="text-slate-600 flex flex-col items-center justify-center h-full space-y-2">
              <Terminal className="w-8 h-8 text-slate-700" />
              <p>Configure your variables on the left and click 'Simulate Container Startup' to test the startup script execution.</p>
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="py-0.5">
                <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                <span className={log.includes('fully online') ? 'text-sky-400 font-bold' : log.includes('error') ? 'text-red-400' : 'text-slate-200'}>
                  {log}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
