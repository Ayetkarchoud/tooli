# tooli API contract

Hi! This is everything the React app expects from the Express + MongoDB backend.
The frontend already works with fake data that has exactly these shapes
(`client/src/services/*.js`), so if your routes return what's below, we just swap the fake calls
for real ones and everything should work.

If something here is awkward to build, tell me and we'll change the contract together
(and update this file) rather than working around it.

## Basics

- **Base URL**: every route starts with `/api`. In development the frontend runs on
  `http://localhost:5173` and Vite forwards `/api/*` to **`http://localhost:5000`**, so run Express on port 5000.
  No CORS setup is needed in development.
- **Format**: JSON in, JSON out (`Content-Type: application/json`). Dates are ISO 8601 strings in UTC
  (`"2026-09-27T14:05:00.000Z"`). Prices are numbers in Tunisian dinars (TND).
- **IDs**: strings. MongoDB `_id` is fine, but please send it as `id` (a slug like `"algebra-basics"` also works).
- **Auth**: a session cookie (see [Auth](#auth)). Every route except signup and login needs it.
  The frontend sends it automatically (`credentials: 'include'`).
- **Errors**: always this shape, with a sensible status code. `message` is shown to the user, so keep it friendly.

  ```json
  { "error": { "message": "This time is no longer free. Please pick another one.", "code": "SLOT_TAKEN" } }
  ```

  | Status | When |
  |---|---|
  | 400 | Invalid input (missing field, wrong type) |
  | 401 | Not logged in / session expired |
  | 403 | Logged in but not allowed (e.g. VIP-only) |
  | 404 | The thing doesn't exist (unknown id) |
  | 409 | Conflict (email already used, slot already booked) |
  | 500 | Something broke on the server |

- **Empty success**: `204 No Content` with no body.

## Endpoints at a glance

| Method | Path | What |
|---|---|---|
| POST | `/api/auth/signup` | Create an account and log in |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Who is logged in |
| GET | `/api/users/me/profile` | Profile details |
| PUT | `/api/users/me/profile` | Update profile details |
| GET | `/api/users/me/settings/notifications` | Notification preferences |
| PUT | `/api/users/me/settings/notifications` | Update notification preferences |
| GET | `/api/courses` | Course catalogue (filters) |
| GET | `/api/courses/continue` | Courses the user has started |
| GET | `/api/courses/:courseId` | One course with its lessons |
| PUT | `/api/courses/:courseId/lessons/:lessonId` | Mark a lesson done / not done |
| GET | `/api/professors` | Professor list (filters) |
| GET | `/api/professors/top` | Best rated professors |
| GET | `/api/professors/:profId` | One professor |
| POST | `/api/professors/:profId/bookings` | Book a class |
| GET | `/api/tutor/chats` | The user's tutor chats |
| GET | `/api/tutor/chats/:chatId` | One chat with its messages |
| POST | `/api/tutor/messages` | Ask the AI tutor a question |
| GET | `/api/tips` | Study tips |
| GET | `/api/notifications` | The user's notifications |
| GET | `/api/notifications/unread-count` | Number of unread notifications |
| POST | `/api/notifications/:id/read` | Mark one as read |
| POST | `/api/notifications/read-all` | Mark all as read |
| GET | `/api/vip/plans` | VIP plans |
| GET | `/api/vip/status` | The user's VIP subscription |
| POST | `/api/vip/subscribe` | Subscribe to a plan |
| GET | `/api/search` | Search courses, professors and tips |

---

## Auth

Use an **httpOnly cookie** holding a session id or a JWT (for example `tooli_session`,
`HttpOnly; SameSite=Lax; Path=/`, plus `Secure` in production). Hash passwords with bcrypt and
**never** send the password (or its hash) back.

The **user** object used everywhere:

```json
{ "id": "u_8f2c", "firstName": "Ayet", "lastName": "Karchoud", "email": "ayet@example.com" }
```

### POST `/api/auth/signup`

Creates the account and logs the user in (sets the cookie).

Request:

```json
{ "firstName": "Ayet", "lastName": "Karchoud", "email": "ayet@example.com", "password": "at-least-8-chars" }
```

Response `201`: `{ "user": { …user } }`

Errors: `400` missing field or password shorter than 8 characters, `409` email already used
(`"An account with this email already exists. Try logging in."`).

### POST `/api/auth/login`

Request: `{ "email": "ayet@example.com", "password": "…" }`

Response `200`: `{ "user": { …user } }` and sets the cookie.

Errors: `401` with one message for both wrong email and wrong password
(`"Email or password is incorrect."`), so we don't reveal which emails exist.

### POST `/api/auth/logout`

Clears the cookie. Response `204`.

### GET `/api/auth/me`

Called when the app starts, to restore the session.

Response `200`: `{ "user": { …user } }`, or `401` when not logged in (the app then shows the public pages).

---

## User profile and settings

### GET `/api/users/me/profile`

Extra profile details (name and email come from `/auth/me`).

```json
{
  "level": "Bac",
  "section": "Mathematics",
  "school": "Lycée pilote de Monastir",
  "city": "Monastir",
  "bio": ""
}
```

`level` is one of `"Bac"`, `"Prépa"`, `"University"`, `"All levels"`.

### PUT `/api/users/me/profile`

Request: only the fields that changed, e.g. `{ "city": "Sousse" }`.
Response `200`: the full profile (same shape as GET).

### GET `/api/users/me/settings/notifications`

```json
{ "courseReminders": true, "bookingUpdates": true, "dailyTip": true, "productNews": false }
```

### PUT `/api/users/me/settings/notifications`

Request: the changed flags, e.g. `{ "dailyTip": false }`. Response `200`: all flags (same shape as GET).

> Theme and colour palette are stored in the browser for now. Later we may add
> `PUT /api/users/me/settings/appearance` with `{ "theme": "dark", "palette": "green" }`.

---

## Courses

Courses come from 4 partner platforms. The **course** object:

```json
{
  "id": "algebra-basics",
  "platform": { "id": "learnsphere", "name": "LearnSphere", "cover": "blue" },
  "title": "Algebra basics: equations and inequalities",
  "subject": "Mathematics",
  "level": "Bac",
  "rating": 4.8,
  "reviews": 412,
  "durationMinutes": 106,
  "lessons": [
    { "id": "algebra-basics-l1", "title": "Linear equations", "minutes": 18, "done": true },
    { "id": "algebra-basics-l2", "title": "Systems of two equations", "minutes": 22, "done": false }
  ],
  "progress": 60
}
```

- `platform.cover` is a palette name (`blue`, `yellow`, `green`, `red`, `violet`): the frontend uses it as the card colour.
- `lessons[].done` and `progress` are **for the logged-in user**. `progress` is 0–100
  (percentage of lessons done, rounded), or `null` if the user hasn't started the course.
- `durationMinutes` = sum of the lesson minutes.

### GET `/api/courses`

Query parameters (all optional, combine freely):

| Param | Example | Meaning |
|---|---|---|
| `subject` | `Mathematics` | Exact subject |
| `level` | `Bac` | Exact level |
| `q` | `prepa` | Text search in title, subject and platform name (ignore case and accents: `prepa` finds `Prépa`) |

Response `200`: an array of courses (`[]` if nothing matches).

### GET `/api/courses/continue`

Courses the user has started but not finished (`0 < progress < 100`), highest progress first.
Response `200`: array of courses.

### GET `/api/courses/:courseId`

Response `200`: one course. `404` if it doesn't exist.

### PUT `/api/courses/:courseId/lessons/:lessonId`

Request: `{ "done": true }`

Response `200`: the updated course (with the new `progress`). `404` if the course or lesson doesn't exist.

---

## Professors

The **professor** object:

```json
{
  "id": "amel-exemple",
  "title": "Prof.",
  "firstName": "Amel",
  "lastName": "Exemple",
  "subject": "Mathematics",
  "levels": ["Bac", "Prépa"],
  "city": "Tunis",
  "languages": ["Arabic", "French"],
  "bio": "Maths teacher for 15 years in a pilot high school…",
  "rating": 4.9,
  "reviews": 128,
  "pricePerHour": 45,
  "slots": [
    { "day": "mon", "times": ["17:00", "18:30"] },
    { "day": "sat", "times": ["09:00", "10:30", "14:00"] }
  ]
}
```

- `title`: `"Prof."` or `"Dr."`. `pricePerHour` in TND.
- `slots`: the free times **for the current week**. `day` is `mon` … `sun`, `time` is `HH:MM` in Tunisia time.
  Booked times must not appear here.

### GET `/api/professors`

Query parameters (optional): `subject`, `city` (exact), `q` (text search in name, subject and city,
ignoring case and accents). Response `200`: array of professors.

### GET `/api/professors/top?limit=3`

Best rated first (ties: more reviews first). `limit` defaults to 3. Response `200`: array of professors.

### GET `/api/professors/:profId`

Response `200`: one professor. `404` if unknown.

### POST `/api/professors/:profId/bookings`

Request: `{ "day": "sat", "time": "10:30" }`

Response `201`:

```json
{ "id": "bk_61a0", "profId": "amel-exemple", "day": "sat", "time": "10:30", "price": 45, "status": "confirmed" }
```

Errors: `404` unknown professor, `409` if the slot isn't free anymore
(`"This time is no longer free. Please pick another one."`). Please also create a notification of type `booking`.
(Payment isn't part of this yet.)

---

## AI tutor

A **message**: `{ "id": "m2", "role": "user" | "tutor", "text": "…", "createdAt": "…" }`.
`text` is plain text; line breaks (`\n`) and numbered steps (`1.`, `2.`) are fine.

### GET `/api/tutor/chats`

The user's chats, newest first, **without** their messages:

```json
[
  {
    "id": "photosynthesis",
    "title": "Photosynthesis in simple words",
    "updatedAt": "2026-09-27T11:02:00.000Z",
    "lastMessage": "Sure! Think of a leaf as a tiny kitchen…"
  }
]
```

### GET `/api/tutor/chats/:chatId`

```json
{
  "id": "photosynthesis",
  "title": "Photosynthesis in simple words",
  "updatedAt": "2026-09-27T11:02:00.000Z",
  "messages": [
    { "id": "m1", "role": "user", "text": "Can you explain photosynthesis simply?", "createdAt": "2026-09-27T11:01:40.000Z" },
    { "id": "m2", "role": "tutor", "text": "Sure! Think of a leaf as a tiny kitchen.\n1. …", "createdAt": "2026-09-27T11:02:00.000Z" }
  ]
}
```

`404` if the chat doesn't exist **or belongs to another user**.

### POST `/api/tutor/messages`

Ask a question. Without `chatId`, create a new chat titled after the question (max ~48 characters).

Request: `{ "chatId": "photosynthesis", "question": "And what about at night?" }` (`chatId` optional)

Response `200`:

```json
{
  "chatId": "photosynthesis",
  "question": { "id": "m3", "role": "user", "text": "And what about at night?", "createdAt": "…" },
  "answer": { "id": "m4", "role": "tutor", "text": "Good question! At night…", "createdAt": "…" }
}
```

Errors: `400` empty question, `404` unknown `chatId`. The answer can take a few seconds (AI call);
the frontend shows a "thinking" state meanwhile.

### GET `/api/tips?q=`

Short study tips (dashboard "Tip of the day", search). `q` optional (text search).

```json
[{ "id": "tip-1", "text": "Study in 25-minute blocks with 5-minute breaks. Your focus stays sharp much longer." }]
```

---

## Notifications

The **notification** object:

```json
{
  "id": "n1",
  "type": "booking",
  "read": false,
  "createdAt": "2026-09-27T13:40:00.000Z",
  "title": "Class confirmed",
  "body": "Your session with Prof. Amel Exemple is booked for Saturday at 10:30.",
  "link": "/dashboard/professors/amel-exemple"
}
```

`type` is one of `course`, `booking`, `tip`, `system`. `link` is a frontend path to open on click, or `null`.

| Method | Path | Response |
|---|---|---|
| GET | `/api/notifications` | `200` array, newest first |
| GET | `/api/notifications/unread-count` | `200` `{ "count": 3 }` |
| POST | `/api/notifications/:id/read` | `204` (`404` if unknown) |
| POST | `/api/notifications/read-all` | `204` |

The unread count is fetched on every page change, so keep it cheap (an index on `userId` + `read`).

---

## VIP

### GET `/api/vip/plans`

```json
[
  {
    "id": "plus",
    "name": "Plus",
    "pricePerMonth": 59,
    "highlighted": true,
    "features": ["Everything in Essential", "2 private hours with a VIP professor", "Personal bac or prépa revision plan"]
  }
]
```

`highlighted`: the plan we recommend (shown bigger). Prices in TND per month.

### GET `/api/vip/status`

`{ "active": false, "planId": null, "renewsOn": null }`, or when subscribed
`{ "active": true, "planId": "plus", "renewsOn": "2026-10-27" }` (`renewsOn` is a date, no time).

### POST `/api/vip/subscribe`

Request: `{ "planId": "plus" }`. Response `200`: the new status (same shape as GET `/vip/status`).
Errors: `404` unknown plan. Payment will be added later (this will probably return a checkout step first).

---

## Search

### GET `/api/search?q=prepa`

Searches courses, professors and tips at once (same matching rules as their own `q` filters).
An empty `q` returns three empty lists.

```json
{
  "courses": [{ …course }],
  "professors": [{ …professor }],
  "tips": [{ "id": "tip-3", "text": "…" }]
}
```

---

## Suggested MongoDB collections

Just a starting point, organise it however you prefer:

| Collection | Holds |
|---|---|
| `users` | name, email, password hash, profile fields, notification settings |
| `courses` | course info, platform (embedded), lessons (embedded) |
| `progress` | `{ userId, courseId, doneLessonIds: [] }`: used to compute `done` and `progress` |
| `professors` | profile, price, weekly availability |
| `bookings` | `{ userId, profId, day, time, price, status, createdAt }` |
| `chats` | `{ userId, title, messages: [], updatedAt }` |
| `tips` | `{ text }` |
| `notifications` | `{ userId, type, title, body, link, read, createdAt }` |
| `subscriptions` | `{ userId, planId, renewsOn }` |

## Where the frontend calls each endpoint

Every function in `client/src/services/` has a `TODO(backend)` comment with its endpoint, and the
auth calls are in `client/src/auth/AuthProvider.jsx`. When a route is ready, tell me which one and
I'll switch that function from fake data to the real call.
