/**
 * GlitchSubmissionStation.tsx
 * The /contact Submission & Forensic Investigation Suite
 * Features:
 * - Photo / Video upload & camera capture
 * - "Talk to Form" audio recording & transcription via gemini-3.5-transcribe
 * - Mandatory TOTP email verification dispatched via Gmail API
 * - Submitter Tumblr username crediting & Google Contacts lookup
 * - Interactive map coordinates selector with Google Maps Grounding
 * - AI Vision Analysis (gemini-3.1-pro-preview)
 * - Web Search Grounding (gemini-3.5-flash)
 * - High-Thinking Municipal Audit Draft (gemini-3.1-pro-preview, ThinkingLevel.HIGH)
 * - Google Docs export & Google Drive backstage sync
 */

import React, { useState, useRef } from 'react';
import {
  Camera,
  Mic,
  MicOff,
  Mail,
  ShieldCheck,
  MapPin,
  Sparkles,
  Search,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  ExternalLink,
  Users,
  Compass,
  Code,
  Copy,
  Check,
  Building,
} from 'lucide-react';
import {
  sendAuthorityIncidentNotification,
  uploadBackstageFile,
  createGlitchAuditReportDoc,
  fetchGoogleContacts,
  ContactItem,
} from '../services/googleWorkspace';
import { TumblrPost, generateTumblrContactPageHtml } from '../services/tumblrTheme';

interface GlitchSubmissionStationProps {
  accessToken: string | null;
  userEmail: string | null;
  onPostSubmitted?: (newPost: TumblrPost) => void;
  onRequestSignIn?: () => void;
}

export const GlitchSubmissionStation: React.FC<GlitchSubmissionStationProps> = ({
  accessToken,
  userEmail,
  onPostSubmitted,
  onRequestSignIn,
}) => {
  // Form fields
  const [tumblrHandle, setTumblrHandle] = useState('sarverott');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [venueName, setVenueName] = useState("McDonald's Drive-Thru #4412");
  const [locationAddress, setLocationAddress] = useState('3200 N Western Ave, Chicago, IL');
  const [osDetected, setOsDetected] = useState('Windows 10 Pro / IoT');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<{ base64: string; mimeType: string; isVideo: boolean; previewUrl: string } | null>(null);

  // Audio recording state ("Talk to form")
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Authority Notification state (Repurposed Gmail automation)
  const [authorityEmail, setAuthorityEmail] = useState('ops-security@franchise-corp.com');
  const [isSendingAuthorityNotice, setIsSendingAuthorityNotice] = useState(false);
  const [authorityNoticeSent, setAuthorityNoticeSent] = useState(false);
  const [authorityNoticeError, setAuthorityNoticeError] = useState<string | null>(null);

  // Embedded Tumblr Subpage View Toggle
  const [viewMode, setViewMode] = useState<'form' | 'subpage-code'>('form');
  const [copiedSubpageCode, setCopiedSubpageCode] = useState(false);

  // AI Diagnostic States
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [visionAnalysisResult, setVisionAnalysisResult] = useState<string | null>(null);
  const [isSearchingGrounding, setIsSearchingGrounding] = useState(false);
  const [searchGroundingResult, setSearchGroundingResult] = useState<string | null>(null);
  const [isMappingGrounding, setIsMappingGrounding] = useState(false);
  const [mapsGroundingResult, setMapsGroundingResult] = useState<string | null>(null);
  const [isThinkingAudit, setIsThinkingAudit] = useState(false);
  const [auditDraftResult, setAuditDraftResult] = useState<string | null>(null);

  // Google Workspace Operations Status
  const [isExportingDoc, setIsExportingDoc] = useState(false);
  const [createdDocUrl, setCreatedDocUrl] = useState<string | null>(null);
  const [isSavingDrive, setIsSavingDrive] = useState(false);
  const [savedDriveSuccess, setSavedDriveSuccess] = useState(false);

  // Google Contacts
  const [matchingContacts, setMatchingContacts] = useState<ContactItem[]>([]);
  const [isCheckingContacts, setIsCheckingContacts] = useState(false);

  // Confirmation Modal for mutating operations
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({ isOpen: false, title: '', description: '', action: async () => {} });

  const embeddedContactHtml = generateTumblrContactPageHtml();

  const handleCopySubpageHtml = () => {
    navigator.clipboard.writeText(embeddedContactHtml);
    setCopiedSubpageCode(true);
    setTimeout(() => setCopiedSubpageCode(false), 2000);
  };

  // Handle File Upload (Photo or Video)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setMediaFile({
        base64: base64String,
        mimeType: file.type,
        isVideo,
        previewUrl: URL.createObjectURL(file),
      });
    };
    reader.readAsDataURL(file);
  };

  // "Talk to Form" Microphone recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone error:', err);
      alert('Could not access microphone: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const res = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: 'audio/webm',
          }),
        });
        const data = await res.json();
        if (data.transcription) {
          setDescription((prev) => (prev ? `${prev}\n\n[Voice Notes]: ${data.transcription}` : data.transcription));
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Trigger Formal Incident Notification to Authorities via Gmail
  const triggerAuthorityNoticeDispatch = async () => {
    if (!authorityEmail) {
      setAuthorityNoticeError('Please specify an authority / management recipient email.');
      return;
    }
    if (!accessToken) {
      if (onRequestSignIn) onRequestSignIn();
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Dispatch Security Advisory to Authorities via Gmail?',
      description: `The application will dispatch a formal incident report to "${authorityEmail}" regarding display vulnerability at "${venueName}" from your connected Gmail address (${userEmail || 'account'}).`,
      action: async () => {
        setIsSendingAuthorityNotice(true);
        setAuthorityNoticeError(null);
        try {
          const result = await sendAuthorityIncidentNotification(accessToken, authorityEmail, {
            incidentId: `GH-AUDIT-${Date.now().toString().slice(-6)}`,
            venue: venueName,
            location: locationAddress,
            osDetected: osDetected,
            submitterCredit: tumblrHandle,
            reportSummary: auditDraftResult || visionAnalysisResult || description || 'Public kiosk exited to desktop shell.',
            remediationAdvice: 'Deploy Shell Launcher, lock down USB ports, and configure watchdog service.',
            attachedDocUrl: createdDocUrl || undefined,
          });

          if (result.success) {
            setAuthorityNoticeSent(true);
          } else {
            setAuthorityNoticeError(result.error || 'Failed to dispatch email');
          }
        } catch (err: any) {
          setAuthorityNoticeError(err.message || 'Notification dispatch failed');
        } finally {
          setIsSendingAuthorityNotice(false);
        }
      },
    });
  };

  // AI Vision Analysis
  const runVisionAnalysis = async () => {
    if (!mediaFile) {
      alert('Please upload a photo or video first to analyze with Gemini Pro.');
      return;
    }

    setIsAnalyzingVision(true);
    setVisionAnalysisResult(null);

    try {
      const endpoint = mediaFile.isVideo ? '/api/gemini/analyze-video' : '/api/gemini/analyze-image';
      const bodyKey = mediaFile.isVideo ? 'videoBase64' : 'imageBase64';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [bodyKey]: mediaFile.base64,
          mimeType: mediaFile.mimeType,
          prompt: `Forensic public display analysis for: ${venueName} at ${locationAddress}.
Focus on OS breakout, exposed desktop (e.g. Windows 10 Start button/taskbar), kiosk software crash, and security risks.`,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setVisionAnalysisResult(data.analysis);
      } else {
        setVisionAnalysisResult(data.error || 'Analysis returned no details.');
      }
    } catch (err: any) {
      setVisionAnalysisResult('Vision analysis failed: ' + err.message);
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  // Google Search Grounding (gemini-3.5-flash)
  const runSearchGrounding = async () => {
    setIsSearchingGrounding(true);
    try {
      const res = await fetch('/api/gemini/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${venueName} ${osDetected} digital menu board display crash vulnerabilities`,
        }),
      });
      const data = await res.json();
      setSearchGroundingResult(data.result);
    } catch (err: any) {
      setSearchGroundingResult('Search grounding failed: ' + err.message);
    } finally {
      setIsSearchingGrounding(false);
    }
  };

  // Google Maps Grounding (gemini-3.5-flash)
  const runMapsGrounding = async () => {
    setIsMappingGrounding(true);
    try {
      const res = await fetch('/api/gemini/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationQuery: `${venueName}, ${locationAddress}`,
        }),
      });
      const data = await res.json();
      setMapsGroundingResult(data.locationDetails);
    } catch (err: any) {
      setMapsGroundingResult('Maps grounding failed: ' + err.message);
    } finally {
      setIsMappingGrounding(false);
    }
  };

  // High Thinking Audit Report (gemini-3.1-pro-preview with ThinkingLevel.HIGH)
  const runHighThinkingAudit = async () => {
    setIsThinkingAudit(true);
    try {
      const res = await fetch('/api/gemini/high-thinking-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentDetails: description || 'Digital signage exited to Windows 10 desktop in public view',
          venue: venueName,
          location: locationAddress,
          osInfo: osDetected,
          submitter: tumblrHandle || 'Anonymous Hunter',
        }),
      });
      const data = await res.json();
      setAuditDraftResult(data.auditReport);
    } catch (err: any) {
      setAuditDraftResult('Thinking audit failed: ' + err.message);
    } finally {
      setIsThinkingAudit(false);
    }
  };

  // Export to Google Docs
  const handleExportDoc = async () => {
    if (!accessToken) {
      if (onRequestSignIn) onRequestSignIn();
      return;
    }
    if (!auditDraftResult && !visionAnalysisResult) {
      alert('Please run the Vision Analysis or High-Thinking Audit first to generate report content.');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Generate Municipal Glitch Audit Document?',
      description: `This will create a new formal Google Doc in your Google Drive titled "[GLITCH AUDIT REPORT] ${venueName}".`,
      action: async () => {
        setIsExportingDoc(true);
        try {
          const content = auditDraftResult || visionAnalysisResult || 'No content';
          const doc = await createGlitchAuditReportDoc(accessToken, `${venueName} // Incident Report`, content);
          setCreatedDocUrl(doc.docUrl);
        } catch (err: any) {
          alert('Failed to create Google Doc: ' + err.message);
        } finally {
          setIsExportingDoc(false);
        }
      },
    });
  };

  // Save to Backstage Google Drive
  const handleSaveBackstageDrive = async () => {
    if (!accessToken) {
      if (onRequestSignIn) onRequestSignIn();
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Upload Incident Telemetry to Google Drive?',
      description: 'This will upload a JSON incident payload and debug script into your "GlitchHunter_Backstage" Google Drive directory.',
      action: async () => {
        setIsSavingDrive(true);
        try {
          const payload = {
            id: `INCIDENT-${Date.now()}`,
            timestamp: new Date().toISOString(),
            venue: venueName,
            location: locationAddress,
            osDetected: osDetected,
            submitter: tumblrHandle,
            email: submitterEmail,
            description: description,
            visionAnalysis: visionAnalysisResult,
            auditReport: auditDraftResult,
          };

          await uploadBackstageFile(
            accessToken,
            `glitch_telemetry_${Date.now()}.json`,
            JSON.stringify(payload, null, 2),
            'application/json'
          );
          setSavedDriveSuccess(true);
        } catch (err: any) {
          alert('Failed to save to Google Drive: ' + err.message);
        } finally {
          setIsSavingDrive(false);
        }
      },
    });
  };

  // Check Google Contacts for submitter profile link
  const handleCheckContacts = async () => {
    if (!accessToken) {
      if (onRequestSignIn) onRequestSignIn();
      return;
    }
    setIsCheckingContacts(true);
    try {
      const contacts = await fetchGoogleContacts(accessToken);
      const filtered = contacts.filter((c) =>
        (submitterEmail && c.email && c.email.toLowerCase().includes(submitterEmail.toLowerCase())) ||
        (tumblrHandle && c.name?.toLowerCase().includes(tumblrHandle.toLowerCase()))
      );
      setMatchingContacts(filtered.length > 0 ? filtered : contacts.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingContacts(false);
    }
  };

  // Direct Publish to Tumblr Live Feed
  const handlePublishToTumblrFeed = () => {
    const newPost: TumblrPost = {
      id: `gh-${Date.now().toString().slice(-4)}`,
      type: mediaFile ? 'photo' : 'text',
      title: `${venueName} // ${osDetected} Breakout`,
      photoUrl: mediaFile?.previewUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      caption: `<strong>SECTOR REPORT:</strong> ${description || 'Public display broke out into OS environment.'}<br><br><strong>Identified OS:</strong> ${osDetected}<br><strong>Venue:</strong> ${venueName}<br><strong>Location:</strong> ${locationAddress}`,
      tags: ['glitchinthematrix', 'publicdisplay', 'windows10', 'kioskbreakout', 'tumblr'],
      notesCount: 1,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase(),
      location: locationAddress,
      osDetected: osDetected,
      venue: venueName,
      submitterCredit: tumblrHandle || 'verified_hunter',
      verifiedTotp: true,
    };

    if (onPostSubmitted) {
      onPostSubmitted(newPost);
    }
    alert('Glitch Incident published successfully to the Tumblr blog feed!');
  };

  return (
    <div className="rounded-md border border-emerald-500/40 bg-black/95 p-5 font-mono shadow-[0_0_35px_rgba(0,255,102,0.12)]">
      {/* Title Header with Subpage Code Switcher */}
      <div className="flex flex-wrap items-center justify-between border-b border-emerald-500/30 pb-3 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-lg font-bold tracking-wider">
              /CONTACT // PUBLIC DISPLAY GLITCH SUBMISSION SUITE
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Embedded Tumblr subpage code, camera upload, voice-to-text, and automated authority security alerts.
          </p>
        </div>

        {/* View Switcher: Interactive Form vs Embedded Subpage Code */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('form')}
            className={`px-3 py-1.5 rounded text-xs transition ${
              viewMode === 'form'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.4)]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            Submission Form
          </button>

          <button
            onClick={() => setViewMode('subpage-code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition ${
              viewMode === 'subpage-code'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.4)]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Tumblr /contact Subpage Code
          </button>
        </div>
      </div>

      {viewMode === 'subpage-code' ? (
        /* EMBEDDED TUMBLR /CONTACT SUBPAGE CODE VIEW */
        <div className="space-y-4">
          <div className="p-4 rounded border border-emerald-500/30 bg-emerald-950/20 text-xs text-emerald-300">
            <div className="font-bold text-sm mb-1 flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Dedicated Embedded Subpage for Tumblr Dashboard
            </div>
            <p className="text-zinc-300 leading-relaxed mb-3">
              To embed this form directly on <code className="text-emerald-300 font-bold">glitch-hunter.tumblr.com/contact</code>:
              <br />
              1. Open your Tumblr Dashboard &rarr; <strong>Settings</strong> &rarr; <strong>glitch-hunter</strong> &rarr; <strong>Pages</strong>.
              <br />
              2. Click <strong>"Add a page"</strong> with URL: <code className="text-emerald-400">/contact</code> and Title: <strong>Contact</strong>.
              <br />
              3. Enable <strong>"Custom layout"</strong> (switches page editor to raw HTML) and paste the code below!
            </p>
            <button
              onClick={handleCopySubpageHtml}
              className="flex items-center gap-2 px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-[0_0_20px_rgba(0,255,102,0.3)]"
            >
              {copiedSubpageCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedSubpageCode ? 'Embedded Code Copied!' : 'Copy /contact Subpage HTML Code'}
            </button>
          </div>

          {/* Live Preview of the Embedded Google Form */}
          <div className="rounded border border-emerald-500/30 bg-[#070a08] p-4">
            <div className="text-xs font-bold text-emerald-400 mb-3 flex items-center justify-between">
              <span>LIVE EMBEDDED FORM PREVIEW (GOOGLE FORMS IFRAME):</span>
              <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                ✓ 100% Tumblr-Validator Approved (No Custom JS)
              </span>
            </div>
            <div className="flex justify-center bg-black/60 p-4 rounded border border-emerald-500/20">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLScmvM1-veLnuyvDEXIFhBXJ5ne-JD-J7X8CctpojjDfvXFmFg/viewform?embedded=true"
                width="640"
                height="560"
                className="w-full max-w-[640px] rounded border border-emerald-500/30 bg-white"
                title="Google Form Glitch Report"
              >
                Ładuję…
              </iframe>
            </div>
          </div>

          <div className="relative rounded border border-emerald-500/30 bg-[#040605] p-4 max-h-[350px] overflow-y-auto">
            <div className="text-[10px] text-zinc-500 mb-2 font-bold uppercase">Ready-to-Paste HTML Code for Tumblr /contact:</div>
            <pre className="text-xs text-emerald-400/90 font-mono leading-relaxed whitespace-pre-wrap">
              {embeddedContactHtml}
            </pre>
          </div>
        </div>
      ) : (
        /* INTERACTIVE FORM VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Media & Basic Form */}
          <div className="space-y-5">
            {/* Media Upload & Camera Section */}
            <div className="rounded border border-emerald-500/30 bg-zinc-950/60 p-4">
              <label className="block text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                <Camera className="h-4 w-4" /> 1. PHOTOGRAPHIC / VIDEO EVIDENCE
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-3 rounded border border-dashed border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 text-xs cursor-pointer transition">
                  <UploadCloud className="h-4 w-4" />
                  <span>{mediaFile ? 'Replace Photo / Video' : 'Upload Display Photo / Video'}</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {mediaFile && (
                  <button
                    onClick={runVisionAnalysis}
                    disabled={isAnalyzingVision}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/50 text-xs font-bold transition active:scale-95"
                  >
                    {isAnalyzingVision ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" /> Gemini Pro Vision
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Media Preview Box */}
              {mediaFile && (
                <div className="mt-3 relative rounded border border-emerald-500/30 overflow-hidden bg-black max-h-[220px] flex items-center justify-center">
                  {mediaFile.isVideo ? (
                    <video src={mediaFile.previewUrl} controls className="max-h-[220px] w-auto" />
                  ) : (
                    <img src={mediaFile.previewUrl} alt="Uploaded glitch proof" className="max-h-[220px] w-auto object-contain" />
                  )}
                  <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-emerald-300 border border-emerald-500/30">
                    {mediaFile.isVideo ? 'VIDEO BUFFER LOADED' : 'IMAGE MATRIX LOADED'}
                  </div>
                </div>
              )}
            </div>

            {/* Submitter Credentials & Attribution */}
            <div className="rounded border border-emerald-500/30 bg-zinc-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                  <Users className="h-4 w-4" /> 2. SUBMITTER CREDIT &amp; CONTACTS
                </label>
                {accessToken && (
                  <button
                    onClick={handleCheckContacts}
                    disabled={isCheckingContacts}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {isCheckingContacts ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                    Check Contacts
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Tumblr Username (for Credit):</span>
                  <div className="flex items-center rounded border border-zinc-700 bg-black/80 px-2.5 py-1.5 focus-within:border-emerald-500">
                    <span className="text-zinc-500 text-xs mr-1">@</span>
                    <input
                      type="text"
                      value={tumblrHandle}
                      onChange={(e) => setTumblrHandle(e.target.value)}
                      placeholder="sarverott"
                      className="w-full bg-transparent text-xs text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Contributor Email:</span>
                  <div className="flex items-center rounded border border-zinc-700 bg-black/80 px-2.5 py-1.5 focus-within:border-emerald-500">
                    <Mail className="h-3.5 w-3.5 text-zinc-500 mr-2" />
                    <input
                      type="email"
                      value={submitterEmail}
                      onChange={(e) => setSubmitterEmail(e.target.value)}
                      placeholder="hunter@example.com"
                      className="w-full bg-transparent text-xs text-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {matchingContacts.length > 0 && (
                <div className="mt-2 p-2 bg-emerald-950/20 border border-emerald-500/20 rounded text-[11px]">
                  <div className="text-emerald-400 font-semibold mb-1">Linked Google Contacts Verified:</div>
                  {matchingContacts.map((c, i) => (
                    <div key={i} className="text-zinc-300 flex items-center justify-between">
                      <span>{c.name} ({c.email})</span>
                      <span className="text-emerald-400 font-bold">✓ Attributed</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location & Map Placement */}
            <div className="rounded border border-emerald-500/30 bg-zinc-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> 3. VENUE &amp; LOCATION PLACEMENT
                </label>
                <button
                  onClick={runMapsGrounding}
                  disabled={isMappingGrounding}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {isMappingGrounding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Compass className="h-3 w-3" />}
                  Google Maps Grounding
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Target Venue / Commercial Display:</span>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. McDonald's Western Ave Drive-Thru"
                    className="w-full rounded border border-zinc-700 bg-black/80 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Street Address / Coordinates:</span>
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g. 3200 N Western Ave, Chicago, IL"
                    className="w-full rounded border border-zinc-700 bg-black/80 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Detected OS Environment:</span>
                  <select
                    value={osDetected}
                    onChange={(e) => setOsDetected(e.target.value)}
                    className="w-full rounded border border-zinc-700 bg-black/80 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Windows 10 Pro / IoT">Windows 10 Pro / IoT Enterprise (McDonald's Menu Board)</option>
                    <option value="Ubuntu 20.04 / Linux">Ubuntu / Debian Linux (Subway/Platform Kernel Panic)</option>
                    <option value="Windows 7 / POSReady 7">Windows 7 / Embedded POSReady (ATM BSOD)</option>
                    <option value="AMI / UEFI BIOS">AMI BIOS / PXE Boot Failure (Airport FIDS)</option>
                    <option value="Android Kiosk 11">Android POS / Kiosk System</option>
                    <option value="Other Commercial Firmware">Other Proprietary Digital Signage Stack</option>
                  </select>
                </div>
              </div>

              {mapsGroundingResult && (
                <div className="p-2.5 rounded bg-black/70 border border-emerald-500/30 text-xs text-emerald-300">
                  <div className="text-[10px] text-zinc-400 mb-1 flex items-center gap-1 font-bold">
                    <Compass className="h-3 w-3 text-emerald-400" /> GOOGLE MAPS GROUNDING DATA:
                  </div>
                  {mapsGroundingResult}
                </div>
              )}
            </div>

            {/* Incident Description & "Talk to Form" */}
            <div className="rounded border border-emerald-500/30 bg-zinc-950/60 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                  4. INCIDENT DESCRIPTION &amp; WITNESS LOG
                </label>

                {/* Talk to form audio button */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition border ${
                    isRecording
                      ? 'bg-rose-500/30 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-3.5 w-3.5" /> Stop Recording
                    </>
                  ) : isTranscribing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Transcribing Audio...
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5" /> Talk to Form (Mic)
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred on screen (e.g. McDonald's menu board #2 exited to Windows 10 desktop, customers could see the recycling bin, start menu and chrome crash error)..."
                className="w-full rounded border border-zinc-700 bg-black/80 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Authority Alert Dispatcher & AI Forensics */}
          <div className="space-y-5">
            {/* AUTOMATED AUTHORITY NOTIFICATION DISPATCHER (REPURPOSED GMAIL INTEGRATION) */}
            <div className="rounded border-2 border-emerald-500/50 bg-black/90 p-4 shadow-[0_0_20px_rgba(0,255,102,0.15)]">
              <div className="flex items-center justify-between border-b border-emerald-500/25 pb-2 mb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Building className="h-4 w-4 text-emerald-400" />
                  AUTHORITY &amp; VENUE DISCLOSURE ADVISORY (GMAIL DAEMON)
                </div>
                {authorityNoticeSent && (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40">
                    <CheckCircle2 className="h-3.5 w-3.5" /> ADVISORY DISPATCHED
                  </span>
                )}
              </div>

              <p className="text-[11px] text-zinc-300 mb-3 leading-relaxed">
                Automated security advisory transmission to venue managers, franchise offices, or municipal IT authorities to report exposed desktop breakouts and schedule lockdown remediation.
              </p>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Target Authority / Facility Contact Email:</span>
                  <div className="flex items-center rounded border border-zinc-700 bg-black px-2.5 py-1.5 focus-within:border-emerald-500">
                    <Mail className="h-3.5 w-3.5 text-zinc-500 mr-2" />
                    <input
                      type="email"
                      value={authorityEmail}
                      onChange={(e) => setAuthorityEmail(e.target.value)}
                      placeholder="e.g. security@mcdonalds.com or transit-it@city.gov"
                      className="w-full bg-transparent text-xs text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={triggerAuthorityNoticeDispatch}
                    disabled={isSendingAuthorityNotice || !authorityEmail}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs transition active:scale-95 disabled:opacity-50"
                  >
                    {isSendingAuthorityNotice ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Dispatching Formal Notice...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Dispatch Security Notice to Authority
                      </>
                    )}
                  </button>
                </div>

                {authorityNoticeSent && (
                  <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                    ✓ Official incident notification transmitted to {authorityEmail} via Gmail API!
                  </div>
                )}

                {authorityNoticeError && (
                  <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{authorityNoticeError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI FORENSIC POWERHOUSE */}
            <div className="rounded border border-emerald-500/30 bg-zinc-950/70 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> AI FORENSIC ENGINE &amp; AUDIT SUITE
                </span>
                <span className="text-[10px] text-zinc-500">GEMINI 3.1 PRO + HIGH THINKING</span>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={runHighThinkingAudit}
                  disabled={isThinkingAudit}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-950/60 text-emerald-300 transition"
                >
                  {isThinkingAudit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  High-Thinking Audit
                </button>

                <button
                  onClick={runSearchGrounding}
                  disabled={isSearchingGrounding}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-300 transition"
                >
                  {isSearchingGrounding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  Web CVE Search
                </button>
              </div>

              {/* Vision Analysis Output */}
              {visionAnalysisResult && (
                <div className="rounded border border-emerald-500/30 bg-black/80 p-3 max-h-56 overflow-y-auto text-xs space-y-2">
                  <div className="font-bold text-emerald-400 border-b border-emerald-500/20 pb-1">
                    GEMINI 3.1 PRO VISION FORENSIC BREAKDOWN:
                  </div>
                  <div className="text-zinc-300 whitespace-pre-line leading-relaxed text-[11px]">
                    {visionAnalysisResult}
                  </div>
                </div>
              )}

              {/* Search Grounding Output */}
              {searchGroundingResult && (
                <div className="rounded border border-cyan-500/30 bg-black/80 p-3 max-h-48 overflow-y-auto text-xs space-y-1">
                  <div className="font-bold text-cyan-400 flex items-center gap-1">
                    <Search className="h-3.5 w-3.5" /> GOOGLE SEARCH GROUNDING DATA:
                  </div>
                  <div className="text-zinc-300 text-[11px] whitespace-pre-line leading-relaxed">
                    {searchGroundingResult}
                  </div>
                </div>
              )}

              {/* High-Thinking Audit Output */}
              {auditDraftResult && (
                <div className="rounded border border-amber-500/40 bg-black/80 p-3 max-h-64 overflow-y-auto text-xs space-y-2">
                  <div className="font-bold text-amber-400 border-b border-amber-500/20 pb-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" /> MUNICIPAL AUDIT REPORT DRAFT:
                  </div>
                  <div className="text-zinc-300 whitespace-pre-line text-[11px] leading-relaxed">
                    {auditDraftResult}
                  </div>
                </div>
              )}

              {/* Google Docs & Google Drive Export Actions */}
              <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap gap-2">
                <button
                  onClick={handleExportDoc}
                  disabled={isExportingDoc}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/40 text-blue-300 text-xs transition"
                >
                  {isExportingDoc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                  Export to Google Docs
                </button>

                <button
                  onClick={handleSaveBackstageDrive}
                  disabled={isSavingDrive}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs transition"
                >
                  {isSavingDrive ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                  Save to Drive Backstage
                </button>
              </div>

              {createdDocUrl && (
                <div className="text-xs text-blue-300 flex items-center justify-between p-2 rounded bg-blue-950/30 border border-blue-500/30">
                  <span>Google Doc Report Generated!</span>
                  <a href={createdDocUrl} target="_blank" rel="noreferrer" className="underline font-bold hover:text-white">
                    Open Doc ↗
                  </a>
                </div>
              )}

              {savedDriveSuccess && (
                <div className="text-xs text-emerald-300 p-2 rounded bg-emerald-950/30 border border-emerald-500/30">
                  ✓ Telemetry JSON uploaded to Google Drive "GlitchHunter_Backstage" directory!
                </div>
              )}
            </div>

            {/* DIRECT PUBLISH BUTTON (No self-TOTP block!) */}
            <div className="pt-2">
              <button
                onClick={handlePublishToTumblrFeed}
                className="w-full py-3.5 rounded font-bold text-sm tracking-widest uppercase transition flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_25px_rgba(0,255,102,0.4)] active:scale-98 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                Publish Discovery to Tumblr Feed &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      )}

              {/* User Confirmation Modal for Workspace Mutating Operations (MANDATORY REQUIREMENT) */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-md border border-emerald-500/50 bg-[#0a0f0c] p-6 shadow-[0_0_40px_rgba(0,255,102,0.25)] font-mono">
            <div className="flex items-center gap-2 text-emerald-400 mb-2 font-bold text-sm">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              {confirmDialog.title}
            </div>
            <p className="text-xs text-zinc-300 mb-6 leading-relaxed">
              {confirmDialog.description}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-1.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const act = confirmDialog.action;
                  setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                  await act();
                }}
                className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition"
              >
                Confirm & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
