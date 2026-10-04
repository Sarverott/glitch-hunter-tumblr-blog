/**
 * XtermHackerConsole.tsx
 * Real interactive terminal powered by xterm.js
 * Provides an edgy, hacker-style diagnostic console for glitch-hunter.tumblr.com
 */

import React, { useEffect, useRef } from 'react';
import { Terminal as XTerminal } from 'xterm';
import 'xterm/css/xterm.css';
import { Terminal as TerminalIcon, Sparkles, Shield, Cpu } from 'lucide-react';

interface XtermHackerConsoleProps {
  onExecuteCommand?: (cmd: string) => void;
}

export const XtermHackerConsole: React.FC<XtermHackerConsoleProps> = ({ onExecuteCommand }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<XTerminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm
    const term = new XTerminal({
      cursorBlink: true,
      fontFamily: "'Fira Code', 'VT323', monospace",
      fontSize: 13,
      lineHeight: 1.25,
      theme: {
        background: '#070a08',
        foreground: '#33ff77',
        cursor: '#00ff66',
        cursorAccent: '#070a08',
        selectionBackground: 'rgba(0, 255, 102, 0.3)',
        black: '#000000',
        green: '#00ff66',
        brightGreen: '#55ff99',
        yellow: '#ffcc00',
        brightYellow: '#ffee55',
        red: '#ff0055',
        cyan: '#00ffff',
      },
    });

    term.open(terminalRef.current);
    xtermInstance.current = term;

    // Banner intro
    term.writeln('\x1b[1;32m========================================================================\x1b[0m');
    term.writeln('\x1b[1;32m  [GLITCH-HUNTER TELEMETRY NODE // DAEMON v3.8.4] \x1b[0m');
    term.writeln('\x1b[1;36m  Host: glitch-hunter.tumblr.com | Subsystem: In-The-Wild Diagnostics\x1b[0m');
    term.writeln('\x1b[1;33m  Type "\x1b[1;37mhelp\x1b[1;33m" to display active hacker diagnostic commands.\x1b[0m');
    term.writeln('\x1b[1;32m========================================================================\x1b[0m');
    term.write('\r\n\x1b[1;32mglitch-hunter@node:~$ \x1b[0m');

    let currentInput = '';

    const handleCommand = (cmd: string) => {
      const clean = cmd.trim();
      const parts = clean.split(' ');
      const action = parts[0]?.toLowerCase();

      term.writeln('');

      switch (action) {
        case 'help':
          term.writeln('\x1b[1;37mAVAILABLE FORENSIC COMMANDS:\x1b[0m');
          term.writeln('  \x1b[1;32mhelp\x1b[0m              - List all available commands');
          term.writeln('  \x1b[1;32mscan-display\x1b[0m      - Probe public kiosk display stream for OS leak');
          term.writeln('  \x1b[1;32mdump-vram\x1b[0m         - Dump video buffer from McDonald\'s Win10 kiosk');
          term.writeln('  \x1b[1;32mmatrix\x1b[0m            - Stream raw green phosphor matrix binary');
          term.writeln('  \x1b[1;32mtumblr-theme\x1b[0m      - Inspect active theme operators & NPF blocks');
          term.writeln('  \x1b[1;32mdrive-logs\x1b[0m        - Check Google Drive backstage directory status');
          term.writeln('  \x1b[1;32mtotp-status\x1b[0m       - Verify email TOTP dispatch daemon');
          term.writeln('  \x1b[1;32mclear\x1b[0m             - Clear terminal screen');
          break;

        case 'scan-display':
          term.writeln('\x1b[1;33m[!] Initializing display port probe on HDMI-1/DP-0...\x1b[0m');
          term.writeln('  [+] Detected resolution: 1920x1080 @ 60Hz Commercial Panel');
          term.writeln('  [+] Active Shell: explorer.exe (PID: 3824) - KIOSK LOCKOUT FAILED');
          term.writeln('  [+] Target: McDonald\'s Drive-Thru lane 2');
          term.writeln('  \x1b[1;31m[!] WARNING: Windows 10 Start Menu & Task Manager fully accessible\x1b[0m');
          break;

        case 'dump-vram':
          term.writeln('\x1b[1;32mDUMPING FRAMEBUFFER 0x00007FFF0000 - 0x00007FFF00FF\x1b[0m');
          for (let i = 0; i < 4; i++) {
            const hex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(' ');
            term.writeln(`  0x7FFF00${i * 16}00: ${hex} | WIN10_EXPLORER_CRASH`);
          }
          term.writeln('\x1b[1;32m[+] Framebuffer dump logged to Backstage Google Drive\x1b[0m');
          break;

        case 'matrix':
          term.writeln('\x1b[1;32m10100110 01101100 01101001 01110100 01100011 01101000\x1b[0m');
          term.writeln('\x1b[1;32m01101000 01110101 01101110 01110100 01100101 01110010\x1b[0m');
          term.writeln('\x1b[1;32m[THE MATRIX HAS BROKEN INTO WINDOWS 10 DESKTOP]\x1b[0m');
          break;

        case 'tumblr-theme':
          term.writeln('\x1b[1;36mTUMBLR OPERATORS LOADED:\x1b[0m');
          term.writeln('  {Title}: "GLITCH HUNTER // IN THE WILD"');
          term.writeln('  {block:Posts} -> {block:Photo}, {block:Text}, {block:Quote}');
          term.writeln('  /contact page: Linked to Google Forms submission handler');
          break;

        case 'drive-logs':
          term.writeln('\x1b[1;33m[GOOGLE DRIVE INTEGRATION]\x1b[0m');
          term.writeln('  Folder: "GlitchHunter_Backstage"');
          term.writeln('  Scopes: https://www.googleapis.com/auth/drive.file');
          term.writeln('  Ready to persist incident reports, telemetry, & scripts.');
          break;

        case 'totp-status':
          term.writeln('\x1b[1;32m[GMAIL TOTP ENGINE // ACTIVE]\x1b[0m');
          term.writeln('  Generator: 6-digit cryptographic hash');
          term.writeln('  Expiry: 10 minutes');
          term.writeln('  Prevents spam and ensures authentic community submissions.');
          break;

        case 'clear':
          term.clear();
          break;

        case '':
          break;

        default:
          term.writeln(`\x1b[1;31mCommand not recognized: "${clean}". Type "help" for active commands.\x1b[0m`);
      }

      if (onExecuteCommand && clean) {
        onExecuteCommand(clean);
      }

      term.write('\r\n\x1b[1;32mglitch-hunter@node:~$ \x1b[0m');
    };

    const disposable = term.onData((data) => {
      // Enter
      if (data === '\r') {
        handleCommand(currentInput);
        currentInput = '';
      }
      // Backspace
      else if (data === '\u007F') {
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1);
          term.write('\b \b');
        }
      }
      // Printable characters
      else if (data >= ' ') {
        currentInput += data;
        term.write(data);
      }
    });

    return () => {
      disposable.dispose();
      term.dispose();
    };
  }, []);

  return (
    <div className="rounded-md border border-emerald-500/40 bg-black/95 p-3 shadow-[0_0_25px_rgba(0,255,102,0.12)]">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-emerald-500/25 pb-2 mb-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-emerald-400">
          <TerminalIcon className="h-4 w-4" />
          <span className="font-bold tracking-wide">XTERM_HACKER_CONSOLE // BACKSTAGE_TTY1</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <Cpu className="h-3 w-3" /> BUFFER: 1024L
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <Shield className="h-3 w-3" /> TOTP_DAEMON: ARMED
          </span>
        </div>
      </div>

      {/* Terminal mount point */}
      <div
        ref={terminalRef}
        className="h-[220px] w-full overflow-hidden rounded bg-[#070a08] p-2 border border-emerald-500/20"
      />
    </div>
  );
};
