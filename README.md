# FreeChat v1 - Real-time 5-Person Group Chat

A high-performance, real-time group chat application that automatically matches users into small, intimate rooms (max 5 people) with a focus on premium UI and customizable identity.

## 🚀 Features

### 1. Real-time Matchmaking
- **Atomic Room Join**: Uses a dedicated SQL function (`join_available_room`) to handle concurrent joins safely.
- **Auto-Cleanup**: Database triggers (`delete_empty_rooms`) automatically delete rooms and messages when the last person leaves.
- **Capacity Control**: strictly limits rooms to 5 participants for better engagement.

### 2. Premium Chat Experience
- **Glassmorphism UI**: A modern, sleek design with smooth transitions and animations.
- **Media Support**: Seamlessly send images (via Supabase Storage), emojis, and built-in stickers.
- **Contextual Replies**: Reply to specific messages with a clear preview of the original content.
- **Read Receipts**: Real-time "Read by X" indicators using Supabase Presence.
- **Notifications**: Native browser notifications and sound alerts for incoming messages.

### 3. Advanced Avatar System (DiceBear v9)
- **Deep Customization**: Adjust head, eyes, eyebrows, mouth, clothing, and accessories.
- **Schema-Perfect**: Fully synced with official DiceBear `schema.json` for 100% parameter accuracy.
- **Smart Validation**: Handles "none" selections by setting `Probability=0` to satisfy v9 API requirements.
- **Real-time Sync**: Avatars update instantly across the app and for all online users when changed in profile.

## 🛠️ Technical Stack
- **Framework**: Next.js 15 (App Router)
- **Backend/Auth**: Supabase (PostgreSQL, Realtime, Auth, Storage)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Avatars**: DiceBear API v9 (Avataaars style)

## 📅 Future Roadmap
- **Custom Hand-Drawn Avatars**: Support for layered PNG rendering to allow unique community art.
- **Voice Messaging**: Audio recording and playback within the chat flow.
- **Giphy Integration**: Search and send dynamic GIFs directly from the input bar.

---
*Status: Production Ready. System stable and documented.*
