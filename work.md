Project Brief: Random 5-Person Group Chat App
Objective: Build a real-time group chat application that automatically matches users into small rooms (max 5 people) and handles room lifecycle automatically.

1. Tech Stack
Framework: Next.js (App Router preferred)

Deployment: Vercel (Must be Serverless-compatible)

Database & Real-time: Supabase (Database, Auth, and Realtime Broadcast/Presence)

Styling: Tailwind CSS

2. Authentication Requirements
Dual-mode Login:

OAuth via Google.

Anonymous Login (Guest mode) by providing a display name.

Profile Management: A dedicated page to update display name and view profile status.

3. Room Logic & Matchmaking (Critical)
Capacity: Max 5 users per room.

Joining Logic: When a user clicks "Join Chat":

Search for an existing active room where member_count < 5.

If a room is found, join that room and increment member_count.

If no room is available, create a new room and set the user as the first member.

Lifecycle Management:

If a user leaves, decrement member_count.

If member_count reaches 0, delete the room or mark it as inactive.

Note: Use Supabase Presence to detect unexpected disconnects (closing the tab).

4. Chat Features
- Real-time messaging within the assigned room_id.
- **Media Support**: Support for sending images (via Supabase Storage), emojis, and built-in stickers.
- **Reply System**: Contextual message replies showing original message and sender name.
- **Presence Indicators**: Real-time "Read Receipts" (Read by X) and online user list with custom avatars.
- **Notifications**: Browser Web Notifications and sound alerts for incoming messages when inactive.
- **Optimized UI**: Group chat interface designed for up to 5 people with complex message type rendering.

5. UI/UX Expectations
- Clean, modern interface using **Glassmorphism** design and Tailwind CSS.
- **Custom Avatar System**: Detailed user customization (Head, Face, Accessories, Clothing) powered by DiceBear.
- Responsive design (Mobile-friendly).
- Smooth animations and transitions for a premium feel.

6. Technical Implementation Details (Completed)
- **Database Schema**: Profiles (with `avatar_config`), Rooms, and Messages tables.
- **Matchmaking**: Atomic SQL Function (`join_available_room`) for safe concurrent joins.
- **Auto-Cleanup**: SQL Trigger (`delete_empty_rooms`) for automatic room and message deletion.
- **Avatar Engine**: Integrated DiceBear Avataaars (v9) with custom Hex-color mapping and short-name parameters for maximum compatibility.
- **Real-time**: Supabase Realtime Broadcast, Presence (tracking `last_read_id` and `avatar_url`).
- **Storage**: Supabase Storage for image uploads.

7. Future Enhancements & Roadmap
- **Custom Hand-Drawn Avatars**: Support for layered PNG rendering (Skin -> Clothing -> Face -> Hair) to allow unique community art and self-drawn assets.
- **Voice Messaging**: Implementation of audio recording and playback within the chat.
- **Giphy Integration**: Direct search and send for dynamic GIFs/Stickers using Giphy API.

---
*Status: All premium features implemented and documented. System stable on DiceBear v9.*