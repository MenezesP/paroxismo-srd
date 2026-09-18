# PAROXISMO — Official SRD Compendium & Virtual Tabletop (VTT)

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-paroxismo--srd.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://paroxismo-srd.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)
[![Discord Activity](https://img.shields.io/badge/Discord-Embedded%20App-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com)
[![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js-black?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Physics](https://img.shields.io/badge/Physics-Cannon.js-crimson?style=for-the-badge)](https://github.com/schteppe/cannon.js)
[![Realtime](https://img.shields.io/badge/Realtime-MQTT%20WebSockets-teal?style=for-the-badge)](https://mqtt.org/)

**A cosmic horror d20 tabletop roleplaying system, interactive digital compendium, and real-time multiplayer Virtual Tabletop (VTT), natively integrated as a Discord Activity.**

---

🌐 **Language / Idioma:** **English** | [Versão em Português](README.pt-BR.md)

</div>

---

## 🌌 Overview

**PAROXISMO** is a tabletop roleplaying game (TTRPG) set in a universe of cosmic dread, psychological horror, and emotional metaphysics. 

This repository houses the complete **Official System Reference Document (SRD)** and a full-fledged web application designed for both players and Game Masters. Built from the ground up as a zero-latency Single Page Application (SPA), it blends rich occult lore and mechanics with modern web technologies: a **real-time 3D physics dice engine**, **live multiplayer session synchronization**, **interactive character sheets**, and direct integration as an **Embedded Discord Voice Activity**.

---

## ⚡ Key Engineering & Product Highlights

### 🎲 Synchronized 3D Physics Dice Engine ("The Same Die")
* **Deterministic Multi-Client Roll Synchronization**: When any player or GM rolls a die (via the quick dock, character sheet, weapon attacks, or skill checks), the client pre-calculates the trajectory and broadcasts initial physical impulse vectors (`position`, `velocity`, `angularVelocity`, `quaternions`) and target faces across MQTT WebSockets.
* **Isolated Headless Physics Prediction**: Utilizes an isolated `headlessWorld` in **Cannon.js** to pre-determine resting orientations and dynamically align dice face UV coordinates (`DiceManager.prepareValues`) before rendering in **Three.js**.
* **Identical Physics Arena**: Fixed collision bounding boxes (`boundX = 50, boundZ = 75`) guarantee that mobile, tablet, and desktop screens experience the exact same bounce paths and land on the **exact same face** simultaneously.
* **Synchronized Chat Feed Delivery**: Numerical chat cards are held until the physical 3D die reaches complete rest on the virtual felt, preserving table drama and suspense.

### 🎮 Discord Activity & Embedded App SDK Integration
* **Voice Channel Native**: Runs directly inside Discord voice channels using the **Discord Embedded App SDK**.
* **Automatic Channel Pairing**: Instantly detects Discord `channel_id` and room instances to pair voice participants into the same game room without manual room code entry.
* **Cross-Client Notification**: Rolls, chat messages, and character state changes automatically broadcast to all active voice channel members.

### 🌐 Serverless Real-Time P2P/MQTT Architecture
* **Pure Vanilla JS Protocol Implementation**: Zero external library bloat; includes a custom, lightweight MQTT 3.1.1 protocol encoder/decoder built with native `Uint8Array`, `TextEncoder`, and `TextDecoder`.
* **High-Availability Broker Mesh**: Features automatic failover across public globally distributed WebSocket brokers (HiveMQ, EMQX).
* **Network Resilience**: Equipped with exponential backoff reconnection, automatic keep-alive heartbeats (`PINGREQ`/`PINGRESP`), and offline message queueing.

### 📜 Complete SRD Compendium & Interactive Lore Systems
* **10 Character Archetypes / Classes & 45 Abyss Fusions**: Dynamic talent trees and an interactive matrix for exploring forbidden eldritch fusions.
* **200+ Spell & Ritual Grimoire**: Filterable and searchable by tier, elemental emotion, and archetype.
* **Interactive Emotion Wheel**: Visualizer for the Metaphysics of Emotions, tracking afflictions, psychological states, and behavioral shifts.
* **Equipment & Weapon Forge**: Complete rules and automated stat calculations for occult weaponry and relics.

### 👤 Dynamic Character Sheet & Stylized Canvas Exporter
* **Reactive Calculations**: Auto-computes Health (PV), Effort Points (PE), skill modifiers, and combat values.
* **Instant VTT Synchronization**: Updating a character's portrait, concept, or health points instantly updates their token and stats for the GM and other players in the session.
* **Exportable Art Cards**: Uses custom HTML5 Canvas rendering (`sheet-image-generator.js`) to generate high-resolution, branded visual character cards directly from the browser.

### 🎨 Dark Fantasy Design System & Immersive Audio
* **Atmospheric UI/UX**: Custom glassmorphic occult theme built with Tailwind CSS and specialized animations.
* **Rotary Navigation Wheel**: Custom circular HUD navigation component designed for quick, responsive switching between compendium sections.
* **Web Audio Soundscape**: Dynamic sound cues for dice throws, critical successes, abyssal fumbles, and liturgical modal triggers (`sound-fx.js`).

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Core** | Pure JavaScript (ES6+ Modules), HTML5, CSS3, Modern SPA Architecture |
| **3D Graphics & Physics** | [Three.js](https://threejs.org/) (WebGL 3D Rendering), [Cannon.js](https://github.com/schteppe/cannon.js) (Rigid Body Physics) |
| **Realtime Networking** | Native MQTT 3.1.1 over WebSockets (Binary Protocol, Pub/Sub, Multi-broker failover) |
| **Platform Integration** | [Discord Embedded App SDK](https://discord.com/developers/docs/activities/overview) |
| **Styling & Design System** | [Tailwind CSS](https://tailwindcss.com/), Custom Occult Glassmorphism Theme |
| **Audio & Canvas** | Web Audio API, HTML5 Canvas 2D Rendering Engine |
| **Hosting & Deploy** | Vercel (Edge Functions & Routing), Netlify |

---

## 🚀 Getting Started

### Prerequisites
* Any modern web browser with WebGL support (Chrome, Firefox, Edge, Safari).
* Node.js (optional, for local development server) or Python.

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MenezesP/paroxismo-srd.git
   cd paroxismo-srd
   ```

2. **Serve the project**:
   ```bash
   # Using Node.js
   npx serve . -p 8080

   # Or using Python
   python -m http.server 8080
   ```

3. Open your browser and navigate to `http://localhost:8080`.

---

## ☁️ Deployment

The project is pre-configured with SPA rewrites and caching headers for both **Vercel** and **Netlify**.

### Vercel (Recommended)
```bash
npx vercel
```
Or import the GitHub repository directly at [vercel.com](https://vercel.com). Leave the build command empty and root directory as `./`.

### Netlify
```bash
npx netlify deploy --prod
```
Or drag-and-drop the project folder into [Netlify Drop](https://app.netlify.com/drop).

---

## 📁 Project Architecture

```
paroxismo-srd/
├── index.html                 # Main SPA entry point & semantic container layout
├── vercel.json                # Vercel SPA routing and caching rules
├── netlify.toml & _redirects  # Netlify fallback routing
├── css/
│   └── paroxismo-theme.css    # Dark fantasy design system, tokens & occult aesthetic
├── js/
│   ├── app.js                 # Central application orchestrator & router
│   ├── components/            # UI Components
│   │   ├── session-viewer.js  # Multiplayer VTT (Chat, GM Screen, Combat Initiative)
│   │   ├── character-sheet.js # Interactive character sheet with real-time sync
│   │   ├── rotary-wheel.js    # Radial navigation menu
│   │   ├── emotion-wheel.js   # Interactive metaphysical emotion wheel
│   │   ├── grimoire-viewer.js # 200+ Ritual search & filter engine
│   │   ├── fusion-matrix.js   # 45 Abyss Fusions interactive matrix
│   │   ├── forge-viewer.js    # Equipment & Weapon crafting rules
│   │   └── particle-canvas.js # Ambient canvas particle background
│   ├── utils/                 # Utilities & Core Services
│   │   ├── realtime-transport.js # Custom MQTT 3.1.1 WebSocket client
│   │   ├── session-sync.js    # Room presence, state replication & chat sync
│   │   ├── dice-animator.js   # Deterministic 3D throw vector orchestrator
│   │   ├── discord-activity.js# Discord Embedded App SDK bridge
│   │   ├── sheet-image-generator.js # Canvas-based character card renderer
│   │   └── sound-fx.js        # Web Audio API procedural sound system
│   ├── data/                  # Game Database & Lore Modules
│   │   ├── classes.js         # 10 Archetypes & skill progression
│   │   ├── rituals.js         # 200+ Rituals & grimoire entries
│   │   ├── archetypes.js      # Deep lore, mechanics & Abyss fusions
│   │   ├── bestiary.js        # Creatures, entities & aberrations
│   │   └── emotions.js        # Metaphysical emotional matrix
│   └── vendor/                # Vendor Libraries
│       ├── three.min.js       # Three.js 3D WebGL renderer
│       ├── cannon.min.js      # Cannon.js physics engine
│       └── three-dice.js      # Custom physics dice implementation
└── assets/                    # Optimized icons, archetype artwork & heraldry
```

---

## Development Process

This project was developed with the assistance of AI-based tools during
implementation, debugging, and iteration.

The project's concept, feature planning, information architecture,
visual direction, UI/UX decisions, and overall product direction were
defined and supervised by me.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use the code, create adaptations, or explore the metaphysical horror universe of **Paroxismo**.

---

<div align="center">
  <sub>Developed by MenezesP · Built for tabletop roleplayers and cosmic horror enthusiasts.</sub>
</div>
