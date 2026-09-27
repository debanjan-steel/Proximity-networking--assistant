# QA Verification Plan & Acceptance Test Suite: Proximity Networking App (v0)

**Document Status:** Approved QA Verifier  
**Version:** 0.1  
**Role:** Lead QA Engineer  
**Target Specification:** `spec_v0.md`  
**Execution Environment:** Google Apps Script Unit Runner + Live Google Sheet Mock  

---

## 1. QA Objective & Test Scope
This document specifies the exact test harness, input fixtures, deterministic assertion rules, and LLM output evaluation criteria for the **Proximity Networking App**. Every candidate code implementation must pass 100% of these test scenarios before sign-off.

---

## 2. Test Execution Environment & Test Harness

### Environment Setup
1. **Host:** Google Sheets + Google Apps Script runtime (V8 engine).
2. **API Backend:** Groq API (`llama-3.3-70b-versatile` / OpenAI-compatible endpoint).
3. **API Key Injection:** Test environment uses secure script property `GROQ_API_KEY`.
4. **Execution Harness:** A standalone test runner function `runAllVerifierTests()` embedded in the script to programmatically assert states and log pass/fail status.

---

## 3. Core Test Scenarios & Pass/Fail States

### Test Scenario 1: Employment Objective (Senior IoT Manager / Tier 3)
* **Goal:** Verify that a senior external target triggers Tier 3 classification, maps to the RUL Copilot asset, and yields an outreach message asking for architectural feedback without direct job pleading.

#### Input Data Matrix
| Field | Value |
| :--- | :--- |
| `Target_Name` | `"John Doe"` |
| `Role` | `"Senior IoT Analytics Manager"` |
| `Company` | `"TechCorp"` |
| `LinkedIn_URL` | `"https://www.linkedin.com/in/johndoe-test"` |
| `Is_CMI_Alumni` | `FALSE` |
| `Networking_Objective` | `"Employment"` |

#### Expected Output & Pass/Fail Criteria
* [ ] **Tier Evaluation:** `Tier == "Tier 3"` *(Matches Senior/Manager keyword rule)*.
* [ ] **Asset Routing:** `Recommended_Asset` matches or contains `"Predictive Maintenance RUL Copilot"` *(Matches IoT keyword rule)*.
* [ ] **Word Count Constraint:** `WordCount(Icebreaker_Draft) < 60` words.
* [ ] **Message Hook:** Accurately references `"TechCorp"` and their work/context in IoT analytics.
* [ ] **Technical Bridge:** References the CNN-Transformer architecture or sensor telemetry project from CMI baseline.
* [ ] **Call to Action (CTA):** Ends with a low-friction request for brief feedback on architectural or modeling decisions (strictly avoids direct asks like *"Please refer me"* or *"Can I get a job?"*).
* [ ] **Row Status:** `Status == "Generated"`.

---

### Test Scenario 2: Collaboration Objective (CMI Alumni / Tier 1)
* **Goal:** Verify that a CMI alumnus triggers Tier 1 classification, leverages the shared academic hook, maps to Streamlit/interactive app deployments, and frames a lateral idea exchange.

#### Input Data Matrix
| Field | Value |
| :--- | :--- |
| `Target_Name` | `"Jane Smith"` |
| `Role` | `"Data Scientist"` |
| `Company` | `"DataStartup"` |
| `LinkedIn_URL` | `"https://www.linkedin.com/in/janesmith-test"` |
| `Is_CMI_Alumni` | `TRUE` |
| `Networking_Objective` | `"Collaboration"` |

#### Expected Output & Pass/Fail Criteria
* [ ] **Tier Evaluation:** `Tier == "Tier 1"` *(Triggered by `Is_CMI_Alumni == TRUE`)*.
* [ ] **Asset Routing:** `Recommended_Asset` matches or contains `"Interactive Data Applications (Streamlit)"` *(or relevant data science prototyping asset)*.
* [ ] **Word Count Constraint:** `WordCount(Icebreaker_Draft) < 60` words.
* [ ] **Alumni Hook:** Explicitly mentions the shared Chennai Mathematical Institute (CMI) connection in the opening sentence.
* [ ] **Lateral Synergy Angle:** Frames the outreach as a peer-level exchange of ideas around data app deployments, rapid prototyping, or model sharing.
* [ ] **Call to Action (CTA):** Low friction, conversational peer ask (e.g., swapping notes on deployment stacks).
* [ ] **Row Status:** `Status == "Generated"`.

---

## 4. Edge Cases & Guardrail Test Suite

| Test ID | Test Case Description | Input Vector | Expected Pass State |
| :--- | :--- | :--- | :--- |
| **TC-03** | **Sparse / Empty Role Info** | `Role: ""` or `"Unknown"`, `Company: "InnovateAI"`, `Alumni: FALSE` | Asset falls back to general CMI Data Science foundation; icebreaker drafts a warm question regarding their journey/transition into `InnovateAI` (<60 words). |
| **TC-04** | **Word Count Hard Ceiling** | Any generated candidate draft | Automated word count validator rejects any output $\ge 60$ words and re-prompts or trims safely. |
| **TC-05** | **Operations / Logistics Keyword Match** | `Role: "Operations Research Analyst"`, `Company: "LogiNext"`, `Objective: "Employment"` | Asset maps to **Mathematical Optimization & Linear Programming Models** (Tier 2/3 based on seniority). |
| **TC-06** | **API Failure / Missing Key Resiliency** | Invalid API Key or network disconnect | `Status` column reflects `"Error: [Specific Message]"`; script logs error without crashing remaining row iterations. |

---

## 5. Automated Verifier Assertion Suite (QA Test Runner Spec)

The codebase will include a dedicated test runner function (`runAllVerifierTests()`) validating the following assertion contract:

```javascript
// Verification Assertion Contract
function assertScenario(result, expected) {
  if (result.tier !== expected.tier) throw new Error(`Tier Mismatch: got ${result.tier}, expected ${expected.tier}`);
  if (!result.asset.includes(expected.assetKeyword)) throw new Error(`Asset Mismatch: got ${result.asset}`);
  
  const wordCount = result.icebreaker.trim().split(/\s+/).length;
  if (wordCount >= 60) throw new Error(`Word count exceeded: ${wordCount} words (Limit: 59)`);
  
  if (expected.mustIncludeHook && !result.icebreaker.toLowerCase().includes(expected.mustIncludeHook.toLowerCase())) {
    throw new Error(`Missing expected hook keyword: ${expected.mustIncludeHook}`);
  }
}
```

---

## 6. QA Sign-Off Criteria
Code generation will be marked **PASSED** when:
1. `runAllVerifierTests()` executes with 0 errors in Google Apps Script.
2. Both Test Scenario 1 and Test Scenario 2 complete in under 3.5 seconds with exact structural compliance.
3. Word count validator asserts strictly $< 60$ words across all permutations.
