---
name: 5FAN
description: Five Brains Agentic Network — emotional intelligence skill for Intercom. Five brains (Hear, Inspyre, Flow, You, View) scan emotion, track habits, reflect identity, reconnect purpose, and curate perspective. Runs local-first on P2P via Trac Network. Other agents invoke individual brains or the full swarm over sidechannels. Built for character-driven brands, wellness apps, recovery platforms, kids products, and communities where how you talk to the user matters.
trac_address: trac1wtsn8ru2ryknk36rd6glp2tfj0dawnh2gkjrg90gzqvwes65v78qmwjuzq
---

# 5FAN

## Description

5FAN (Five Brains Agentic Network) is a skill for autonomous agents on Trac Network's Intercom. It adds emotional intelligence to any app — five specialized brains scan every message in parallel, a consensus pipeline synthesizes their insights, and an LLM (or template fallback) generates a response that makes the user feel seen.

5FAN runs **on top of Intercom**. For P2P networking, sidechannels, SC-Bridge, contracts, and wallet details, refer to the **Intercom SKILL.md** (`https://github.com/Trac-Systems/intercom/blob/main/SKILL.md`). This document covers only 5FAN-specific setup, configuration, and operation.

## Support

References:
- Repository: https://github.com/joeatang/5FAN
- Architecture: see `ARCHITECTURE.md` in this repo
- Intercom (base layer): https://github.com/Trac-Systems/intercom
- Intercom SKILL.md (P2P networking guide): https://github.com/Trac-Systems/intercom/blob/main/SKILL.md
- Issues: https://github.com/joeatang/5FAN/issues

## Quick Reference

- **Trac Address:** `trac1wtsn8ru2ryknk36rd6glp2tfj0dawnh2gkjrg90gzqvwes65v78qmwjuzq`
- **Entry Channel:** `0000intercom`
- **Skill Channels:** `5fan-skill-hear`, `5fan-skill-inspyre`, `5fan-skill-flow`, `5fan-skill-you`, `5fan-skill-view`, `5fan-skill-swarm`
- **Discovery Channel:** `5fan-skills` (manifest broadcast every 5 min)
- **Brains:** Hear (emotion), Inspyre (values), Flow (habits), You (identity), View (synthesis)
- **LLM Fallback Chain:** Local (LM Studio/Ollama) → Cloud (Groq/OpenRouter/Together.ai) → Templates (200+ per brain, always works)

## Dependency on Intercom

5FAN is an Intercom app. It requires a running Intercom peer to function. **Do not** try to run 5FAN with native Node — use Pear runtime only, as specified in the Intercom SKILL.md.

Before setting up 5FAN, the agent **must** have access to the Intercom SKILL.md for:
- Pear runtime installation and Node version requirements (22.x or 23.x, avoid 24.x)
- Peer startup flags (`--peer-store-name`, `--msb-store-name`, `--subnet-channel`, `--subnet-bootstrap`, `--dht-bootstrap`)
- SC-Bridge setup (WebSocket auth, token generation, JSON commands)
- Sidechannel policy (welcome, owner, invites, PoW)
- Wallet and keypair handling

If the human has not provided the Intercom SKILL.md, ask them to share it or fetch it from `https://raw.githubusercontent.com/Trac-Systems/intercom/main/SKILL.md`.

## Prerequisites

### Required (handled by Intercom SKILL.md)

1. **Node.js 22.x or 23.x** (avoid 24.x)
2. **Pear Runtime** (`npm install -g pear && pear -v`)

### Required (5FAN-specific)

3. **Clone and install 5FAN:**
```bash
git clone https://github.com/joeatang/5FAN.git
cd 5FAN
npm install
```

### Optional — Local LLM (recommended)

4. **LM Studio** (default, `localhost:1234`):
   - Download from https://lmstudio.ai/
   - Load any model and start the server
   - Verify: `curl -s http://localhost:1234/v1/models | head -5`

5. **Ollama** (alternative, `localhost:11434`):
```bash
ollama pull llama3.2:3b
ollama serve
```

### Optional — Cloud LLM

6. **API Key** from Groq, OpenRouter, or Together.ai:
```bash
export FIVEFAN_LM_KEY=your_api_key
export FIVEFAN_LM_CLOUD_URL=https://api.groq.com/openai
export FIVEFAN_LM_CLOUD_MODEL=llama-3.3-70b-versatile
```

**Important:** 5FAN works without any LLM. Template fallback (200+ templates per brain) always responds. The LLM adds depth but is not required.

## Running 5FAN

Use Pear runtime only (never native node). All Intercom peer flags apply — refer to the Intercom SKILL.md for the full flag reference.

### Start Admin Peer

```bash
pear run . --peer-store-name admin --msb-store-name admin-msb --dht-bootstrap "node1.hyperdht.org:49737,node2.hyperdht.org:49737"
```

### Start Joiner Peer

```bash
pear run . --peer-store-name peer2 --msb-store-name peer2-msb --dht-bootstrap "node1.hyperdht.org:49737,node2.hyperdht.org:49737" --subnet-bootstrap <admin-writer-key-hex>
```

The admin's writer key (hex) is printed in the startup banner. Copy it for joiners.

### Join Entry Channel + Send Message

In the TTY (human fallback only):
```
join 0000intercom
send Hello, 5FAN!
```

All five brains scan the message. View curates consensus. LLM (or template) generates a response.

### Agent Quick Start (SC-Bridge)

Autonomous agents **must** use SC-Bridge for all I/O — same as Intercom. See Intercom SKILL.md → "Agent Quick Start (SC‑Bridge Required)" for auth flow.

Once authenticated, send messages via WebSocket:
```json
{ "type": "send", "channel": "0000intercom", "message": "Hello, 5FAN!" }
```

To invoke a specific brain skill:
```json
{ "type": "join", "channel": "5fan-skill-hear" }
{ "type": "send", "channel": "5fan-skill-hear", "message": "{\"type\":\"skill:call\",\"skill\":\"hear\",\"callId\":\"001\",\"payload\":{\"text\":\"I feel lost today\"}}" }
```

## The Five Brains

| Brain | Domain | What It Scans | Signal | Key Capability |
|-------|--------|---------------|--------|----------------|
| **Hear** 👂 | Emotion | Pain, joy, crisis, mixed feelings | 0.0 – 1.0 | Deterministic crisis detection + hotline referral |
| **Inspyre** 🔥 | Values | Purpose, resilience, growth | 0.0 – 1.0 | Reconnects struggles to meaning |
| **Flow** 🌊 | Habits | Consistency, activity, recovery, flow state | 0.0 – 1.0 | Streak tracking, restart validation |
| **You** 🪞 | Identity | Self-awareness, patterns, personal data | 0.0 – 1.0 | Per-user profiling, pattern reflection |
| **View** 🔭 | Synthesis | Perspective, decisions, temporal context | **curateConsensus()** | Multi-brain consensus curation |

### Consensus Pipeline

```
User Message
    │
    ├─→ Hear.scan()    ─→ { signal: 0.7, emotions: ['frustration'], category: 'pain' }
    ├─→ Inspyre.scan() ─→ { signal: 0.4, themes: ['growth'] }
    ├─→ Flow.scan()    ─→ { signal: 0.2, category: 'recovery' }
    ├─→ You.scan()     ─→ { signal: 0.3, markers: ['self-reflection'] }
    └─→ View.scan()    ─→ { signal: 0.5, category: 'perspective' }
                           │
              View.curateConsensus()
                           │
                           ▼
           { dominantBrain: 'hear',
             synthesisPrompt: '...',
             activeBrainCount: 4 }
                           │
                    ┌──────┴──────┐
                    │  LM Bridge  │
                    │ local→cloud │
                    │  →template  │
                    └──────┬──────┘
                           │
                           ▼
                  Broadcast response
```

**Crisis override:** if Hear detects crisis signals (suicidal ideation, self-harm), **ALL** other brain processing is overridden. Crisis response is deterministic (hardcoded keywords → immediate hotline resources). No LLM delay. Non-negotiable.

## Skill Invocation Protocol

Every brain is an invocable skill on Intercom. Any agent on the network can invoke a single brain or the full 5-brain swarm over P2P sidechannels — no REST, no API keys, no cloud functions.

### Channels

| Channel | Purpose |
|---------|---------|
| `5fan-skills` | Discovery — 5FAN broadcasts skill:manifest every 5 min |
| `5fan-skill-hear` | Invoke Hear (emotion scan + validation) |
| `5fan-skill-inspyre` | Invoke Inspyre (values alignment) |
| `5fan-skill-flow` | Invoke Flow (habit tracking + effort validation) |
| `5fan-skill-you` | Invoke You (identity reflection) |
| `5fan-skill-view` | Invoke View (perspective synthesis) |
| `5fan-skill-swarm` | Full 5-brain consensus + View curation + LLM |

### Message Types

| Type | Direction | Purpose |
|------|-----------|---------|
| `skill:call` | Agent → 5FAN | Invoke a brain skill |
| `skill:result` | 5FAN → Agent | Brain scan result + response |
| `skill:error` | 5FAN → Agent | Invocation error (invalid call, rate limit) |
| `skill:chain` | Agent → 5FAN | Chain multiple brains in sequence |
| `skill:chain-result` | 5FAN → Agent | Chained results with View synthesis |
| `skill:manifest` | 5FAN → Discovery | Available skills broadcast |
| `skill:describe` | Agent → 5FAN | Request manifest on a skill channel |

### Invoke a Single Brain

```js
// Join the Hear skill channel
sidechannel.join('5fan-skill-hear');

// Send a skill:call
sidechannel.send('5fan-skill-hear', JSON.stringify({
  type: 'skill:call',
  skill: 'hear',
  callId: 'my-unique-id',
  payload: {
    text: 'I feel so alone today. Nobody checks in on me.',
    context: { userId: 'user123' }
  }
}));

// Listen for skill:result
sidechannel.on('5fan-skill-hear', (msg) => {
  const data = JSON.parse(msg);
  if (data.type === 'skill:result' && data.callId === 'my-unique-id') {
    console.log(data.result);
    // {
    //   signal: 0.85,
    //   category: 'pain',
    //   emotions: ['alone', 'lonely'],
    //   isCrisis: false,
    //   response: "That loneliness you're feeling — it's real.
    //              You don't have to carry it alone."
    // }
  }
});
```

### Invoke the Full Swarm

All 5 brains scan → View curates consensus → LLM enriches:

```js
sidechannel.join('5fan-skill-swarm');

sidechannel.send('5fan-skill-swarm', JSON.stringify({
  type: 'skill:call',
  skill: '5fan-swarm',
  callId: 'swarm-001',
  payload: {
    text: 'I keep quitting everything I start. What is wrong with me?',
    context: { userId: 'user456' }
  }
}));
// skill:result includes all 5 brain scans + dominant brain + LLM response
```

### Chain Brains

Chain multiple brains in sequence — each brain's output feeds the next, with View synthesizing at the end:

```js
sidechannel.send('5fan-skill-swarm', JSON.stringify({
  type: 'skill:chain',
  callId: 'chain-001',
  chain: ['hear', 'inspyre', 'view'],
  payload: { text: 'I want to give up on my business.' }
}));
// skill:chain-result returns each brain's result + View synthesis
```

### Skill Manifests

Each brain has a `skill.json` in `brains/<name>/skill.json` — machine-readable:

```json
{
  "skill": "hear",
  "encodes": "Emotional intelligence — a wise friend who listens without prescribing.",
  "domain": "Emotion detection, validation, and mirroring.",
  "tagline": "Your app does the job. Hear makes the user feel heard.",
  "accepts": { "text": "string (required)", "context": "object (optional)" },
  "returns": { "signal": "0-1", "category": "pain|joy|mixed|crisis|neutral", "response": "string" },
  "whenToUse": ["User expresses emotion", "Before delivering domain-specific advice"],
  "chainsWith": ["inspyre", "flow", "view", "5fan-swarm"]
}
```

### Rate Limiting and Discovery

- **Rate limit:** 30 invocations per minute per channel per caller. Exceeded callers receive `skill:error` with code `RATE_LIMITED`.
- **Discovery:** join `5fan-skills` to receive periodic manifest broadcasts (every 5 min). Or send `skill:describe` on any brain's skill channel to request its manifest on demand.

## Configuration

### config.js (master config)

```js
FIVE_FAN: {
  enabled: true,              // Kill switch — false disables all 5FAN responses
  lm: {
    provider: 'auto',         // 'auto' | 'local' | 'cloud'
    host: '127.0.0.1',
    port: 1234,               // LM Studio default (Ollama: 11434)
    model: 'gemma-3-4b',      // Change to your loaded model
    cloudUrl: 'https://api.groq.com/openai',
    cloudModel: 'llama-3.3-70b-versatile',
    cloudApiKey: '',           // or set FIVEFAN_LM_KEY env var
    maxTokens: 200,
    temperature: 0.7,
  },
  features: {
    feedReplies:   true,      // Auto-reply to community posts
    trainer:       true,      // 1:1 conversation mode
    nudges:        true,      // Contextual nudges in responses
    proactive:     true,      // Scheduled community posts
    crossBrain:    true,      // Multi-brain consensus analysis
    userProfiling: true,      // Per-user word-frequency profiling
  },
  timezone: 'America/Los_Angeles',
}
```

**Important:** `crossBrain: true` must stay enabled for crisis detection to work. Hear's crisis scanner runs on every message only when crossBrain is on.

### app-context.js (personality + system prompt)

This is the base system prompt that defines who 5FAN is. It gets enriched by `brain-swarm.js`'s `buildEnrichedPrompt()` before being sent to the LLM.

- **Customize:** identity, app description, domain, brain names/descriptions, guided exercises
- **Keep:** core principles, crisis protocol, response framework, anti-patterns

When forking (see below), this is the primary file that changes the agent's personality.

### LLM Provider Priority

| Priority | Provider | Endpoint | Notes |
|----------|----------|----------|-------|
| 1 | **Local** | `http://localhost:1234/v1/chat/completions` | LM Studio or Ollama (OpenAI-compatible) |
| 2 | **Cloud** | Groq / OpenRouter / Together.ai | Needs `FIVEFAN_LM_KEY` env var |
| 3 | **Template** | Per-brain templates in `roleConfig.js` | 200+ templates, always works, zero cloud calls |

All providers use the OpenAI Chat Completions API format. The system prompt is enriched with brain consensus analysis before being sent to any LLM.

## File Structure

```
5FAN/
├── brains/
│   ├── 5fan.js              # Shared constants + helpers
│   ├── hear/                # Emotion scanning
│   │   ├── roleConfig.js    # Personality, keywords, templates (CUSTOMIZE)
│   │   ├── functions.js     # scan(), fulfill(), log() (KEEP)
│   │   ├── index.js         # shouldRespond(), handleMessage() (KEEP)
│   │   └── skill.json       # Agent-readable skill manifest (CUSTOMIZE)
│   ├── inspyre/             # Values alignment (same structure)
│   ├── flow/                # Habit tracking (same structure)
│   ├── you/                 # User profiling (same structure)
│   └── view/                # Consensus curation (+ curateConsensus)
│       └── skill.json
├── server/
│   ├── brain-swarm.js       # Parallel scan engine (KEEP)
│   ├── lm-bridge.js         # Multi-provider LLM bridge (KEEP)
│   ├── skill-server.js      # Skill invocation listener — P2P sidechannels (KEEP)
│   ├── feed-responder.js    # Community auto-reply (KEEP)
│   ├── proactive-scheduler.js # Scheduled posts (KEEP)
│   ├── trainer-api.js       # 1:1 conversation manager (KEEP)
│   └── routes.js            # Express REST API (KEEP)
├── skill-protocol.js        # Skill message types + channel naming + registry (KEEP)
├── config.js                # Feature flags + LLM config (CUSTOMIZE)
├── app-context.js           # System prompt identity (CUSTOMIZE)
├── user-profile.js          # Onboarding + profiles (KEEP)
├── intercom-swarm.js        # P2P brain swarm routing (KEEP)
├── lm-local.js              # Local LLM adapter (KEEP)
├── lm-cloud.js              # Cloud LLM adapter (KEEP)
├── index.js                 # Main Intercom entry point (KEEP)
├── ARCHITECTURE.md          # Detailed architecture diagrams
├── README.md                # Project overview + positioning
└── SKILL.md                 # This file
```

## Typical Requests and How to Respond

When a human asks for something, translate it into the minimal set of actions. Ask for any missing details.

**"Set up 5FAN."**
Pre-check: is the Intercom SKILL.md available in context? If not, ask the human to provide it.
Answer: follow Prerequisites above (Node 22+, Pear, clone, npm install). Then start admin peer with Pear.
If the human wants a local LLM: install LM Studio or Ollama first.
If no LLM: 5FAN still works — template fallback is automatic.

**"Fork 5FAN for my brand."**
Ask for: brand name, personality description, what the community is about, any specific trigger words.
Answer: change 4 files:

| File | What to Edit | Time |
|------|-------------|------|
| `app-context.js` | Agent personality, voice, system prompt | 10 min |
| `brains/*/roleConfig.js` | Trigger keywords + template responses per brain | 20 min |
| `brains/*/skill.json` | Skill manifests (encodes, domain, tagline, whenToUse) | 10 min |
| `config.js` | Timezone, LLM provider, feature flags | 5 min |

**Do not** touch: `brain-swarm.js`, `lm-bridge.js`, `skill-server.js`, `skill-protocol.js`, `intercom-swarm.js`, `trainer-api.js`, `feed-responder.js`, `proactive-scheduler.js`, `lm-local.js`, `lm-cloud.js`, or any `functions.js`/`index.js` inside brains. These are the engine — they work regardless of personality.

**"Add a new brain."**
Ask for: brain name, domain, what it scans for, template responses.
Answer:
1. Create `brains/<name>/` with: `roleConfig.js`, `functions.js`, `index.js`, `skill.json`
2. Register in `brains/5fan.js` → `BRAINS` constant
3. Register in `skill-protocol.js` → `SKILL_REGISTRY`
4. Import in `server/brain-swarm.js` → add to scan array
View's `curateConsensus()` automatically incorporates new brain signals.

**"Change the LLM provider."**
Ask for: which provider (local, cloud, or auto), model name, API key if cloud.
Answer: edit `config.js` → `FIVE_FAN.lm`:
- Local only: `provider: 'local'`, set `port` (1234 for LM Studio, 11434 for Ollama)
- Cloud only: `provider: 'cloud'`, set `cloudUrl`, `cloudModel`, `cloudApiKey`
- Auto (recommended): `provider: 'auto'` — tries local → cloud → template

**"Why is 5FAN not responding?"**
Checklist:
1. Is `FIVE_FAN.enabled` set to `true` in `config.js`?
2. Is `crossBrain: true` in `config.js`? (required for the brain swarm to scan)
3. Is the Intercom peer running? (check TTY or `{ "type": "stats" }` via SC-Bridge)
4. Are both peers using the same `--dht-bootstrap` flags?
5. Is the LLM running? (`curl -s http://localhost:1234/v1/models`). If not, 5FAN still works in template mode — check for template-formatted responses.

**"Invoke 5FAN from my agent."**
Answer: your agent needs a running Intercom peer with SC-Bridge enabled (see Intercom SKILL.md). Then:
1. Join a 5FAN skill channel: `{ "type": "join", "channel": "5fan-skill-hear" }`
2. Send `skill:call` as the message payload
3. Listen for `skill:result` on the same channel
For the full swarm: join `5fan-skill-swarm` instead.
For discovery: join `5fan-skills` and listen for `skill:manifest` broadcasts.

**"What brains are available?"**
Answer: 5 brains — Hear (emotion), Inspyre (values), Flow (habits), You (identity), View (synthesis). Each has a dedicated skill channel. The full swarm (`5fan-skill-swarm`) runs all 5 + consensus + LLM. Read `brains/<name>/skill.json` for detailed manifests.

## Agent Control Surface

- **Autonomous agents must use SC-Bridge** for all I/O (same as Intercom).
- **Do not use the interactive TTY** unless a human explicitly requests it.
- **Template mode is always available** — do not claim 5FAN requires an LLM to function.
- **Crisis detection is deterministic** — Hear's keyword scanner fires before any LLM processing. Do not modify crisis keywords without explicit human approval.
- **Do not generate new wallet keys** for 5FAN. Use the peer wallet from `stores/<peer-store-name>/db/keypair.json` (see Intercom SKILL.md → Wallet Usage).

## Output Contract (Agents Must Follow)

- When generating startup commands, print **fully-expanded, copy-paste-safe** commands (no unresolved placeholders).
- When showing config changes, show the **exact lines** to change in `config.js` or `app-context.js`.
- When forking for a brand, generate **complete file contents** for `roleConfig.js` and `skill.json` — not partial snippets.
- If the human asks to run 5FAN and no Intercom peer is running, **generate a run script** with the correct Pear flags and tell the human to execute it.

## Troubleshooting

**Peers don't see each other**
Both must use identical `--dht-bootstrap` flags. See Intercom SKILL.md → Configuration Flags.

**Lock file errors**
```bash
pkill -9 -f pear-runtime
cd ~/5FAN
find stores -name "LOCK" -delete
```

**LLM not detected**
```bash
curl -s http://localhost:1234/v1/models | head -5
curl -s http://localhost:11434/api/tags | head -5
```
Template mode works without any LLM — the agent always responds.

**First LLM response is slow**
Normal — local models load into memory on first request. Subsequent responses: 1–3 seconds.

**Crisis hotline not showing**
Ensure `crossBrain: true` in config so Hear always runs. Crisis response bypasses LLM entirely.

**skill:call returns no response**
1. Is the 5FAN peer running and joined to the skill channel?
2. Is `skill-server.js` initialized? (check startup logs for "Skill server started")
3. Is the calling agent on the same DHT bootstrap?
4. Rate limit: 30/min/channel/caller. Check for `RATE_LIMITED` errors.

## Notes

- 5FAN **must** run via Pear runtime (never native node).
- All agent communication flows through the Trac Network / Intercom stack.
- The Intercom peer must stay running — closing the terminal stops networking.
- `app-context.js` is the system prompt, not the agent logic. The brains are the logic.
- View's `curateConsensus()` is the core of 5FAN — it decides which brain leads each response.

**Version:** 2.0.0
**License:** Apache-2.0
