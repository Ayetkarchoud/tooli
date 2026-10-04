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
- **Format**: JSON in, JSON out (`Content-Type: application/json`). Prices are numbers in Tunisian dinars (TND).
- **Dates and times**: always full ISO 8601 date-times **with a time zone**, never a bare date + `HH:MM`.
  - Timestamps (`createdAt`, `updatedAt`…): UTC is fine, e.g. `"2026-09-27T14:05:00.000Z"`.
  - **Professor availability and bookings are in Tunis time** (`Africa/Tunis`, UTC+01:00, no daylight saving),
    e.g. `"2026-10-05T17:00:00+01:00"`. The frontend converts them and shows them in the **student's local
    time** (the same in Tunisia; correct for students abroad too).
  - Calendar-only dates (VIP `renewsOn`) are `YYYY-MM-DD`.
- **Query parameters**: optional filters go in the query string (`GET /api/courses?subject=Physics&q=derivatives`).
  The frontend leaves out empty ones (it never sends `subject=` or `q=undefined`), so treat a missing param as "no filter".
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
| GET | `/api/courses` | Course catalogue (filters + sort) |
| GET | `/api/courses/filters` | Subjects, levels and platforms for the filters |
| GET | `/api/courses/continue` | Courses the user has started |
| GET | `/api/courses/:courseId` | One course with its lessons |
| PUT | `/api/courses/:courseId/lessons/:lessonId` | Mark a lesson done / not done |
| GET | `/api/professors` | Professor list (filters) |
| GET | `/api/professors/filters` | Subjects, cities and languages for the filters |
| GET | `/api/professors/top` | Best rated professors |
| GET | `/api/professors/:profId` | One professor |
| GET | `/api/professors/:profId/availability` | Free times for the next 7 days |
| GET | `/api/professors/:profId/reviews` | Student reviews |
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
  "platform": { "id": "learnsphere", "name": "LearnSphere", "cover": "blue", "url": "https://learnsphere.example" },
  "title": "Algebra basics: equations and inequalities",
  "subject": "Mathematics",
  "level": "Bac",
  "rating": 4.8,
  "reviews": 412,
  "publishedAt": "2026-05-30T09:00:00.000Z",
  "description": "Master the equations and inequalities that come up in every bac maths exam…",
  "outcomes": ["Solve linear equations and systems with confidence", "Work with inequalities and intervals"],
  "durationMinutes": 106,
  "lessons": [
    { "id": "algebra-basics-l1", "title": "Linear equations", "minutes": 18, "done": true },
    { "id": "algebra-basics-l2", "title": "Systems of two equations", "minutes": 22, "done": false }
  ],
  "progress": 60
}
```

- `platform.cover` is a palette name (`blue`, `yellow`, `green`, `red`, `violet`): the frontend uses it as the card colour.
  `platform.url` is where "Start / Resume" will send the student (the course page on the partner's site).
- `outcomes`: 3–5 short "What you'll learn" bullets. `publishedAt` is used for the "Newest" sort.
- `lessons[].done` and `progress` are **for the logged-in user**. `progress` is 0–100
  (percentage of lessons done, rounded), or `null` if the user hasn't started the course.
- `durationMinutes` = sum of the lesson minutes.

### GET `/api/courses`

Query parameters (all optional, combine freely):

| Param | Example | Meaning |
|---|---|---|
| `subject` | `Mathematics` | Exact subject |
| `level` | `Bac` | Exact level |
| `platform` | `codenest` | Platform id |
| `q` | `prepa` | Text search in title, subject and platform name (ignore case and accents: `prepa` finds `Prépa`) |
| `sort` | `newest` | `popular` (most reviews first, the default), `newest` (`publishedAt`), `shortest` (`durationMinutes`) |

Response `200`: an array of courses (`[]` if nothing matches).

### GET `/api/courses/filters`

The values for the filter chips, in display order:

```json
{
  "subjects": ["Biology", "Chemistry", "Computer science", "English", "French", "Mathematics", "Physics"],
  "levels": ["Bac", "Prépa", "University", "All levels"],
  "platforms": [{ "id": "learnsphere", "name": "LearnSphere" }, { "id": "codenest", "name": "CodeNest" }]
}
```

> Express tip: register `/courses/filters` and `/courses/continue` **before** `/courses/:courseId`,
> otherwise Express treats `filters` as a course id. Same for `/professors/top` and `/professors/filters`.

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
  "nextSlot": "2026-09-28T17:00:00+01:00"
}
```

- `title`: `"Prof."` or `"Dr."`. `pricePerHour` in TND. All professors on tooli are VIP.
- `nextSlot`: the start of the first free 1-hour class in the next 7 days (ISO date-time, Tunis time),
  or `null` when fully booked.
- How you store the weekly schedule is up to you; the frontend only needs `nextSlot` and the
  availability endpoint below.

### GET `/api/professors`

Query parameters (all optional, combine freely):

| Param | Example | Meaning |
|---|---|---|
| `subject` | `Physics` | Exact subject |
| `city` | `Monastir` | Exact city |
| `language` | `English` | Teaches in this language |
| `price` | `under-40` | `under-40` (< 40 TND), `40-50` (40 to 50), `over-50` (> 50) |
| `available` | `1` | Only professors with at least one free time in the next 7 days |
| `q` | `sousse` | Text search in name, subject and city (ignore case and accents) |

Response `200`: array of professors, best rated first.

### GET `/api/professors/filters`

```json
{
  "subjects": ["Biology", "Chemistry", "Computer science", "English", "French", "Mathematics", "Physics"],
  "cities": ["Bizerte", "Monastir", "Nabeul", "Sfax", "Sousse", "Tunis"],
  "languages": ["Arabic", "English", "French"]
}
```

### GET `/api/professors/:profId/availability`

| Param | Example | Meaning |
|---|---|---|
| `days` | `7` | How many days ahead, starting today (Tunis date). Default 7 |
| `durationMinutes` | `90` | Length of the class the student wants (`60`, `90` or `120`). Default 60 |

The start times when a class of `durationMinutes` can begin, in the next `days` days, sorted:

```json
{
  "timeZone": "Africa/Tunis",
  "slots": ["2026-09-28T17:00:00+01:00", "2026-09-28T18:30:00+01:00", "2026-09-30T16:00:00+01:00"]
}
```

Leave out:

- times already past;
- **any start whose class would overlap an existing booking** of this professor, for the requested length
  (see [the overlap rule](#the-overlap-rule)). So the list can change with `durationMinutes`.

The frontend groups the slots by the student's local day and shows them in local time. `404` if the
professor doesn't exist.

### GET `/api/professors/:profId/reviews`

Newest first:

```json
[{ "id": "r_1", "author": "Yasmine B.", "rating": 5, "text": "Super clear and patient…", "createdAt": "2026-09-24T10:00:00.000Z" }]
```

Show only the first name + initial of the author (privacy).

### GET `/api/professors/top?limit=3`

Best rated first (ties: more reviews first). `limit` defaults to 3. Response `200`: array of professors.

### GET `/api/professors/:profId`

Response `200`: one professor. `404` if unknown.

### POST `/api/professors/:profId/bookings`

Request: `{ "startsAt": "2026-10-03T10:30:00+01:00", "durationMinutes": 90 }`
(`startsAt` is one of the availability `slots`; `durationMinutes` is `60`, `90` or `120`.)

Response `201`:

```json
{
  "id": "bk_61a0",
  "profId": "amel-exemple",
  "startsAt": "2026-10-03T10:30:00+01:00",
  "endsAt": "2026-10-03T12:00:00+01:00",
  "durationMinutes": 90,
  "price": 67.5,
  "status": "confirmed"
}
```

`price` = `pricePerHour × durationMinutes / 60`, rounded to 0.1 TND. Compute it on the server; don't trust a
price sent by the browser.

#### The overlap rule

A booking occupies `[startsAt, endsAt)`. Two classes overlap when **each one starts before the other ends**
(`a.startsAt < b.endsAt && b.startsAt < a.endsAt`). So a 2 h booking at 09:00 blocks a class at 10:30, and a
1 h 30 class at 08:00 is blocked by a booking at 09:00. Touching is fine (09:00–10:00 then 10:00–11:00).

**Reject an overlapping booking with `409`**, even if the time looked free when the page loaded (two students
can book at the same moment, so check inside a transaction or with a unique/locking strategy):
`"This class would overlap another booking. Please pick another time or a shorter session."`

Errors: `400` invalid `startsAt`/length or a time that isn't one of the professor's slots, `404` unknown
professor, `409` overlap (above). Please also create a notification of type `booking` (`"Class booked"`, with a
link to the professor). Payment isn't part of this yet: the student pays the professor after the class.

---

## AI tutor

A **message**: `{ "id": "m2", "role": "user" | "tutor", "text": "…", "createdAt": "…" }`.
Tutor answers are plain text with a little formatting the frontend understands. Please ask the AI
to answer in this style (nothing fancier, like tables or headings):

| Write | Shows as |
|---|---|
| a line break (`\n`) | a new line; a blank line starts a new paragraph |
| `1. `, `2. ` at the start of lines | numbered steps |
| `- ` at the start of lines | a bullet list |
| `**words**` | bold |
| `` `x = 4` `` | inline code |
| lines between two ```` ``` ```` lines (optionally ```` ```python ````) | a code block |

Anything else (HTML included) is shown as plain text, never interpreted.

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

Errors: `400` empty question or longer than **1000 characters**, `404` unknown `chatId`. The answer can take a few seconds (AI call);
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
| `bookings` | `{ userId, profId, startsAt, endsAt, durationMinutes, price, status, createdAt }` (dates as real `Date`s; index `profId` + `startsAt`) |
| `reviews` | `{ profId, userId, rating, text, createdAt }` |
| `chats` | `{ userId, title, messages: [], updatedAt }` |
| `tips` | `{ text }` |
| `notifications` | `{ userId, type, title, body, link, read, createdAt }` |
| `subscriptions` | `{ userId, planId, renewsOn }` |

## Where the frontend calls each endpoint

Every function in `client/src/services/` has a `TODO(backend)` comment with its endpoint, and the
auth calls are in `client/src/auth/AuthProvider.jsx`. When a route is ready, tell me which one and
I'll switch that function from fake data to the real call.
