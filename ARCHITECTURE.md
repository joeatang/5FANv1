# 5FAN v2 Architecture

## Overview

5FAN (Five Brains Agentic Network) is a multi-brain AI agent built on [Trac Network's Intercom](https://github.com/Trac-Systems/intercom) for apps where how you talk to the user matters — character-driven brands, wellness & recovery products, kids platforms, and communities. Five specialized brains analyze every message in parallel, then a consensus pipeline synthesizes their insights into a single response that makes the user feel seen. Every brain is also an invocable skill — any agent on Intercom can call them over P2P sidechannels.

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERCOM P2P LAYER                       │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐               │
│  │  Plane 1  │   │  Plane 2  │   │  Plane 3  │               │
│  │  HyperDHT │   │ Hyperswarm│   │Sidechannel│               │
│  │  (find)   │   │  (sync)   │   │ (message) │               │
│  └──────────┘   └──────────┘   └──────────┘               │
│                                    │                         │
│               ┌────────────────────┼────────────────┐       │
│               │                    │                │       │
│        ┌──────┴───────┐    ┌──────┴────────┐  ┌────┴─────┐│
│        │ 0000intercom │    │ 5fan-skill-*  │  │5fan-skills││
│        │ (entry point)│    │ (brain skills)│  │(discovery)││
│        └──────┬───────┘    └──────┬────────┘  └──────────┘│
└───────────────┼───────────────────┼─────────────────────────┘
                │                   │
                ▼                   ▼
┌───────────────────────┐  ┌───────────────────────────────────┐
│   INTERCOM-SWARM.JS   │  │         SKILL-SERVER.JS           │
│   (Message Router)    │  │     (Skill Invocation Layer)      │
│                       │  │                                   │
│ incoming → filter →   │  │ skill:call → brain scan/fulfill → │
│ route → response →    │  │ skill:result back to caller       │
│ broadcast             │  │                                   │
│                       │  │ Channels:                         │
│ Routes:               │  │   5fan-skill-hear                 │
│  • Feed → Swarm       │  │   5fan-skill-inspyre              │
│  • DM → Trainer       │  │   5fan-skill-flow                 │
│  • Command → Handler  │  │   5fan-skill-you                  │
│  • Onboard → Profile  │  │   5fan-skill-view                 │
│                       │  │   5fan-skill-swarm (all 5 + LLM)  │
└───────────┬───────────┘  └───────────────┬───────────────────┘
            │                              │
            └──────────┬───────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    BRAIN SWARM ENGINE                        │
│                   (brain-swarm.js)                           │
│                                                             │
│  ┌───────┐ ┌─────────┐ ┌──────┐ ┌─────┐ ┌──────┐         │
│  │ HEAR  │ │ INSPYRE │ │ FLOW │ │ YOU │ │ VIEW │         │
│  │emotion│ │ values  │ │ habit│ │ data│ │curate│         │
│  │scanner│ │ align   │ │ guard│ │ anal│ │synth │         │
│  └───┬───┘ └────┬────┘ └──┬───┘ └──┬──┘ └──┬───┘         │
│      │          │          │        │       │               │
│      ▼          ▼          ▼        ▼       ▼               │
│  ┌──────────────────────────────────────────────┐           │
│  │            PARALLEL SCAN                       │           │
│  │  Each brain scans for its domain signals       │           │
│  │  (keywords, patterns, emotional markers)       │           │
│  └──────────────────────┬───────────────────────┘           │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────┐           │
│  │         VIEW: CURATE CONSENSUS                 │           │
│  │  • Rank all brain signals                      │           │
│  │  • Identify dominant brain                     │           │
│  │  • Build synthesis prompt                      │           │
│  │  • Tag extraction                              │           │
│  └──────────────────────┬───────────────────────┘           │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     LM BRIDGE                                │
│                   (lm-bridge.js)                             │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │
│  │  LOCAL LLM   │──▶│  CLOUD LLM   │──▶│  TEMPLATE    │      │
│  │  LM Studio   │   │  Groq/       │   │  FALLBACK    │      │
│  │  Ollama      │   │  OpenRouter   │   │  (per brain) │      │
│  │  (localhost)  │   │  Together.ai  │   │              │      │
│  └─────────────┘   └─────────────┘   └─────────────┘      │
│                                                             │
│  Auto-fallback: local → cloud → template                    │
│  All providers use OpenAI-compatible Chat Completions API   │
└─────────────────────────────────────────────────────────────┘
```

## Brain Specializations

| Brain | Role | Scans For | Key Capability |
|-------|------|-----------|----------------|
| **Hear** | Emotional Scanner | Pain, joy, crisis signals | Crisis detection + hotline referral |
| **Inspyre** | Values Alignment | Purpose, resilience, growth | Reconnects struggles to meaning |
| **Flow** | Habit Guardian | Consistency, activity, recovery | Streak tracking, routine validation |
| **You** | Data Analyst | Self-awareness, identity, patterns | Per-user profiling, pattern reflection |
| **View** | Curator/Synthesizer | Perspective, decisions, synthesis | **curateConsensus()** — multi-brain synthesis |

## Consensus Pipeline

```
User Message
    │
    ▼
┌─────────────────────────────────────┐
│  1. PARALLEL SCAN                    │
│     hearScan()   → signal + emotions │
│     inspyreScan() → signal + themes  │
│     flowScan()   → signal + patterns │
│     youScan()    → signal + markers  │
│     viewScan()   → signal + angles   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. VIEW CURATES CONSENSUS           │
│     • Rank signals (0.0 → 1.0)      │
│     • Identify dominant brain        │
│     • Build synthesis prompt         │
│     • Extract unique tags            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. LLM ENRICHMENT                   │
│     System prompt = app context      │
│                   + brain consensus  │
│                   + user profile     │
│                   + response rules   │
│                                      │
│     local LLM → cloud LLM → null    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. RESPONSE                         │
│     LLM response OR template         │
│     (dominant brain's templates)     │
│                                      │
│     → Broadcast on sidechannel       │
└─────────────────────────────────────┘
```

## File Map

```
5FAN/
├── brains/                          # Brain modules
│   ├── 5fan.js                      # Shared config, constants, helpers
│   ├── hear/
│   │   ├── index.js                 # shouldRespond() + handleMessage()
│   │   ├── functions.js             # scan(), fulfill(), log(), sendTo()
│   │   ├── roleConfig.js            # Title, triggers, templates
│   │   └── skill.json               # Agent-readable skill manifest
│   ├── inspyre/                     # Same structure
│   ├── flow/                        # Same structure
│   ├── you/                         # Same structure
│   └── view/                        # Same + curateConsensus()
│       └── skill.json
│
├── server/                          # Server-side engine
│   ├── brain-swarm.js               # Parallel scan + consensus pipeline
│   ├── lm-bridge.js                 # Multi-provider LLM (auto-fallback)
│   ├── skill-server.js              # Skill invocation listener (P2P)
│   ├── feed-responder.js            # Auto-reply to community posts
│   ├── proactive-scheduler.js       # Scheduled community posts
│   ├── trainer-api.js               # 1:1 conversation manager
│   └── routes.js                    # Express routes for /v1/5fan/*
│
├── contract/                        # Intercom contract (from Trac)
├── features/                        # Intercom features (sidechannels, SC-Bridge)
│
├── skill-protocol.js                # Skill message types, channels, registry
├── config.js                        # Master config + feature flags
├── app-context.js                   # System prompt identity (customize this)
├── user-profile.js                  # Onboarding questionnaire + profiles
├── intercom-swarm.js                # P2P brain swarm routing
├── lm-local.js                      # Local LLM adapter (standalone)
├── lm-cloud.js                      # Cloud LLM adapter (standalone)
├── index.js                         # Main Intercom entry point
│
├── demo.html                        # Browser demo
├── index.html                       # GitHub Pages demo
├── ARCHITECTURE.md                  # This file
├── README.md                        # Project documentation
├── SKILL.md                         # Setup, skill protocol, troubleshooting
├── package.json                     # v2.0.0
└── LICENSE.md                       # MIT
```

## Data Flow

### Feed Message (Community)
```
P2P Message → intercom-swarm.js → brain-swarm.analyze()
            → lm-bridge.generate() → broadcast response
```

### DM (Direct Message to Brain)
```
DM Message → intercom-swarm.js → trainer-api.handleMessage()
           → brain-swarm.analyze() → lm-bridge.generate()
           → DM response
```

### Proactive Post
```
Scheduler tick → proactive-scheduler.generatePost()
              → brain-swarm context → lm-bridge.generate()
              → broadcast to community
```

### Feed Auto-Reply
```
User content post → feed-responder.respondToFeed()
                  → brain-swarm.analyze() → lm-bridge.generate()
                  → rate-limited response
```

### Skill Invocation (Single Brain)
```
External agent → joins "5fan-skill-hear" → sends skill:call
skill-server.js → hearScan() + hearFulfill()
              → skill:result { signal, category, emotions, response }
              → sent back on same channel
```

### Skill Invocation (Full Swarm)
```
External agent → joins "5fan-skill-swarm" → sends skill:call
skill-server.js → all 5 brains scan → View.curateConsensus()
              → brain-swarm.analyzeAndRespond() → lm-bridge.generate()
              → skill:result { dominant, consensus, response }
```

### Skill Chain
```
External agent → sends skill:chain { chain: ['hear', 'inspyre', 'view'] }
skill-server.js → hear.scan() → inspyre.scan() → view.scan()
              → View synthesizes chain → skill:chain-result
```

### Skill Discovery
```
5FAN → every 5 min → broadcasts skill:manifest on "5fan-skills"
External agent → joins "5fan-skills" → receives manifest
External agent → sends skill:describe on any skill channel → gets manifest
```

## LLM Provider Chain

| Priority | Provider | Endpoint | Notes |
|----------|----------|----------|-------|
| 1 | **Local** | `http://localhost:1234/v1/chat/completions` | LM Studio or Ollama (OpenAI-compatible) |
| 2 | **Cloud** | Groq / OpenRouter / Together.ai | Needs `FIVEFAN_LM_KEY` env var |
| 3 | **Template** | Per-brain templates | 40+ templates per brain, always works |

All providers use the OpenAI Chat Completions API format. The system prompt is enriched with brain consensus analysis before being sent to any LLM.

## Trainer Modes

| Mode | Description | Trigger |
|------|-------------|---------|
| **Open** | Freeform conversation with brain swarm enrichment | Default |
| **Guided** | Structured exercises (gratitude, reframe, values, breathe, journal) | `/exercise [name]` |

### Trainer Commands
- `/open` — Switch to open mode
- `/exercise [name]` — Start guided exercise
- `/exercises` — List available exercises
- `/stats` — Show session stats

## Configuration

Edit `config.js` to customize:
- **Kill switch**: `FIVE_FAN.enabled`
- **LLM provider**: `FIVE_FAN.lm.provider` ('auto' | 'local' | 'cloud')
- **Feature flags**: `FIVE_FAN.features.*`
- **Timezone**: `FIVE_FAN.timezone`
- **Rate limits**: `FIVE_FAN.feedResponder.maxPerHour`

Edit `app-context.js` to customize the agent's personality and voice for your application.
