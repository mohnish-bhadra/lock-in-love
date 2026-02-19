# Lock In Love 💖

**Study Together, Grow Together**

A real-time study accountability app where two users can join a shared room, run individual study timers, and grow a shared animated heart based on consistent studying.

## Features

 **Real-time Synchronization**
- Live timer updates between both users
- Instant heart evolution based on combined study time
- Real-time room state management

❤️ **Shared Heart System**
- One shared heart per room that grows with consistent studying
- 5 evolution levels (0-4) based on total study minutes
- Dynamic animations: bounce, pulse, glow, scale effects
- Visual states: neutral, happy, glowing, sad, cracked, broken

🔥 **Streak Tracking**
- Daily streak counter to encourage consistency
- Automatic streak calculation based on last study date
- Heart decay system if you miss study sessions

⏱️ **Individual Study Timers**
- Personal stopwatch with Start/Pause/Reset controls
- See your partner's timer in real-time
- Accumulate study time throughout the day

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI**: React 18, Tailwind CSS, Framer Motion
- **Database**: Firebase Firestore
- **Authentication**: Firebase Anonymous Auth
- **Deployment**: Vercel (free tier)

## Heart Evolution

### Levels
- **Level 0** (0-60 min): Small neutral heart
- **Level 1** (60-300 min): Slightly bigger with soft smile
- **Level 2** (300-900 min): Bright red, happy expression
- **Level 3** (900-2000 min): Glowing with bouncing animation
- **Level 4** (2000+ min): Large, pulsing with sparkles

### Decay Logic
- **1 day missed**: Slight shrink
- **3 days missed**: Sad face appears
- **5 days missed**: Visible crack overlay
- **7+ days missed**: Broken heart state
- **Revival**: Study 30+ minutes in one day to revive

### Health Formula
```
heartHealthScore = (totalStudyMinutes * 1.0) - (daysInactive * 120)
Minimum score: 0
```

## Project Structure

```
/lock-in-love
  /app
    page.tsx              # Homepage (create/join room)
    /room/[roomId]
      page.tsx            # Room interface
    layout.tsx            # Root layout
    globals.css           # Global styles
  /components
    Heart.tsx             # Animated heart component
    Timer.tsx             # User's timer component
    PartnerTimer.tsx      # Partner's timer (read-only)
  /lib
    firebase.ts           # Firebase configuration
    heartLogic.ts         # Heart calculation functions
  /public
    favicon.svg           # App favicon
    og-image.png          # Open Graph image
  firestore.rules         # Firestore security rules
  .env.local.example      # Environment variables template
```

## Database Structure

### Firestore Collections

**rooms/{roomId}**
```javascript
{
  createdAt: Timestamp,
  totalStudyMinutes: number,
  lastStudyDate: Timestamp | null,
  currentStreak: number,
  heartState: string,
  heartHealthScore: number,
  users: [userId1, userId2]  // Max 2 users
}
```

**rooms/{roomId}/users/{userId}**
```javascript
{
  displayName: string,
  isRunning: boolean,
  startTimestamp: number | null,
  accumulatedSeconds: number,
  todayStudySeconds: number,
  lastActiveDate: Timestamp,
  joinedAt: Timestamp
}
```

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

1. Clone the repository
2. Install dependencies: `npm install` or `yarn install`
3. Set up Firebase project (see SETUP.md)
4. Configure environment variables in `.env.local`
5. Run development server: `npm run dev` or `yarn dev`
6. Deploy to Vercel: `vercel deploy`

## Usage

1. **Create/Join Room**: Enter your display name and create a new room or join an existing one
2. **Share Room ID**: Copy the room ID and share it with your study partner
3. **Start Studying**: Use the timer controls to track your study sessions
4. **Watch Your Heart Grow**: Study consistently to level up your shared heart
5. **Maintain Streak**: Study daily to keep your streak alive and prevent heart decay

## Security

- Anonymous authentication via Firebase Auth
- Firestore security rules enforce:
  - Only room members can read/write room data
  - Maximum 2 users per room
  - Users can only modify their own user documents

## Contributing

This project was built as a production-ready study accountability app. Feel free to fork and customize for your needs!

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ for productive study sessions
