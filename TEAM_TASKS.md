\# FarmShield - Team Task List (2 People)



\## Team

\- \*\*Backend\*\*: You - FastAPI, Database, APIs

\- \*\*Frontend\*\*: Teammate - React, UI, Maps



\## Git Workflow (IMPORTANT!)



\### Rule: NEVER push directly to `main`



| Person | Their Branch | Purpose |

|--------|--------------|---------|

| You | `feature/backend-\*` | Your backend code |

| Frontend Dev | `feature/frontend-\*` | Their React code |

| Both | `main` | Only merge working, tested code |



---



\## Your Workflow (Backend)



```cmd

\# 1. Start new task - always pull latest main first

git checkout main

git pull origin main

git checkout -b feature/backend-database



\# 2. Work on your code...



\# 3. Push your branch (NOT main)

git add .

git commit -m "Add SQLite database setup"

git push -u origin feature/backend-database



\# 4. On GitHub.com:

\#    - Click "Pull Requests" → "New Pull Request"

\#    - base: main ← compare: feature/backend-database

\#    - Create PR, wait for review, merge



\# 5. After merging, clean up

git checkout main

git pull origin main

git branch -d feature/backend-database

/frontend dev 

# 1. Clone repo
git clone https://github.com/Safari-jnr/FarmSield.git
cd FarmSield

# 2. Create their branch
git checkout main
git pull origin main
git checkout -b feature/frontend-setup

# 3. Work on React code...

# 4. Push their branch (NOT main)
git add .
git commit -m "Add React project structure"
git push -u origin feature/frontend-setup

# 5. Create Pull Request on GitHub for you to review