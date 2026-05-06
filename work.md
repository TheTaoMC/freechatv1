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
- **Optimized UI**: Group chat interface designed for up to 5 people with message type rendering (text, image, sticker).
- **Session Persistence**: Messages are stored in the database but managed by room lifecycle.

5. UI/UX Expectations
- Clean, modern interface using **Glassmorphism** design and Tailwind CSS.
- Responsive design (Mobile-friendly).
- Clear state indicators (Connecting, Finding Room, Chatting).
- Smooth animations and transitions for a premium feel.

6. Technical Implementation Details (Completed)
- **Database Schema**: Profiles, Rooms, and Messages tables with RLS enabled.
- **Matchmaking**: Atomic SQL Function (`join_available_room`) to handle concurrent joins safely.
- **Auto-Cleanup**: SQL Trigger (`delete_empty_rooms`) that automatically deletes the room and its messages when `member_count` reaches 0.
- **Auth**: Supports Google OAuth and Anonymous Guest login (Supabase Auth).
- **Real-time**: Powered by Supabase Realtime Broadcast and Presence.
- **Storage**: Supabase Storage bucket (`chat-media`) for image uploads.

---
*Status: All core features implemented and deployed to Vercel.*