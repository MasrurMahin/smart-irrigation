# Smart Irrigation System

CSE 3206 – Software Engineering Sessional, Lab 2
Project 23 · Process model: **Prototype** · Group 23, RUET

A simple full-stack web app: store soil-moisture readings for each field and turn
the water pump on or off, by hand or automatically.

## Technology

HTML · CSS · JavaScript · Node.js (Express) · PostgreSQL

## How to run

**1. Install Node.js and PostgreSQL.**

**2. Create the database:**

```bash
createdb -U postgres smart_irrigation
psql -U postgres -d smart_irrigation -f database.sql
```

**3. Install the packages and start the server:**

```bash
npm install
npm start
```

Open <http://localhost:3000>

Demo login: **demo@demo.com / 123456**

If your PostgreSQL password is not `postgres`, set it before starting:

```bash
# Windows (cmd)
set DB_PASSWORD=yourpassword && npm start
# Linux / macOS
DB_PASSWORD=yourpassword npm start
```

## Files

```
smart-irrigation/
├── database.sql            PostgreSQL tables + demo data
├── package.json
├── docs/
│   ├── SETUP_GUIDE.md            read this first
│   ├── Requirement_Report.pdf    report to submit
│   ├── Requirement_Report.md
│   ├── Work_Distribution.md      who does what
│   └── Git_Guide.md              step-by-step Git & GitHub
├── screenshots/            MVP and GitHub screenshots
└── src/
    ├── server.js           Express server        (Member 1)
    ├── db.js               PostgreSQL connection      (Member 1)
    ├── routes/
    │   ├── auth.js         register, login, logout   (Member 1)
    │   ├── fields.js       fields + sensor readings  (Member 2)
    │   └── irrigation.js   pump control + history    (Member 3)
    └── public/
        ├── index.html      login / register page
        ├── dashboard.html  main page
        ├── style.css
        ├── auth.js
        └── dashboard.js
```

## Features

- Register, log in, log out (passwords hashed with bcrypt)
- Add, list and delete fields with a moisture threshold per field
- Store soil moisture, temperature and humidity readings
- "Take sensor reading" button generates readings while there is no hardware
- Turn the pump ON/OFF manually
- "Run auto irrigation" starts the pump on every field below its threshold
- Irrigation history showing what happened, when, and whether it was manual or auto

## API

| Method | Path | Purpose |
|---|---|---|
| POST | /api/register | Create an account |
| POST | /api/login | Log in |
| POST | /api/logout | Log out |
| GET | /api/me | Current user |
| GET | /api/fields | List fields with the latest reading |
| POST | /api/fields | Add a field |
| DELETE | /api/fields/:id | Delete a field |
| POST | /api/fields/:id/reading | Save a sensor reading |
| GET | /api/fields/:id/readings | Last 10 readings |
| POST | /api/simulate | Generate one reading per field |
| POST | /api/pump/:id/on \| /off | Turn the pump on or off |
| POST | /api/auto | Automatic irrigation for all fields |
| GET | /api/logs | Irrigation history |

## Team

| Member | Work | Branch |
|---|---|---|
| Masrur Mahin (lead) | Database, login/register, server, report | `member1-auth` |
| _[Name]_ | Fields and sensor readings | `member2-fields` |
| _[Name]_ | Pump control, auto irrigation, dashboard UI | `member3-irrigation` |
