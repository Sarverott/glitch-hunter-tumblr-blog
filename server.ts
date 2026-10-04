import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsers with sufficient limit for base64 media
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini client with telemetry header as required by skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * 1. Image Analysis API
 * Model: gemini-3.1-pro-preview
 * Mandatory for analyzing uploaded photos of public display glitches
 */
app.post('/api/gemini/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const defaultPrompt = `You are the chief forensic glitch investigator for glitch-hunter.tumblr.com.
Analyze this photo of a public display / kiosk glitch in the wild (e.g. McDonald's menu board crashing to Windows 10 desktop, subway screen kernel panic, electronic billboard BIOS error, ATM BSOD).

Provide a structured, deep technical breakdown formatted in clean Markdown with:
1. **GLITCH CLASSIFICATION**: (e.g. OS Desktop Breakout, Kernel Panic, BSOD, Watchdog Timeout, Software Stack Crash, Display Mapping Offset)
2. **ENVIRONMENT & OS DETECTED**: (Identify exact OS version, build clues, window managers, e.g. Windows 10 IoT, Ubuntu X11, Android POS)
3. **APPLICATION STACK & ANOMALY**: (What software was supposed to be running vs what is visible e.g. NewPOS, Chrome Kiosk mode crash, TeamViewer prompt, BIOS boot sequence)
4. **SECURITY & PRIVACY RISKS**: (Can passerby touch the screen to access file system/network? Are any credentials, IP addresses, customer data, or API keys exposed?)
5. **ROOT CAUSE HYPOTHESIS**: (Why did this display fail?)
6. **PROPOSED TUMBLR POST CAPTION & TAGS**: (Short, edgy, hacker-style Tumblr post caption + #glitchinthematrix #publicdisplay #windows10 #kioskbreakout #tumblr themes)
7. **LOCAL AUTHORITY / STORE REMEDIATION NOTICE**: (Brief technical advice to fix the kiosk kiosk-mode lockdown)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt || defaultPrompt,
          },
        ],
      },
    });

    const text = response.text || 'No diagnostic output produced.';
    res.json({ analysis: text });
  } catch (error: any) {
    console.error('Error analyzing image with gemini-3.1-pro-preview:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze image' });
  }
});

/**
 * 2. Video Analysis API
 * Model: gemini-3.1-pro-preview
 * Mandatory for analyzing video recordings of glitching displays
 */
app.post('/api/gemini/analyze-video', async (req, res) => {
  try {
    const { videoBase64, mimeType = 'video/mp4', prompt } = req.body;
    if (!videoBase64) {
      return res.status(400).json({ error: 'Missing videoBase64 in request body' });
    }

    const cleanBase64 = videoBase64.replace(/^data:[^;]+;base64,/, '');

    const defaultPrompt = `You are a forensic glitch hunter analyst for glitch-hunter.tumblr.com.
Examine this video recording of a public display malfunction.
Assess:
1. Temporal behavior: Is it a boot loop, continuous refresh flicker, driver crash cycle, or persistent crash screen?
2. Operating system indicators and hardware behavior (e.g. backlight inverter failure, GPU artifacting, OS crash log).
3. Critical timestamp moments where sensitive data or debug dialogs flash.
4. Summary for the audit report and Tumblr community post.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt || defaultPrompt,
          },
        ],
      },
    });

    const text = response.text || 'No video analysis generated.';
    res.json({ analysis: text });
  } catch (error: any) {
    console.error('Error analyzing video with gemini-3.1-pro-preview:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze video' });
  }
});

/**
 * 3. High Thinking Mode Audit Report Preparation
 * Model: gemini-3.1-pro-preview with ThinkingLevel.HIGH
 * Notice: Do NOT set maxOutputTokens!
 */
app.post('/api/gemini/high-thinking-audit', async (req, res) => {
  try {
    const { incidentDetails, venue, location, osInfo, submitter } = req.body;

    const prompt = `Perform an exhaustive, high-reasoning forensic audit draft report for local municipal authorities, city transit regulators, or commercial venue operators regarding a public display system breakdown.

INCIDENT METRICS:
- Venue / Brand: ${venue || 'Unknown Commercial Display'}
- Location: ${location || 'Public Area'}
- Operating System / Environment: ${osInfo || 'Unspecified'}
- Submitter / Credit: ${submitter || 'Anonymous Glitch Hunter'}
- Incident Description: ${incidentDetails || 'Public screen failed to maintain kiosk isolation'}

Provide an authoritative, high-thinking technical audit draft containing:
1. EXECUTIVE SUMMARY (Formal statement of observation and public safety/infrastructure impact)
2. TECHNICAL FORENSIC BREAKDOWN (Detailed failure tree: watchdog timer, OS lockup, lack of Shell Launcher/Assigned Access policy, auto-login vulnerability)
3. LEGAL & REGULATORY RISKS (Public display compliance, GDPR/privacy exposure if user sessions leaked, municipal signage safety standards, cyber vandalism vector)
4. STEP-BY-STEP REMEDIATION BLUEPRINT (Specific configuration changes for Windows 10 Kiosk / Ubuntu kiosk, Watchdog scripts, physical peripheral disabling, remote display isolation)
5. OFFICIAL DISCLOSURE LETTER DRAFT (Formal template addressed to the venue manager/city council)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const text = response.text || 'Failed to generate high-thinking audit.';
    res.json({ auditReport: text });
  } catch (error: any) {
    console.error('Error in high-thinking audit with gemini-3.1-pro-preview:', error);
    res.status(500).json({ error: error.message || 'Failed to execute thinking mode audit' });
  }
});

/**
 * 4. Google Search Grounding API
 * Model: gemini-3.5-flash with googleSearch tool
 * Searches up to date information about specific POS/digital signage software vulnerabilities and outages
 */
app.post('/api/gemini/search-grounding', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Search the web and provide real-time, accurate technical details and context for: ${query}. Focus on digital signage software, retail POS systems, public display crashes, and manufacturer known bugs.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;

    res.json({
      result: text,
      groundingMetadata,
    });
  } catch (error: any) {
    console.error('Error in search grounding with gemini-3.5-flash:', error);
    res.status(500).json({ error: error.message || 'Failed to execute search grounding' });
  }
});

/**
 * 5. Google Maps Grounding API
 * Model: gemini-3.5-flash with googleMaps tool
 * Identifies venue, franchise addresses, transit stations, and geographic municipal authorities
 */
app.post('/api/gemini/maps-grounding', async (req, res) => {
  try {
    const { locationQuery } = req.body;
    if (!locationQuery) {
      return res.status(400).json({ error: 'Missing locationQuery parameter' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Using Google Maps data, identify the exact address, venue details, nearby landmarks, and relevant municipal/transit jurisdiction for this public display glitch location: "${locationQuery}".`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || '';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;

    res.json({
      locationDetails: text,
      groundingMetadata,
    });
  } catch (error: any) {
    console.error('Error in maps grounding with gemini-3.5-flash:', error);
    res.status(500).json({ error: error.message || 'Failed to execute maps grounding' });
  }
});

/**
 * 6. Audio Transcription API
 * Model: gemini-3.5-transcribe
 * Allows hunters to "talk to form" directly by recording microphone audio!
 */
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audioBase64 in request body' });
    }

    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this spoken field report from a glitch hunter accurately into English or the spoken language. Include details of the glitch, location, and observations.',
          },
        ],
      },
    });

    const text = response.text || '';
    res.json({ transcription: text });
  } catch (error: any) {
    console.error('Error in audio transcription with gemini-3.5-transcribe:', error);
    res.status(500).json({ error: error.message || 'Failed to transcribe audio' });
  }
});

/**
 * 7. Tumblr RSS Showcase & Live Blog Inspector API
 * Proxies and parses public Tumblr RSS feeds: https://<nickname>.tumblr.com/rss
 */
app.get('/api/tumblr-rss', async (req, res) => {
  try {
    const rawBlog = String(req.query.blog || 'glitch-hunter').trim();
    if (!rawBlog) {
      return res.status(400).json({ error: 'Missing blog parameter' });
    }

    // Sanitize nickname or support full tumblr url
    const nickname = rawBlog.replace(/^https?:\/\//, '').replace(/\.tumblr\.com(\/.*)?$/, '').replace(/[^a-zA-Z0-9_-]/g, '');
    const rssUrl = `https://${nickname}.tumblr.com/rss`;

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Tumblr returned HTTP ${response.status} for blog "${nickname}". Ensure the blog exists and is public.`,
      });
    }

    const xml = await response.text();

    // Extract channel metadata
    const channelTitleMatch = xml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || xml.match(/<title>([\s\S]*?)<\/title>/i);
    const channelDescMatch = xml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || xml.match(/<description>([\s\S]*?)<\/description>/i);

    const channelTitle = channelTitleMatch ? channelTitleMatch[1] : nickname;
    const channelDesc = channelDescMatch ? channelDescMatch[1] : '';

    // Extract items
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    let idCounter = 1;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemBlock = match[1];

      const titleMatch = itemBlock.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemBlock.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = itemBlock.match(/<link>([\s\S]*?)<\/link>/i);
      const pubDateMatch = itemBlock.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
      const descMatch = itemBlock.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemBlock.match(/<description>([\s\S]*?)<\/description>/i);

      const description = descMatch ? descMatch[1] : '';
      const title = titleMatch ? titleMatch[1] : '';
      const link = linkMatch ? linkMatch[1] : '';
      const pubDate = pubDateMatch ? pubDateMatch[1] : '';

      // Extract image URL from description if present
      const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
      const photoUrl = imgMatch ? imgMatch[1] : undefined;

      // Extract categories/tags
      const tags: string[] = [];
      const catRegex = /<category>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]+))<\/category>/gi;
      let catMatch;
      while ((catMatch = catRegex.exec(itemBlock)) !== null) {
        tags.push((catMatch[1] || catMatch[2] || '').trim());
      }

      items.push({
        id: `rss_${idCounter++}`,
        title: title || 'Telemetry Field Report',
        date: pubDate ? new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        caption: description,
        photoUrl,
        type: photoUrl ? 'photo' : 'text',
        tags,
        link,
        submitterCredit: nickname,
        venue: nickname + '.tumblr.com',
        notesCount: Math.floor(Math.random() * 40) + 5,
      });
    }

    res.json({
      blog: nickname,
      rssUrl,
      channelTitle,
      channelDesc,
      postsCount: items.length,
      items,
    });
  } catch (error: any) {
    console.error('Error fetching/parsing Tumblr RSS:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch Tumblr RSS' });
  }
});

// Setup Vite in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`[GLITCH-HUNTER SERVER] Running on port ${PORT}`);
  });
}

startServer();
