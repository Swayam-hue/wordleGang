# Wordle League

A private, screenshot-based Wordle competition platform where a group of friends can submit their daily Wordle result screenshots, have their results automatically extracted and validated, calculate scores according to configurable rules, and maintain daily and cumulative leaderboards.

The primary goal is:

> **Make submitting a daily Wordle result almost effortless while keeping the scoring system accurate, transparent, and difficult to manipulate.**

---

# 1. Project Goals

The application should allow a group of friends to:

1. Create/join a private Wordle group.
2. Register themselves once.
3. Upload their daily Wordle screenshot.
4. Automatically detect:

   * Wordle puzzle number
   * Number of attempts
   * Whether the puzzle was solved
   * Wordle result grid when possible
5. Validate the extracted result.
6. Calculate a score according to configurable scoring rules.
7. Store the submission permanently.
8. Prevent duplicate submissions for the same player and puzzle.
9. View:

   * Today's leaderboard
   * Historical leaderboard
   * Overall leaderboard
   * Individual player history
10. Eventually support configurable scoring rules without changing the screenshot-processing system.

---

# 2. Core Product Principle

The application should prioritize:

### Simplicity

A friend should be able to:

```text
Open website
    ↓
Upload screenshot
    ↓
Confirm detected result
    ↓
Done
```

### Accuracy

The system should not blindly trust OCR.

The result should ideally be verified using multiple signals:

```text
Screenshot
    ↓
OCR
    +
Grid / image analysis
    ↓
Validation
    ↓
Confidence
    ↓
Accept / Ask user to retry
```

### Maintainability

The following concerns must remain separate:

```text
Screenshot processing
        ↓
Result extraction
        ↓
Result validation
        ↓
Score calculation
        ↓
Database storage
        ↓
Leaderboard
```

Do not tightly couple these components.

---

# 3. Technology Stack

## Frontend

* React
* Vite
* JavaScript or TypeScript
* React Router
* Tailwind CSS
* Axios or native `fetch`

Preferred:

```text
React
TypeScript
Vite
Tailwind CSS
```

---

## Backend

* Python
* FastAPI
* Pydantic
* Uvicorn

Screenshot processing:

* OpenCV
* OCR library such as PaddleOCR or Tesseract
* Pillow

The OCR implementation should be isolated behind a service/interface so it can be replaced later.

---

## Database

Supabase PostgreSQL.

Supabase should be used for:

* PostgreSQL database
* Authentication if authentication is added
* Storage if screenshot storage is required
* Row Level Security
* Database access

Do not put the Supabase service-role key in the React frontend.

---

# 4. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │      React App      │
                         │                     │
                         │ Upload Screenshot   │
                         │ Leaderboard         │
                         │ Player History      │
                         └──────────┬──────────┘
                                    │
                                  HTTP
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     FastAPI API     │
                         │                     │
                         │ Players             │
                         │ Submissions         │
                         │ Screenshot Parser   │
                         │ Validation          │
                         │ Scoring             │
                         └──────────┬──────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                ┌────────────────┐    ┌─────────────────┐
                │ Screenshot     │    │ Supabase        │
                │ Processing     │    │ PostgreSQL      │
                │                │    │                 │
                │ OCR            │    │ Players         │
                │ OpenCV         │    │ Submissions     │
                │ Validation     │    │ Groups          │
                └────────────────┘    │ Scores          │
                                      └─────────────────┘
```

---

# 5. Recommended Repository Structure

Create the project with this structure:

```text
wordle-league/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   ├── players.py
│   │   │   ├── submissions.py
│   │   │   ├── leaderboard.py
│   │   │   └── health.py
│   │   │
│   │   ├── services/
│   │   │   ├── screenshot_parser.py
│   │   │   ├── ocr_service.py
│   │   │   ├── grid_analyzer.py
│   │   │   ├── validator.py
│   │   │   └── scoring.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── database/
│   │   │   └── supabase.py
│   │   ├── core/
│   │   │   └── config.py
│   │   └── utils/
│   │
│   ├── tests/
│   │   ├── test_health.py
│   │   ├── test_parser.py
│   │   ├── test_scoring.py
│   │   └── test_submissions.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── database/
│   ├── migrations/
│   └── seed.sql
│
├── test_images/
│   ├── solved_1.png
│   ├── solved_2.png
│   ├── solved_3.png
│   └── failed.png
│
├── README.md
└── .gitignore
```

Do not create unnecessary folders until they are needed.

---

# 6. Development Philosophy

The project MUST be developed level by level.

Do NOT implement all functionality simultaneously.

Each level must:

1. Be runnable.
2. Be testable.
3. Have a clear definition of done.
4. Not break previously completed functionality.
5. Be committed to Git before moving forward.

The order is:

```text
LEVEL 1
Project skeleton
        ↓
LEVEL 2
Basic React + FastAPI connection
        ↓
LEVEL 3
Supabase database
        ↓
LEVEL 4
Player system
        ↓
LEVEL 5
Manual Wordle result submission
        ↓
LEVEL 6
Scoring engine
        ↓
LEVEL 7
Screenshot upload
        ↓
LEVEL 8
OCR extraction
        ↓
LEVEL 9
Screenshot validation
        ↓
LEVEL 10
Automatic submission
        ↓
LEVEL 11
Leaderboard
        ↓
LEVEL 12
Player history
        ↓
LEVEL 13
Authentication / private groups
        ↓
LEVEL 14
Security + abuse prevention
        ↓
LEVEL 15
UI/UX refinement
        ↓
LEVEL 16
Testing + deployment
```

**Do not skip ahead.**

---

# LEVEL 1 — Project Skeleton

## Objective

Create the basic React and FastAPI applications.

Nothing related to OCR, Supabase, authentication, or scoring should be implemented yet.

---

## Frontend

Create a Vite React application.

Required:

```text
React
TypeScript
Vite
Tailwind CSS
```

Create a simple page:

```text
Wordle League

Backend status:
Checking...
```

---

## Backend

Create FastAPI application.

Endpoint:

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

---

## Definition of Done

Running:

```bash
npm run dev
```

starts the frontend.

Running:

```bash
uvicorn app.main:app --reload
```

starts the backend.

Frontend can successfully communicate with:

```text
GET /health
```

and display:

```text
Backend status: Online
```

---

# LEVEL 2 — Frontend / Backend Integration

## Objective

Establish a clean API communication layer.

Create:

```text
frontend/src/services/api.ts
```

All backend requests should go through this service.

Do NOT scatter API URLs throughout React components.

Example:

```text
api.ts
    ↓
healthService()
    ↓
React component
```

Configure environment variables:

```text
VITE_API_URL=http://localhost:8000
```

Backend:

```text
CORS
```

must allow the frontend development origin.

---

## Definition of Done

The React application displays the backend health status through an API call.

---

# LEVEL 3 — Supabase Database

## Objective

Connect FastAPI to Supabase PostgreSQL.

Create environment variables:

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to the frontend.

---

# 7. Database Design

The initial database should contain the following tables.

## groups

```text
id
name
invite_code
created_at
```

---

## players

```text
id
group_id
name
created_at
```

---

## submissions

```text
id
player_id
group_id
puzzle_number
puzzle_date
attempts
solved
raw_result
score
confidence
screenshot_url
created_at
```

Add a unique constraint:

```text
(player_id, puzzle_number)
```

This prevents a player from submitting the same Wordle twice.

---

## scoring_rules

Initially this table may not be required.

The scoring system should first exist as backend code.

Later it can become configurable.

---

# LEVEL 4 — Player System

## Objective

Allow players to create/select their identity.

For the MVP, avoid complicated authentication.

A simple player registration flow is sufficient.

Example:

```text
Enter your name

[ Swayam Ghosh ]

[ Continue ]
```

The backend creates:

```text
player
```

and returns a player ID.

Store the player identity safely on the frontend.

Do not trust a user-supplied player ID for authorization once authentication is introduced.

---

## Required API

```http
POST /players
```

Request:

```json
{
  "name": "Swayam Ghosh",
  "group_id": "..."
}
```

Response:

```json
{
  "id": "...",
  "name": "Swayam Ghosh"
}
```

---

# LEVEL 5 — Manual Wordle Submission

Before implementing OCR, implement the complete submission pipeline manually.

This is extremely important.

The frontend should temporarily allow:

```text
Puzzle number
Attempts
Solved / Failed
```

Example:

```text
Puzzle Number
[ 1567 ]

Attempts
[ 3 ]

Solved
[x]

[ Submit ]
```

Backend:

```text
POST /submissions
```

Request:

```json
{
  "player_id": "...",
  "puzzle_number": 1567,
  "attempts": 3,
  "solved": true
}
```

The backend stores the submission.

---

# LEVEL 6 — Scoring Engine

## Objective

Create a completely independent scoring system.

Create:

```text
backend/app/services/scoring.py
```

Example interface:

```python
def calculate_score(
    attempts: int,
    solved: bool
) -> int:
    ...
```

Do NOT put scoring logic inside the API route.

Bad:

```python
@app.post("/submissions")
def submit(...):
    if attempts == 1:
        score = 10
```

Good:

```python
score = calculate_score(
    attempts=attempts,
    solved=solved
)
```

---

# 8. Initial Scoring Rules

The exact rules are intentionally left configurable.

Use a temporary default implementation:

```text
1 attempt → 10
2 attempts → 8
3 attempts → 6
4 attempts → 4
5 attempts → 2
6 attempts → 1
Failed     → 0
```

These are placeholders.

The final scoring rules will be defined later.

The rest of the system must not depend on these exact values.

---

# LEVEL 7 — Screenshot Upload

Now introduce screenshots.

The user should be able to upload:

```text
PNG
JPEG
WEBP
```

Frontend:

```text
┌───────────────────────────────┐
│                               │
│   Upload your Wordle result   │
│                               │
│     [ Choose Screenshot ]     │
│                               │
│       or drag & drop          │
│                               │
└───────────────────────────────┘
```

Backend endpoint:

```http
POST /submissions/preview
```

The preview endpoint should NOT save a submission.

It should only process the screenshot.

---

# LEVEL 8 — Screenshot Parser

## Objective

Extract Wordle information from the screenshot.

The parser should return a structured object.

Example:

```json
{
  "puzzle_number": 1567,
  "attempts": 3,
  "solved": true,
  "grid": [
    ["gray", "yellow", "gray", "green", "gray"],
    ["green", "green", "gray", "yellow", "gray"],
    ["green", "green", "green", "green", "green"]
  ],
  "confidence": 0.97
}
```

---

# 9. Screenshot Processing Pipeline

The parser should conceptually work like:

```text
Image
  ↓
Image preprocessing
  ↓
Wordle screenshot detection
  ↓
OCR
  ↓
Puzzle number extraction
  ↓
Attempt extraction
  ↓
Grid detection
  ↓
Grid color classification
  ↓
Validation
  ↓
Structured result
```

---

# 10. OCR

Use OCR primarily for text.

The OCR should attempt to detect:

```text
Wordle 1567
3/6
```

Potential OCR output:

```text
Wordle 1567 3/6
```

Extract:

```python
puzzle_number = 1567
attempts = 3
solved = True
```

For:

```text
X/6
```

set:

```python
solved = False
```

OCR should not be responsible for determining grid colors.

---

# LEVEL 9 — Grid Analysis

Use OpenCV/image processing to analyze the Wordle grid.

The system should detect:

```text
green
yellow
gray
```

rather than attempting to understand the letters themselves.

The goal is to determine:

```text
number of rows
number of tiles
tile colors
```

Example:

```text
[
    [GRAY, YELLOW, GRAY, GREEN, GRAY],
    [GREEN, GREEN, GRAY, YELLOW, GRAY],
    [GREEN, GREEN, GREEN, GREEN, GREEN]
]
```

---

# 11. Do Not Overcomplicate Grid Detection Initially

Wordle screenshots are highly structured.

Start with:

1. Detecting the grid region.
2. Detecting square tiles.
3. Sampling the center of each tile.
4. Classifying tile color.

Do not use a neural network unless conventional computer vision proves insufficient.

---

# LEVEL 10 — Result Validation

The system must not immediately trust OCR.

Create:

```text
validator.py
```

The validator compares:

```text
OCR result
+
Grid analysis
```

Example:

```text
OCR:

3/6

Grid:

3 rows
final row all green
```

Result:

```text
VALID
confidence = 0.98
```

---

# 12. Confidence System

Every parsed result should have a confidence value.

Example:

```text
0.98 → very confident
0.91 → confident
0.72 → uncertain
0.45 → invalid
```

The exact thresholds can be adjusted after testing.

Example:

```text
confidence >= 0.90
    ↓
automatic acceptance

0.70 - 0.89
    ↓
ask user to confirm

< 0.70
    ↓
reject and request another screenshot
```

---

# LEVEL 11 — Submission Preview

Now connect the screenshot parser to the frontend.

After uploading:

```text
Screenshot
      ↓
FastAPI
      ↓
Parser
      ↓
Validator
      ↓
React preview
```

Show:

```text
Detected Wordle

Puzzle: #1567
Attempts: 3
Result: Solved

Confidence: High

Calculated Score: 6

[ Submit Result ]
[ Upload Again ]
```

The user should explicitly confirm the result before the first automatic submission implementation.

---

# LEVEL 12 — Automatic Submission

After the user confirms:

```text
POST /submissions
```

The backend:

```text
validate player
        ↓
validate puzzle
        ↓
check duplicate
        ↓
calculate score
        ↓
store submission
```

Do not trust the score sent by React.

The backend must calculate the score itself.

---

# 13. Duplicate Protection

A player cannot submit the same puzzle twice.

Database constraint:

```text
UNIQUE(player_id, puzzle_number)
```

The backend should also check before insertion to provide a friendly response.

Example:

```json
{
  "error": "already_submitted",
  "message": "You have already submitted this puzzle."
}
```

---

# LEVEL 13 — Leaderboard

Create:

```text
GET /leaderboard/today
```

Return:

```json
[
  {
    "rank": 1,
    "player": "Rahul",
    "score": 10
  },
  {
    "rank": 2,
    "player": "Swayam",
    "score": 8
  }
]
```

---

# 14. Leaderboard Types

The application should eventually support:

## Today's leaderboard

Only today's puzzle.

```text
Player       Score
-------------------
Rahul          10
Swayam          8
Aman            6
```

## Overall leaderboard

Total accumulated score.

```text
Player       Total
-------------------
Swayam        142
Rahul         138
Aman          126
```

## Historical leaderboard

Allow selecting a date.

```text
October 1, 2026
```

and show that day's results.

---

# LEVEL 14 — Player History

Endpoint:

```http
GET /players/{player_id}/history
```

Example:

```text
Swayam

Puzzle    Attempts    Score
---------------------------
1567          3         6
1566          4         4
1565          2         8
1564          X         0
```

Add:

```text
Total Score
Games Played
Average Attempts
Wins
Failures
Current Streak
Best Streak
```

Only add metrics that have clear definitions.

---

# LEVEL 15 — Groups

The application should support private groups.

Example:

```text
Create Group

Name:
[ SMIT Wordle Gang ]

[ Create ]
```

Generate:

```text
Invite Code:
ABC7X9
```

Friends can join using:

```text
Join Group

[ ABC7X9 ]

[ Join ]
```

Every player and submission belongs to a group.

This ensures that one group's leaderboard does not mix with another group's data.

---

# LEVEL 16 — Authentication

Authentication should be added only after the core product works.

Preferred options:

```text
Supabase Auth
```

Potential login:

```text
Google
Email OTP
Magic Link
```

For a private friend group, Supabase Auth + magic link is a good simple option.

Authentication should replace the temporary player identity system.

---

# 17. Security Requirements

Never trust frontend-provided:

```text
player_id
group_id
score
puzzle_date
```

without validating them server-side.

The backend should determine:

```text
authenticated user
→ player
→ group
```

The score must always be calculated on the backend.

---

# 18. Screenshot Storage

Screenshots do not necessarily need to be stored permanently.

Default behavior:

```text
Upload
  ↓
Process
  ↓
Extract
  ↓
Validate
  ↓
Delete temporary image
```

If screenshots are needed for auditing:

Use:

```text
Supabase Storage
```

and store:

```text
screenshot_url
```

in the submissions table.

Do not expose private screenshots publicly.

---

# LEVEL 17 — Admin / Moderation

Eventually provide an admin interface.

Admin should be able to:

```text
View submissions
View screenshots
Correct an incorrectly parsed result
Delete fraudulent submission
Modify score
View parser confidence
```

Any manual score correction should record:

```text
original_score
new_score
reason
modified_by
modified_at
```

This creates an audit trail.

---

# LEVEL 18 — Advanced Scoring System

Once the basic system works, make scoring configurable.

Potential rules:

```text
Attempts
Streak
Completion
Time
Hard Mode
Special bonuses
Special penalties
```

Example conceptual interface:

```python
class ScoringContext:
    attempts: int
    solved: bool
    streak: int
    hard_mode: bool
```

Then:

```python
score = scoring_engine.calculate(context)
```

Do not couple the scoring engine to React or OCR.

---

# 19. Important Rule

The parser should output facts.

The scoring engine should interpret those facts.

For example:

```text
Parser:

attempts = 3
solved = true
puzzle = 1567
```

Then:

```text
Scoring engine:

3 attempts
→ 6 points
```

Never make the parser return:

```text
score = 6
```

This separation allows scoring rules to change without rebuilding the OCR system.

---

# LEVEL 19 — UI/UX

The main dashboard should be extremely simple.

Suggested layout:

```text
┌─────────────────────────────────────────┐
│ WORDLE LEAGUE                            │
│                                         │
│ Today's Wordle #1567                    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  🥇 Rahul              10 pts       │ │
│ │  🥈 Swayam              8 pts       │ │
│ │  🥉 Aman                6 pts       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│       [ Submit Today's Result ]          │
│                                         │
│ Overall Leaderboard                     │
│ History                                 │
│ My Profile                              │
└─────────────────────────────────────────┘
```

The upload flow should be the primary action.

---

# 20. Mobile First

Many users will upload screenshots from their phones.

The website MUST work well on:

```text
Android
iPhone
Desktop
Tablet
```

The screenshot uploader should support:

```text
camera
gallery
file picker
drag and drop
```

where supported by the browser.

---

# 21. Error Handling

Never show raw backend errors to users.

Bad:

```text
500 Internal Server Error
```

Good:

```text
We couldn't process this screenshot.

Please make sure the full Wordle result is visible and try again.
```

Possible errors:

```text
INVALID_IMAGE
NOT_WORDLE_SCREENSHOT
OCR_FAILED
LOW_CONFIDENCE
DUPLICATE_SUBMISSION
INVALID_PUZZLE
ALREADY_SUBMITTED
SERVER_ERROR
```

---

# 22. API Design

Initial API structure:

```text
GET    /health

POST   /players
GET    /players/{id}
GET    /players/{id}/history

POST   /submissions/preview
POST   /submissions

GET    /leaderboard/today
GET    /leaderboard/overall
GET    /leaderboard/date/{date}

POST   /groups
POST   /groups/join
GET    /groups/{id}
```

Keep API routes thin.

Business logic belongs in services.

---

# 23. Backend Layering

Use this structure:

```text
API route
    ↓
Schema validation
    ↓
Service
    ↓
Database
```

Example:

```text
POST /submissions
        ↓
SubmissionRequest
        ↓
submission_service
        ↓
parser
        ↓
validator
        ↓
scoring_engine
        ↓
database
```

Do not put all logic inside `main.py`.

---

# 24. Testing Strategy

Testing is required at every level.

## Unit tests

Test:

```text
scoring.py
parser.py
validator.py
```

Example:

```text
3 attempts → expected score
X/6 → expected score 0
duplicate → rejected
```

---

# 25. Screenshot Test Dataset

Create a local test dataset:

```text
test_images/

solved_1.png
solved_2.png
solved_3.png
solved_4.png
solved_5.png
solved_6.png

failed_1.png

cropped.png
blurry.png
dark.png
rotated.png
invalid.png
```

The parser should be tested against real screenshots representing different devices and screen sizes.

Do not optimize only for one screenshot.

---

# 26. Accuracy Target

Before declaring screenshot parsing complete, test against a meaningful collection of screenshots.

Target:

```text
Puzzle number extraction: >= 99%
Attempt extraction:       >= 99%
Solved/failed detection:  >= 99%
Grid detection:            >= 98%
```

These are engineering targets, not assumptions.

Measure actual accuracy using a labeled test set.

---

# 27. Performance

A normal screenshot submission should ideally take:

```text
Upload
  ↓
Processing
  ↓
Result
```

within a few seconds.

Do not introduce an external LLM API into every submission unless conventional OCR/CV cannot achieve sufficient accuracy.

---

# 28. Optional LLM Fallback

If OCR/CV fails:

```text
Normal parser
      ↓
confidence < threshold
      ↓
optional fallback
      ↓
LLM/image model
      ↓
structured result
```

The fallback should NOT be the primary parser.

If used, validate the LLM response before accepting it.

---

# 29. Data Integrity

A submission should contain immutable core facts:

```text
player
group
puzzle
attempts
solved
score
created_at
```

If score rules change later, decide explicitly whether historical scores:

```text
remain unchanged
```

or:

```text
are recalculated
```

Default recommendation:

> Historical submissions should preserve the score calculated under the rules active when the submission was made.

---

# 30. Time and Date Handling

Use UTC internally where appropriate.

The group should have a defined timezone.

For the initial application:

```text
Asia/Kolkata
```

may be used for the group's daily boundary if this is a Bangalore/India-based friend group.

Do not determine the Wordle day solely from the server's local timezone.

---

# 31. Git Workflow

Create a Git repository.

Recommended commits:

```text
feat: initialize react frontend
feat: initialize fastapi backend
feat: connect frontend to backend
feat: connect supabase
feat: add player system
feat: add manual submissions
feat: add scoring engine
feat: add screenshot upload
feat: add screenshot parser
feat: add grid validation
feat: add automatic submissions
feat: add leaderboard
feat: add player history
feat: add groups
feat: add authentication
feat: add security
feat: add deployment configuration
```

Each level should produce a working commit.

---

# 32. Environment Variables

Frontend:

```env
VITE_API_URL=
```

Backend:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Never commit `.env`.

Provide:

```text
.env.example
```

instead.

---

# 33. Deployment Architecture

Recommended eventual deployment:

```text
                    Internet
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
        Frontend               FastAPI
        Vercel                 Render/Railway
                                  │
                                  ▼
                             Supabase
                             PostgreSQL
```

The exact hosting provider can be decided later.

Do not deploy before the local MVP works.

---

# 34. MVP Definition

The MVP is complete when a friend can:

```text
1. Open the website
2. Identify themselves
3. Upload their Wordle screenshot
4. System extracts the result
5. System validates the result
6. User confirms
7. Score is calculated
8. Submission is stored
9. Today's leaderboard updates
10. Duplicate submission is rejected
```

Nothing else is required for the first usable version.

---

# 35. Features Explicitly NOT Required for MVP

Do not implement these prematurely:

```text
❌ Chat
❌ Notifications
❌ Social feed
❌ Complex profiles
❌ Achievements
❌ AI-generated comments
❌ Real-time WebSockets
❌ Microservices
❌ Kubernetes
❌ Complex authentication
❌ Mobile application
❌ Native app
❌ Neural-network screenshot classifier
```

Build the simplest working product first.

---

# 36. Important Development Constraint

At every level, stop and verify that the current level works before proceeding.

For example:

```text
LEVEL 1
↓
Run frontend
Run backend
Test /health
↓
STOP

LEVEL 2
↓
Connect frontend
Test API
↓
STOP

LEVEL 3
↓
Connect Supabase
Insert/read test row
↓
STOP
```

Do NOT implement future levels before the current level is verified.

---

# 37. Final Target Architecture

The finished system should look approximately like:

```text
                         USER
                          │
                          ▼
                 ┌─────────────────┐
                 │   React App     │
                 │                 │
                 │ Dashboard       │
                 │ Upload          │
                 │ Leaderboard     │
                 │ History         │
                 └────────┬────────┘
                          │
                          │ HTTPS
                          ▼
                 ┌─────────────────┐
                 │    FastAPI      │
                 │                 │
                 │ API             │
                 │ Authentication  │
                 │ Validation      │
                 │ Business Logic  │
                 └────────┬────────┘
                          │
             ┌────────────┼─────────────┐
             │            │             │
             ▼            ▼             ▼
        Screenshot      Scoring      Supabase
        Processor       Engine       PostgreSQL
             │                          │
       ┌─────┴─────┐                    │
       │           │                    │
      OCR         OpenCV                │
       │           │                    │
       └─────┬─────┘                    │
             │                          │
             ▼                          │
         Validator ─────────────────────┘
```

---

# 38. What the Code Editor Should Do Now

Start ONLY with **LEVEL 1**.

Do not implement:

* Supabase
* OCR
* screenshot processing
* authentication
* leaderboard
* scoring
* player history
* groups

until LEVEL 1 is completed and verified.

The first task is:

```text
Create the project structure.

Create:
- React + Vite + TypeScript frontend
- FastAPI backend
- GET /health endpoint
- basic frontend page
- frontend → backend health check
- basic README/development documentation
```

After implementation, report:

```text
LEVEL 1 COMPLETE

Frontend:
[status]

Backend:
[status]

Health API:
[status]

Frontend → Backend:
[status]

Files created:
[list]
```

Then wait for the next instruction before implementing LEVEL 2.

---

# 39. Guiding Principle

This project should remain:

> **A simple private Wordle league, not an over-engineered software platform.**

Prefer:

```text
simple
reliable
transparent
maintainable
```

over:

```text
complex
clever
over-engineered
```

The user experience should ultimately feel like:

```text
Take Wordle screenshot
        ↓
Open website
        ↓
Upload
        ↓
Confirm
        ↓
Done
```

while the backend handles:

```text
OCR
+
Computer Vision
+
Validation
+
Scoring
+
Database
+
Leaderboard
```

automatically.

---

# END OF PROJECT SPECIFICATION

