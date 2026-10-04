/**
 * GoogleDriveBackstage.tsx
 * Google Drive Backstage & Forensic Scripts Manager
 * Manages scripts, telemetry databases, and incident files in Google Drive's "GlitchHunter_Backstage"
 */

import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  FileCode,
  Upload,
  RefreshCw,
  ExternalLink,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  HardDrive,
  FileText,
} from 'lucide-react';
import {
  listBackstageDriveFiles,
  uploadBackstageFile,
  DriveFileItem,
} from '../services/googleWorkspace';

interface GoogleDriveBackstageProps {
  accessToken: string | null;
  onRequestSignIn?: () => void;
  onExecuteScript?: (scriptName: string, output: string) => void;
}

const DEFAULT_SAMPLE_SCRIPTS = [
  {
    name: 'kiosk_watchdog_probe.py',
    description: 'Polls commercial HDMI ports to detect Windows 10 desktop breakouts vs active POS apps',
    code: `# Kiosk Watchdog Probe v2.4
import psutil, time, os

def monitor_kiosk_shell():
    print("[+] Scanning process tree for shell breakout...")
    for proc in psutil.process_iter(['pid', 'name']):
        if proc.info['name'] == 'explorer.exe':
            print(f"[!] ALERT: Explorer.exe running in foreground (PID {proc.info['pid']})")
            print("[!] Kiosk lockdown violated! Windows 10 Start Menu accessible.")
            return True
    print("[+] Kiosk application contained.")
    return False

if __name__ == '__main__':
    monitor_kiosk_shell()
`,
  },
  {
    name: 'vram_display_harvester.sh',
    description: 'Dumps GPU framebuffer memory slices from signage players to diagnose memory leaks',
    code: `#!/usr/bin/env bash
echo "[*] Harvesting VRAM telemetry for glitch-hunter.tumblr.com..."
timestamp=$(date +%s)
echo "[+] Framebuffer dump: /dev/fb0 -> drive/backstage/vram_\${timestamp}.raw"
echo "[+] Resolution: 1920x1080 32bpp BGRA"
echo "[+] Detected BSOD memory dump: ntoskrnl.exe CRITICAL_PROCESS_DIED"
echo "[*] Telemetry saved to Google Drive Backstage"
`,
  },
  {
    name: 'tumblr_api_syncer.js',
    description: 'Synchronizes verified TOTP public display submissions with Tumblr Neue Post Format (NPF)',
    code: `// Tumblr NPF Post Generator
const generateNPFGlitchPost = (glitchData) => {
  return {
    content: [
      { type: "image", media: [{ url: glitchData.photoUrl }] },
      { type: "text", subtype: "heading1", text: glitchData.venue + " // Glitch Found" },
      { type: "text", text: "Reported OS: " + glitchData.osDetected },
      { type: "text", text: "Submitter credit: @" + glitchData.tumblrHandle }
    ],
    tags: ["glitchinthematrix", "publicdisplay", "windows10"]
  };
};
`,
  },
];

export const GoogleDriveBackstage: React.FC<GoogleDriveBackstageProps> = ({
  accessToken,
  onRequestSignIn,
  onExecuteScript,
}) => {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScript, setSelectedScript] = useState(DEFAULT_SAMPLE_SCRIPTS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [executionLog, setExecutionLog] = useState<string | null>(null);

  // Load files from Google Drive
  const loadFiles = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const items = await listBackstageDriveFiles(accessToken);
      setFiles(items);
    } catch (err) {
      console.error('Error loading drive files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadFiles();
    }
  }, [accessToken]);

  const handleUploadScriptToDrive = async () => {
    if (!accessToken) {
      if (onRequestSignIn) onRequestSignIn();
      return;
    }

    const confirmed = window.confirm(
      `Upload "${selectedScript.name}" to your Google Drive "GlitchHunter_Backstage" directory?`
    );
    if (!confirmed) return;

    setIsUploading(true);
    setUploadSuccess(false);
    try {
      await uploadBackstageFile(accessToken, selectedScript.name, selectedScript.code, 'text/plain');
      setUploadSuccess(true);
      await loadFiles();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSimulateExecution = () => {
    const output = `[EXECUTION RUNNER] Initializing ${selectedScript.name}...
Connecting to public display controller at 127.0.0.1:8080...
${selectedScript.code.split('\n').filter(l => l.includes('echo') || l.includes('print')).join('\n').replace(/echo |print\(|\)|"/g, '')}
[DONE] Execution completed with status code 0. Telemetry synced.`;

    setExecutionLog(output);

    if (onExecuteScript) {
      onExecuteScript(selectedScript.name, output);
    }
  };

  return (
    <div className="rounded-md border border-emerald-500/40 bg-[#080d0a] p-5 font-mono shadow-[0_0_35px_rgba(0,255,102,0.12)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-emerald-500/30 pb-3 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <HardDrive className="h-5 w-5 text-emerald-400" />
            GOOGLE DRIVE BACKSTAGE // SCRIPTS & TELEMETRY STORAGE
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Store raw display logs, watchdog scripts, and audit drafts in your personal Google Drive directory: <code className="text-emerald-300">GlitchHunter_Backstage</code>
          </p>
        </div>

        {accessToken ? (
          <button
            onClick={loadFiles}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-950/70 text-emerald-300 text-xs transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Files
          </button>
        ) : (
          <button
            onClick={onRequestSignIn}
            className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition"
          >
            Connect Google Drive
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Script Selector & Drive Files */}
        <div className="space-y-4">
          <div className="rounded border border-emerald-500/25 bg-black/60 p-3">
            <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
              <FolderGit2 className="h-4 w-4" /> FORENSIC SCRIPTS PAYLOADS
            </div>
            <div className="space-y-1.5">
              {DEFAULT_SAMPLE_SCRIPTS.map((script) => (
                <button
                  key={script.name}
                  onClick={() => {
                    setSelectedScript(script);
                    setExecutionLog(null);
                  }}
                  className={`w-full text-left p-2.5 rounded border transition text-xs ${
                    selectedScript.name === script.name
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="truncate">{script.name}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{script.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Drive Backstage Files List */}
          <div className="rounded border border-emerald-500/25 bg-black/60 p-3">
            <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <HardDrive className="h-4 w-4" /> DRIVE BACKSTAGE FILES
              </span>
              <span className="text-[10px] text-zinc-500">{files.length} ITEMS</span>
            </div>

            {isLoading ? (
              <div className="p-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" /> Loading files...
              </div>
            ) : files.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 rounded bg-zinc-950/80 border border-zinc-800 text-[11px]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="text-zinc-200 truncate">{file.name}</span>
                    </div>
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline shrink-0 ml-2"
                      >
                        View ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-zinc-500 text-xs">
                {accessToken
                  ? 'No files yet in GlitchHunter_Backstage. Click "Upload to Drive" to persist scripts.'
                  : 'Sign in to access your Google Drive folder.'}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Script Code Editor & Execution Console */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded border border-emerald-500/30 bg-black/80 p-4">
            <div className="flex flex-wrap items-center justify-between border-b border-emerald-500/20 pb-2 mb-3 gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-300">{selectedScript.name}</span>
                <span className="text-[10px] text-zinc-400 block">{selectedScript.description}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateExecution}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition"
                >
                  <Play className="h-3.5 w-3.5" /> Run Script
                </button>

                <button
                  onClick={handleUploadScriptToDrive}
                  disabled={isUploading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-[0_0_15px_rgba(0,255,102,0.3)] disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Upload to Drive
                </button>
              </div>
            </div>

            {uploadSuccess && (
              <div className="mb-3 p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                Script uploaded to Google Drive "GlitchHunter_Backstage" directory!
              </div>
            )}

            {/* Code editor view */}
            <div className="rounded border border-zinc-800 bg-[#040605] p-3 max-h-[300px] overflow-y-auto">
              <pre className="text-xs text-emerald-400/90 leading-relaxed font-mono whitespace-pre-wrap">
                {selectedScript.code}
              </pre>
            </div>
          </div>

          {/* Script Execution Console Output */}
          {executionLog && (
            <div className="rounded border border-emerald-500/30 bg-black/90 p-4">
              <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                SCRIPT EXECUTION LOG
              </div>
              <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed bg-[#050806] p-3 rounded border border-emerald-500/20">
                {executionLog}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
