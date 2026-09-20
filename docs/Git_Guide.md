# Git & GitHub — step by step (Group 23)

The rubric needs: a repository, a README, **3 feature branches**, **3 pull
requests**, merging, and a meaningful commit history. This guide produces exactly
that.

---

## Step 0 — one time, on every laptop

```bash
git config --global user.name  "Your Name"
git config --global user.email "your-github-email@example.com"
```

If `git push` asks for a password, use a GitHub token instead:
GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
→ Generate new token → tick `repo` → copy it and paste it as the password.

---

## Step 1 — create the repository (Member 1 only)

On GitHub: **New repository** → name `smart-irrigation` → Public → **do not** add a
README → Create.

Then in the project folder:

```bash
cd smart-irrigation
git init
git add .
git commit -m "chore: initial project setup"
git branch -M main
git remote add origin https://github.com/<username>/smart-irrigation.git
git push -u origin main
```

Add the other two: repo → **Settings → Collaborators → Add people**.

**Force pull requests** (this is where the marks are):
repo → **Settings → Branches → Add branch protection rule** → pattern `main` →
tick *Require a pull request before merging* → *Require approvals: 1* → Save.

---

## Step 2 — members 2 and 3 get the code

```bash
git clone https://github.com/<username>/smart-irrigation.git
cd smart-irrigation
npm install
createdb -U postgres smart_irrigation
psql -U postgres -d smart_irrigation -f database.sql
npm start
```

---

## Step 3 — work on your own branch (everyone)

```bash
git checkout main
git pull origin main
git checkout -b member2-fields        # use YOUR branch name
```

| Member | Branch |
|---|---|
| Masrur | `member1-auth` |
| Member 2 | `member2-fields` |
| Member 3 | `member3-irrigation` |

Commit in small steps — one big commit scores badly:

```bash
git status
git add src/routes/fields.js
git commit -m "feat(fields): add list and create field routes"
git push -u origin member2-fields     # first push only; later just: git push
```

**Commit message format:** `type(scope): message`

```
feat(auth): hash password with bcrypt before saving the user
feat(fields): reject moisture values outside 0-100
feat(irrigation): start pump automatically when moisture is below threshold
fix(dashboard): show a dash when a field has no reading
docs(readme): add setup steps for PostgreSQL
```

Types: `feat`, `fix`, `docs`, `refactor`, `style`, `chore`.

---

## Step 4 — open a pull request

Go to the repo on GitHub → the yellow **"Compare & pull request"** button → base
`main`, compare your branch → write a description:

```markdown
## What this adds
- Field list, add and delete routes
- Sensor reading storage and the simulator

## Requirements covered
FR-04, FR-05, FR-06, FR-07, FR-08, FR-09

## How to test
npm start, log in as demo@demo.com / 123456, add a field, press "Take sensor reading"
```

On the right side, set **Reviewers** → a teammate. **Never merge your own PR.**

---

## Step 5 — review a teammate's PR

Open the PR → **Files changed** → click a line number → write a real comment
(the rubric wants evidence of review, "ok" is not enough). Good things to ask:

- Is the input checked before it goes into the database?
- Does this route check that the field belongs to the logged-in user?
- What happens if there is no reading yet?

Then **Review changes → Approve → Submit**.

To test their branch first:

```bash
git fetch origin
git checkout member3-irrigation
npm start
git checkout main
```

---

## Step 6 — merge

On the PR page → **Merge pull request** → Confirm → **Delete branch**.
Then everyone runs:

```bash
git checkout main
git pull origin main
```

---

## Step 7 — before every new PR, update your branch

```bash
git checkout main
git pull origin main
git checkout member2-fields
git merge main
git push
```

---

## Step 8 — fixing a merge conflict

```bash
git status            # shows which files conflict
```

Open the file, you will see:

```
<<<<<<< HEAD
app.use('/api', require('./routes/fields'));
=======
app.use('/api', require('./routes/irrigation'));
>>>>>>> member3-irrigation
```

Usually **keep both lines**, delete the `<<<<<<<`, `=======`, `>>>>>>>` markers, then:

```bash
git add src/server.js
git commit -m "fix: resolve merge conflict in server.js"
git push
```

To cancel and start again: `git merge --abort`.

**To avoid conflicts:** stick to the files listed in `Work_Distribution.md` and pull
`main` before starting work each day.

---

## Step 9 — screenshots for the report

Save these in `screenshots/`:

| File | What to capture |
|---|---|
| 01-repo.png | Repository home page with README |
| 02-branches.png | Branches page with the three feature branches |
| 03-pull-requests.png | Pull requests tab, three merged PRs |
| 04-review.png | A review comment on a teammate's code |
| 05-network.png | Insights → Network graph |
| 06-commits.png | Commit history with all three names |
| 07-login.png | The login page |
| 08-dashboard.png | The dashboard with fields |
| 09-auto.png | Message after "Run auto irrigation" |

Then:

```bash
git checkout -b docs-report
git add screenshots docs/Requirement_Report.pdf
git commit -m "docs: add report and screenshots"
git push -u origin docs-report
```

Open a fourth PR for it — more evidence of the workflow.

---

## Commands you will actually use

| Task | Command |
|---|---|
| What changed | `git status` |
| See changes | `git diff` |
| Stage a file | `git add <file>` |
| Commit | `git commit -m "feat(x): message"` |
| Push | `git push` |
| Update main | `git checkout main && git pull origin main` |
| Switch branch | `git checkout <branch>` |
| All branches | `git branch -a` |
| History graph | `git log --oneline --graph --all` |
| Undo a file's changes | `git restore <file>` |
| Undo last commit, keep changes | `git reset --soft HEAD~1` |

## Team rules

1. Never push directly to `main`.
2. Never merge your own pull request.
3. Never commit `node_modules/` (`.gitignore` already blocks it).
4. Pull `main` before you start work each day.
