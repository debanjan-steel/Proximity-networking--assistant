import re

with open("code.gs", "r", encoding="utf-8") as f:
    code = f.read()

old_block = """    lastError = `Groq API Error (${responseCode}): ${responseBody}`;

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
  }"""

new_block = """    lastError = `Groq API Error (${responseCode}): ${responseBody}`;

    // If model is not found (404), decommissioned/unsupported (400), or rate limited (429), gracefully try next model
    const isRateLimited = responseCode === 429 || responseBody.includes("rate_limit_exceeded") || responseBody.includes("Rate limit");
    const isModelUnavailable = responseCode === 404 || 
      (responseCode === 400 && (
        responseBody.includes("model_decommissioned") || 
        responseBody.includes("model_not_found") || 
        responseBody.includes("decommissioned") || 
        responseBody.includes("does not exist") ||
        responseBody.includes("not supported")
      ));

    if (isRateLimited) {
      Logger.log(`Model '${currentModel}' rate limited (429). Pausing 2.5s and switching to fallback model...`);
      Utilities.sleep(2500);
      continue;
    } else if (isModelUnavailable) {
      Logger.log(`Model '${currentModel}' unavailable (${responseCode}). Trying next fallback model...`);
      continue;
    } else {
      // If error is auth or other failure, throw immediately
      throw new Error(lastError);
    }
  }"""

code = code.replace(old_block, new_block)
code = code.replace("Utilities.sleep(400); // Rate-limiting buffer", "Utilities.sleep(1200); // Safe rate-limiting buffer")

with open("code.gs", "w", encoding="utf-8") as f:
    f.write(code)

print("code.gs successfully patched!")
