/**
 * TumblrThemeViewer.tsx
 * Live interactive preview of glitch-hunter.tumblr.com, Main Theme HTML Code exporter,
 * and Dedicated Embedded /contact Subpage HTML Code exporter.
 * Documented according to https://www.tumblr.com/docs/pl/custom_themes
 */

import React, { useState } from 'react';
import { TumblrPost, generateTumblrThemeHtml, generateTumblrContactPageHtml } from '../services/tumblrTheme';
import {
  Code,
  Eye,
  Copy,
  Check,
  Download,
  Heart,
  Repeat,
  Tag,
  ShieldCheck,
  FileCode2,
  Sliders,
} from 'lucide-react';

interface TumblrThemeViewerProps {
  posts: TumblrPost[];
  onOpenSubmitForm?: () => void;
}

export const TumblrThemeViewer: React.FC<TumblrThemeViewerProps> = ({
  posts,
  onOpenSubmitForm,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'theme-code' | 'contact-code'>('preview');
  const [copiedThemeCode, setCopiedThemeCode] = useState(false);
  const [copiedContactCode, setCopiedContactCode] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Theme customizations
  const [accentColor] = useState('#00ff66');
  const [bgColor] = useState('#0a0d0b');
  const [blogTitle] = useState('GLITCH HUNTER // IN THE WILD');

  const themeHtmlCode = generateTumblrThemeHtml({
    accentColor,
    bgColor,
    blogTitle,
  });

  const contactSubpageHtmlCode = generateTumblrContactPageHtml({
    accentColor,
    bgColor,
  });

  const handleCopyThemeCode = () => {
    navigator.clipboard.writeText(themeHtmlCode);
    setCopiedThemeCode(true);
    setTimeout(() => setCopiedThemeCode(false), 2000);
  };

  const handleCopyContactCode = () => {
    navigator.clipboard.writeText(contactSubpageHtmlCode);
    setCopiedContactCode(true);
    setTimeout(() => setCopiedContactCode(false), 2000);
  };

  const handleDownloadTheme = () => {
    const blob = new Blob([themeHtmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'glitch-hunter-tumblr-theme.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadContactPage = () => {
    const blob = new Blob([contactSubpageHtmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'glitch-hunter-contact-page.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPosts = selectedTag
    ? posts.filter((p) => p.tags.includes(selectedTag))
    : posts;

  return (
    <div className="rounded-md border border-emerald-500/40 bg-[#070b08] p-5 font-mono shadow-[0_0_35px_rgba(0,255,102,0.12)]">
      {/* Top Header / View Switcher */}
      <div className="flex flex-wrap items-center justify-between border-b border-emerald-500/30 pb-4 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <span className="text-zinc-500">tumblr.com/</span>
            <span className="text-emerald-300">glitch-hunter</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              CUSTOM HTML THEME
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Public display glitch catalog rendering live Tumblr theme operators ({`{Title}`}, {`{block:Posts}`}, {`{block:Photo}`})
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition ${
              activeTab === 'preview'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.4)]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Live Blog Preview
          </button>

          <button
            onClick={() => setActiveTab('theme-code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition ${
              activeTab === 'theme-code'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.4)]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Main Theme HTML (theme.html)
          </button>

          <button
            onClick={() => setActiveTab('contact-code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition ${
              activeTab === 'contact-code'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.4)]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5" />
            Embedded /contact Subpage
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <div>
          {/* Simulated Tumblr Sticky HUD */}
          <div className="sticky top-0 z-20 mb-6 flex flex-wrap items-center justify-between rounded border border-emerald-500/30 bg-black/90 p-3 backdrop-blur shadow-lg">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-xs tracking-wider text-emerald-300">{blogTitle}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-1 rounded text-[11px] border transition ${
                  selectedTag === null
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                /feed
              </button>

              <button
                onClick={onOpenSubmitForm}
                className="px-2.5 py-1 rounded border border-emerald-500 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 font-bold text-[11px] transition"
              >
                /contact [embedded form]
              </button>
            </div>
          </div>

          {/* Tag Filter Bar */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-zinc-500 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Filter by:
            </span>
            {['mcdonalds', 'windows10', 'transit', 'linux', 'billboard', 'teamviewer', 'kioskbreakout'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                className={`px-2 py-0.5 rounded border transition ${
                  selectedTag === t
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 font-bold'
                    : 'bg-black/60 border-zinc-800 text-zinc-400 hover:border-emerald-500/30 hover:text-zinc-200'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {filteredPosts.map((post) => {
              const isLiked = likedPosts[post.id];
              return (
                <article
                  key={post.id}
                  className="rounded border border-emerald-500/25 bg-black/80 overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition hover:border-emerald-500/50"
                >
                  {/* Post Header */}
                  <div className="flex flex-wrap items-center justify-between border-b border-emerald-500/15 bg-emerald-950/20 px-4 py-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <span>POST_{post.id}</span>
                      <span className="text-zinc-600">//</span>
                      <span className="text-zinc-400">{post.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.verifiedTotp && (
                        <span className="flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                          <ShieldCheck className="h-3 w-3 text-emerald-400" />
                          VERIFIED SUBMISSION
                        </span>
                      )}
                      <span className="text-zinc-500 text-[11px]">
                        Credit: @{post.submitterCredit}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-5">
                    {post.title && (
                      <h3 className="text-base font-bold text-white mb-3 tracking-wide">
                        {post.title}
                      </h3>
                    )}

                    {/* Photo Post */}
                    {post.type === 'photo' && post.photoUrl && (
                      <div className="relative rounded overflow-hidden border border-emerald-500/30 mb-4 bg-zinc-950">
                        <img
                          src={post.photoUrl}
                          alt={post.title}
                          className="w-full max-h-[460px] object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/85 backdrop-blur px-2.5 py-1 rounded text-[11px] text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>VENUE: {post.venue}</span>
                          <span className="text-zinc-500">|</span>
                          <span className="text-amber-300">OS: {post.osDetected}</span>
                        </div>
                      </div>
                    )}

                    {/* Quote Post */}
                    {post.type === 'quote' && (
                      <blockquote className="my-4 border-l-4 border-emerald-500 pl-4 italic text-emerald-300 text-sm">
                        "{post.quote}"
                        {post.source && <footer className="mt-2 text-xs text-zinc-500 not-italic">— {post.source}</footer>}
                      </blockquote>
                    )}

                    {/* Q&A / Answer Post */}
                    {post.type === 'answer' && (
                      <div className="my-3 space-y-3">
                        <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 text-xs">
                          <span className="text-emerald-400 font-bold block mb-1">@{post.asker} asked:</span>
                          <p className="text-zinc-200">{post.question}</p>
                        </div>
                        <div className="text-xs text-zinc-300 pl-2 border-l-2 border-emerald-500/50">
                          {post.answer}
                        </div>
                      </div>
                    )}

                    {/* Caption */}
                    {post.caption && (
                      <div
                        className="text-xs text-zinc-300 leading-relaxed space-y-2 mt-3"
                        dangerouslySetInnerHTML={{ __html: post.caption }}
                      />
                    )}

                    {/* Post Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {post.tags.map((t) => (
                          <span
                            key={t}
                            onClick={() => setSelectedTag(t)}
                            className="cursor-pointer text-[11px] text-emerald-400/80 bg-emerald-950/40 hover:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20 transition"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Footer with Tumblr Notes & Like/Reblog buttons */}
                  <div className="flex items-center justify-between border-t border-emerald-500/15 bg-black/60 px-5 py-3 text-xs">
                    <span className="text-zinc-400 text-[11px]">
                      {post.notesCount + (isLiked ? 1 : 0)} notes
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition border ${
                          isLiked
                            ? 'bg-rose-950/60 border-rose-500 text-rose-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                        <span>{isLiked ? 'Liked' : 'Like'}</span>
                      </button>

                      <button
                        onClick={() => alert(`Post #${post.id} copied to reblog buffer for glitch-hunter.tumblr.com!`)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
                      >
                        <Repeat className="h-3.5 w-3.5" />
                        <span>Reblog</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'theme-code' ? (
        /* MAIN THEME HTML CODE VIEW */
        <div className="space-y-4">
          <div className="rounded border border-emerald-500/30 bg-black/80 p-4">
            <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Sliders className="h-4 w-4" /> MAIN BLOG THEME (theme.html)
            </h4>
            <p className="text-xs text-zinc-400 mb-4">
              This code powers the main blog theme. Go to your Tumblr dashboard at{' '}
              <span className="text-emerald-300 font-bold">glitch-hunter.tumblr.com/customize</span>, click <strong>"Edit HTML"</strong>, and paste.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyThemeCode}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-[0_0_20px_rgba(0,255,102,0.3)]"
              >
                {copiedThemeCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedThemeCode ? 'Theme Code Copied!' : 'Copy Main Theme HTML'}
              </button>

              <button
                onClick={handleDownloadTheme}
                className="flex items-center gap-1.5 px-4 py-2 rounded border border-emerald-500/40 bg-zinc-900 hover:bg-zinc-800 text-emerald-300 text-xs transition font-semibold"
              >
                <Download className="h-4 w-4" />
                Download glitch-hunter-tumblr-theme.html
              </button>
            </div>
          </div>

          {/* Code display block */}
          <div className="relative rounded border border-emerald-500/30 bg-[#040605] p-4 max-h-[500px] overflow-y-auto">
            <pre className="text-xs text-emerald-400/90 font-mono leading-relaxed whitespace-pre-wrap">
              {themeHtmlCode}
            </pre>
          </div>
        </div>
      ) : (
        /* EMBEDDED /CONTACT SUBPAGE CODE VIEW */
        <div className="space-y-4">
          <div className="rounded border border-emerald-500/30 bg-black/80 p-4">
            <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <FileCode2 className="h-4 w-4" /> EMBEDDED /CONTACT SUBPAGE (contact-page.html)
            </h4>
            <p className="text-xs text-zinc-400 mb-4">
              Self-contained custom page for <span className="text-emerald-300 font-bold">glitch-hunter.tumblr.com/contact</span>. Go to Tumblr Dashboard &rarr; <strong>Settings</strong> &rarr; <strong>glitch-hunter</strong> &rarr; <strong>Pages</strong> &rarr; <strong>Add a page</strong> &rarr; URL: <code>/contact</code> &rarr; toggle <strong>"Custom layout"</strong> &rarr; paste this HTML!
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyContactCode}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-[0_0_20px_rgba(0,255,102,0.3)]"
              >
                {copiedContactCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedContactCode ? 'Subpage Code Copied!' : 'Copy /contact Subpage HTML'}
              </button>

              <button
                onClick={handleDownloadContactPage}
                className="flex items-center gap-1.5 px-4 py-2 rounded border border-emerald-500/40 bg-zinc-900 hover:bg-zinc-800 text-emerald-300 text-xs transition font-semibold"
              >
                <Download className="h-4 w-4" />
                Download glitch-hunter-contact-page.html
              </button>

              <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> 100% Tumblr-Validator Compliant (Pure HTML+CSS &amp; Google Forms iframe)
              </span>
            </div>
          </div>

          {/* Live Preview of the Embedded Google Form */}
          <div className="rounded border border-emerald-500/30 bg-[#070a08] p-4">
            <div className="text-xs font-bold text-emerald-400 mb-3 flex items-center justify-between">
              <span>LIVE EMBEDDED FORM PREVIEW (WHAT VISITORS SEE ON /CONTACT):</span>
              <span className="text-zinc-500 text-[10px]">Google Docs Forms Embed</span>
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
            <div className="text-[10px] text-zinc-500 mb-2 font-bold uppercase">Ready-to-Paste HTML Code:</div>
            <pre className="text-xs text-emerald-400/90 font-mono leading-relaxed whitespace-pre-wrap">
              {contactSubpageHtmlCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
