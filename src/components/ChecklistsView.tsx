import React from 'react';
import { CheckCircle2, ShieldAlert, Cpu, CheckSquare } from 'lucide-react';
import { HOSTING_PLANS } from '../data/eggFiles';

export const ChecklistsView: React.FC = () => {
  const testingSteps = [
    'Static HTML: Verify /home/container/public/index.html loads instantly on port ${SERVER_PORT}.',
    'PHP & PHP-FPM: Verify PHP 8.4 info page works and Nginx passes .php requests to PHP-FPM socket.',
    'Laravel Routing: Verify artisan commands run and /index.php?query_string rewrite rules work correctly.',
    'Node.js Mode: Verify npm install, build scripts, and custom STARTUP_CMD run properly without root privileges.',
    'Security Isolation: Verify attempts to access .env or .git are blocked with 403 Forbidden.'
  ];

  const securityChecklist = [
    'Non-Root Execution: Container runs strictly under the unprivileged user container (UID 1000).',
    'Dangerous PHP Functions Disabled: exec, passthru, shell_exec, system, proc_open, popen disabled in php.ini.',
    'Strict Nginx Path Traversal Protection: Hidden files and sensitive file extensions (.env, .git, .sh, .sql) blocked.',
    'No Docker Socket Exposure: Customers have zero access to the host daemon or Docker socket.',
    'Resource Limitations: Enforced cleanly via Pterodactyl Wings CPU, RAM, and Disk limits.'
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Resource Limits */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-sky-400" />
          <span>Recommended ArixByte Hosting Plan Resource Limits</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HOSTING_PLANS.map((plan, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">{plan.name}</h3>
                <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30 font-mono">{plan.ram} RAM</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">CPU</span>
                  <span className="text-slate-200 font-semibold">{plan.cpu}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Disk</span>
                  <span className="text-slate-200 font-semibold">{plan.disk}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Disk I/O</span>
                  <span className="text-slate-200 font-semibold">{plan.io}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">{plan.idealFor}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Testing Checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>Production Testing Checklist</span>
          </h2>
          <div className="space-y-3">
            {testingSteps.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Production Security Checklist</span>
          </h2>
          <div className="space-y-3">
            {securityChecklist.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
