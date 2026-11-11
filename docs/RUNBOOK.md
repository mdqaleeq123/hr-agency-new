# Runbook: connect the Sheet, email, GitHub and record the video

Follow in order. Each step says what to capture for the submission.

## 1. Create the Google Sheet and the bridge (5 min)
1. Go to sheets.new and name it **HR Agency Ledger**.
2. Extensions > Apps Script. Delete the sample code and paste all of `apps-script/Code.gs`.
3. In the function dropdown choose **setup**, click Run, and approve permissions. This creates the `Ledger` tab with the header
   `Timestamp | Agent Name | Task Performed | Output Status`, colours the status column, installs a daily 18:30 email trigger,
   and prints a WEBHOOK_SECRET in the Execution log. Copy that secret.
4. Deploy > New deployment > type **Web app** > Execute as **Me** > Who has access **Anyone** > Deploy. Copy the `/exec` URL.
5. Share the Sheet as "Anyone with the link can view" for your submission link (Share button, top right).

## 2. Run the agency locally (2 min)
```bash
export SHEET_WEBHOOK_URL="<the /exec URL>"
export WEBHOOK_SECRET="<the secret>"
node scripts/run_all.mjs
```
Expected: 8 lines ending `sheet: row added`, then the brief, then `EMAIL: sent via Apps Script`.
Check: the Sheet has 8 new rows, and an email titled `[HR Agency] Daily brief <date>` is in your inbox.
Take a screenshot of the Sheet and of the email, and copy the email (Forward as attachment or print to PDF).

If the Sheet shows no rows: open the Web app URL in a browser tab. If it says you need to authorise, redo step 1.4.
Rows that failed are in `data/ledger-queue.csv`; run `node scripts/sheet_bridge.mjs --flush`.

## 3. Make the daily email automatic
The Apps Script trigger from `setup()` emails a brief from the Sheet every day at about 18:30, even when your laptop is off.
Schedule the local run with Claude Code or cron (weekdays 09:00):
```
0 9 * * 1-5  cd /path/to/hr-agency && SHEET_WEBHOOK_URL=... WEBHOOK_SECRET=... node scripts/run_all.mjs
```
Run it on two different days so the inbox shows more than one confirmation email.

## 4. Push to GitHub
```bash
cd hr-agency
git init && git add . && git commit -m "HR Agency: 8 AI employees, sheet and email bridges"
git branch -M main
git remote add origin https://github.com/<your-username>/hr-agency.git
git push -u origin main
```
Create the empty repo first on github.com (New repository, no README). Submit the repo URL. Confirm `.installed.json`
and `scripts/` are visible on the repo page. Never commit `.env` or your webhook secret.

## 5. Screen recording (aim for 5 to 8 minutes)
Use OBS, Win+G (Windows) or QuickTime (Mac). Show in this order:
1. The repo folder tree and `.installed.json`.
2. Terminal: `node scripts/runlog.mjs --selftest` then `node scripts/run_all.mjs` (the live run).
3. `data/out/` files being created, open `pipeline.csv` and `audit_report.md`.
4. The Google Sheet filling with 8 rows.
5. The inbox with the daily brief email.
6. Optional: open Claude Code in the folder and say "Install the HR Agency from this folder".
Say what each agent does as its line appears.

## 6. Submission checklist
- [ ] 1-page agency plan (`HR_Agency_Plan.docx` or PDF)
- [ ] Google Sheet link and confirmation email copies
- [ ] GitHub link (shows `.installed.json`, scripts, apps-script)
- [ ] Screen recording video
- [ ] Project PowerPoint (`HR_Agency_Project.pptx`)
