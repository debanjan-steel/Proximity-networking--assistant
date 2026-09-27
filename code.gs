/**
 * ============================================================================
 * PROXIMITY NETWORKING APP - GOOGLE APPS SCRIPT ENGINE (v0.1)
 * ============================================================================
 * Platform: Google Sheets + Google Apps Script + Groq API
 * Baseline: 2 Years Data Science Coursework @ Chennai Mathematical Institute (CMI)
 * Projects: 
 *   1. Predictive Maintenance RUL Copilot (CNN-Transformer)
 *   2. Mathematical Optimization (Complex Linear Programming Models)
 *   3. Interactive Data Applications & Prototyping (Streamlit Deployments)
 * ============================================================================
 */

// Global Configuration
const CONFIG = {
  SHEET_NAME: "Targets",
  GROQ_MODEL: "llama-3.1-8b-instant",
  FALLBACK_MODELS: [
    "llama-3.1-8b-instant",
    "gemma-2-9b-it",
    "deepseek-r1-distill-llama-70b"
  ],
  DEFAULT_API_KEY: "YOUR_GROQ_API_KEY_HERE", // Replace here or set via Custom Menu
  WORD_COUNT_LIMIT: 60,
  COLUMNS: {
    TARGET_NAME: 1,        // Col A
    ROLE: 2,               // Col B
    COMPANY: 3,            // Col C
    LINKEDIN_URL: 4,       // Col D
    IS_CMI_ALUMNI: 5,      // Col E (Checkbox)
    NETWORKING_OBJECTIVE: 6,// Col F (Employment | Collaboration)
    TIER: 7,               // Col G (Tier 1 | Tier 2 | Tier 3)
    RECOMMENDED_ASSET: 8,  // Col H
    ICEBREAKER_DRAFT: 9,   // Col I
    STATUS: 10             // Col J
  },
  ASSETS: {
    RUL_COPILOT: {
      key: "ASSET_RUL",
      title: "Predictive Maintenance RUL Copilot (CNN-Transformer)",
      focus: "Hybrid CNN-Transformer architecture predicting Remaining Useful Life from high-frequency sensor telemetry",
      regex: /iot|manufacturing|industrial|hardware|sensor|sensors|predictive|automotive|telemetry|time-?series|machinery|equipment/i
    },
    OPTIMIZATION_LP: {
      key: "ASSET_LP",
      title: "Mathematical Optimization (Linear Programming Models)",
      focus: "Formulating and solving complex LP and Mixed-Integer Linear Programming models for logistics, routing, and operations research",
      regex: /operations|logistics|strategy|supply chain|optimization|finance|routing|planning|operations research|inventory|procurement/i
    },
    STREAMLIT_APPS: {
      key: "ASSET_STREAMLIT",
      title: "Interactive Data Applications (Streamlit Deployments)",
      focus: "Rapid end-to-end prototyping and cloud deployment of interactive data intelligence web apps using Streamlit and Python",
      regex: /product|front-?end|engineering|app|deployment|platform|full-?stack|ui|ux|saas|startup|software|developer/i
    },
    FALLBACK_CMI: {
      key: "ASSET_FALLBACK",
      title: "CMI Data Science & Mathematical Modeling Foundation",
      focus: "Rigorous mathematical modeling, probability, and machine learning foundation from Chennai Mathematical Institute",
      regex: /.*/i
    }
  }
};

/**
 * Creates custom menu in Google Sheets UI on document open.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🚀 Proximity Networking")
    .addItem("⚡ Generate with Antigravity (Unlimited)", "triggerAntigravityProcessing")
    .addItem("▶️ Generate with Groq In-Sheet", "processPendingRows")
    .addItem("🎯 Generate for Selected Row", "processSelectedRow")
    .addSeparator()
    .addItem("📋 Insert 20 Sample Target Rows", "populateSampleRows")
    .addItem("⚙️ Initialize Sheet Template & Headers", "setupSheetTemplate")
    .addItem("🔑 Set Groq API Key", "promptSetApiKey")
    .addItem("⚙️ Select / Test Groq Model", "promptSetGroqModel")
    .addSeparator()
    .addItem("🧪 Run QA Verifier Test Suite", "runAllVerifierTests")
    .addToUi();
}

/**
 * Retrieves the Groq API Key from UserProperties or fallback config.
 */
function getApiKey() {
  const userProps = PropertiesService.getUserProperties();
  const savedKey = userProps.getProperty("GROQ_API_KEY") || userProps.getProperty("GEMINI_API_KEY");
  if (savedKey && savedKey.trim() !== "") {
    return savedKey.trim();
  }
  return CONFIG.DEFAULT_API_KEY;
}

/**
 * Retrieves the currently active Groq Model (auto-sanitizing known decommissioned IDs).
 */
function getGroqModel() {
  const userProps = PropertiesService.getUserProperties();
  const savedModel = userProps.getProperty("GROQ_MODEL");
  
  const decommissioned = [
    "qwen-2.5-32b",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "llama-3.3-70b-versatile",
    "llama-3.2-1b-preview",
    "llama-3.2-3b-preview",
    "llama-3.2-11b-vision-preview",
    "mixtral-8x7b-32768"
  ];

  if (savedModel && savedModel.trim() !== "") {
    const trimmed = savedModel.trim();
    if (!decommissioned.includes(trimmed)) {
      return trimmed;
    }
    // Clean up stale decommissioned model from user properties
    userProps.deleteProperty("GROQ_MODEL");
  }
  return CONFIG.GROQ_MODEL;
}

/**
 * UI Prompt for setting the Groq API Key.
 */
function promptSetApiKey() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    "Configure Groq API Key",
    "Enter your Groq API Key (starts with gsk_...):",
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const key = response.getResponseText().trim();
    if (key) {
      PropertiesService.getUserProperties().setProperty("GROQ_API_KEY", key);
      ui.alert("Success", "Groq API Key successfully saved.", ui.ButtonSet.OK);
    } else {
      ui.alert("Warning", "API key was empty. Key not updated.", ui.ButtonSet.OK);
    }
  }
}

/**
 * UI Prompt for selecting or testing Groq Model.
 */
function promptSetGroqModel() {
  const ui = SpreadsheetApp.getUi();
  const currentModel = getGroqModel();
  const apiKey = getApiKey();
  
  let availableInfo = "";
  if (apiKey && apiKey !== "YOUR_GROQ_API_KEY_HERE") {
    const liveModels = fetchAvailableGroqModels(apiKey);
    if (liveModels.length > 0) {
      availableInfo = `\n\nActive models in your Groq account:\n• ${liveModels.slice(0, 10).join("\n• ")}`;
    }
  }

  const response = ui.prompt(
    "Select Groq Model",
    `Current Model: ${currentModel}\n\nRecommended Active Models:\n• llama-3.1-8b-instant (Fast & Stable)\n• gemma-2-9b-it (Google Gemma 2)\n• deepseek-r1-distill-llama-70b (Reasoning)${availableInfo}\n\nEnter model name:`,
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const model = response.getResponseText().trim();
    if (model) {
      PropertiesService.getUserProperties().setProperty("GROQ_MODEL", model);
      ui.alert("Model Updated", `Active Groq Model set to: ${model}`, ui.ButtonSet.OK);
    }
  }
}

/**
 * Queries the Groq /models API to get a list of active models.
 * @param {string} apiKey - Groq API Key
 * @returns {Array<string>} - Array of available model IDs
 */
function fetchAvailableGroqModels(apiKey) {
  try {
    const url = "https://api.groq.com/openai/v1/models";
    const options = {
      method: "get",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      const json = JSON.parse(response.getContentText());
      if (json.data && Array.isArray(json.data)) {
        return json.data
          .map(m => m.id)
          .filter(id => !id.toLowerCase().includes("whisper") && !id.toLowerCase().includes("guard") && !id.toLowerCase().includes("vision") && !id.toLowerCase().includes("tts"));
      }
    }
  } catch (e) {
    Logger.log("Could not query Groq /models endpoint: " + e.message);
  }
  return [];
}

/**
 * Sets up standard sheet headers, column widths, formatting, and data validation.
 */
function setupSheetTemplate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.getActiveSheet();
    sheet.setName(CONFIG.SHEET_NAME);
  }

  const headers = [
    "Target_Name",
    "Role",
    "Company",
    "LinkedIn_URL",
    "Is_CMI_Alumni",
    "Networking_Objective",
    "Tier",
    "Recommended_Asset",
    "Icebreaker_Draft",
    "Status"
  ];

  // Set Header Row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#1a73e8");
  headerRange.setFontColor("#ffffff");
  headerRange.setHorizontalAlignment("center");

  // Format Columns
  sheet.setColumnWidth(1, 160); // Target_Name
  sheet.setColumnWidth(2, 220); // Role
  sheet.setColumnWidth(3, 160); // Company
  sheet.setColumnWidth(4, 200); // LinkedIn_URL
  sheet.setColumnWidth(5, 110); // Is_CMI_Alumni
  sheet.setColumnWidth(6, 170); // Networking_Objective
  sheet.setColumnWidth(7, 100); // Tier
  sheet.setColumnWidth(8, 260); // Recommended_Asset
  sheet.setColumnWidth(9, 420); // Icebreaker_Draft
  sheet.setColumnWidth(10, 120); // Status

  // Add Data Validation for Networking_Objective (Dropdown)
  const ruleObjective = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Employment", "Collaboration"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange("F2:F1000").setDataValidation(ruleObjective);

  // Add Checkbox validation for Is_CMI_Alumni
  const ruleCheckbox = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  sheet.getRange("E2:E1000").setDataValidation(ruleCheckbox);

  SpreadsheetApp.getUi().alert("Sheet Initialized", "Sheet structure and validation configured successfully.", SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Inserts 20 realistic dummy target rows for testing and demonstration.
 */
function populateSampleRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getActiveSheet();

  // Ensure headers exist
  if (sheet.getLastRow() < 1) {
    setupSheetTemplate();
  }

  const sampleRows = [
    ["Arjun Sharma", "Senior IoT Analytics Manager", "Siemens Energy", "https://www.linkedin.com/in/arjun-sharma-iot", false, "Employment", "", "", "", "Ready"],
    ["Priya Venkatesh", "Data Scientist", "Fractal Analytics", "https://www.linkedin.com/in/priya-venkatesh-cmi", true, "Collaboration", "", "", "", "Ready"],
    ["Marcus Vance", "Lead Operations Research Engineer", "Uber Freight", "https://www.linkedin.com/in/marcus-vance-or", false, "Employment", "", "", "", "Ready"],
    ["Dr. Elena Rostova", "Director of Applied AI", "Bosch Global", "https://www.linkedin.com/in/elena-rostova-ai", false, "Employment", "", "", "", "Ready"],
    ["Rohan Nair", "Full-Stack ML Platform Engineer", "Hasura", "https://www.linkedin.com/in/rohan-nair-ml", false, "Collaboration", "", "", "", "Ready"],
    ["Ananya Deshmukh", "Junior Data Scientist", "Swiggy", "https://www.linkedin.com/in/ananya-deshmukh-cmi", true, "Employment", "", "", "", "Ready"],
    ["David K. Miller", "VP of Supply Chain Optimization", "Maersk", "https://www.linkedin.com/in/david-miller-logistics", false, "Employment", "", "", "", "Ready"],
    ["Siddharth Sen", "Machine Learning Engineer", "Postman", "https://www.linkedin.com/in/siddharth-sen-apps", false, "Collaboration", "", "", "", "Ready"],
    ["Vikramaditya Rao", "Senior Predictive Maintenance Lead", "General Electric", "https://www.linkedin.com/in/vikram-rao-ge", false, "Employment", "", "", "", "Ready"],
    ["Sneha Kulkarni", "Data Science Researcher", "Microsoft Research", "https://www.linkedin.com/in/sneha-kulkarni-cmi", true, "Collaboration", "", "", "", "Ready"],
    ["Carlos Mendoza", "Operations Research Analyst", "Amazon Robotics", "https://www.linkedin.com/in/carlos-mendoza-amz", false, "Employment", "", "", "", "Ready"],
    ["Neha Agarwal", "Product Analytics Specialist", "Razorpay", "https://www.linkedin.com/in/neha-agarwal-product", false, "Collaboration", "", "", "", "Ready"],
    ["Thomas Becker", "Staff Telemetry & Sensor Engineer", "Tesla Motors", "https://www.linkedin.com/in/thomas-becker-telemetry", false, "Employment", "", "", "", "Ready"],
    ["Karthik Ramanathan", "Senior Quantitative Researcher", "WorldQuant", "https://www.linkedin.com/in/karthik-raman-cmi", true, "Employment", "", "", "", "Ready"],
    ["Samantha Reed", "Head of Routing & Fleet Logistics", "Delhivery", "https://www.linkedin.com/in/samantha-reed-fleet", false, "Employment", "", "", "", "Ready"],
    ["Aditya Sundaram", "Frontend AI Developer", "Streamlit / Snowflake", "https://www.linkedin.com/in/aditya-sundaram-dev", false, "Collaboration", "", "", "", "Ready"],
    ["Meera Iyer", "Associate Data Scientist", "The Math Company", "https://www.linkedin.com/in/meera-iyer-cmi", true, "Employment", "", "", "", "Ready"],
    ["Lukas Schneider", "Industrial Machinery Systems Specialist", "ABB", "https://www.linkedin.com/in/lukas-schneider-abb", false, "Employment", "", "", "", "Ready"],
    ["Pooja Hegde", "Logistics Planning Strategist", "Flipkart", "https://www.linkedin.com/in/pooja-hegde-planning", false, "Employment", "", "", "", "Ready"],
    ["Gautam Mukherjee", "Senior Software Engineer (Data Apps)", "BrowserStack", "https://www.linkedin.com/in/gautam-mukherjee-data", false, "Collaboration", "", "", "", "Ready"]
  ];

  // Write sample rows starting at Row 2
  const targetRange = sheet.getRange(2, 1, sampleRows.length, 10);
  targetRange.setValues(sampleRows);

  SpreadsheetApp.getUi().alert(
    "Sample Data Inserted",
    `Successfully populated ${sampleRows.length} test target rows across diverse domains and tiers!\n\nClick '🚀 Proximity Networking -> ▶️ Generate Outreach for Pending Rows' to process them all.`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Deterministic Tier Evaluation Logic (Hybrid Engine).
 * @param {boolean} isAlumni - Is CMI Alumni flag
 * @param {string} role - Target professional role
 * @returns {string} - "Tier 1" | "Tier 2" | "Tier 3"
 */
function evaluateTier(isAlumni, role) {
  if (isAlumni === true || isAlumni === "TRUE" || isAlumni === true) {
    return "Tier 1";
  }

  const roleText = (role || "").toString().toLowerCase().trim();

  // Tier 3: Senior ML Managers / Decision Makers / Leads
  const seniorRegex = /\b(lead|manager|senior|director|head|vp|principal|chief|founder|partner|staff)\b/i;
  if (seniorRegex.test(roleText)) {
    return "Tier 3";
  }

  // Tier 1: Peers / Junior Data Scientists / Researchers
  const peerRegex = /\b(junior|data scientist|associate|intern|student|peer|fellow|researcher)\b/i;
  if (peerRegex.test(roleText)) {
    return "Tier 1";
  }

  // Tier 2: Bridge Connections / Mid-level Engineers
  return "Tier 2";
}

/**
 * Deterministic Project & Asset Routing Matrix.
 * @param {string} role - Target professional role
 * @param {string} company - Target company name
 * @returns {Object} - Matched Asset Object
 */
function routeAsset(role, company) {
  const query = `${role || ""} ${company || ""}`.toLowerCase();

  if (CONFIG.ASSETS.RUL_COPILOT.regex.test(query)) {
    return CONFIG.ASSETS.RUL_COPILOT;
  }
  if (CONFIG.ASSETS.OPTIMIZATION_LP.regex.test(query)) {
    return CONFIG.ASSETS.OPTIMIZATION_LP;
  }
  if (CONFIG.ASSETS.STREAMLIT_APPS.regex.test(query)) {
    return CONFIG.ASSETS.STREAMLIT_APPS;
  }
  return CONFIG.ASSETS.FALLBACK_CMI;
}

/**
 * Calls the Groq API to synthesize the personalized icebreaker message.
 * Supports automated model fallback and live model discovery if a model returns 404 or decommissioned errors.
 * @param {Object} target - Target profile details
 * @param {string} apiKey - Groq API Key
 * @returns {string} - Generated icebreaker text (<60 words)
 */
function callGroqForIcebreaker(target, apiKey) {
  if (!apiKey || apiKey === "YOUR_GROQ_API_KEY_HERE") {
    throw new Error("Missing Groq API Key. Use menu 'Proximity Networking -> Set Groq API Key'.");
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";

  const firstName = (target.name || "").trim().split(/\s+/)[0] || "there";
  const isAlumni = target.isAlumni === true || target.isAlumni === "TRUE";
  const objective = target.objective || "Employment";

  const systemInstruction = `You are a warm, genuine, and thoughtful Data Science student at Chennai Mathematical Institute (CMI) reaching out on LinkedIn.

Your Voice & Demeanor:
- Highly respectful, polite, and deeply grateful for the recipient's valuable time.
- Natural, humble, and conversational. Sound 100% human—NEVER sound like a bot, sales pitch, or template.
- Never mention internal labels like "Tier 1", "Tier 2", "Asset", "Rule", or cheesy slogans like "Connecting minds".

Writing Rules:
1. Strict Word Limit: Strictly 35 to 48 words total.
2. Greeting: "Hi ${firstName},"
3. Opening Hook:
   - If CMI Alumni is TRUE: Lead warmly with the shared CMI connection (e.g., "Wonderful to connect with a fellow CMI alumnus!").
   - If CMI Alumni is FALSE: Start with genuine admiration for their role at ${target.company || "their team"}.
4. Natural Bridge: Connect your CMI data science coursework or technical project (${target.asset.title}) naturally and humbly.
5. Grateful & Low-Friction CTA:
   - If Objective is "Employment": Graciously ask for 2 minutes of their perspective on modeling or architecture when convenient.
   - If Objective is "Collaboration": Propose a warm peer exchange of notes or tools.
   - End with sincere gratitude (e.g., "Really appreciate your time and all the best!").
6. Output ONLY the raw message text. No quotes, no hashtags, no meta-text.`;

  const userPrompt = `Craft a personalized, human, and grateful LinkedIn outreach message:
- Recipient: ${target.name || "there"}
- Role: ${target.role || "Professional"}
- Company: ${target.company || "their company"}
- Is CMI Alumni: ${isAlumni ? "TRUE" : "FALSE"}
- Networking Objective: ${objective}
- Matched Focus: ${target.asset.title}

Write the warm message:`;

  const primaryModel = getGroqModel();
  const candidateModels = [
    primaryModel,
    ...(CONFIG.FALLBACK_MODELS || [])
  ];

  // Unique list of models to try
  const modelsToTry = [];
  candidateModels.forEach(m => {
    if (m && !modelsToTry.includes(m)) {
      modelsToTry.push(m);
    }
  });

  let lastError = null;
  let responseBody = "";
  let successfulModel = "";

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    const payload = {
      model: currentModel,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 95
    };

    const options = {
      method: "post",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    responseBody = response.getContentText();

    if (responseCode === 200) {
      successfulModel = currentModel;
      // Auto-save working model in user properties for future calls
      if (currentModel !== primaryModel) {
        PropertiesService.getUserProperties().setProperty("GROQ_MODEL", currentModel);
      }
      break;
    }

    lastError = `Groq API Error (${responseCode}): ${responseBody}`;

    // If model is not found (404) or decommissioned/unsupported (400), gracefully try next model
    const isModelUnavailable = responseCode === 404 || 
      (responseCode === 400 && (
        responseBody.includes("model_decommissioned") || 
        responseBody.includes("model_not_found") || 
        responseBody.includes("decommissioned") ||
        responseBody.includes("does not exist") ||
        responseBody.includes("not supported")
      ));

    if (isModelUnavailable) {
      Logger.log(`Model '${currentModel}' unavailable (${responseCode}). Trying next fallback model...`);
      continue;
    } else {
      // If error is auth or other failure, throw immediately
      throw new Error(lastError);
    }
  }

  // If all static fallback models failed, query live models dynamically from Groq account
  if (!successfulModel) {
    const liveModels = fetchAvailableGroqModels(apiKey);
    for (const liveModel of liveModels) {
      if (modelsToTry.includes(liveModel)) continue;
      const payload = {
        model: liveModel,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.4,
        max_tokens: 95
      };
      const options = {
        method: "post",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      const response = UrlFetchApp.fetch(url, options);
      if (response.getResponseCode() === 200) {
        successfulModel = liveModel;
        responseBody = response.getContentText();
        PropertiesService.getUserProperties().setProperty("GROQ_MODEL", liveModel);
        break;
      }
    }
  }

  if (!successfulModel) {
    throw new Error(lastError || "Failed to generate icebreaker with any available Groq model.");
  }

  const json = JSON.parse(responseBody);
  let text = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content
    ? json.choices[0].message.content.trim()
    : "";

  // Clean up quotes and trailing whitespace
  text = text.replace(/^["']|["']$/g, "").trim();

  // Validate and enforce strict word count constraint (< 60 words)
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= CONFIG.WORD_COUNT_LIMIT) {
    const trimmedSlice = words.slice(0, 48).join(" ").replace(/[,;:\s]+$/, "");
    if (/[.!?]$/.test(trimmedSlice)) {
      text = trimmedSlice;
    } else {
      text = trimmedSlice + "... Would love your thoughts!";
    }
  }

  return text;
}

/**
 * Processes all pending rows where Status is empty, "Ready", or "Pending".
 */

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

function processPendingRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("No Data", "No rows found to process. Please enter target data first.", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const apiKey = getApiKey();
  const dataRange = sheet.getRange(2, 1, lastRow - 1, 10);
  const rows = dataRange.getValues();
  let processedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 2; // 1-indexed Sheet row
    const targetName = row[CONFIG.COLUMNS.TARGET_NAME - 1];
    const role = row[CONFIG.COLUMNS.ROLE - 1];
    const company = row[CONFIG.COLUMNS.COMPANY - 1];
    const isAlumni = row[CONFIG.COLUMNS.IS_CMI_ALUMNI - 1];
    const objective = row[CONFIG.COLUMNS.NETWORKING_OBJECTIVE - 1] || "Employment";
    const currentStatus = (row[CONFIG.COLUMNS.STATUS - 1] || "").toString().trim().toLowerCase();

    // Skip already generated or sent rows unless marked Ready/Pending
    if (currentStatus === "generated" || currentStatus === "sent") {
      continue;
    }
    if (!targetName && !role && !company) {
      continue;
    }

    try {
      sheet.getRange(rowIndex, CONFIG.COLUMNS.STATUS).setValue("Processing...");
      SpreadsheetApp.flush();

      // 1. Evaluate Tier
      const tier = evaluateTier(isAlumni, role);

      // 2. Route Asset
      const matchedAsset = routeAsset(role, company);

      // 3. Generate Icebreaker
      const targetPayload = {
        name: targetName,
        role: role,
        company: company,
        isAlumni: isAlumni,
        objective: objective,
        tier: tier,
        asset: matchedAsset
      };

      const icebreaker = callGroqForIcebreaker(targetPayload, apiKey);

      // 4. Update Sheet Row
      sheet.getRange(rowIndex, CONFIG.COLUMNS.TIER).setValue(tier);
      sheet.getRange(rowIndex, CONFIG.COLUMNS.RECOMMENDED_ASSET).setValue(matchedAsset.title);
      sheet.getRange(rowIndex, CONFIG.COLUMNS.ICEBREAKER_DRAFT).setValue(icebreaker);
      sheet.getRange(rowIndex, CONFIG.COLUMNS.STATUS).setValue("Generated");

      processedCount++;
      Utilities.sleep(1200); // Safe rate-limiting buffer
    } catch (err) {
      sheet.getRange(rowIndex, CONFIG.COLUMNS.STATUS).setValue(`Error: ${err.message}`);
    }
  }

  SpreadsheetApp.getUi().alert("Execution Complete", `Processed ${processedCount} pending row(s).`, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Processes only the currently selected row in the active sheet.
 */
function processSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const selectedRow = sheet.getActiveCell().getRow();

  if (selectedRow < 2) {
    SpreadsheetApp.getUi().alert("Invalid Selection", "Please select a data row (Row 2 or below).", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const apiKey = getApiKey();
  const rowData = sheet.getRange(selectedRow, 1, 1, 10).getValues()[0];

  const targetName = rowData[CONFIG.COLUMNS.TARGET_NAME - 1];
  const role = rowData[CONFIG.COLUMNS.ROLE - 1];
  const company = rowData[CONFIG.COLUMNS.COMPANY - 1];
  const isAlumni = rowData[CONFIG.COLUMNS.IS_CMI_ALUMNI - 1];
  const objective = rowData[CONFIG.COLUMNS.NETWORKING_OBJECTIVE - 1] || "Employment";

  try {
    sheet.getRange(selectedRow, CONFIG.COLUMNS.STATUS).setValue("Processing...");
    SpreadsheetApp.flush();

    const tier = evaluateTier(isAlumni, role);
    const matchedAsset = routeAsset(role, company);

    const targetPayload = {
      name: targetName,
      role: role,
      company: company,
      isAlumni: isAlumni,
      objective: objective,
      tier: tier,
      asset: matchedAsset
    };

    const icebreaker = callGroqForIcebreaker(targetPayload, apiKey);

    sheet.getRange(selectedRow, CONFIG.COLUMNS.TIER).setValue(tier);
    sheet.getRange(selectedRow, CONFIG.COLUMNS.RECOMMENDED_ASSET).setValue(matchedAsset.title);
    sheet.getRange(selectedRow, CONFIG.COLUMNS.ICEBREAKER_DRAFT).setValue(icebreaker);
    sheet.getRange(selectedRow, CONFIG.COLUMNS.STATUS).setValue("Generated");

    SpreadsheetApp.getUi().alert("Success", `Generated outreach draft for ${targetName || "Target"}.`, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (err) {
    sheet.getRange(selectedRow, CONFIG.COLUMNS.STATUS).setValue(`Error: ${err.message}`);
    SpreadsheetApp.getUi().alert("Error", err.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * ============================================================================
 * QA VERIFIER AUTOMATED TEST RUNNER (verifier_v0.md Compliance)
 * ============================================================================
 */
function runAllVerifierTests() {
  const results = [];
  const apiKey = getApiKey();

  Logger.log("=== STARTING QA VERIFIER TEST SUITE ===");

  // --------------------------------------------------------------------------
  // TEST SCENARIO 1 (Employment): John Doe, Senior IoT Analytics Manager, TechCorp
  // --------------------------------------------------------------------------
  try {
    const s1Input = {
      name: "John Doe",
      role: "Senior IoT Analytics Manager",
      company: "TechCorp",
      isAlumni: false,
      objective: "Employment"
    };

    const s1Tier = evaluateTier(s1Input.isAlumni, s1Input.role);
    const s1Asset = routeAsset(s1Input.role, s1Input.company);

    if (s1Tier !== "Tier 3") {
      throw new Error(`Scenario 1 Tier Failed: expected 'Tier 3', got '${s1Tier}'`);
    }
    if (!s1Asset.title.includes("Predictive Maintenance RUL Copilot")) {
      throw new Error(`Scenario 1 Asset Failed: expected RUL Copilot, got '${s1Asset.title}'`);
    }

    let s1Icebreaker = "";
    if (apiKey && apiKey !== "YOUR_GROQ_API_KEY_HERE") {
      s1Icebreaker = callGroqForIcebreaker({ ...s1Input, tier: s1Tier, asset: s1Asset }, apiKey);
      const wordCount = s1Icebreaker.trim().split(/\s+/).length;
      if (wordCount >= 60) {
        throw new Error(`Scenario 1 Word Count Failed: got ${wordCount} words (Limit: <60)`);
      }
      Logger.log(`[PASS] Scenario 1 Draft (${wordCount} words):\n"${s1Icebreaker}"`);
    } else {
      Logger.log("[WARN] Skipping Scenario 1 Live API call (API Key not configured).");
    }

    results.push({ test: "Scenario 1 (Employment / Tier 3 / IoT RUL Copilot)", status: "PASSED" });
  } catch (e) {
    results.push({ test: "Scenario 1 (Employment)", status: `FAILED: ${e.message}` });
  }

  // --------------------------------------------------------------------------
  // TEST SCENARIO 2 (Collaboration): Jane Smith, Data Scientist, DataStartup, CMI Alumni
  // --------------------------------------------------------------------------
  try {
    const s2Input = {
      name: "Jane Smith",
      role: "Data Scientist",
      company: "DataStartup",
      isAlumni: true,
      objective: "Collaboration"
    };

    const s2Tier = evaluateTier(s2Input.isAlumni, s2Input.role);
    const s2Asset = routeAsset(s2Input.role, s2Input.company);

    if (s2Tier !== "Tier 1") {
      throw new Error(`Scenario 2 Tier Failed: expected 'Tier 1', got '${s2Tier}'`);
    }
    if (!s2Asset.title.includes("Streamlit") && !s2Asset.title.includes("Data Applications")) {
      throw new Error(`Scenario 2 Asset Failed: expected Streamlit Apps, got '${s2Asset.title}'`);
    }

    let s2Icebreaker = "";
    if (apiKey && apiKey !== "YOUR_GROQ_API_KEY_HERE") {
      s2Icebreaker = callGroqForIcebreaker({ ...s2Input, tier: s2Tier, asset: s2Asset }, apiKey);
      const wordCount = s2Icebreaker.trim().split(/\s+/).length;
      if (wordCount >= 60) {
        throw new Error(`Scenario 2 Word Count Failed: got ${wordCount} words (Limit: <60)`);
      }
      const lower = s2Icebreaker.toLowerCase();
      if (!lower.includes("cmi") && !lower.includes("chennai mathematical institute")) {
        throw new Error("Scenario 2 Failed: Draft does not reference shared CMI connection.");
      }
      Logger.log(`[PASS] Scenario 2 Draft (${wordCount} words):\n"${s2Icebreaker}"`);
    } else {
      Logger.log("[WARN] Skipping Scenario 2 Live API call (API Key not configured).");
    }

    results.push({ test: "Scenario 2 (Collaboration / Tier 1 / CMI Alumni / Streamlit)", status: "PASSED" });
  } catch (e) {
    results.push({ test: "Scenario 2 (Collaboration)", status: `FAILED: ${e.message}` });
  }

  // --------------------------------------------------------------------------
  // TEST SCENARIO 3 (Edge Case: Operations / Logistics LP Models)
  // --------------------------------------------------------------------------
  try {
    const s3Asset = routeAsset("Operations Research Lead", "LogiCorp");
    if (!s3Asset.title.includes("Linear Programming")) {
      throw new Error(`Scenario 3 Asset Failed: expected Linear Programming, got '${s3Asset.title}'`);
    }
    results.push({ test: "Scenario 3 (Operations / Linear Programming Routing)", status: "PASSED" });
  } catch (e) {
    results.push({ test: "Scenario 3 (Operations)", status: `FAILED: ${e.message}` });
  }

  // Log and Display Results
  Logger.log("=== QA VERIFIER SUMMARY ===");
  results.forEach(r => Logger.log(`${r.test}: ${r.status}`));

  const allPassed = results.every(r => r.status === "PASSED");
  const message = results.map(r => `• ${r.test}: ${r.status}`).join("\n");

  if (typeof SpreadsheetApp !== "undefined" && SpreadsheetApp.getUi) {
    SpreadsheetApp.getUi().alert(
      allPassed ? "✅ All Verifier Tests Passed" : "❌ Verifier Test Failures",
      message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * ============================================================================
 * REST WEB APP API ENDPOINTS (For Antigravity Live Read / Write Integration)
 * ============================================================================
 */

/**
 * HTTP GET Endpoint: Reads rows from the Google Sheet and returns JSON.
 * Query Parameters:
 *   - action: "read_all" (default) | "read_pending" | "status"
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getActiveSheet();
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "read_all";

    if (action === "status") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "online",
        sheetName: sheet.getName(),
        totalRows: sheet.getLastRow(),
        groqModel: getGroqModel()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        count: 0,
        headers: [],
        rows: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const headers = sheet.getRange(1, 1, 1, 10).getValues()[0];
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 10).getValues();

    const formattedRows = [];
    for (let i = 0; i < dataRange.length; i++) {
      const row = dataRange[i];
      const rowIndex = i + 2; // 1-indexed Sheet row number
      const rowObj = {
        rowIndex: rowIndex,
        targetName: row[0],
        role: row[1],
        company: row[2],
        linkedInUrl: row[3],
        isCmiAlumni: row[4] === true || row[4] === "TRUE",
        networkingObjective: row[5] || "Employment",
        tier: row[6],
        recommendedAsset: row[7],
        icebreakerDraft: row[8],
        status: row[9] || ""
      };

      if (action === "read_pending") {
        const s = (rowObj.status || "").toLowerCase();
        if (s !== "generated" && s !== "sent" && (rowObj.targetName || rowObj.role || rowObj.company)) {
          formattedRows.push(rowObj);
        }
      } else {
        formattedRows.push(rowObj);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      count: formattedRows.length,
      headers: headers,
      rows: formattedRows
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * HTTP POST Endpoint: Updates cells / rows in the Google Sheet from Antigravity.
 * Expected JSON payload:
 *   - action: "update_row" | "batch_update" | "append_row"
 *   - data: { rowIndex: 2, tier: "Tier 1", recommendedAsset: "...", icebreakerDraft: "...", status: "Generated" }
 *     OR for batch: { action: "batch_update", rows: [ { rowIndex: 2, icebreakerDraft: "..." }, ... ] }
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getActiveSheet();
    
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Missing POST payload.");
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || "update_row";
    let updatedCount = 0;

    if (action === "update_row") {
      const item = payload.data || payload;
      if (!item.rowIndex || item.rowIndex < 2) {
        throw new Error("Invalid or missing 'rowIndex'. Must be >= 2.");
      }

      if (item.tier !== undefined) sheet.getRange(item.rowIndex, CONFIG.COLUMNS.TIER).setValue(item.tier);
      if (item.recommendedAsset !== undefined) sheet.getRange(item.rowIndex, CONFIG.COLUMNS.RECOMMENDED_ASSET).setValue(item.recommendedAsset);
      if (item.icebreakerDraft !== undefined) sheet.getRange(item.rowIndex, CONFIG.COLUMNS.ICEBREAKER_DRAFT).setValue(item.icebreakerDraft);
      if (item.status !== undefined) sheet.getRange(item.rowIndex, CONFIG.COLUMNS.STATUS).setValue(item.status);
      updatedCount = 1;

    } else if (action === "batch_update") {
      const rows = Array.isArray(payload.data) ? payload.data : (payload.rows || []);
      for (const item of rows) {
        if (!item.rowIndex || item.rowIndex < 2) continue;
        if (item.tier !== undefined) sheet.getRange(item.rowIndex, CONFIG.COLUMNS.TIER).setValue(item.tier);
        if (item.recommendedAsset !== undefined) sheet.getRange(item.rowIndex, CONFIG.COLUMNS.RECOMMENDED_ASSET).setValue(item.recommendedAsset);
        if (item.icebreakerDraft !== undefined) sheet.getRange(item.rowIndex, CONFIG.COLUMNS.ICEBREAKER_DRAFT).setValue(item.icebreakerDraft);
        if (item.status !== undefined) sheet.getRange(item.rowIndex, CONFIG.COLUMNS.STATUS).setValue(item.status);
        updatedCount++;
      }

    } else if (action === "append_row") {
      const item = payload.data || payload;
      const newRow = [
        item.targetName || "",
        item.role || "",
        item.company || "",
        item.linkedInUrl || "",
        item.isCmiAlumni === true,
        item.networkingObjective || "Employment",
        item.tier || "",
        item.recommendedAsset || "",
        item.icebreakerDraft || "",
        item.status || "Ready"
      ];
      sheet.appendRow(newRow);
      updatedCount = 1;

    } else {
      throw new Error(`Unsupported action: '${action}'`);
    }

    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      action: action,
      updatedCount: updatedCount,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
