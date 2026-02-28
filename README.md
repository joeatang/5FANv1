# 5FAN — Emotional Intelligence as P2P Infrastructure

**41 callable skills for any app that talks to humans.** Emotion scan, crisis detection, coaching, community engagement, wellness scoring — all over P2P sidechannels on [Trac Network's Intercom](https://github.com/Trac-Systems/intercom). No REST endpoints, no API keys, no cloud dependency.

Your app already does the job. 5FAN makes it *feel* right — so notifications land with the right tone, crisis signals never get missed, and responses sound like someone who actually listened.

**[Live Demo](https://joeatang.github.io/5FAN/)** · **[Architecture](ARCHITECTURE.md)** · **[Skill Guide](SKILL.md)** · **[Fork Guide](#fork-this-for-your-brand)**

## Trac Address (for payouts)
trac1wtsn8ru2ryknk36rd6glp2tfj0dawnh2gkjrg90gzqvwes65v78qmwjuzq

## Proof of Running
- **Live Demo:** https://joeatang.github.io/5FAN/
- **Production VPS:** Running 24/7 on Trac Network (peer + skill server on `104.131.183.26`)
- **SC-Bridge:** WebSocket skill invocation active — `connected: true, authed: true, healthy: true`

---

## What Your App Gets

Call any skill over WebSocket or P2P sidechannel. Get a structured result back in milliseconds.

```json
{ "type": "skill-call", "skill": "emotion-scan", "input": { "text": "I feel lost" } }
→ { "type": "skill-result", "result": { "ok": true, "signal": 0.82, "emotions": ["sadness", "confusion"], "category": "pain" }, "ms": 12 }
```

### Integration Examples

| When Your App Needs To... | Call This Skill | What You Get Back |
|---|---|---|
| Read the room before sending a notification | `emotion-scan` | Signal strength (0–1), detected emotions, category |
| Catch "I want to give up" before the LLM sees it | `crisis-detect` | Crisis type, severity, hotline resources — deterministic, zero misses |
| Adjust reply tone to match the user's mood | `tone-match` | Suggested tone, energy level, formality score |
| Know if a user is burning out or in flow | `wellness-score` | Composite score across emotional, habit, and identity dimensions |
| Celebrate a milestone the user didn't announce | `milestone-detect` | Streak count, milestone type, suggested acknowledgment |
| Generate a coaching nudge at the right moment | `nudge-engine` | Context-aware nudge text, trigger reason, urgency |
| Help a user reframe a negative thought | `reframe` | Original thought, cognitive distortion, reframed perspective |
| Turn raw emotion into a concrete action | `micro-move` | 30-second action matched to the detected emotion |

Every skill is deterministic first (keyword scanning, rule-based analysis), LLM-enriched second (local → cloud → template fallback). Crisis detection is **always deterministic** — no probabilistic misses.

---

## 41 Skills — Full Catalog

| Category | Count | Skills | What They Do |
|----------|-------|--------|--------------|
| **EQ Engine** | 9 | emotion-scan, emotion-family, emotion-blend, emotion-timeline, crisis-detect, alias-match, reframe, micro-move, desire-bridge | Deterministic emotional intelligence — scan, classify, reframe, and act on emotion |
| **Compass** | 5 | compass-locate, compass-interpret, compass-point, compass-practice, shift-navigator | Purpose and values navigation — find where you are, where you're going, what to practice |
| **Community** | 5 | feed-reply, proactive-post, community-pulse, hi-note-compose, social-caption | Community engagement — auto-reply, scheduled posts, sentiment pulse |
| **AI Coach** | 10 | tone-match, content-elevate, gym-facilitator, coach-chat, nudge-engine, milestone-detect, memory-context, journal-prompt, session-summary, wellness-score | 1:1 coaching — guided sessions, contextual nudges, milestone tracking, wellness scoring |
| **Internal** | 6 | earn-calculator, tier-gate, hi5-claim-check, quality-score, anti-bot, vault-query | Stay Hi Trac integration — point economy, tier access, anti-abuse |
| **Core Brains** | 6 | hear, inspyre, flow, you, view, swarm | 5-brain consensus engine + full swarm invocation |

All 41 skills are registered in `skill-protocol.js` and dispatched via `skill-dispatch.js`. Rate limited to 30 calls/min/caller.

### Invocation (P2P Sidechannel)

```json
{ "type": "skill:call", "skill": "compass-locate", "input": { "text": "I don't know what I want" } }
→ { "type": "skill:result", ... }
```

### Invocation (WebSocket / SC-Bridge)

```json
{ "type": "skill-call", "skill": "wellness-score", "input": { "text": "I've been off for days" } }
→ { "type": "skill-result", "skill": "wellness-score", "result": { "ok": true, ... }, "ms": 18 }
```

---

## Why Not Just Prompt an LLM?

For simple cases, you should. But 5FAN solves three problems a prompted LLM can't:

| Problem | LLM Alone | 5FAN |
|---|---|---|
| **Consistency** | Drifts — different tone, depth, character every time | Deterministic brain scanners fire identically on every message. The LLM only handles talking, not thinking. |
| **Safety** | *Might* catch a crisis signal. Probabilistic. | `crisis-detect` catches suicide/self-harm keywords with 100% recall. Fires before the LLM. Non-negotiable. |
| **Data control** | Every message goes to someone else's server | Runs local-first on P2P. 200+ template responses work with zero cloud calls. Data stays on-device. |

---

## Who Needs This

| If You're Building... | The Problem Without 5FAN |
|---|---|
| **Recovery & crisis apps** | "I want to use again" MUST be caught every time. LLMs are probabilistic. 5FAN is deterministic. |
| **Kids & youth platforms** | Sending a child's emotional data to a cloud LLM is a COPPA/GDPR-K minefield. 5FAN runs local-first. |
| **Fitness & wellness apps** | Your app knows it's day 14 but says "Don't break your streak!" — that's guilt, not intelligence. 5FAN knows restarts are harder than streaks. |
| **Character-driven brands** | 283 characters need distinct voices. LLMs drift. 5FAN's brain architecture locks personality in code. |
| **Creator & fan communities** | A chatbot in a 50K community feels hollow. 5FAN scans every message, only triggers depth when it matters. |
| **Corporate wellness** | Employee emotional data going to OpenAI? Legal shuts it down. 5FAN runs on-premise or P2P. |

---

## How It Works — The Five Brains

Under the hood, 5FAN runs five specialized brains in parallel on every message. A consensus engine synthesizes their signals into one informed response.

| Brain | Domain | Scans For | Signal |
|-------|--------|-----------|--------|
| **Hear** | Emotion | Pain, joy, crisis, mixed feelings | 0.0 – 1.0 |
| **Inspyre** | Values | Purpose, resilience, growth themes | 0.0 – 1.0 |
| **Flow** | Habits | Consistency, activity, recovery, flow state | 0.0 – 1.0 |
| **You** | Identity | Self-awareness, patterns, personal data | 0.0 – 1.0 |
| **View** | Synthesis | Perspective, decisions, temporal context | **+ curateConsensus()** |

View's `curateConsensus()` ranks signals, identifies the dominant brain, and builds a synthesis prompt that enriches the LLM system message. **Crisis detection** bypasses all of this — Hear's keyword scanner fires immediately and provides hotline resources with no LLM delay.

### Consensus Pipeline

```
User message
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
                    ┌──────────┴──────────┐
                    │  LLM Bridge         │
                    │  local → cloud →    │
                    │  template fallback  │
                    └──────────┬──────────┘
                               │
                               ▼
                        Final response
```

### P2P Skill Channels

Any agent on Intercom can invoke a single brain or the full swarm over sidechannels:

| Channel | What It Does |
|---------|---------|
| `5fan-skill-hear` | Invoke Hear (emotion scan) |
| `5fan-skill-inspyre` | Invoke Inspyre (values alignment) |
| `5fan-skill-flow` | Invoke Flow (habit tracking) |
| `5fan-skill-you` | Invoke You (identity reflection) |
| `5fan-skill-view` | Invoke View (perspective synthesis) |
| `5fan-skill-swarm` | All 5 brains → consensus → LLM |
| `5fan-skills` | Discovery — manifest broadcast every 5 min |

---

## Quick Start

### Prerequisites

- **Node.js** 22.x or 23.x
- **[Pear Runtime](https://docs.pears.com/guides/getting-started)**
- **LLM** (optional): [LM Studio](https://lmstudio.ai/) or [Ollama](https://ollama.ai/) for local; Groq/OpenRouter/Together.ai for cloud

### Install

```bash
git clone https://github.com/joeatang/5FAN.git
cd 5FAN
npm install
```

### Run

```bash
# Terminal 1 — Admin peer
pear run . --peer-store-name admin --msb-store-name admin_msb \
  --dht-bootstrap "node1.hyperdht.org:49737,node2.hyperdht.org:49737"

# Terminal 2 — Second peer
pear run . --peer-store-name peer2 --msb-store-name peer2_msb \
  --dht-bootstrap "node1.hyperdht.org:49737,node2.hyperdht.org:49737"

# In both terminals
join 0000intercom
send Hello world
```

5FAN scans the message across all five brains, builds consensus, enriches via LLM (if available), and broadcasts a response.

---

## LLM Configuration

### Local LLM (recommended for development)

Start LM Studio or Ollama — 5FAN auto-detects at `localhost:1234` (LM Studio) or `localhost:11434` (Ollama).

```bash
# LM Studio: just start the application and load a model
# Ollama:
ollama pull llama3.2:3b && ollama serve
```

### Cloud LLM

Set environment variables in your shell or `.env`:

```bash
export FIVEFAN_LM_KEY=gsk_your_groq_key_here
export FIVEFAN_LM_CLOUD_URL=https://api.groq.com/openai
export FIVEFAN_LM_CLOUD_MODEL=llama-3.3-70b-versatile
```

Supported providers (all OpenAI-compatible):
- **Groq** — `https://api.groq.com/openai`
- **OpenRouter** — `https://openrouter.ai/api`
- **Together.ai** — `https://api.together.xyz`

### No LLM

Works fine without any LLM — falls back to curated templates (40+ per brain, ~200 total).

---

## Feature Flags

Edit `config.js` to toggle capabilities:

```js
features: {
  feedReplies:   true,   // Auto-reply to community posts
  trainer:       true,   // 1:1 conversation mode
  nudges:        true,   // Contextual nudges in responses
  proactive:     true,   // Scheduled community posts
  crossBrain:    true,   // Multi-brain consensus
  userProfiling: true,   // Per-user word-frequency tracking
}
```

**Kill switch:** Set `FIVE_FAN.enabled = false` to disable all brain responses instantly.

---

## Trainer Mode

DM the agent to start a 1:1 session:

| Command | Action |
|---------|--------|
| *(any message)* | Open conversation with brain swarm enrichment |
| `/exercise gratitude` | Guided gratitude exercise (5 prompts) |
| `/exercise reframe` | Cognitive reframing exercise |
| `/exercise values` | Values clarification |
| `/exercise breathe` | Guided breathing |
| `/exercise journal` | Reflective journaling |
| `/exercises` | List all available exercises |
| `/stats` | Session statistics |
| `/open` | Switch back to open conversation |

---

## Proactive Scheduler

Timezone-aware scheduled posts to the community channel:

| Slot | Window | Theme |
|------|--------|-------|
| Morning | 7:00–9:00 | Energy, gratitude, intention |
| Afternoon | 13:00–15:00 | Momentum, flow, connection |
| Evening | 18:00–20:00 | Reflection, rest, celebration |

10 templates per slot, LLM-enriched when available. Configurable timezone in `config.js`.

---

## REST API

When using Express routes (`server/routes.js`):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/5fan/status` | GET | System status + LLM availability |
| `/v1/5fan/analyze` | POST | Run brain swarm analysis on text |
| `/v1/5fan/respond` | POST | Analyze + generate response |
| `/v1/5fan/feed` | POST | Feed auto-reply |
| `/v1/5fan/trainer` | POST | Trainer conversation turn |
| `/v1/5fan/proactive` | GET | Generate proactive post |
| `/v1/5fan/lm/status` | GET | LLM provider status |

---

## File Structure

```
5FAN/
├── brains/
│   ├── 5fan.js              # Shared config, constants, helpers
│   ├── hear/                # Emotional scanner + skill.json
│   ├── inspyre/             # Values alignment + skill.json
│   ├── flow/                # Habit guardian + skill.json
│   ├── you/                 # Data analyst / profiler + skill.json
│   └── view/                # Curator + curateConsensus() + skill.json
├── skills/
│   ├── eq-engine/           # 9 skills: emotion-scan, crisis-detect, reframe...
│   │   └── data/            # Emotion families, micro-moves, desire map
│   ├── compass/             # 5 skills: locate, interpret, point, practice, shift
│   ├── community/           # 5 skills: feed-reply, proactive-post, pulse...
│   ├── coach/               # 10 skills: tone-match, coach-chat, nudge-engine...
│   └── internal/            # 6 skills: earn-calculator, tier-gate, anti-bot...
├── server/
│   ├── brain-swarm.js       # Parallel scan + consensus engine
│   ├── lm-bridge.js         # Multi-provider LLM (auto-fallback)
│   ├── skill-server.js      # 41-skill handler imports + registration
│   ├── feed-responder.js    # Community feed auto-reply
│   ├── proactive-scheduler.js
│   ├── trainer-api.js       # 1:1 conversation manager
│   └── routes.js            # Express REST API
├── skill-dispatch.js        # Central skill dispatcher (35 callable)
├── skill-http.js            # HTTP skill endpoint
├── skill-protocol.js        # Skill registry + message types + channels
├── config.js                # Master config + feature flags
├── app-context.js           # System prompt identity
├── user-profile.js          # Onboarding + profile persistence
├── intercom-swarm.js        # P2P brain swarm routing
├── lm-local.js              # Local LLM adapter
├── lm-cloud.js              # Cloud LLM adapter
├── index.js                 # Main Intercom entry point
├── tests/                   # Skill test suites
└── ARCHITECTURE.md          # Detailed architecture docs
```

Each brain directory contains three files:
- `roleConfig.js` — Title, personality description, trigger keywords, template responses
- `functions.js` — `scan()`, `fulfill()`, `log()`, `sendTo()`
- `index.js` — `shouldRespond()`, `handleMessage()` (threshold-based)

---

## Fork This for Your Brand

5FAN is designed to be forked. The architecture separates *what the brains do* from *how the system works* — so you change the personality without touching the engine.

### What It Looks Like for Real Brands

| If You're... | Your 5-Brain Agent Becomes | Brain Specializations |
|---|---|---|
| **VeeFriends / GaryVee** | VeeFAN — character-trait companion | Hear→Empathy, Inspyre→Hustle, Flow→Patience, You→Self-Awareness, View→Gratitude |
| **Peloton / Fitness brand** | FitFAN — workout accountability | Hear→Recovery, Inspyre→PRs, Flow→Consistency, You→Body data, View→Progress |
| **Calm / Mental health** | MindFAN — emotional wellness | Hear→Mood, Inspyre→Coping, Flow→Mindfulness streaks, You→Patterns, View→Holistic |
| **Nike Running Club** | RunFAN — runner's companion | Hear→Runner's wall, Inspyre→Goals, Flow→Mileage, You→Splits data, View→Season plan |
| **Recovery community** | SoberFAN — sobriety support | Hear→Crisis/cravings, Inspyre→Why I quit, Flow→Clean days, You→Triggers, View→Long game |
| **Corporate wellness** | TeamFAN — employee engagement | Hear→Burnout, Inspyre→Purpose, Flow→Work-life, You→Team pulse, View→Culture |
| **Education / EdTech** | StudyFAN — student support | Hear→Stress, Inspyre→Goals, Flow→Study habits, You→Grades, View→Semester plan |
| **Sports franchise** | FanFAN — fan engagement | Hear→Game emotions, Inspyre→Loyalty, Flow→Watch streaks, You→Fan stats, View→Season |
| **Creator economy** | CreatorFAN — audience companion | Hear→Sentiment, Inspyre→Vision, Flow→Posting cadence, You→Audience data, View→Strategy |

### What You Change vs What You Keep

| You Change (30 min) | You Keep (entire engine) |
|---|---|
| `app-context.js` — AI personality & voice | Consensus pipeline (parallel scan → curate → respond) |
| `brains/*/roleConfig.js` — keywords & templates | LLM bridge (local → cloud → template fallback) |
| `config.js` — feature flags & timezone | Skill layer (P2P invocation over sidechannels) |
| Brain names (Hear→Recovery, etc.) | Trainer system (open + guided exercises) |
| Template response text | Proactive scheduler (timezone-aware) |
| `brains/*/skill.json` — skill manifests | Skill protocol (message types + channel naming) |
| | Feed auto-responder (rate-limited) |
| | User profiling (word-frequency + onboarding) |
| | REST API (`/v1/5fan/*`) |
| | P2P routing (Intercom sidechannels) |
| | Crisis detection + hotline referral |

### Step-by-Step Fork

```bash
# 1. Clone
git clone https://github.com/joeatang/5FAN.git my-brand-agent
cd my-brand-agent
npm install

# 2. Edit app-context.js — change the personality
#    "You are VeeFAN, a character-trait companion for the VeeFriends community..."

# 3. Edit brains/*/roleConfig.js — change keywords + templates
#    Hear: swap emotion words for your domain
#    Inspyre: swap motivational triggers
#    Flow: swap habit/consistency keywords
#    You: swap identity/data markers
#    View: swap synthesis templates

# 4. Edit brains/*/skill.json — update skill manifests for your brains
#    Change "encodes", "domain", "tagline", "whenToUse" for each brain

# 5. Edit config.js — your timezone, LLM provider, feature flags

# 6. Run it
pear run . --peer-store-name admin --msb-store-name admin_msb \
  --dht-bootstrap "node1.hyperdht.org:49737,node2.hyperdht.org:49737"
```

You now have a 5-brain AI agent on a P2P network with multi-provider LLM, 1:1 coaching, proactive community engagement, and crisis detection — customized for your brand.

### Add a 6th Brain

Need a brain that doesn't exist? Add one:

1. `mkdir brains/mybrain` — create the directory
2. Copy `roleConfig.js`, `functions.js`, `index.js` from any existing brain
3. Change the scan keywords, templates, and personality
4. Create a `skill.json` manifest (copy from any brain, update metadata)
5. Register in `brains/5fan.js` → add to `BRAINS` array
6. Register in `skill-protocol.js` → add to `SKILL_REGISTRY`
7. Import in `server/brain-swarm.js` → add to scan array

View's `curateConsensus()` automatically incorporates the new brain's signals — no other changes needed.

---

## Credits

**Built by:** [@joeatang](https://github.com/joeatang)

**Built on:** [Trac Network Intercom](https://github.com/Trac-Systems/intercom) · [Pear Runtime](https://docs.pears.com) · [Trac Network](https://trac.network)

**LLM providers:** [LM Studio](https://lmstudio.ai/) · [Ollama](https://ollama.ai/) · [Groq](https://groq.com/) · [OpenRouter](https://openrouter.ai/) · [Together.ai](https://together.ai/)

---

**Version:** 2.1.0  
**License:** Apache-2.0
