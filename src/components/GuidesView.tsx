import React, { useState } from 'react';
import { Server, Terminal, Copy, Check, Upload, Package, ArrowRight } from 'lucide-react';

export const GuidesView: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sections = [
    {
      title: '1. Docker Build Commands',
      description: 'Build the custom ArixByte web hosting Docker image locally or on your CI/CD runner.',
      code: `docker build -t ghcr.io/arixbyte/web-hosting:latest .`
    },
    {
      title: '2. GitHub Container Registry (GHCR) Push Commands',
      description: 'Authenticate with GitHub Container Registry and push your production image so Pterodactyl Wings can pull it.',
      code: `echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
docker push ghcr.io/arixbyte/web-hosting:latest`
    },
    {
      title: '3. Pterodactyl Egg Import Instructions',
      description: 'Steps to add the ArixByte Web Hosting egg to your Pterodactyl Panel.',
      code: `# 1. Log in to your Pterodactyl Admin Panel.
# 2. Navigate to Nests -> Select or create a Nest (e.g., 'Web Hosting').
# 3. Click 'Import Egg' and upload the 'egg-arixbyte-webhosting.json' file.
# 4. Choose your associated Node daemon and click Save.`
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Docker Build & Pterodactyl Deployment Guide</h2>
        <p className="text-slate-400 text-sm">
          Follow these exact production commands to build, push, and import your ArixByte web hosting egg into Pterodactyl Panel.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-sm">{section.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{section.description}</p>
              </div>
              <button
                onClick={() => copyCode(section.code, idx)}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              >
                {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === idx ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-sky-300 border border-slate-800 overflow-x-auto">
              <pre>{section.code}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
