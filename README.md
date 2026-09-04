# 🌐 VibePulse — Scalable Random 1-on-1 Video Chat Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-black.svg)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P-orange.svg)](https://webrtc.org/)

**VibePulse** is an original, modern, highly scalable 1-to-1 random video chat application built with React, Node.js, Express, Socket.IO, Redis, MongoDB, and native browser WebRTC APIs.

---

## 🚀 Key Highlights & Architecture

- **True P2P WebRTC Video/Audio**: Video streams flow directly between peers via STUN/TURN ICE negotiation. Zero video stream bandwidth hits the backend servers.
- **Atomic Redis Matchmaker**: Distributed queue handling that prevents self-matching, duplicate rooms, stale queue entries, and mutual blocks.
- **Layered Moderation**:
  - *Browser-Side*: In-browser canvas frame analysis with automatic safety flagging and one-click smart privacy blur.
  - *Server-Side*: Real-time keyword filter, spam/URL redaction, anti-flood rate limiters, and session ban lists.
- **Staff Moderation Portal**: Real-time admin dashboard with live telemetry, incident report resolution, session suspension tools, and diagnostic metrics.
- **Containerized & Free-Tier Friendly**: Pre-configured `docker-compose.yml` and portable environment settings for Cloudflare Pages, Render, Railway, MongoDB Atlas, and Upstash Redis.

---

## 🏗️ System Architecture

```
User A (Browser) <---------------- P2P WebRTC (Audio/Video) ----------------> User B (Browser)
       |                                                                            |
       | Socket.IO (Signalling, Text, Controls)                                     |
       v                                                                            v
  +------------------------------------------------------------------------------------+
  |                     Node.js / Express Signalling Cluster                           |
  +------------------------------------------------------------------------------------+
       |                                                                            |
       v                                                                            v
  +-----------------------------------+             +----------------------------------+
  |    Redis Distributed Matchmaker   |             |       MongoDB (Data & Audit)     |
  |  (Queue, Session state, Rooms)    |             |  (Users, Reports, Blocks, Logs)  |
  +-----------------------------------+             +----------------------------------+
```

---

## 📦 Project Structure

```
random-video-chat/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # VideoPlayer, Controls, ChatBox, Modals, Navbar
│   │   ├── context/            # SocketContext, AuthContext
│   │   ├── hooks/              # useWebRTC, useMediaStream, useFrameModeration
│   │   ├── pages/              # Landing, Chat, AdminDashboard, AdminLogin, Rules
│   │   ├── services/           # API and Socket clients
│   │   └── utils/              # STUN/TURN configuration
│   ├── Dockerfile
│   └── package.json
│
├── server/                     # Node.js + Express + Socket.IO Backend
│   ├── src/
│   │   ├── config/             # DB, Redis, Env configuration
│   │   ├── controllers/        # Admin, Reports, Stats controllers
│   │   ├── middleware/         # Auth, RateLimiting, Error Handling
│   │   ├── models/             # Mongoose schemas (User, Report, Block, Event)
│   │   ├── services/           # Matchmaker & Moderation engines
│   │   ├── sockets/            # Match, Signalling, and Chat event handlers
│   │   └── server.js           # Server entrypoint
│   ├── Dockerfile
│   └── package.json
│
├── load-test/                  # Socket.IO concurrency stress test suite
│   ├── package.json
│   └── simulate-traffic.js
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Quickstart (Local Development)

### 1. Prerequisites
- **Node.js**: v18 or higher
- **npm** or **yarn**
- *(Optional)* Docker & Docker Compose

### 2. Installation
Install dependencies for both server and client:
```bash
# Install root, backend and frontend packages
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
*(Default settings work out of the box with resilient in-memory fallbacks if local Mongo/Redis are offline)*.

### 4. Running Client & Server
Start both servers in development mode:
```bash
# Runs backend on :5000 and frontend on :5173
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) to start chatting.
- Open [http://localhost:5173/admin/login](http://localhost:5173/admin/login) for the Moderator Dashboard (`admin` / `admin123`).

---

## 🐳 Running with Docker Compose

To start the complete stack (Client, Server, Redis, MongoDB, and coturn TURN server):
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- TURN Server: `3478/tcp`, `3478/udp`

---

## ⚡ Concurrency & Load Testing

Run the automated virtual client simulator to test matchmaking throughput:
```bash
# Simulates 50 concurrent matching clients
npm --prefix load-test install
node load-test/simulate-traffic.js
```
Custom test parameters:
```bash
USERS=200 DURATION=30 node load-test/simulate-traffic.js
```

---

## 📈 Scaling toward 10,000 Concurrent Users

To scale VibePulse toward 10,000+ active connections:
1. **P2P Offload**: WebRTC transfers video directly between browsers, meaning the backend servers only process lightweight JSON signalling packets (~1KB per match).
2. **Horizontal Node Scaling**: Run multiple Node.js instances behind an NGINX / Cloudflare load balancer using the built-in `@socket.io/redis-adapter`.
3. **Redis Cluster / Upstash**: Matchmaking queues run in memory with O(1) popping and atomic pairing.
4. **MongoDB Atlas Sharding**: Write reports and moderation logs asynchronously without blocking active video sessions.

---

## 🛡️ Community Safety & Moderation

- **18+ Age & Consent Safeguard**: Explicit agreement required before opening video devices.
- **Instant Skip & Mutual Block**: Skipping a user immediately severs the WebRTC track and prevents re-matching.
- **Reporting System**: Captures violation category and dispatches to the Admin Dashboard for instant suspension.
- **Privacy First**: No raw video is streamed or saved on the backend.
