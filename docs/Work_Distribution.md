# Work Distribution — Group 23

Each member owns different **files**, so you rarely edit the same file and merge
conflicts stay rare.

---

## Member 1 — Masrur Mahin (lead): database, login, server

**Files you own**

```
database.sql
src/server.js
src/db.js
src/routes/auth.js
src/public/index.html
src/public/auth.js
README.md
docs/
```

**Tasks**

1. Create the GitHub repository, push the first commit, add README and `.gitignore`.
2. Write `database.sql`: the four tables plus demo data.
3. Write `db.js` (PostgreSQL pool) and `server.js` (Express + session + static files).
4. Write `routes/auth.js`: register, login, logout, `/api/me`, and the `checkLogin`
   middleware that the other two members import.
5. Build the login/register page (`index.html` + `auth.js`).
6. Review and merge the other two pull requests.
7. Write the report and collect screenshots.

**Report sections:** 1–7, 12, 13, 14, 17, 18.

---

## Member 2 — fields and sensor readings

**Files you own**

```
src/routes/fields.js
```
(and the field parts of `src/public/dashboard.js` — the add-field form and the
fields table)

**Tasks**

1. `GET /api/fields` — list the logged-in user's fields with their latest reading
   and a dry/ok status.
2. `POST /api/fields` — add a field; reject an empty name or crop.
3. `DELETE /api/fields/:id` — delete only the user's own field.
4. `POST /api/fields/:id/reading` — save a reading; reject moisture outside 0–100.
5. `GET /api/fields/:id/readings` — last 10 readings.
6. `POST /api/simulate` — generate one random reading per field (this replaces the
   hardware for now).
7. In `dashboard.js`: the add-field form and the `loadFields()` table.

**Report sections:** 8 (functional requirements), 15 database tables.

---

## Member 3 — pump control and dashboard UI

**Files you own**

```
src/routes/irrigation.js
src/public/dashboard.html
src/public/style.css
```
(and the pump/history parts of `src/public/dashboard.js`)

**Tasks**

1. `POST /api/pump/:id/on|off` — manual control; reject turning it ON twice.
2. `POST /api/auto` — for every field, compare the latest moisture with the
   threshold and start or stop the pump; return a message per field.
3. Write a row into `logs` for every pump action (MANUAL or AUTO).
4. `GET /api/logs` — last 15 irrigation events of the user.
5. Build `dashboard.html` and `style.css`.
6. In `dashboard.js`: the pump buttons, "Run auto irrigation" and the history table.

**Report sections:** 9 (non-functional requirements), 10 (user stories and use case),
15 irrigation rule, 16 (GitHub evidence).

---

## Everyone together

- Agree the requirement list before anyone writes code.
- Review each other's pull requests — nobody merges their own.
- Rehearse the demo: log in → add a field → take sensor reading → run auto
  irrigation → turn a pump off → show the history.
- For the individual viva, **every member must be able to explain the whole
  system**, not only their own files.

## Suggested 4-day plan

| Day | Member 1 | Member 2 | Member 3 |
|---|---|---|---|
| 1 | Repo + database.sql + server.js | Functional requirements list | Non-functional requirements + user stories |
| 2 | auth.js + login page → PR #1 | fields.js routes | irrigation.js routes |
| 3 | Review PR #2 and #3 | Dashboard field table → PR #2 | dashboard.html + CSS → PR #3 |
| 4 | Report + PDF + screenshots | Test everything | Demo rehearsal |

## Viva questions to prepare

1. Why the Prototype model, and why not Waterfall or Spiral?
2. What is the difference between a functional and a non-functional requirement?
3. Show where in the code FR-13 (auto irrigation) is implemented.
4. Why are passwords hashed, and what does bcrypt do?
5. What happens if a field has no sensor reading yet?
6. Which branch caused a merge conflict and how did you fix it?
