/**
 * HR Agency - Google Apps Script backend (bridge target).
 * Bound to the Google Sheet "HR Agency Ledger".
 *
 * Provides:
 *   doPost(e)        -> appends [Timestamp | Agent Name | Task Performed | Output Status]
 *                       and handles {action:"email"} from scripts/daily_brief.mjs
 *   sendDailyBrief() -> reads today's rows from the sheet and emails a scannable bulletin
 *                       (set a time-driven trigger on this function, daily ~18:30)
 *   setup()          -> run ONCE: creates the header row, stores a secret, installs the trigger
 *
 * Deploy: Extensions > Apps Script > paste this file > Deploy > New deployment >
 *         Web app > Execute as: Me > Who has access: Anyone > copy the /exec URL.
 */

const SHEET_NAME = 'Ledger';
const HEADERS = ['Timestamp', 'Agent Name', 'Task Performed', 'Output Status'];
const TZ = 'Asia/Karachi';

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1f3a5f').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    sh.setColumnWidths(1, 1, 190); sh.setColumnWidths(2, 1, 190); sh.setColumnWidths(3, 1, 420); sh.setColumnWidths(4, 1, 130);
    const rule = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('ok').setBackground('#d9f2d9').setRanges([sh.getRange('D2:D')]).build();
    const rule2 = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('failed').setBackground('#f8d0d0').setRanges([sh.getRange('D2:D')]).build();
    const rule3 = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('partial').setBackground('#fff2cc').setRanges([sh.getRange('D2:D')]).build();
    sh.setConditionalFormatRules([rule, rule2, rule3]);
  }
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('WEBHOOK_SECRET')) props.setProperty('WEBHOOK_SECRET', Utilities.getUuid());
  // Daily trigger for the email brief (idempotent)
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'sendDailyBrief').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendDailyBrief').timeBased().everyDays(1).atHour(18).nearMinute(30).inTimezone(TZ).create();
  Logger.log('WEBHOOK_SECRET = ' + props.getProperty('WEBHOOK_SECRET'));
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: 'bad json' }); }
  const secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (secret && body.secret !== secret) return out({ ok: false, error: 'unauthorized' });

  if (body.action === 'log' && Array.isArray(body.row) && body.row.length === 4) {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    sh.appendRow(body.row);
    return out({ ok: true, action: 'log' });
  }
  if (body.action === 'email') {
    // Sends to the sheet owner only (never to an address supplied by the caller).
    const to = Session.getEffectiveUser().getEmail();
    MailApp.sendEmail({ to, subject: body.subject, body: body.text, htmlBody: body.html });
    return out({ ok: true, action: 'email', to });
  }
  return out({ ok: false, error: 'unknown action' });
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Time-driven fallback: builds the brief straight from the sheet, so email works even if the laptop is off. */
function sendDailyBrief() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sh.getDataRange().getValues().slice(1);
  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  const todays = rows.filter(r => String(r[0]).startsWith(today) || (r[0] instanceof Date && Utilities.formatDate(r[0], TZ, 'yyyy-MM-dd') === today));
  const by = {};
  todays.forEach(r => { const a = r[1]; by[a] = by[a] || { ok: 0, partial: 0, failed: 0, other: 0 }; (by[a][r[3]] !== undefined ? by[a][r[3]]++ : by[a].other++); });
  const agents = Object.keys(by);
  const bad = agents.filter(a => by[a].failed || by[a].partial);
  let text = 'HR Agency daily brief - ' + today + '\n\n';
  text += 'Runs logged: ' + todays.length + ' | Agents reporting: ' + agents.length + '/8\n\n';
  text += bad.length ? 'NEEDS ATTENTION: ' + bad.join(', ') + '\n\n' : 'All reporting agents healthy.\n\n';
  agents.forEach(a => { text += '- ' + a + ': ' + by[a].ok + ' ok, ' + by[a].partial + ' partial, ' + by[a].failed + ' failed\n'; });
  MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(), subject: '[HR Agency] Daily brief ' + today, body: text });
}
