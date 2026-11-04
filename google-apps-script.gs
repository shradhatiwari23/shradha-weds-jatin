/**
 * RSVP -> Google Sheet backend
 * Paste this into Extensions > Apps Script in your Google Sheet.
 */
const SHEET_NAME = 'RSVPs';
const HEADERS = ['Timestamp (IST)', 'Name', 'Phone', 'Attendance', 'Guests', 'Wishes'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const p = (e && e.parameter) || {};

    // Honeypot: bots fill this hidden field, real guests never see it
    if (p.website) return json_({ result: 'ignored' });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    sheet.appendRow([
      Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
      clean_(p.name),
      clean_(p.phone),
      clean_(p.attendance),
      clean_(p.guests),
      clean_(p.wishes)
    ]);

    return json_({ result: 'success' });
  } catch (err) {
    return json_({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Open the /exec URL in a browser to confirm the deployment is live
function doGet() {
  return json_({ result: 'ok', message: 'RSVP endpoint is running' });
}

// Stops guests' text from being run as a spreadsheet formula
function clean_(v) {
  const s = String(v == null ? '' : v).trim().slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
