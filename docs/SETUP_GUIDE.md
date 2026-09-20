# Setup Guide — start here

For Masrur (Member 1, team lead). Node.js and PostgreSQL are already installed on
your PC, so you only need Parts B to E. Do them in order.

---

# PART A — Check that your tools work

Open a terminal:
**Windows:** press the Windows key, type `cmd`, press Enter.
**macOS:** open **Terminal**.

Type these one at a time:

```bash
node -v
npm -v
```

You should see two version numbers. If not, reopen the terminal, or reinstall
Node.js from <https://nodejs.org>.

**The one thing you must know:** the password you chose when you installed
PostgreSQL, for the user called `postgres`. You will need it in Part C. If you do
not remember it, the easiest fix is to reinstall PostgreSQL and set a password you
will remember — use `postgres`, which is what this project expects by default.

---

# PART B — Put the project on your computer

1. Unzip the downloaded file. You get a folder named `smart-irrigation`.
2. Move it somewhere simple, for example `C:\projects\smart-irrigation`.
3. Open a terminal **inside that folder**:
   **Windows:** open the folder in File Explorer, click the white address bar at the
   top, type `cmd`, press Enter.
   **macOS:** right-click the folder → Services → New Terminal at Folder.
4. Check you are in the right place:

```bash
dir        # Windows
ls         # macOS / Linux
```

You should see `package.json`, `database.sql`, `src`, `docs`.

---

# PART C — Create the database

You have two ways. **Way 1 (pgAdmin) is easier if you do not like the terminal.**

### Way 1 — pgAdmin (clicking)

1. Open **pgAdmin** from the Start menu. It asks for a master password the first
   time — set any password you will remember.
2. On the left, expand **Servers → PostgreSQL 16**. It asks for the `postgres`
   user's password — type the one from Part A.
3. Right-click **Databases → Create → Database…**
4. In **Database**, type `smart_irrigation` and click **Save**.
5. Click once on your new `smart_irrigation` database to select it, then in the top
   menu choose **Tools → Query Tool**.
6. In the Query Tool, click the **folder icon** (Open File) and select
   `database.sql` from your project folder.
7. Press the **▶ Execute** button (or F5).
8. You should see a success message at the bottom. On the left, expand
   `smart_irrigation → Schemas → public → Tables` — you should see four tables:
   `users`, `fields`, `readings`, `logs`.

### Way 2 — SQL Shell / terminal (typing)

Open **SQL Shell (psql)** from the Start menu. Press Enter four times to accept the
defaults, then type your `postgres` password. Then:

```sql
CREATE DATABASE smart_irrigation;
\c smart_irrigation
\i 'C:/projects/smart-irrigation/database.sql'
\dt
```

Use forward slashes `/` in that path, and change it to wherever your folder is.
`\dt` should list the four tables. Type `\q` to quit.

---

# PART D — Run the project

In the terminal from Part B (inside the project folder):

```bash
npm install
```

This downloads Express, the PostgreSQL driver and bcrypt. It takes about a minute
and creates a `node_modules` folder. **You only do this once.**

Now start the server. If your postgres password is exactly `postgres`:

```bash
npm start
```

If it is anything else:

```bash
# Windows
set DB_PASSWORD=yourpassword && npm start
# macOS / Linux
DB_PASSWORD=yourpassword npm start
```

You should see:

```
Server running on http://localhost:3000
```

Open **http://localhost:3000** in your browser and log in with:

- Email: `demo@demo.com`
- Password: `123456`

**Test everything once:** add a field, press "Take sensor reading", press "Run auto
irrigation", turn a pump off, check the history table at the bottom.

To stop the server: click the terminal and press **Ctrl + C**.
To start it again another day: just `npm start` — Parts A to C are one-time only.

### If something goes wrong

| Message | What it means and what to do |
|---|---|
| `ECONNREFUSED ...5432` | PostgreSQL is not running. Windows: press Win+R, type `services.msc`, find `postgresql-x64-16`, right-click → Start. |
| `password authentication failed for user "postgres"` | Wrong password. Use the `set DB_PASSWORD=...` line above. |
| `database "smart_irrigation" does not exist` | Part C did not finish. Do it again. |
| `relation "users" does not exist` | The database exists but the tables were not created. Run `database.sql` again, and make sure the Query Tool was connected to `smart_irrigation`, not to `postgres`. |
| `EADDRINUSE :::3000` | Port 3000 is already used. Close the other terminal, or run `set PORT=3001 && npm start` and open localhost:3001. |
| `'npm' is not recognized` | Reopen the terminal; if it still fails, reinstall Node.js. |

---

# PART E — Put it on GitHub and bring in your team

Full detail is in `Git_Guide.md`. Short version:

1. Install Git from <https://git-scm.com> (defaults are fine), then:

```bash
git config --global user.name  "Masrur Mahin"
git config --global user.email "your-github-email@example.com"
```

2. On GitHub, create an empty repository named `smart-irrigation`.
   **Do not** tick "Add a README file".

3. Back in the project folder:

```bash
git init
git add .
git commit -m "chore: initial project setup"
git branch -M main
git remote add origin https://github.com/<your-username>/smart-irrigation.git
git push -u origin main
```

4. Add your two teammates: repo → **Settings → Collaborators → Add people**.

5. Force pull requests (this is where the marks are):
   repo → **Settings → Branches → Add branch protection rule** → pattern `main` →
   tick *Require a pull request before merging* → *Require approvals: 1* → Save.

6. Send your teammates `Work_Distribution.md` and `Git_Guide.md`.

---

# PART F — Before you submit

- [ ] Fill in your teammates' names and roll numbers in `docs/Requirement_Report.md`
      (search for `[Name]` and `[roll]`)
- [ ] Fill in your group number, section, teacher's name and the date on the cover page
- [ ] Take the nine screenshots listed in `Git_Guide.md` Step 9 into `screenshots/`
- [ ] Check the repo has 3 branches and 3 merged pull requests
- [ ] Check all three names appear in the commit history
- [ ] Practise the demo end to end once
