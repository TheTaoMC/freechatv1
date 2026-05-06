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
Real-time messaging within the assigned room_id.

The UI should handle a group of up to 5 people comfortably.

Messages should be stored in the database for session persistence.

5. UI/UX Expectations
Clean, modern interface using Tailwind CSS.

Responsive design (Mobile-friendly).

Clear state indicators (Connecting, Finding Room, Chatting).

คำแนะนำเพิ่มเติมสำหรับสั่ง AI:
บอกมันว่า "Avoid Socket.io" เพราะเราจะรันบน Vercel ให้เน้นไปที่ Supabase Realtime แทน

สั่งให้มันสร้าง Database Schema สำหรับ profiles, rooms, และ messages ก่อนเริ่มเขียนส่วน UI