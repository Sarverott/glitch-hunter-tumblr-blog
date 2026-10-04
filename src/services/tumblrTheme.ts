/**
 * Tumblr Theme Generator & Glitch Post Catalog
 * Designed strictly according to official Tumblr Custom Theme documentation:
 * https://www.tumblr.com/docs/pl/custom_themes
 */

export interface TumblrPost {
  id: string;
  type: 'photo' | 'text' | 'video' | 'quote' | 'link' | 'chat' | 'answer';
  title?: string;
  body?: string;
  caption?: string;
  photoUrl?: string;
  videoUrl?: string;
  quote?: string;
  source?: string;
  linkUrl?: string;
  linkName?: string;
  asker?: string;
  question?: string;
  answer?: string;
  tags: string[];
  notesCount: number;
  date: string;
  location: string;
  osDetected: string;
  venue: string;
  isReblog?: boolean;
  reblogFrom?: string;
  submitterCredit?: string;
  verifiedTotp?: boolean;
}

export const SAMPLE_GLITCH_POSTS: TumblrPost[] = [
  {
    id: 'gh-1092',
    type: 'photo',
    title: 'Drive-Thru Menu Board Crash // McDonald’s Windows 10 Breakout',
    photoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    caption: `<strong>SECTOR 4 REPORT:</strong> Order display screen #2 crashed right in front of the drive-thru lane. Instead of the Big Mac meal promo, the signage player exited to standard Windows 10 Pro 64-bit desktop.<br><br>Visible on screen: NewPOS kiosk batch launcher aborted, Task Manager open showing 98% memory consumption, and standard Windows 10 wallpaper with visible Start button. Customers were placing orders by describing which folder the cursor hovered over!`,
    tags: ['mcdonalds', 'windows10', 'publicdisplay', 'glitchinthematrix', 'kioskbreakout', 'posfail'],
    notesCount: 4821,
    date: 'OCTOBER 03, 2026',
    location: 'Chicago, IL — Western Ave Drive-Thru',
    osDetected: 'Windows 10 Pro 22H2',
    venue: "McDonald's Franchise #4412",
    submitterCredit: 'cyber_wanderer_09',
    verifiedTotp: true,
  },
  {
    id: 'gh-1093',
    type: 'photo',
    title: 'Subway Central Platform Arrivals // Linux Kernel Panic',
    photoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    caption: `Digital platform arrival time screen dropped out of the transit schedule app into raw Linux kernel panic: <code>Kernel panic - not syncing: Fatal exception in interrupt</code>.<br><br>The entire commuter platform stood staring at memory register dumps and stack addresses instead of the next train to South Ferry.`,
    tags: ['transit', 'subway', 'linux', 'kernelpanic', 'matrix', 'terminal'],
    notesCount: 2319,
    date: 'SEPTEMBER 28, 2026',
    location: 'Metropolitan Transit Center, Platform 3',
    osDetected: 'Ubuntu 20.04 LTS (Kernel 5.4.0-89-generic)',
    venue: 'City Transit Authority',
    submitterCredit: 'sarverott',
    verifiedTotp: true,
  },
  {
    id: 'gh-1094',
    type: 'photo',
    title: 'Times Square High-Rise LED Billboard // TeamViewer ID & Password Leak',
    photoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    caption: `30-meter roadside commercial LED billboard failed its media sync loop and displayed a full screen TeamViewer v14 remote desktop dialog. The 9-digit partner ID and 4-digit temporary PIN were glowing in 4K across the entire avenue for 45 minutes before power-cycling!`,
    tags: ['billboard', 'teamviewer', 'cybersecurity', 'infosec', 'displayglitch'],
    notesCount: 8940,
    date: 'SEPTEMBER 21, 2026',
    location: 'Midtown Manhattan LED Cluster',
    osDetected: 'Windows 10 IoT Enterprise',
    venue: 'ClearMedia Outdoor Displays',
    submitterCredit: 'net_stalker',
    verifiedTotp: true,
  },
  {
    id: 'gh-1095',
    type: 'quote',
    quote: 'The real world is merely an unhandled exception caught by a digital signage player.',
    source: 'Anonymous Glitch Hunter Logbook #404',
    tags: ['quote', 'matrix', 'cyberpunk', 'glitchphilosophy'],
    notesCount: 1205,
    date: 'SEPTEMBER 15, 2026',
    location: 'Encrypted Backstage BBS',
    osDetected: 'N/A',
    venue: 'Glitch Hunter Collective',
    submitterCredit: 'daemon_zero',
    verifiedTotp: true,
  },
  {
    id: 'gh-1096',
    type: 'answer',
    asker: 'neon_drifter',
    question: 'Why do so many fast food drive-thrus still run full Windows 10 desktops instead of lightweight locked microcontrollers?',
    answer: 'Legacy corporate POS software! Many digital menu boards are tied to restaurant inventory suites that were compiled 15 years ago for Win32. They slap a standard mini-PC behind each LG commercial panel, disable Windows Update, and cross their fingers that Explorer.exe never crashes back to the desktop. When watchdog scripts fail, the matrix is revealed.',
    tags: ['ask', 'qanda', 'pos', 'architecture', 'windows'],
    notesCount: 3410,
    date: 'SEPTEMBER 10, 2026',
    location: 'Q&A Archive',
    osDetected: 'All Platforms',
    venue: 'Community Discussion',
    submitterCredit: 'admin',
    verifiedTotp: true,
  },
];

/**
 * Generates official, valid, standalone Tumblr theme HTML code
 * referencing official tumblr theme operators:
 * {Title}, {Description}, {block:Posts}, {block:Text}, {block:Photo},
 * {block:Quote}, {block:Answer}, {block:HasTags}, {block:Pages}, etc.
 */
export const generateTumblrThemeHtml = (options?: {
  accentColor?: string;
  bgColor?: string;
  blogTitle?: string;
  enableMatrixRain?: boolean;
}): string => {
  const accent = options?.accentColor || '#00ff66';
  const bg = options?.bgColor || '#0a0d0b';
  const title = options?.blogTitle || 'GLITCH HUNTER // IN THE WILD';

  return `<!DOCTYPE html>
<!--
   ========================================================================
   GLITCH-HUNTER.TUMBLR.COM // OFFICIAL HACKER-THEME CODE
   Optimized for Tumblr Theme Garden & Custom HTML Editor
   Documented via: https://www.tumblr.com/docs/pl/custom_themes
   Features: Matrix Aesthetic, CRT Scanlines, NPF Support, /contact Google Form Link
   ========================================================================
-->
<html lang="{lang:en}">
<head>
    <meta charset="utf-8">
    <title>{Title}{block:PostTitle} // {PostTitle}{/block:PostTitle}</title>
    <meta name="description" content="{MetaDescription}">
    <link rel="shortcut icon" href="{Favicon}">
    <link rel="alternate" type="application/rss+xml" href="{RSS}">

    <!-- CUSTOM TUMBLR THEME OPTIONS (Editable in Tumblr /customize panel) -->
    <meta name="color:Background" content="${bg}"/>
    <meta name="color:Terminal Accent" content="${accent}"/>
    <meta name="color:CRT Phosphor" content="#00ff41"/>
    <meta name="color:Alert Red" content="#ff0055"/>
    <meta name="font:Monospace" content="'Fira Code', 'Courier New', monospace"/>
    <meta name="text:GoogleFormURL" content="https://glitch-hunter.tumblr.com/contact"/>
    <meta name="if:Show CRT Scanlines" content="1"/>
    <meta name="if:Enable Matrix Hacker Glow" content="1"/>
    <meta name="if:Show Verified TOTP Badges" content="1"/>

    <style type="text/css">
        :root {
            --bg-color: {color:Background};
            --accent: {color:Terminal Accent};
            --phosphor: {color:CRT Phosphor};
            --alert: {color:Alert Red};
            --font-mono: {font:Monospace};
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-color);
            color: #d1ffd6;
            font-family: var(--font-mono);
            font-size: 14px;
            line-height: 1.6;
            background-image: 
                radial-gradient(ellipse at 50% 0%, rgba(0, 255, 102, 0.08) 0%, transparent 75%),
                linear-gradient(rgba(0, 20, 10, 0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 20, 10, 0.4) 1px, transparent 1px);
            background-size: 100% 100%, 30px 30px, 30px 30px;
            min-height: 100vh;
            padding-bottom: 80px;
        }

        /* CRT Scanline Overlay */
        {block:IfShowCRTScanlines}
        body::before {
            content: " ";
            display: block;
            position: fixed;
            top: 0; left: 0; bottom: 0; right: 0;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
            z-index: 9999;
            background-size: 100% 3px, 6px 100%;
            pointer-events: none;
            opacity: 0.85;
        }
        {/block:IfShowCRTScanlines}

        a {
            color: var(--accent);
            text-decoration: none;
            transition: color 0.15s ease;
        }
        a:hover {
            color: #ffffff;
            text-shadow: 0 0 8px var(--accent);
        }

        /* Header / Terminal HUD */
        #terminal-hud {
            border-bottom: 1px solid rgba(0, 255, 102, 0.25);
            background: rgba(10, 15, 12, 0.95);
            backdrop-filter: blur(8px);
            padding: 16px 24px;
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .hud-inner {
            max-width: 900px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
        }

        .hud-brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .hud-status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--accent);
            box-shadow: 0 0 10px var(--accent);
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
        }

        .hud-title {
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: var(--accent);
            text-shadow: 0 0 8px rgba(0, 255, 102, 0.6);
        }

        .hud-nav {
            display: flex;
            gap: 16px;
            align-items: center;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .hud-nav a {
            padding: 6px 12px;
            border: 1px solid rgba(0, 255, 102, 0.3);
            border-radius: 2px;
            background: rgba(0, 255, 102, 0.05);
        }
        .hud-nav a:hover {
            background: rgba(0, 255, 102, 0.2);
            border-color: var(--accent);
        }

        /* Container */
        #container {
            max-width: 860px;
            margin: 40px auto;
            padding: 0 20px;
        }

        /* Mission Banner */
        .system-banner {
            border: 1px solid rgba(0, 255, 102, 0.3);
            background: rgba(0, 25, 10, 0.6);
            padding: 20px;
            margin-bottom: 40px;
            border-left: 4px solid var(--accent);
        }

        .system-banner h1 {
            font-size: 18px;
            color: var(--accent);
            margin-bottom: 8px;
            letter-spacing: 1px;
        }

        .system-banner p {
            color: #9cd4a4;
            font-size: 13px;
        }

        /* Tumblr Posts Feed */
        .post {
            border: 1px solid rgba(0, 255, 102, 0.2);
            background: rgba(8, 12, 10, 0.85);
            margin-bottom: 35px;
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
            transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .post:hover {
            border-color: rgba(0, 255, 102, 0.6);
            transform: translateY(-2px);
        }

        .post-header {
            padding: 12px 18px;
            background: rgba(0, 20, 10, 0.5);
            border-bottom: 1px solid rgba(0, 255, 102, 0.15);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #79a882;
        }

        .post-meta-tag {
            color: var(--accent);
            font-weight: 600;
        }

        .post-content {
            padding: 24px;
        }

        .post-content h2, .post-content h3 {
            font-size: 18px;
            color: #ffffff;
            margin-bottom: 14px;
        }

        .post-content img {
            width: 100%;
            height: auto;
            border: 1px solid rgba(0, 255, 102, 0.3);
            border-radius: 2px;
            margin-bottom: 16px;
            filter: contrast(1.05) saturate(1.1);
        }

        .post-caption {
            font-size: 13px;
            line-height: 1.7;
            color: #c0dec4;
            margin-top: 14px;
        }

        /* Tags */
        .post-tags {
            margin-top: 18px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            list-style: none;
        }

        .post-tags li a {
            font-size: 11px;
            background: rgba(0, 255, 102, 0.08);
            border: 1px solid rgba(0, 255, 102, 0.2);
            padding: 3px 8px;
            border-radius: 2px;
            color: #8edfa0;
        }

        /* Footer & Reblog Controls */
        .post-footer {
            padding: 12px 18px;
            border-top: 1px solid rgba(0, 255, 102, 0.15);
            background: rgba(0, 15, 8, 0.4);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
        }

        .notes-count {
            color: #92bfa0;
        }

        .tumblr-actions {
            display: flex;
            gap: 12px;
        }

        /* Footer Pagination */
        #footer-nav {
            display: flex;
            justify-content: space-between;
            padding: 24px 0;
            border-top: 1px solid rgba(0, 255, 102, 0.2);
            font-size: 12px;
            letter-spacing: 1px;
        }

        /* Tumblr Custom CSS Injection */
        {CustomCSS}
    </style>
</head>
<body>

    <!-- STICKY HACKER HUD -->
    <header id="terminal-hud">
        <div class="hud-inner">
            <div class="hud-brand">
                <div class="hud-status-dot"></div>
                <div class="hud-title">${title}</div>
            </div>
            <nav class="hud-nav">
                <a href="/">/feed</a>
                <a href="/archive">/archive</a>
                <!-- Link to Google Form contact/submission -->
                <a href="{text:GoogleFormURL}" style="border-color: var(--accent); color: #fff;">/submit [contact]</a>
                {block:HasPages}
                    {block:Pages}
                        <a href="{URL}">{Label}</a>
                    {/block:Pages}
                {/block:HasPages}
            </nav>
        </div>
    </header>

    <div id="container">
        <!-- MISSION STATEMENT BANNER -->
        <div class="system-banner">
            <h1>>> GLITCH_HUNTER TELEMETRY DAEMON</h1>
            <p>Cataloging unintended operating system breakout events, kiosk failure vectors, and BSOD anomalies in public commercial displays. McDonalds drive-thrus, transit kiosks, and digital billboards caught rendering Windows 10, BIOS, or Linux in the wild.</p>
        </div>

        <!-- POSTS STREAM -->
        <div id="posts">
        {block:Posts}

            <!-- NPF & LEGACY TEXT POSTS -->
            {block:Text}
                <article class="post text-post">
                    <div class="post-header">
                        <span>SYS_LOG // POST_{PostID}</span>
                        {block:Date}<span>{Month} {DayOfMonth}, {Year}</span>{/block:Date}
                    </div>
                    <div class="post-content">
                        {block:Title}<h3><a href="{Permalink}">{Title}</a></h3>{/block:Title}
                        {block:NotReblog}{Body}{/block:NotReblog}
                        {block:RebloggedFrom}
                            <div class="reblog-stream">{Body}</div>
                        {/block:RebloggedFrom}

                        {block:HasTags}
                            <ul class="post-tags">
                                {block:Tags}<li><a href="{TagURL}">#{Tag}</a></li>{/block:Tags}
                            </ul>
                        {/block:HasTags}
                    </div>
                    <div class="post-footer">
                        {block:NoteCount}<span class="notes-count">{NoteCountWithLabel}</span>{/block:NoteCount}
                        <div class="tumblr-actions">
                            <a href="{Permalink}">[permalink]</a>
                        </div>
                    </div>
                </article>
            {/block:Text}

            <!-- PHOTO POSTS (e.g. McDonald's Windows 10 desktop, ATM BSOD) -->
            {block:Photo}
                <article class="post photo-post">
                    <div class="post-header">
                        <span class="post-meta-tag">[IN THE WILD CAPTURE]</span>
                        {block:Date}<span>{TimeAgo}</span>{/block:Date}
                    </div>
                    <div class="post-content">
                        <a href="{PhotoURL-HighRes}"><img src="{PhotoURL-500}" alt="{PhotoAlt}"/></a>
                        {block:Caption}<div class="post-caption">{Caption}</div>{/block:Caption}
                        {block:HasTags}
                            <ul class="post-tags">
                                {block:Tags}<li><a href="{TagURL}">#{Tag}</a></li>{/block:Tags}
                            </ul>
                        {/block:HasTags}
                    </div>
                    <div class="post-footer">
                        {block:NoteCount}<span class="notes-count">{NoteCountWithLabel}</span>{/block:NoteCount}
                        <div class="tumblr-actions">
                            <a href="{Permalink}">[inspect]</a>
                        </div>
                    </div>
                </article>
            {/block:Photo}

            <!-- QUOTE POSTS -->
            {block:Quote}
                <article class="post quote-post">
                    <div class="post-content">
                        <h2 style="font-style: italic; color: var(--accent);">"{Quote}"</h2>
                        {block:Source}<p style="margin-top: 10px; color: #88b08f;">— {Source}</p>{/block:Source}
                    </div>
                </article>
            {/block:Quote}

            <!-- ANSWER / Q&A POSTS -->
            {block:Answer}
                <article class="post answer-post">
                    <div class="post-content">
                        <p style="color: var(--accent); margin-bottom: 8px;"><strong>@{Asker}</strong> asked:</p>
                        <blockquote style="border-left: 2px solid var(--accent); padding-left: 12px; margin-bottom: 12px;">{Question}</blockquote>
                        <div class="answer-body">{Answer}</div>
                    </div>
                </article>
            {/block:Answer}

        {/block:Posts}
        </div>

        <!-- PAGINATION -->
        <footer id="footer-nav">
            {block:Pagination}
                {block:PreviousPage}<a href="{PreviousPage}">&lt; NEWER DISCOVERIES</a>{/block:PreviousPage}
                {block:NextPage}<a href="{NextPage}">OLDER ARCHIVES &gt;</a>{/block:NextPage}
            {/block:Pagination}
            <a href="/archive">[FULL TELEMETRY ARCHIVE]</a>
        </footer>
    </div>
</body>
</html>`;
};
