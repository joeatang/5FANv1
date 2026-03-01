/**
 * 5FAN Community — hi-note-compose
 *
 * Orchestrator skill: assembles a complete Hi-Note payload from a user's
 * share text. Chains context-distill → copy-elevate → imagery-director
 * → quality-rails → caption-craft internally.
 *
 * Returns a render-ready payload for the frontend Hi-Note canvas renderer.
 * No LLM itself — delegates text elevation to content-elevate.
 *
 * @param {object} input - { text: string, replyText?: string, userName?: string, origin?: string }
 * @returns {Promise<object>} - { ok, note: { elevated, pose, doodles, palette, title, footer } }
 */

import { handle as emotionScan } from '../../eq-engine/emotion-scan/handler.js';
import { handle as contentElevate } from '../../coach/content-elevate/handler.js';
import { handle as socialCaption } from '../social-caption/handler.js';
import { FAMILY_MAP } from '../../eq-engine/data/emotion-families.js';

/** Hi5FAN pose options — broader variety tied to emotional zone */
const POSES = {
  hi: [
    { id: 'classic-high-five', label: 'Classic High-Five', asset: 'pose_classic_high_five.svg' },
    { id: 'walking-high-five', label: 'Walking High-Five', asset: 'pose_walking_high_five.svg' },
    { id: 'thumbs-up-wink', label: 'Thumbs-Up + Wink', asset: 'pose_thumbs_up_wink.svg' },
    { id: 'hands-cheering', label: 'Hands Up Cheer', asset: 'pose_hands_cheering.svg' },
    { id: 'peace-grin', label: 'Peace Sign + Grin', asset: 'pose_peace_grin.svg' },
    { id: 'fist-pump', label: 'Fist Pump', asset: 'pose_fist_pump.svg' },
    { id: 'jump-high-five', label: 'Jumping High-Five', asset: 'pose_jump_high_five.svg' },
  ],
  neutral: [
    { id: 'gentle-wave', label: 'Gentle Wave', asset: 'pose_gentle_wave.svg' },
    { id: 'thinking-then-five', label: 'Thinking then High-Five', asset: 'pose_thinking_high_five.svg' },
    { id: 'point-forward', label: 'Pointing Forward', asset: 'pose_point_forward.svg' },
    { id: 'walking-high-five', label: 'Walking High-Five', asset: 'pose_walking_high_five.svg' },
  ],
  opportunity: [
    { id: 'gentle-wave', label: 'Gentle Wave', asset: 'pose_gentle_wave.svg' },
    { id: 'thinking-then-five', label: 'Thinking then High-Five', asset: 'pose_thinking_high_five.svg' },
    { id: 'classic-high-five', label: 'Classic High-Five', asset: 'pose_classic_high_five.svg' },
    { id: 'point-forward', label: 'Pointing Forward', asset: 'pose_point_forward.svg' },
  ],
};

/** Doodle elements per emotional zone */
const DOODLES = {
  hi: ['stars', 'sparkles', 'confetti', 'sunburst', 'hearts'],
  neutral: ['waves', 'clouds', 'leaves', 'dots', 'lines'],
  opportunity: ['rain', 'roots', 'stones', 'cocoon', 'seeds'],
};

/** Color palettes per emotional zone */
const PALETTES = {
  hi: {
    background: '#FEF3E2',
    text: '#1A1A1A',
    accent: '#F59E0B',
    secondary: '#FCD34D',
    name: 'Golden Warmth',
  },
  neutral: {
    background: '#F0F4F8',
    text: '#1A1A1A',
    accent: '#6B7280',
    secondary: '#9CA3AF',
    name: 'Soft Slate',
  },
  opportunity: {
    background: '#EDE9FE',
    text: '#1A1A1A',
    accent: '#7C3AED',
    secondary: '#A78BFA',
    name: 'Deep Violet',
  },
};

/** Notebook and desk treatment to keep render output coherent */
const NOTEBOOK_STYLE = {
  paper: 'warm-off-white-lined',
  texture: 'subtle-fiber',
  creases: 'light',
  edges: 'soft-torn',
  desk: 'light-wood',
  lighting: 'soft-natural',
  glow: 'orange-to-deep-red-bottom',
  angleDeg: 10,
};

/** Rolling anti-repeat memory for visual combinations */
const RECENT_VARIANTS = [];
const MAX_RECENT_VARIANTS = 24;

/** Pick a random element from an array */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick N unique random elements */
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function pushRecentVariant(variantId) {
  RECENT_VARIANTS.push(variantId);
  if (RECENT_VARIANTS.length > MAX_RECENT_VARIANTS) RECENT_VARIANTS.shift();
}

function wasRecentVariant(variantId) {
  return RECENT_VARIANTS.includes(variantId);
}

/**
 * Determine emotional zone from emotion scan results.
 */
function resolveZone(scanResult) {
  if (!scanResult.ok || scanResult.matchCount === 0) return 'neutral';
  return scanResult.dominantCategory || 'neutral';
}

function detectUniversalTheme(sourceText, zone) {
  const lower = (sourceText || '').toLowerCase();
  if (lower.includes('streak') || lower.includes('consisten') || lower.includes('show up')) return 'consistency';
  if (lower.includes('anx') || lower.includes('overwhelm') || lower.includes('stress')) return 'calm-under-pressure';
  if (lower.includes('grateful') || lower.includes('joy') || lower.includes('peace')) return 'grounded-gratitude';
  if (lower.includes('fail') || lower.includes('setback') || lower.includes('again')) return 'resilient-restart';
  if (zone === 'opportunity') return 'gentle-recovery';
  if (zone === 'hi') return 'momentum-with-heart';
  return 'steady-presence';
}

function contextDistill({ text, replyText, scan, zone }) {
  const source = (replyText || text || '').trim();
  const universalTheme = detectUniversalTheme(source, zone);
  return {
    source,
    emotionalCore: {
      zone,
      dominantCategory: scan?.dominantCategory || zone,
      familyId: scan?.families?.[0]?.id || null,
      familyLabel: scan?.families?.[0]?.label || null,
      hiScale: scan?.hiScale || null,
      matchCount: scan?.matchCount || 0,
    },
    universalTheme,
    tone: zone === 'opportunity' ? 'gentle' : zone === 'hi' ? 'uplifting' : 'reflective',
    doNotSay: ['you said', 'you told me', 'as you said', '@username'],
  };
}

function toBodyLines(elevatedText) {
  const cleaned = (elevatedText || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return ['Dear friend,', 'Keep showing up to your own life, one breath at a time.'];

  const chunks = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const lines = ['Dear friend,'];
  for (const sentence of chunks.slice(0, 5)) {
    lines.push(sentence);
  }
  return lines;
}

function chooseTitleBubble(family, universalTheme) {
  if (universalTheme === 'consistency') return { text: 'One More Rep', emoji: '💪' };
  if (universalTheme === 'calm-under-pressure') return { text: '2-Minute Shift', emoji: '✨' };
  if (universalTheme === 'resilient-restart') return { text: 'Fresh Start', emoji: '🌱' };
  if (family) return { text: family.label, emoji: family.emoji };
  return { text: '2-Minute Shift', emoji: '✨' };
}

function imageryDirector({ zone, universalTheme }) {
  const poses = POSES[zone] || POSES.neutral;
  let pose = pick(poses);

  // lightweight anti-repeat for pose+doodle mix
  let doodles = pickN(DOODLES[zone] || DOODLES.neutral, 3);
  let variantId = `${pose.id}:${doodles.join(',')}`;
  let attempts = 0;
  while (attempts < 4 && wasRecentVariant(variantId)) {
    pose = pick(poses);
    doodles = pickN(DOODLES[zone] || DOODLES.neutral, 3);
    variantId = `${pose.id}:${doodles.join(',')}`;
    attempts += 1;
  }
  pushRecentVariant(variantId);

  const palette = PALETTES[zone] || PALETTES.neutral;
  return {
    pose,
    doodles,
    palette,
    notebookStyle: NOTEBOOK_STYLE,
    composition: {
      orientation: 'portrait',
      size: '1080x1920',
      characterCorner: 'bottom-right',
      universalTheme,
    },
  };
}

function qualityRails({ bodyLines, titleBubble, pose, doodles, elevated }) {
  const joined = bodyLines.join(' ').toLowerCase();
  const reasons = [];

  if (bodyLines.length < 2) reasons.push('body_too_short');
  if (bodyLines.length > 7) reasons.push('body_too_long');
  if (!titleBubble?.text) reasons.push('missing_title_bubble');
  if (!pose?.id) reasons.push('missing_pose');
  if (!Array.isArray(doodles) || doodles.length < 3) reasons.push('insufficient_doodles');
  if (/\byou said\b|\byou told me\b|\bas you said\b/.test(joined)) reasons.push('direct_reply_language');
  if (!elevated || !String(elevated).trim()) reasons.push('missing_elevated_text');

  const score = Math.max(0, 100 - reasons.length * 15);
  return {
    pass: reasons.length === 0,
    score,
    fixes: reasons,
    reasons,
  };
}

export async function handle(input) {
  const { text, replyText, userName, origin } = input || {};

  if (!text) {
    return { ok: false, error: 'text is required.' };
  }

  // ── Step 1: Emotion Scan ────────────────────────────────────────
  const scan = emotionScan({ text });
  const zone = resolveZone(scan);
  const familyId = scan.ok && scan.families?.length > 0 ? scan.families[0].id : null;

  // ── Step 2: Context Distill ─────────────────────────────────────
  const distilled = contextDistill({ text, replyText, scan, zone });

  // ── Step 3: Copy Elevation ──────────────────────────────────────
  const elevation = await contentElevate({
    text: distilled.source,
    familyId,
    tone: distilled.tone,
  });

  const elevated = elevation.ok ? elevation.elevated : distilled.source;
  const bodyLines = toBodyLines(elevated);

  // ── Step 4: Imagery Director ────────────────────────────────────
  const imagery = imageryDirector({ zone, universalTheme: distilled.universalTheme });

  // Title bubble — family label or universal-theme default
  const family = familyId ? FAMILY_MAP[familyId] : null;
  const titleBubble = chooseTitleBubble(family, distilled.universalTheme);

  // ── Step 5: Quality Rails ───────────────────────────────────────
  const quality = qualityRails({
    bodyLines,
    titleBubble,
    pose: imagery.pose,
    doodles: imagery.doodles,
    elevated,
  });

  // ── Step 6: Caption Craft ───────────────────────────────────────
  const captionResult = await socialCaption({
    text: elevated,
    platform: 'general',
    userName,
    hashtags: true,
    cta: false,
  });

  // Footer — attribution
  const footer = {
    app: 'Stay Hi',
    tagline: 'Your emotional compass',
    userName: userName || null,
    origin: origin || 'share',
    timestamp: new Date().toISOString(),
  };

  return {
    ok: true,
    note: {
      elevated,
      original: text,
      method: elevation.method || 'fallback',
      header: 'Hi5FAN\'s Hi-Note',
      bodyLines,
      signature: '— Hi5FAN',
      pose: imagery.pose,
      doodles: imagery.doodles,
      palette: imagery.palette,
      notebookStyle: imagery.notebookStyle,
      composition: imagery.composition,
      titleBubble,
      footer,
      zone,
    },
    captionDraft: captionResult?.ok ? {
      caption: captionResult.caption,
      hashtags: captionResult.hashtags || [],
      method: captionResult.method,
    } : null,
    quality,
    trace: {
      skills: ['context-distill', 'copy-elevate', 'imagery-director', 'quality-rails', 'caption-craft'],
      method: 'modular-v1',
      universalTheme: distilled.universalTheme,
    },
    emotionScan: scan.ok ? {
      matchCount: scan.matchCount,
      families: scan.families,
      hiScale: scan.hiScale,
      dominantCategory: scan.dominantCategory,
    } : null,
    emotionalCore: {
      ...(elevation.ok ? (elevation.emotionalCore || {}) : {}),
      ...distilled.emotionalCore,
      universalTheme: distilled.universalTheme,
      doNotSay: distilled.doNotSay,
    },
  };
}
