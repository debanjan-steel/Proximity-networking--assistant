import urllib.request
import json
import re

WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwO-EhNtP8TeisTBcJFPRATNvfN9Av4HHhIuDlP4rtzuy3OePylss6azoYrN4rs10sD/exec"

# Fetch current sheet data
req = urllib.request.Request(f"{WEB_APP_URL}?action=read_all", headers={"User-Agent": "Antigravity/1.0"})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode("utf-8"))

rows = data.get("rows", [])

# Beautiful, warm, genuine, human-like drafts with authentic gratitude (< 50 words each)
humanized_data = [
    {
        "rowIndex": 2,
        "targetName": "Arjun Sharma",
        "tier": "Tier 3",
        "recommendedAsset": "Predictive Maintenance RUL Copilot (CNN-Transformer)",
        "icebreakerDraft": "Hi Arjun, really admire your sensor telemetry work at Siemens Energy! As a CMI Data Science student exploring CNN-Transformer models for remaining useful life prediction, I'd be so grateful for 2 minutes of your thoughts on industrial sensor noise. Thanks so much for your time!",
        "status": "Generated"
    },
    {
        "rowIndex": 3,
        "targetName": "Priya Venkatesh",
        "tier": "Tier 1",
        "recommendedAsset": "CMI Data Science & Mathematical Modeling Foundation",
        "icebreakerDraft": "Hi Priya, wonderful to connect with a fellow CMI alumnus! Really inspired by your data science journey at Fractal. As I wrap up my coursework at CMI, I'd be truly grateful for 2 minutes of your advice on transitioning into client analytics. Thanks so much!",
        "status": "Generated"
    },
    {
        "rowIndex": 4,
        "targetName": "Marcus Vance",
        "tier": "Tier 3",
        "recommendedAsset": "Mathematical Optimization (Linear Programming Models)",
        "icebreakerDraft": "Hi Marcus, huge respect for your operations research engineering at Uber Freight! Coming from CMI with a focus on LP and MILP vehicle routing, I'd be incredibly grateful for 2 minutes of your perspective on handling dynamic dispatch constraints. Thanks so much for your time!",
        "status": "Generated"
    },
    {
        "rowIndex": 5,
        "targetName": "Dr. Elena Rostova",
        "tier": "Tier 3",
        "recommendedAsset": "Interactive Data Applications (Streamlit Deployments)",
        "icebreakerDraft": "Hi Dr. Elena, really admire your applied AI leadership at Bosch! As a CMI Data Science student prototyping interactive ML applications in Streamlit, I would be deeply grateful for 2 minutes of your perspective on bridging research models to production. Thank you for your time!",
        "status": "Generated"
    },
    {
        "rowIndex": 6,
        "targetName": "Rohan Nair",
        "tier": "Tier 2",
        "recommendedAsset": "Interactive Data Applications (Streamlit Deployments)",
        "icebreakerDraft": "Hi Rohan, love what Hasura is doing for data platforms! As a CMI Data Science student deploying interactive apps via Streamlit, I'd love to swap notes on reactive architectures and rapid prototyping toolchains if you're open to connecting. Really appreciate your time!",
        "status": "Generated"
    },
    {
        "rowIndex": 7,
        "targetName": "Ananya Deshmukh",
        "tier": "Tier 1",
        "recommendedAsset": "CMI Data Science & Mathematical Modeling Foundation",
        "icebreakerDraft": "Hi Ananya, wonderful to connect with a fellow CMI graduate! Hope you're doing great. Really inspiring to follow your data science work at Swiggy. I would be so grateful for 2 minutes of your perspective on transitioning from CMI to production teams. Thanks a million!",
        "status": "Generated"
    },
    {
        "rowIndex": 8,
        "targetName": "David K. Miller",
        "tier": "Tier 3",
        "recommendedAsset": "Mathematical Optimization (Linear Programming Models)",
        "icebreakerDraft": "Hi David, Maersk's global supply chain scale is truly remarkable. Drawing on my CMI Data Science training in linear programming and integer optimization, I'd be immensely grateful for 2 minutes of your thoughts on real-world vessel routing heuristics. Thank you so much for your time!",
        "status": "Generated"
    },
    {
        "rowIndex": 9,
        "targetName": "Siddharth Sen",
        "tier": "Tier 2",
        "recommendedAsset": "Interactive Data Applications (Streamlit Deployments)",
        "icebreakerDraft": "Hi Siddharth, huge fan of Postman's developer experience and tooling! As a CMI Data Science student building interactive Streamlit tools, I'd love to swap notes on API design and data workflows if you're open to a brief chat. Truly appreciate your time!",
        "status": "Generated"
    },
    {
        "rowIndex": 10,
        "targetName": "Vikramaditya Rao",
        "tier": "Tier 3",
        "recommendedAsset": "Predictive Maintenance RUL Copilot (CNN-Transformer)",
        "icebreakerDraft": "Hi Vikramaditya, GE's predictive maintenance capabilities have always been a benchmark for me. As a CMI Data Science student modeling sensor telemetry with CNN-Transformers, I'd be so grateful for 2 minutes of your architectural insights. Totally understand if you're busy—thank you!",
        "status": "Generated"
    },
    {
        "rowIndex": 11,
        "targetName": "Sneha Kulkarni",
        "tier": "Tier 1",
        "recommendedAsset": "CMI Data Science & Mathematical Modeling Foundation",
        "icebreakerDraft": "Hi Sneha, wonderful to connect with a fellow CMI alumnus! Huge congratulations on your research work at Microsoft. As a current CMI student exploring machine learning modeling, I'd be thrilled to exchange thoughts and follow your research journey. Thanks so much!",
        "status": "Generated"
    },
    {
        "rowIndex": 12,
        "targetName": "Carlos Mendoza",
        "tier": "Tier 2",
        "recommendedAsset": "Mathematical Optimization (Linear Programming Models)",
        "icebreakerDraft": "Hi Carlos, Amazon Robotics' automated fulfillment models are incredible! With a background in mathematical optimization at CMI, I'd be truly grateful for 2 minutes of your perspective on warehouse routing formulations. Totally understand your busy schedule—thanks so much for your time!",
        "status": "Generated"
    },
    {
        "rowIndex": 13,
        "targetName": "Neha Agarwal",
        "tier": "Tier 2",
        "recommendedAsset": "Interactive Data Applications (Streamlit Deployments)",
        "icebreakerDraft": "Hi Neha, really admire your product analytics work at Razorpay! As a CMI Data Science student deploying interactive prototypes in Streamlit, I'd love to swap notes on dashboard UX and metrics tracking if you're open to connecting. Thanks so much for your time!",
        "status": "Generated"
    },
    {
        "rowIndex": 14,
        "targetName": "Thomas Becker",
        "tier": "Tier 3",
        "recommendedAsset": "Predictive Maintenance RUL Copilot (CNN-Transformer)",
        "icebreakerDraft": "Hi Thomas, Tesla's telemetry engineering is truly groundbreaking. As a CMI Data Science student building CNN-Transformer architectures for high-frequency sensor streams, I would be so grateful for 2 minutes of your perspective on real-time signal processing. Thank you for your time and guidance!",
        "status": "Generated"
    },
    {
        "rowIndex": 15,
        "targetName": "Karthik Ramanathan",
        "tier": "Tier 1",
        "recommendedAsset": "Mathematical Optimization (Linear Programming Models)",
        "icebreakerDraft": "Hi Karthik, wonderful to connect with a fellow CMI alumnus! Following our math training at CMI, I've focused on linear programming and optimization modeling. I would be deeply grateful for 2 minutes of your thoughts on quantitative modeling in industry. Thanks so much!",
        "status": "Generated"
    },
    {
        "rowIndex": 16,
        "targetName": "Samantha Reed",
        "tier": "Tier 3",
        "recommendedAsset": "Mathematical Optimization (Linear Programming Models)",
        "icebreakerDraft": "Hi Samantha, Delhivery's routing network scale is remarkable! Coming from CMI Data Science with coursework in mixed-integer linear programming, I'd be immensely grateful for 2 minutes of your perspective on scaling vehicle dispatch algorithms. Thank you so much for your time!",
        "status": "Generated"
    },
    {
        "rowIndex": 17,
        "targetName": "Aditya Sundaram",
        "tier": "Tier 2",
        "recommendedAsset": "Interactive Data Applications (Streamlit Deployments)",
        "icebreakerDraft": "Hi Aditya, love what you're building across the Streamlit and Snowflake ecosystems! As a CMI Data Science student deploying interactive ML applications, I'd love to swap notes on reactive component design if you're open to connecting. Really appreciate your time!",
        "status": "Generated"
    },
    {
        "rowIndex": 18,
        "targetName": "Meera Iyer",
        "tier": "Tier 1",
        "recommendedAsset": "Interactive Data Applications (Streamlit Deployments)",
        "icebreakerDraft": "Hi Meera, great to connect with a fellow CMI graduate! Really inspired by your client solutions work at The Math Company. As I build interactive data apps in Streamlit, I'd be so grateful for 2 minutes of your advice on production modeling. Thanks so much!",
        "status": "Generated"
    },
    {
        "rowIndex": 19,
        "targetName": "Lukas Schneider",
        "tier": "Tier 2",
        "recommendedAsset": "Predictive Maintenance RUL Copilot (CNN-Transformer)",
        "icebreakerDraft": "Hi Lukas, ABB's industrial machinery systems are true engineering marvels! As a CMI Data Science student working on CNN-Transformer sensor telemetry for predictive maintenance, I'd be so grateful for 2 minutes of your feedback on equipment degradation modeling. Thanks so much!",
        "status": "Generated"
    },
    {
        "rowIndex": 20,
        "targetName": "Pooja Hegde",
        "tier": "Tier 2",
        "recommendedAsset": "Mathematical Optimization (Linear Programming Models)",
        "icebreakerDraft": "Hi Pooja, Flipkart's supply chain intelligence is truly inspiring. Drawing on my CMI Data Science background in linear programming and inventory optimization, I'd be so grateful for 2 minutes of your thoughts on fulfillment planning. Thank you so much for your time!",
        "status": "Generated"
    },
    {
        "rowIndex": 21,
        "targetName": "Gautam Mukherjee",
        "tier": "Tier 3",
        "recommendedAsset": "Interactive Data Applications (Streamlit Deployments)",
        "icebreakerDraft": "Hi Gautam, really admire your data engineering infrastructure at BrowserStack! As a CMI Data Science student building interactive Streamlit applications, I'd love to swap notes on frontend performance for data apps if you're open to connecting. Thanks so much for your time!",
        "status": "Generated"
    }
]

# Verify word count for every single draft (< 50 words)
for item in humanized_data:
    words = len(item["icebreakerDraft"].split())
    print(f"Row {item['rowIndex']} ({words} words) -> {item['targetName']}: {item['icebreakerDraft']}")
    assert words < 50, f"Row {item['rowIndex']} exceeded 50 words ({words} words)"

# POST batch updates back to the live Google Sheet Web App API
post_payload = json.dumps({"action": "batch_update", "data": humanized_data}).encode("utf-8")
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
