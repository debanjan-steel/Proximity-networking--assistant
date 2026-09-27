import urllib.request
import json
import re

WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwO-EhNtP8TeisTBcJFPRATNvfN9Av4HHhIuDlP4rtzuy3OePylss6azoYrN4rs10sD/exec"

# 1. Fetch live rows from the Google Sheet
req = urllib.request.Request(f"{WEB_APP_URL}?action=read_all", headers={"User-Agent": "Antigravity/1.0"})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode("utf-8"))

rows = data.get("rows", [])
print(f"Total rows fetched: {len(rows)}")

# Icebreaker synthesis mapping for rows needing generation or retry
drafts = {
    13: (
        "Hi Neha, love Razorpay's product telemetry and developer platform! As a CMI Data Science student prototyping interactive analytics apps in Streamlit, I'd love to swap notes on full-stack data toolchains and dashboard UX if you're open to connecting.",
        "Tier 2",
        "Interactive Data Applications (Streamlit Deployments)"
    ),
    14: (
        "Hi Thomas, your telemetry & sensor architecture at Tesla is inspiring. With 2 years in Data Science at CMI, I built a CNN-Transformer predicting Remaining Useful Life on high-frequency sensor streams. Would love 2 mins of your perspective on sensor noise filtering.",
        "Tier 3",
        "Predictive Maintenance RUL Copilot (CNN-Transformer)"
    ),
    15: (
        "Hi Karthik, great to connect with a fellow CMI alumnus! Following our rigorous math and probability training at CMI, I've focused on complex Linear Programming and MILP formulations. Would value 2 mins of your brief perspective on quantitative optimization modeling.",
        "Tier 1",
        "Mathematical Optimization (Linear Programming Models)"
    ),
    16: (
        "Hi Samantha, Delhivery's fleet routing and dispatch scale is incredible. Drawing on my CMI Data Science coursework, I've formulated Mixed-Integer Linear Programming models for vehicle routing. Would value 2 mins of your thoughts on real-time routing optimization constraints.",
        "Tier 3",
        "Mathematical Optimization (Linear Programming Models)"
    ),
    17: (
        "Hi Aditya, love what you're building across the Streamlit and Snowflake ecosystems! As a CMI Data Science student deploying interactive ML web apps, I'd love to swap notes on reactive component architecture and cloud deployment if you're open to a brief chat.",
        "Tier 2",
        "Interactive Data Applications (Streamlit Deployments)"
    ),
    18: (
        "Hi Meera, wonderful to see a fellow CMI graduate driving data science solutions at The Math Company! I've been deploying end-to-end interactive analytics apps in Streamlit. Would love 2 mins of your perspective on scaling production client models.",
        "Tier 1",
        "Interactive Data Applications (Streamlit Deployments)"
    ),
    20: (
        "Hi Pooja, Flipkart's supply chain intelligence and fulfillment logistics set the standard. Coming from CMI Data Science with a focus on Linear Programming and MILP scheduling models, I would appreciate 2 mins of your perspective on inventory optimization decisions.",
        "Tier 2",
        "Mathematical Optimization (Linear Programming Models)"
    ),
    21: (
        "Hi Gautam, impressive work on BrowserStack's data engineering infrastructure! As a CMI Data Science student building interactive Streamlit apps, I'd love to swap notes on frontend performance for high-throughput analytics if you're open to connecting.",
        "Tier 3",
        "Interactive Data Applications (Streamlit Deployments)"
    )
}

updates = []
for row_idx, (draft, tier, asset) in drafts.items():
    words = len(draft.split())
    print(f"Row {row_idx} ({words} words) -> {draft}")
    assert words < 60, f"Row {row_idx} exceeded word limit ({words} words)"
    updates.append({
        "rowIndex": row_idx,
        "tier": tier,
        "recommendedAsset": asset,
        "icebreakerDraft": draft,
        "status": "Generated"
    })

# POST batch updates back to the live Google Sheet Web App API
post_payload = json.dumps({"action": "batch_update", "data": updates}).encode("utf-8")
post_req = urllib.request.Request(
    WEB_APP_URL,
    data=post_payload,
    headers={"Content-Type": "application/json", "User-Agent": "Antigravity/1.0"},
    method="POST"
)

with urllib.request.urlopen(post_req) as post_resp:
    res = json.loads(post_resp.read().decode("utf-8"))
    print("\nGoogle Sheet Update Response:")
    print(json.dumps(res, indent=2))
