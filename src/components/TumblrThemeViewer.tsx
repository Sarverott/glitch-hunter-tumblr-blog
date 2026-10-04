/**
 * TumblrThemeViewer.tsx
 * Live interactive preview of glitch-hunter.tumblr.com, Main Theme HTML Code exporter,
 * and Dedicated Embedded /SEND_GLITCH.exe Subpage HTML Code exporter.
 *
 * Includes:
 * - Responsive 3-column (800px+) and 5-column (1200px+) grid
 * - Single Post Reader Mode (full-width view when post is clicked to read)
 * - Live Tumblr Blog RSS Feed showcase by blog nickname
 * - Interactive pagination for posts listing
 * - Clean preview without mission banner/description
 */

import React, { useState, useEffect } from 'react';
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
  Rss,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Search,
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

  // Single post reader mode
  const [readingPostId, setReadingPostId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Live Tumblr RSS showcase state
  const [feedSource, setFeedSource] = useState<'curated' | 'rss'>('curated');
  const [rssNickname, setRssNickname] = useState<string>('sarverott');
  const [rssPosts, setRssPosts] = useState<TumblrPost[]>([]);
  const [rssInfo, setRssInfo] = useState<{ title: string; desc: string; total: number; blog: string } | null>(null);
  const [isRssLoading, setIsRssLoading] = useState<boolean>(false);
  const [rssError, setRssError] = useState<string | null>(null);

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

  // Fetch Tumblr RSS from backend proxy
  const fetchTumblrRss = async (blogName: string) => {
    const clean = blogName.trim();
    if (!clean) return;

    setIsRssLoading(true);
    setRssError(null);

    try {
      const res = await fetch(`/api/tumblr-rss?blog=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `Failed to fetch RSS for ${clean}`);
      }

      setRssPosts(data.items || []);
      setRssInfo({
        title: data.channelTitle || clean,
        desc: data.channelDesc || '',
        total: data.postsCount || 0,
        blog: data.blog || clean,
      });
      setCurrentPage(1);
      setReadingPostId(null);
    } catch (err: any) {
      console.error('Error fetching Tumblr RSS:', err);
      setRssError(err.message || 'Could not fetch Tumblr RSS. Check blog name.');
    } finally {
      setIsRssLoading(false);
    }
  };

  // Reset page when filter or source changes
  useEffect(() => {
    setCurrentPage(1);
    setReadingPostId(null);
  }, [selectedTag, feedSource]);

  const activeSourcePosts = feedSource === 'rss' ? rssPosts : posts;

  const filteredPosts = selectedTag
    ? activeSourcePosts.filter((p) => p.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase())))
    : activeSourcePosts;

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedPosts = filteredPosts.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize
  );

  // Active reading post
  const readingPost = readingPostId
    ? activeSourcePosts.find((p) => p.id === readingPostId) || null
    : null;

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

  return (
    <div className="rounded-md border border-emerald-500/40 bg-[#070b08] p-4 sm:p-5 font-mono shadow-[0_0_35px_rgba(0,255,102,0.12)]">
      {/* Top Header / View Switcher */}
      <div className="flex flex-wrap items-center justify-between border-b border-emerald-500/30 pb-4 mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <span className="text-zinc-500">tumblr.com/</span>
            <span className="text-emerald-300">
              {feedSource === 'rss' && rssInfo ? rssInfo.blog : 'glitch-hunter'}
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              {feedSource === 'rss' ? 'LIVE BLOG RSS' : 'CUSTOM HTML THEME'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Public display glitch catalog rendering multi-column matrix grids (3-col @800px, 5-col @1200px) &amp; full permalink reader
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
            Embedded /SEND_GLITCH.exe Subpage
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <div>
          {/* Top Control Bar: Source Switcher & RSS Inspector */}
          <div className="mb-4 rounded border border-emerald-500/25 bg-black/70 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Feed source buttons */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-[11px] font-semibold">FEED SOURCE:</span>
              <button
                onClick={() => {
                  setFeedSource('curated');
                  setReadingPostId(null);
                }}
                className={`px-2.5 py-1 rounded transition border ${
                  feedSource === 'curated'
                    ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                }`}
              >
                Curated Glitch Catalog ({posts.length})
              </button>

              <button
                onClick={() => {
                  setFeedSource('rss');
                  if (rssPosts.length === 0) {
                    fetchTumblrRss(rssNickname);
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition border ${
                  feedSource === 'rss'
                    ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                }`}
              >
                <Rss className="h-3 w-3" />
                Live Tumblr RSS Showcase
              </button>
            </div>

            {/* RSS input form (when in RSS mode) */}
            {feedSource === 'rss' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-zinc-400 text-[11px]">Tumblr Nickname:</span>
                <div className="relative flex items-center">
                  <span className="absolute left-2 text-zinc-500 text-[11px]">@</span>
                  <input
                    type="text"
                    value={rssNickname}
                    onChange={(e) => setRssNickname(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchTumblrRss(rssNickname)}
                    placeholder="e.g. sarverott"
                    className="w-32 sm:w-40 rounded border border-emerald-500/40 bg-black pl-6 pr-2 py-1 text-emerald-300 text-xs focus:outline-hidden focus:border-emerald-400"
                  />
                </div>
                <button
                  onClick={() => fetchTumblrRss(rssNickname)}
                  disabled={isRssLoading}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition"
                >
                  {isRssLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  Fetch RSS
                </button>

                {/* Quick preset switches */}
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <span>Presets:</span>
                  <button
                    onClick={() => {
                      setRssNickname('sarverott');
                      fetchTumblrRss('sarverott');
                    }}
                    className="underline hover:text-emerald-400"
                  >
                    sarverott
                  </button>
                  <span>&bull;</span>
                  <button
                    onClick={() => {
                      setRssNickname('glitch-hunter');
                      fetchTumblrRss('glitch-hunter');
                    }}
                    className="underline hover:text-emerald-400"
                  >
                    glitch-hunter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RSS Error Banner */}
          {feedSource === 'rss' && rssError && (
            <div className="mb-4 rounded border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-center justify-between">
              <span>{rssError}</span>
              <button
                onClick={() => fetchTumblrRss('glitch-hunter')}
                className="underline hover:text-white"
              >
                Try glitch-hunter.tumblr.com
              </button>
            </div>
          )}

          {/* RSS Channel Info Header */}
          {feedSource === 'rss' && rssInfo && (
            <div className="mb-4 rounded border border-emerald-500/20 bg-emerald-950/20 px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Rss className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-bold text-emerald-300">{rssInfo.title}</span>
                <span className="text-zinc-500">//</span>
                <span className="text-zinc-400 text-[11px]">{rssInfo.total} live posts discovered via RSS</span>
              </div>
              <a
                href={`https://${rssInfo.blog}.tumblr.com`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
              >
                Open on Tumblr <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Simulated Tumblr Sticky HUD */}
          <div className="sticky top-0 z-20 mb-4 flex flex-wrap items-center justify-between rounded border border-emerald-500/30 bg-black/90 p-2.5 backdrop-blur shadow-lg text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold tracking-wider text-emerald-300">
                {feedSource === 'rss' && rssInfo ? rssInfo.title : blogTitle}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedTag(null);
                  setReadingPostId(null);
                }}
                className={`px-2 py-1 rounded text-[11px] border transition ${
                  selectedTag === null && !readingPostId
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
                /SEND_GLITCH.exe [SUBMIT]
              </button>
            </div>
          </div>

          {/* Tag Filter Bar (hidden if reading single post) */}
          {!readingPostId && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-zinc-500 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Tags:
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

              {/* Items count & Page Size selector */}
              <div className="flex items-center gap-2 text-zinc-500 text-[10px]">
                <span>Showing {paginatedPosts.length} of {filteredPosts.length} reports</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded border border-zinc-800 bg-black px-1.5 py-0.5 text-zinc-300 text-[10px]"
                >
                  <option value={10}>10 / page</option>
                  <option value={15}>15 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* VIEW A: SINGLE POST READER MODE (When post is clicked)       */}
          {/* ============================================================= */}
          {readingPost ? (
            <div className="max-w-3xl mx-auto my-4 space-y-4">
              {/* Back to Grid Feed Button */}
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <button
                  onClick={() => setReadingPostId(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  &larr; Return to Multi-Column Grid Feed
                </button>

                <div className="text-[11px] text-zinc-400">
                  <span>SINGLE PERMALINK READER</span>
                  <span className="text-zinc-600 ml-2">// {readingPost.date}</span>
                </div>
              </div>

              {/* Single Post Article Container */}
              <article className="rounded border border-emerald-500/40 bg-black/90 overflow-hidden shadow-[0_0_40px_rgba(0,255,102,0.15)]">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-emerald-500/20 bg-emerald-950/30 px-5 py-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span>POST_{readingPost.id}</span>
                    <span className="text-zinc-600">//</span>
                    <span className="text-zinc-300">{readingPost.venue}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {readingPost.verifiedTotp && (
                      <span className="flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-semibold">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        VERIFIED SUBMISSION
                      </span>
                    )}
                    <span className="text-zinc-400 text-[11px]">
                      Discovered by: @{readingPost.submitterCredit}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h2 className="text-lg font-bold text-white tracking-wide">
                    {readingPost.title}
                  </h2>

                  {/* High-res Image */}
                  {readingPost.photoUrl && (
                    <div className="relative rounded overflow-hidden border border-emerald-500/30 bg-black">
                      <img
                        src={readingPost.photoUrl}
                        alt={readingPost.title}
                        className="w-full max-h-[560px] object-contain mx-auto"
                      />
                      <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur px-3 py-1.5 rounded text-xs text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>ASSET: {readingPost.venue}</span>
                        {readingPost.osDetected && (
                          <>
                            <span className="text-zinc-600">|</span>
                            <span className="text-amber-300">OS: {readingPost.osDetected}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Caption & Forensics */}
                  {readingPost.caption && (
                    <div
                      className="text-xs text-zinc-200 leading-relaxed space-y-3 pt-2"
                      dangerouslySetInnerHTML={{ __html: readingPost.caption }}
                    />
                  )}

                  {/* Tags */}
                  {readingPost.tags && readingPost.tags.length > 0 && (
                    <div className="pt-3 border-t border-emerald-500/15 flex flex-wrap gap-1.5">
                      {readingPost.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] text-emerald-400/90 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Single Post Footer */}
                <div className="flex items-center justify-between border-t border-emerald-500/20 bg-emerald-950/20 px-5 py-3 text-xs">
                  <span className="text-zinc-400">
                    {readingPost.notesCount + (likedPosts[readingPost.id] ? 1 : 0)} notes &bull; logged on {readingPost.date}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleLike(readingPost.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded transition border ${
                        likedPosts[readingPost.id]
                          ? 'bg-rose-950/60 border-rose-500 text-rose-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${likedPosts[readingPost.id] ? 'fill-rose-500' : ''}`} />
                      <span>{likedPosts[readingPost.id] ? 'Liked' : 'Like'}</span>
                    </button>

                    <button
                      onClick={() => alert(`Post #${readingPost.id} copied to reblog buffer for glitch-hunter.tumblr.com!`)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
                    >
                      <Repeat className="h-3.5 w-3.5" />
                      <span>Reblog</span>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ) : (
            /* ============================================================= */
            /* VIEW B: MULTI-COLUMN GRID VIEW (3 cols @800px, 5 cols @1200px) */
            /* ============================================================= */
            <div>
              {paginatedPosts.length === 0 ? (
                <div className="p-8 text-center rounded border border-emerald-500/20 bg-black/60 text-zinc-400 text-xs">
                  No telemetry posts matched the selected criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 min-[800px]:grid-cols-3 min-[1200px]:grid-cols-5 gap-3.5">
                  {paginatedPosts.map((post) => {
                    const isLiked = likedPosts[post.id];
                    return (
                      <article
                        key={post.id}
                        onClick={() => setReadingPostId(post.id)}
                        className="cursor-pointer flex flex-col h-full rounded border border-emerald-500/25 bg-black/80 overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition hover:border-emerald-500/60 hover:-translate-y-0.5 group"
                      >
                        {/* Post Header */}
                        <div className="flex flex-wrap items-center justify-between border-b border-emerald-500/15 bg-emerald-950/20 px-3 py-1.5 text-xs">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] group-hover:text-emerald-300">
                            <span>POST_{post.id}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {post.verifiedTotp && (
                              <span className="flex items-center gap-1 text-[9px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">
                                <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                                VERIFIED
                              </span>
                            )}
                            <span className="text-zinc-500 text-[10px]">
                              @{post.submitterCredit}
                            </span>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="p-3.5 flex-1 flex flex-col">
                          {post.title && (
                            <h3 className="text-sm font-bold text-white mb-2 tracking-wide line-clamp-2 group-hover:text-emerald-200 transition">
                              {post.title}
                            </h3>
                          )}

                          {/* Photo Post */}
                          {post.photoUrl && (
                            <div className="relative rounded overflow-hidden border border-emerald-500/30 mb-2.5 bg-zinc-950">
                              <img
                                src={post.photoUrl}
                                alt={post.title}
                                className="w-full h-36 object-cover group-hover:scale-105 transition duration-300"
                              />
                              <div className="absolute bottom-1.5 left-1.5 bg-black/85 backdrop-blur px-2 py-0.5 rounded text-[10px] text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 truncate max-w-[90%]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <span className="truncate">{post.venue}</span>
                              </div>
                            </div>
                          )}

                          {/* Quote Post */}
                          {post.type === 'quote' && (
                            <blockquote className="my-2 border-l-2 border-emerald-500 pl-3 italic text-emerald-300 text-xs">
                              "{post.quote}"
                              {post.source && <footer className="mt-1 text-[10px] text-zinc-500 not-italic">— {post.source}</footer>}
                            </blockquote>
                          )}

                          {/* Caption */}
                          {post.caption && (
                            <div
                              className="text-[11px] text-zinc-300 leading-relaxed line-clamp-3 mt-1"
                              dangerouslySetInnerHTML={{ __html: post.caption }}
                            />
                          )}

                          {/* Post Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1">
                              {post.tags.slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTag(t);
                                  }}
                                  className="cursor-pointer text-[10px] text-emerald-400/80 bg-emerald-950/40 hover:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/20 transition"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Post Footer with Notes & Read Button */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between border-t border-emerald-500/15 bg-black/60 px-3 py-2 text-[11px] mt-auto"
                        >
                          <span className="text-zinc-400 text-[10px]">
                            {post.notesCount + (isLiked ? 1 : 0)} notes
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setReadingPostId(post.id)}
                              className="text-[10px] text-emerald-400 hover:underline"
                            >
                              [Inspect]
                            </button>

                            <button
                              onClick={() => toggleLike(post.id)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition border ${
                                isLiked
                                  ? 'bg-rose-950/60 border-rose-500 text-rose-400'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              <Heart className={`h-3 w-3 ${isLiked ? 'fill-rose-500' : ''}`} />
                            </button>

                            <button
                              onClick={() => alert(`Post #${post.id} copied to reblog buffer for glitch-hunter.tumblr.com!`)}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
                            >
                              <Repeat className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Matrix Cyberpunk Pagination Footer */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/20 pt-4 text-xs">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validCurrentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500/20 transition"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    &lt;&lt; NEWER DISCOVERIES
                  </button>

                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                    <span>PAGE</span>
                    <span className="bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 rounded text-white">
                      {validCurrentPage}
                    </span>
                    <span>/</span>
                    <span>{totalPages}</span>
                    <span className="text-zinc-500 text-[11px] ml-1">({filteredPosts.length} total)</span>
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={validCurrentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500/20 transition"
                  >
                    OLDER ARCHIVES &gt;&gt;
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
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
        /* EMBEDDED /SEND_GLITCH.exe SUBPAGE CODE VIEW */
        <div className="space-y-4">
          <div className="rounded border border-emerald-500/30 bg-black/80 p-4">
            <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <FileCode2 className="h-4 w-4" /> EMBEDDED /SEND_GLITCH.exe SUBPAGE (contact.html)
            </h4>
            <p className="text-xs text-zinc-400 mb-4">
              Self-contained custom page for <span className="text-emerald-300 font-bold">glitch-hunter.tumblr.com/SEND_GLITCH.exe</span>. Go to Tumblr Dashboard &rarr; <strong>Settings</strong> &rarr; <strong>glitch-hunter</strong> &rarr; <strong>Pages</strong> &rarr; <strong>Add a page</strong> &rarr; URL: <code>/SEND_GLITCH.exe</code> &rarr; toggle <strong>"Custom layout"</strong> &rarr; paste this HTML!
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyContactCode}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-[0_0_20px_rgba(0,255,102,0.3)]"
              >
                {copiedContactCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedContactCode ? 'Subpage Code Copied!' : 'Copy /SEND_GLITCH.exe Subpage HTML'}
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
              <span>LIVE EMBEDDED FORM PREVIEW (WHAT VISITORS SEE ON /SEND_GLITCH.exe):</span>
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
