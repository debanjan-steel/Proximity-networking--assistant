"""
===============================================================================
Proximity Networking App - Google Sheet Antigravity Sync Client
===============================================================================
Allows Antigravity to directly read target contacts from your live Google Sheet,
process/summarize them in Antigravity chat, and push the outputs back to the Sheet.
===============================================================================
"""

import sys
import json
import argparse
import urllib.request
import urllib.parse

def check_status(web_app_url: str):
    url = f"{web_app_url}?action=status"
    req = urllib.request.Request(url, headers={"User-Agent": "Antigravity/1.0"})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        print(json.dumps(data, indent=2))
        return data

def read_sheet(web_app_url: str, only_pending: bool = False):
    action = "read_pending" if only_pending else "read_all"
    url = f"{web_app_url}?action={action}"
    req = urllib.request.Request(url, headers={"User-Agent": "Antigravity/1.0"})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        print(json.dumps(data, indent=2))
        return data

def update_row(web_app_url: str, row_index: int, draft: str = None, asset: str = None, tier: str = None, status: str = "Generated"):
    payload = {
        "action": "update_row",
        "data": {
            "rowIndex": row_index
        }
    }
    if draft is not None:
        payload["data"]["icebreakerDraft"] = draft
    if asset is not None:
        payload["data"]["recommendedAsset"] = asset
    if tier is not None:
        payload["data"]["tier"] = tier
    if status is not None:
        payload["data"]["status"] = status

    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        web_app_url,
        data=data_bytes,
        headers={"Content-Type": "application/json", "User-Agent": "Antigravity/1.0"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print(json.dumps(res, indent=2))
        return res

def batch_update(web_app_url: str, batch_file: str):
    with open(batch_file, "r", encoding="utf-8") as f:
        rows_data = json.load(f)

    payload = {
        "action": "batch_update",
        "data": rows_data if isinstance(rows_data, list) else rows_data.get("rows", [])
    }

    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        web_app_url,
        data=data_bytes,
        headers={"Content-Type": "application/json", "User-Agent": "Antigravity/1.0"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print(json.dumps(res, indent=2))
        return res

def main():
    parser = argparse.ArgumentParser(description="Antigravity Live Google Sheet Sync Tool")
    parser.add_argument("--url", required=True, help="Your deployed Google Apps Script Web App URL")
    parser.add_argument("--status", action="store_true", help="Check Web App connection status")
    parser.add_argument("--read", action="store_true", help="Read all rows from the Google Sheet")
    parser.add_argument("--read-pending", action="store_true", help="Read only rows with Pending / Ready status")
    parser.add_argument("--update-row", type=int, help="Target 1-indexed row number to update")
    parser.add_argument("--draft", help="Icebreaker draft text to write to Column I")
    parser.add_argument("--asset", help="Recommended Asset text to write to Column H")
    parser.add_argument("--tier", help="Tier classification (Tier 1 | Tier 2 | Tier 3) to write to Column G")
    parser.add_argument("--set-status", default="Generated", help="Status to write to Column J (default: Generated)")
    parser.add_argument("--batch-file", help="Path to JSON file containing array of row updates")

    args = parser.parse_args()

    if args.status:
        check_status(args.url)
    elif args.read:
        read_sheet(args.url, only_pending=False)
    elif args.read_pending:
        read_sheet(args.url, only_pending=True)
    elif args.update_row:
        update_row(args.url, args.update_row, draft=args.draft, asset=args.asset, tier=args.tier, status=args.set_status)
    elif args.batch_file:
        batch_update(args.url, args.batch_file)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
