with open("code.gs", "r", encoding="utf-8") as f:
    content = f.read()

menu_target = '.addItem("▶️ Generate Outreach for Pending Rows", "processPendingRows")'
menu_replacement = '.addItem("⚡ Generate with Antigravity (Unlimited)", "triggerAntigravityProcessing")\n    .addItem("▶️ Generate with Groq In-Sheet", "processPendingRows")'

func_addition = """
/**
 * Triggers Antigravity Background Worker by marking all un-generated rows as 'Pending'.
 * Antigravity's daemon immediately picks these up, drafts warm humanized icebreakers,
 * and updates the sheet in batches without hitting Groq model limits!
 */
function triggerAntigravityProcessing() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("No Data", "No rows found to process. Please enter target data first.", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  let count = 0;
  const statusRange = sheet.getRange(2, CONFIG.COLUMNS.STATUS, lastRow - 1, 1);
  const statuses = statusRange.getValues();

  for (let i = 0; i < statuses.length; i++) {
    const s = (statuses[i][0] || "").toString().trim().toLowerCase();
    if (s !== "generated" && s !== "sent") {
      statuses[i][0] = "Pending";
      count++;
    }
  }

  statusRange.setValues(statuses);
  SpreadsheetApp.flush();

  SpreadsheetApp.getUi().alert(
    "⚡ Antigravity Sync Triggered",
    `Marked ${count} row(s) as Pending. Antigravity's background worker is generating the warm humanized replies right now!`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
"""

if menu_target in content:
    content = content.replace(menu_target, menu_replacement)
    content = content.replace("function processPendingRows() {", func_addition + "\nfunction processPendingRows() {")
    with open("code.gs", "w", encoding="utf-8") as f:
        f.write(content)
    print("code.gs successfully updated!")
else:
    print("menu_target already replaced or not found")
