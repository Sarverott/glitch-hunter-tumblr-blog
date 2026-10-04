/**
 * App.tsx
 * Glitch Hunter // Public Display Anomalies
 * Matrix-styled Tumblr theme, public display glitch telemetry tracker,
 * TOTP-verified submissions, Google Workspace audit reports, and AI vision forensics.
 */

import React, { useState, useEffect } from 'react';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/googleWorkspace';
import { User } from 'firebase/auth';
import { SAMPLE_GLITCH_POSTS, TumblrPost } from './services/tumblrTheme';
import { DoomGlitchKiosk3D } from './components/DoomGlitchKiosk3D';
import { XtermHackerConsole } from './components/XtermHackerConsole';
import { AnimeGlitchHud } from './components/AnimeGlitchHud';
import { GlitchSubmissionStation } from './components/GlitchSubmissionStation';
import { TumblrThemeViewer } from './components/TumblrThemeViewer';
import { GoogleDriveBackstage } from './components/GoogleDriveBackstage';
import {
  Radio,
  Terminal,
  Camera,
  FolderGit2,
  Box,
  FileCode,
  Shield,
  LogOut,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'submit' | 'doom3d' | 'xterm' | 'backstage'>('feed');
  const [posts, setPosts] = useState<TumblrPost[]>(SAMPLE_GLITCH_POSTS);
  const [activeGlitchState, setActiveGlitchState] = useState("McDonald's Win10 Breakout");
  const [terminalNotification, setTerminalNotification] = useState<string | null>(null);

  // Initialize Auth state listener
  useEffect(() => {
    initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
  }, []);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
  };

  const handleNewPostSubmitted = (newPost: TumblrPost) => {
    setPosts([newPost, ...posts]);
    setActiveTab('feed');
    setTerminalNotification(`NEW GLITCH COMMITTED TO TUMBLR FEED: ${newPost.title}`);
  };

  return (
    <div className="min-h-screen bg-[#050806] text-[#c9f5cf] font-mono selection:bg-emerald-500 selection:text-black">
      {/* Background CRT Scanlines */}
      <div className="fixed inset-0 crt-scanlines pointer-events-none z-50 opacity-60" />

      {/* Top Cyber Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-emerald-500/30 bg-[#070b08]/95 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Node Info */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded bg-emerald-950 border border-emerald-500/60 shadow-[0_0_15px_rgba(0,255,102,0.3)]">
              <span className="text-emerald-400 font-black text-sm">GH</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-wider text-emerald-300 text-glow-green">
                  GLITCH-HUNTER.TUMBLR.COM
                </h1>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                  NODE: LIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                In-The-Wild Public Display & Kiosk Breakout Telemetry
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 text-xs overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
                activeTab === 'feed'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Tumblr Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('submit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
                activeTab === 'submit'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>/contact Form</span>
            </button>

            <button
              onClick={() => setActiveTab('doom3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
                activeTab === 'doom3d'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>3D Doom Kiosk</span>
            </button>

            <button
              onClick={() => setActiveTab('xterm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
                activeTab === 'xterm'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>xterm.js Console</span>
            </button>

            <button
              onClick={() => setActiveTab('backstage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
                activeTab === 'backstage'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <FolderGit2 className="h-3.5 w-3.5" />
              <span>Drive Backstage</span>
            </button>
          </nav>

          {/* Authentication & User Session */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/40 rounded px-2.5 py-1 text-xs">
                {user.photoURL && (
                  <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full" />
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-emerald-300 font-bold truncate max-w-[120px]">
                    {user.displayName || 'Hunter Operator'}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="p-1 text-zinc-400 hover:text-rose-400 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              /* Official Google Sign-in Button with required markup */
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button text-xs"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Terminal Notification Banner (if any) */}
        {terminalNotification && (
          <div className="rounded border border-emerald-500/50 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              {terminalNotification}
            </span>
            <button
              onClick={() => setTerminalNotification(null)}
              className="text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Anime.js Interactive Cyber HUD */}
        <AnimeGlitchHud
          detectedAnomaliesCount={posts.length * 7 + 14}
          lastScannedVenue={activeGlitchState}
        />

        {/* ACTIVE VIEW CONTENT */}
        {activeTab === 'feed' && (
          <TumblrThemeViewer
            posts={posts}
            onOpenSubmitForm={() => setActiveTab('submit')}
          />
        )}

        {activeTab === 'submit' && (
          <GlitchSubmissionStation
            accessToken={token}
            userEmail={user?.email || null}
            onPostSubmitted={handleNewPostSubmitted}
            onRequestSignIn={handleSignIn}
          />
        )}

        {activeTab === 'doom3d' && (
          <div className="space-y-4">
            <DoomGlitchKiosk3D
              onGlitchStateChange={(newState) => {
                setActiveGlitchState(newState);
                setTerminalNotification(`3D KIOSK VRAM BUFFER SHIFTED TO: ${newState}`);
              }}
            />
          </div>
        )}

        {activeTab === 'xterm' && (
          <div className="space-y-4">
            <XtermHackerConsole
              onExecuteCommand={(cmd) => {
                if (cmd.startsWith('scan-display')) {
                  setActiveGlitchState("McDonald's Win10 Breakout (Lane 2)");
                }
              }}
            />
          </div>
        )}

        {activeTab === 'backstage' && (
          <GoogleDriveBackstage
            accessToken={token}
            onRequestSignIn={handleSignIn}
            onExecuteScript={(scriptName, output) => {
              setTerminalNotification(`SCRIPT EXECUTED: ${scriptName}`);
            }}
          />
        )}
      </main>

      {/* Cyber Footer */}
      <footer className="border-t border-emerald-500/20 bg-black/90 py-6 px-4 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">GLITCH HUNTER // 2026</span>
            <span>— In-The-Wild Public Display Forensic Suite</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Google Drive API: v3</span>
            <span>Gmail TOTP: Active</span>
            <span>Google Docs Audits: Ready</span>
            <span>Google Forms /contact: Linked</span>
            <span>Gemini 3.1 Pro & Thinking: Armed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
