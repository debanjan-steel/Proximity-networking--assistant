#!/usr/bin/env python3
"""
Antigravity Live Google Sheet Background Daemon
================================================
Monitors the Google Sheet via Apps Script Web App REST API.
Automatically detects pending rows, routes assets, generates warm human-like
gratitude-filled icebreaker drafts, and syncs results back to Google Sheet.
"""

import sys
import time
import json
import re
import urllib.request
import urllib.parse
from datetime import datetime

# Ensure utf-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwO-EhNtP8TeisTBcJFPRATNvfN9Av4HHhIuDlP4rtzuy3OePylss6azoYrN4rs10sD/exec"

ASSET_RUL = {
    "key": "ASSET_RUL",
    "title": "Predictive Maintenance RUL Copilot (CNN-Transformer)",
    "focus": "Hybrid CNN-Transformer architecture predicting Remaining Useful Life from high-frequency sensor telemetry",
    "regex": re.compile(r"iot|manufacturing|industrial|hardware|sensor|sensors|predictive|automotive|telemetry|time-?series|machinery|equipment", re.I)
}

ASSET_LP = {
    "key": "ASSET_LP",
    "title": "Mathematical Optimization (Linear Programming Models)",
    "focus": "Formulating and solving complex LP and Mixed-Integer Linear Programming models for logistics, routing, and operations research",
    "regex": re.compile(r"operations|logistics|strategy|supply chain|optimization|finance|routing|planning|operations research|inventory|procurement", re.I)
}

ASSET_STREAMLIT = {
    "key": "ASSET_STREAMLIT",
    "title": "Interactive Data Applications (Streamlit Deployments)",
    "focus": "Rapid end-to-end prototyping and cloud deployment of interactive data intelligence web apps using Streamlit and Python",
    "regex": re.compile(r"product|front-?end|engineering|app|deployment|platform|full-?stack|ui|ux|saas|startup|software|developer", re.I)
}

ASSET_FALLBACK = {
    "key": "ASSET_FALLBACK",
    "title": "CMI Data Science & Mathematical Modeling Foundation",
    "focus": "Rigorous mathematical modeling, probability, and machine learning foundation from Chennai Mathematical Institute",
    "regex": re.compile(r".*", re.I)
}

def route_asset(role, company):
    query = f"{role or ''} {company or ''}".lower()
    if ASSET_RUL["regex"].search(query):
        return ASSET_RUL
    if ASSET_LP["regex"].search(query):
        return ASSET_LP
    if ASSET_STREAMLIT["regex"].search(query):
        return ASSET_STREAMLIT
    return ASSET_FALLBACK

def evaluate_tier(is_alumni, role):
    if is_alumni in [True, "TRUE", "true", "True", 1, "1"]:
        return "Tier 1"
    role_str = (role or "").lower()
    t3_regex = re.compile(r"director|vp|vice president|head of|chief|cto|cdo|lead|principal|staff|partner|founder", re.I)
    if t3_regex.search(role_str):
        return "Tier 3"
    return "Tier 2"

from bulk_humanizer import generate_human_icebreaker as craft_human_icebreaker


def read_pending_rows(web_app_url):
    req = urllib.request.Request(
        f"{web_app_url}?action=read_pending",
        headers={"User-Agent": "Antigravity-SheetSync/2.0"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data.get("rows", [])

def batch_update_rows(web_app_url, updates):
    payload = json.dumps({"action": "batch_update", "rows": updates, "data": updates, "updates": updates}).encode("utf-8")
    req = urllib.request.Request(
        web_app_url,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "Antigravity-SheetSync/2.0"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def run_sync_cycle(web_app_url):
    try:
        pending_rows = read_pending_rows(web_app_url)
        if not pending_rows:
            return 0
        
        updates = []
        for r in pending_rows:
            row_idx = r["rowIndex"]
            name = r.get("targetName", "")
            role = r.get("role", "")
            company = r.get("company", "")
            is_alumni = r.get("isCmiAlumni", False)
            objective = r.get("networkingObjective", "Employment")
            
            if not name and not role and not company:
                continue
                
            tier = evaluate_tier(is_alumni, role)
            asset = route_asset(role, company)
            draft = craft_human_icebreaker(name, role, company, is_alumni, objective, asset)
            
            updates.append({
                "rowIndex": row_idx,
                "tier": tier,
                "recommendedAsset": asset["title"],
                "icebreakerDraft": draft,
                "status": "Generated"
            })
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Processed Row {row_idx} ({name} @ {company}) -> {len(draft.split())} words")
            
        if updates:
            res = batch_update_rows(web_app_url, updates)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Synced {len(updates)} row(s) to Sheet. Status: {res.get('status')}")
            return len(updates)
        return 0
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Sync Error: {e}", file=sys.stderr)
        return 0

def daemon_loop(web_app_url, poll_interval=8):
    print(f"Antigravity Sheet Daemon Started.")
    print(f"Monitoring Sheet: {web_app_url}")
    print(f"Polling Interval: {poll_interval}s\n")
    
    while True:
        try:
            run_sync_cycle(web_app_url)
        except KeyboardInterrupt:
            print("\nDaemon stopped by user.")
            break
        except Exception as e:
            print(f"Loop error: {e}", file=sys.stderr)
        time.sleep(poll_interval)

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else WEB_APP_URL
    daemon_loop(url)
