# StudyTrack

A simple Expo + Node.js + MongoDB study tracking app.

## Features

- Simple register and login
- JWT authentication
- Persistent login with AsyncStorage
- Dashboard with daily, weekly and monthly study time
- Study timer
- Timer survives app close/reopen by storing the start timestamp
- Pause, resume, stop and reset
- Manual study entry
- Subjects: add, edit and delete
- Topic and notes for every study session
- Study history
- Day/week/month analytics
- Subject-wise analytics
- Daily goal
- Current and best streak
- Calendar-style date history
- Weekly report
- Goal vs actual
- Achievements
- Light/dark mode
- Profile and logout

## Run backend

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Set these values in `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/studytrack
JWT_SECRET=change_this_to_a_long_random_secret
```

## Run Expo app

```bash
cd client
npm install
npx expo start -c
```

For a physical Android phone, keep the phone and computer on the same Wi-Fi and set `API_URL` in `client/src/config.js` to your computer's IPv4 address.

Example:

```js
export const API_URL = "http://192.168.0.241:5000/api";
```

The app uses timestamp-based timer persistence. If the app is closed or removed from recent apps, reopening it calculates the elapsed time from the saved start timestamp. This does not depend on a JavaScript interval continuing while the app is killed.
