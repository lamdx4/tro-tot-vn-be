# Trọ Tốt VN - Backend Architecture 🚀

A high-performance, real-time backend for the "Trọ Tốt VN" platform, built with **Node.js**, **TypeScript**, and **Express**. This project implements modern signaling systems, AI integration, and robust data persistence.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js
- **Database**: TypeORM (SQL Server / MySQL)
- **Real-time**: Socket.IO + Redis Adapter
- **Caching**: Redis (Device-level tracking, signaling state)
- **Cloud Messaging**: Firebase Admin SDK (FCM)
- **AI**: Google Gemini AI (Agentic Property Search)
- **Multimedia**: Multer + Local/Cloud Storage

---

## ✨ Key Features

### 💬 Real-time Chat System
- **Reliable Messaging**: Socket.IO for instant delivery with SQL persistence.
- **Message Types**: Support for Text, Images, and File attachments.
- **Presence Tracking**: Real-time online/offline status using Redis.

### 🎥 WebRTC Video Calls
- **Signaling Server**: Custom signaling logic for 1-on-1 video calls.
- **ICE Configuration**: Automated STUN/TURN server config.
- **FCM Fallback**: "Incoming Call" alerts via push notifications for offline devices.

### 🔔 Push Notifications (FCM)
- **"Socket-First" Strategy**: Intelligent delivery that skips push notifications for devices already active in a socket session.
- **Multicast Support**: Efficient notification delivery across multiple user devices.

### 🤖 AI-Powered Assistant
- **Intent Extraction**: Advanced NLP to understand user housing needs.
- **Search Optimization**: Integrated with recommendation services for personalized results.

---

## 📂 Project Structure

This project follows a clean architecture pattern to ensure modularity and scalability:

```text
src
├── domains      # Core business entities (TypeORM Models)
├── infras       # Infrastructure (DB, Redis, Repository Impl, Sockets)
├── services     # Domain & Application Logic (FCM, Chat, Notification)
├── web          # Web Layer (Controllers, Routers, Middlewares, Validators)
└── utils        # Shared Constants & Utility Functions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- Docker (for Redis and Coturn)
- SQL Server (or configured database)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup
Create a `.env` file from the template and fill in the required credentials:
```env
PORT=3333
DB_HOST=localhost
REDIS_HOST=localhost
FIREBASE_PROJECT_ID=...
# FCM Service Account fields...
```

---

## 📖 Documentation
- [WebRTC Signaling Guide](./docs/WEBRTC.md)
- [FCM Integration Walkthrough](./src/walkthrough.md)

---

## 🛠 Development Scripts
- `npm run dev`: Start the development server with nodemon.
- `npm run build`: Compile TypeScript to JavaScript.
- `npm run lint`: Run ESLint to check for code issues.
- `npm test`: Execute Jest test suites.

Developed with ❤️ by the Trọ Tốt VN Team.