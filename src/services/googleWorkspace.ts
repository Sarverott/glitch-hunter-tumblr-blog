/**
 * Google Workspace & Firebase Authentication Service
 * Manages OAuth credentials in-memory and provides client-side integrations for:
 * - Firebase Auth (Sign in with Google)
 * - Google Drive (Backstage logs, debug payloads, scripts)
 * - Gmail (TOTP email dispatch for verifiable submitter authentication)
 * - Google Contacts (People API hunter profile verification & crediting)
 * - Google Forms (Automated glitch submission form creation & linking)
 * - Google Docs (Audit Draft Report generation for local authorities)
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Dynamic Firebase configuration utilizing environment variables
const clientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (firebaseConfig as any)?.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfig as any)?.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (firebaseConfig as any)?.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (firebaseConfig as any)?.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfig as any)?.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (firebaseConfig as any)?.appId,
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(clientConfig);
export const auth = getAuth(app);

// Provider with required Workspace scopes
export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/documents',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory access token storage (Security requirement: never in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google Auth Provider');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// -------------------------------------------------------------
// 1. GOOGLE DRIVE: Backstage Data & Scripts
// -------------------------------------------------------------

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  webViewLink?: string;
}

export const getOrCreateBackstageFolder = async (token: string): Promise<string> => {
  const query = encodeURIComponent("name = 'GlitchHunter_Backstage' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await searchRes.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'GlitchHunter_Backstage',
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Backstage scripts, debug telemetry, and audit logs for glitch-hunter.tumblr.com',
    }),
  });
  const newFolder = await createRes.json();
  return newFolder.id;
};

export const listBackstageDriveFiles = async (token: string): Promise<DriveFileItem[]> => {
  const folderId = await getOrCreateBackstageFolder(token);
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,createdTime,webViewLink)`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.files || [];
};

export const uploadBackstageFile = async (
  token: string,
  filename: string,
  content: string,
  mimeType: string = 'text/plain'
): Promise<DriveFileItem> => {
  const folderId = await getOrCreateBackstageFolder(token);

  const metadata = {
    name: filename,
    parents: [folderId],
    mimeType: mimeType,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  return await res.json();
};

// -------------------------------------------------------------
// 2. GMAIL: Automated Authority / Venue Incident Notification Dispatch
// -------------------------------------------------------------

export interface AuthorityIncidentData {
  incidentId: string;
  venue: string;
  location: string;
  osDetected: string;
  submitterCredit: string;
  reportSummary: string;
  remediationAdvice?: string;
  attachedDocUrl?: string;
}

export const sendAuthorityIncidentNotification = async (
  token: string,
  recipientEmail: string,
  data: AuthorityIncidentData
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const subject = `[SECURITY NOTICE // REF ${data.incidentId}] Public Display Kiosk Breakout - ${data.venue}`;
    const bodyText = `[GLITCH-HUNTER FORENSIC INCIDENT DISCLOSURE]
========================================================================
TO: Facility Management / IT Infrastructure / Municipal Display Authority
SUBJECT: KIOSK SHELL BREAKOUT & DISPLAY MALFUNCTION ADVISORY
INCIDENT ID: ${data.incidentId}
TIMESTAMP: ${new Date().toUTCString()}
VENUE / ASSET: ${data.venue}
LOCATION: ${data.location}
DETECTED OS & ENVIRONMENT: ${data.osDetected}
DISCOVERED BY: Glitch Hunter (@${data.submitterCredit})
========================================================================

1. INCIDENT OVERVIEW:
A commercial public display screen at the referenced location was observed
and documented to have crashed or exited its designated kiosk mode. Rather
than displaying intended commercial or transit content, the display is exposing
underlying operating system desktop components, system utilities, or crash dialogs.

2. FORENSIC SUMMARY & VULNERABILITY ASSESSMENT:
${data.reportSummary}

3. RECOMMENDED SECURITY & REMEDIATION ACTIONS:
${data.remediationAdvice || `- Immediately deploy Shell Launcher / Assigned Access policies to isolate the desktop shell.
- Disable auto-login to administrator accounts on commercial signage units.
- Block physical USB/peripherals on exposed kiosk ports.
- Enforce watchdog process monitoring to reboot failed signage loops cleanly.`}

${data.attachedDocUrl ? `Full Formal Audit Document (Google Docs):\n${data.attachedDocUrl}\n` : ''}
========================================================================
This automated advisory was prepared by the glitch-hunter.tumblr.com
community forensic reporting suite to aid public safety and digital signage integrity.
`;

    const rawMessage = [
      `To: ${recipientEmail}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      bodyText,
    ].join('\r\n');

    // Base64url encode
    const utf8Bytes = new TextEncoder().encode(rawMessage);
    let binary = '';
    utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const base64 = btoa(binary);
    const base64Url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: base64Url }),
    });

    const respData = await res.json();
    if (!res.ok) {
      throw new Error(respData.error?.message || 'Failed to send authority notification email');
    }
    return { success: true, messageId: respData.id };
  } catch (err: any) {
    console.error('Error sending authority notification email:', err);
    return { success: false, error: err.message || 'Gmail transmission failed' };
  }
};

// -------------------------------------------------------------
// 3. GOOGLE CONTACTS: Check / Crediting Submitters
// -------------------------------------------------------------

export interface ContactItem {
  resourceName: string;
  name?: string;
  email?: string;
  photoUrl?: string;
}

export const fetchGoogleContacts = async (token: string): Promise<ContactItem[]> => {
  try {
    const res = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos&pageSize=100',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    if (!data.connections) return [];
    return data.connections.map((c: any) => ({
      resourceName: c.resourceName,
      name: c.names?.[0]?.displayName || 'Unknown Contact',
      email: c.emailAddresses?.[0]?.value || '',
      photoUrl: c.photos?.[0]?.url || '',
    }));
  } catch (err) {
    console.error('Error fetching contacts:', err);
    return [];
  }
};

// -------------------------------------------------------------
// 4. GOOGLE FORMS: Create & Link /contact Form
// -------------------------------------------------------------

export interface GoogleFormInfo {
  formId: string;
  responderUri: string;
  title: string;
}

export const createGlitchReportGoogleForm = async (
  token: string
): Promise<GoogleFormInfo> => {
  // Step 1: Create Form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: 'Glitch Hunter // Public Display Anomalies Submission',
        documentTitle: 'Glitch-Hunter Community Submissions Form',
      },
    }),
  });

  const form = await createRes.json();
  if (!createRes.ok) {
    throw new Error(form.error?.message || 'Failed to initialize Google Form');
  }

  const formId = form.formId;

  // Step 2: Add question items via batchUpdate
  const batchRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          createItem: {
            item: {
              title: 'Submitter Tumblr Handle (e.g. glitch-hunter or cyber-archivist)',
              description: 'Used to attribute and credit discovery on glitch-hunter.tumblr.com',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: false },
                },
              },
            },
            location: { index: 0 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Verified Contact Email',
              description: 'For sending TOTP confirmation and verification status',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: false },
                },
              },
            },
            location: { index: 1 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Public Glitch Location & Venue',
              description: 'e.g. McDonald’s Drive-Thru Screen 2, Downtown Metro Station Platform B',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: false },
                },
              },
            },
            location: { index: 2 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Glitch Classification & Observed Environment',
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: 'RADIO',
                    options: [
                      { value: 'Windows 10/11 Desktop Breakout (e.g. Start menu, taskbar visible)' },
                      { value: 'Blue Screen of Death (BSOD) / Kernel Panic' },
                      { value: 'BIOS / UEFI / Bootloader Failure / PXE TFTP Boot' },
                      { value: 'TeamViewer / Remote Desktop Login Prompt' },
                      { value: 'Unlicensed Software / Windows Activation Watermark' },
                      { value: 'Hardware Artifacts / Memory Corruption / Matrix Glitch' },
                    ],
                  },
                },
              },
            },
            location: { index: 3 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Incident Description & Witness Details',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: true },
                },
              },
            },
            location: { index: 4 },
          },
        },
      ],
    }),
  });

  if (!batchRes.ok) {
    console.warn('Batch update of form items warning:', await batchRes.text());
  }

  return {
    formId: form.formId,
    responderUri: form.responderUri || `https://docs.google.com/forms/d/${form.formId}/viewform`,
    title: form.info?.title || 'Glitch Hunter Submission Form',
  };
};

// -------------------------------------------------------------
// 5. GOOGLE DOCS: Municipal / Venue Glitch Audit Draft Report
// -------------------------------------------------------------

export interface AuditDocResult {
  documentId: string;
  title: string;
  docUrl: string;
}

export const createGlitchAuditReportDoc = async (
  token: string,
  title: string,
  reportMarkdown: string
): Promise<AuditDocResult> => {
  // Step 1: Create blank doc
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `[GLITCH AUDIT REPORT] ${title}`,
    }),
  });

  const doc = await createRes.json();
  if (!createRes.ok) {
    throw new Error(doc.error?.message || 'Failed to create Google Doc');
  }

  const documentId = doc.documentId;

  // Step 2: Insert formatted report text
  const cleanText = `${reportMarkdown}\n\n---\nReport compiled automatically by glitch-hunter.tumblr.com forensic investigation suite.\nPowered by Google Workspace & Gemini Thinking Forensic Engine.`;

  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: cleanText,
          },
        },
      ],
    }),
  });

  return {
    documentId: documentId,
    title: doc.title,
    docUrl: `https://docs.google.com/document/d/${documentId}/edit`,
  };
};
