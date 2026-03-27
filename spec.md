# Sora AI Video Studio

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Internet Identity authentication with role-based access (user, admin)
- Credit system: 300 free credits on first signup, credit cost per video length
- Text-to-Video generation UI (prompt + video length + style selector)
- Image-to-Video generation UI (image upload + prompt + style selector)
- Video length options: 15s (10 credits), 30s (20 credits), 3min (80 credits), 8min (200 credits)
- Style options: Cinematic, Realistic, Web Series, Movie, Music Video, Custom
- Video Library showing generated video cards with placeholder preview, title, duration, style, download button
- Content categories: Web Series, Movies, Songs/Music Videos, Short Films
- Upgrade to Pro page with pricing tiers (Free, Pro, Enterprise)
- Admin panel: user management, credit management, content management
- Dark cinematic theme, neon/gold accents, smooth animations
- Responsive layout for mobile and desktop

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko):
   - User profiles: principal -> {credits, role, createdAt, isNewUser}
   - Credit management: getCredits, deductCredits, addCredits (admin)
   - Video jobs: createVideoJob (stores job metadata, deducts credits), listUserVideos, listAllVideos (admin)
   - Admin functions: listUsers, updateUserCredits, updateUserRole, deleteVideo
   - VideoJob type: {id, owner, prompt, style, duration, status, createdAt, thumbnailUrl}
   - On first login, auto-assign 300 credits

2. Frontend:
   - Landing page with hero section, feature highlights
   - Auth-gated app shell with sidebar nav
   - Dashboard with credit balance, recent generations, quick-create button
   - Generate page: tabs for Text-to-Video and Image-to-Video
   - Library page: grid of video cards with category filter
   - Pricing page with plan cards
   - Admin panel: users table, content table
   - Global dark theme: bg-black/bg-zinc-950, gold/amber accents, neon purple/blue highlights
