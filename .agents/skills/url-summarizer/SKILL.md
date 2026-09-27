---
name: url-summarizer
description: Analyzes and summarizes a given URL or technical document across 6 structured dimensions (core method, importance/usefulness, with vs. without comparison, real-world examples, beginner analogies, and alternatives). Use this skill whenever the user provides a URL and asks to summarize, analyze, or explain its contents or methodology.
---

# URL & Technical Method Summarizer

This skill guides the agent to fetch, analyze, and synthesize any technical webpage or documentation link into a structured, comprehensive, and beginner-friendly summary across 6 key pillars.

---

## Workflow Steps

### Step 1: Fetch Content
1. Use the `read_url_content` tool to fetch the text/markdown content from the target URL.
2. If the page requires dynamic JavaScript or browser rendering, use the browser subagent or fall back to targeted web search queries.

### Step 2: Analyze & Extract
Analyze the document to identify:
* The core technology, design pattern, architecture, or method being introduced.
* The primary problem it solves and why standard approaches fall short.
* Practical industrial/real-world applications.
* Competing alternatives and trade-offs.

### Step 3: Produce the 6-Pillar Summary
Format the output using clear Markdown headings, GitHub-style alerts, and succinct comparison tables. Follow the exact template below.

---

## Required Output Template

```markdown
# Summary: [Document Title or Topic Name]
**Source URL:** [URL]

---

### 1. Main Method Discussed
* Clearly describe the primary technique, concept, or tool in 2–4 concise paragraphs.
* Explain the core mechanism (how it works under the hood) in simple terms.

---

### 2. Importance & Usefulness
Highlight the key benefits:
* **Key Problem Solved:** What headache does this eliminate?
* **Core Value:** Efficiency, scalability, cost reduction, reliability, or developer experience.
* **Why Now:** Why this approach is relevant in modern workflows.

---

### 3. Capability Analysis: With vs. Without

| Dimension | With This Method | Without This Method |
| :--- | :--- | :--- |
| **Workflow Speed** | Automated, instant, or streamlined. | Manual, tedious, and repetitive. |
| **Error Rate / Risk** | Standardized, deterministic, guardrailed. | Prone to human error, drift, or oversight. |
| **Scalability** | Scales seamlessly across teams/systems. | Context bottlenecks; difficult to share. |
| **Maintenance** | Single source of truth / centralized. | Fragmented knowledge across silos. |

---

### 4. Real-World Power Examples
Provide 2–3 concrete, practical engineering or business scenarios:
* **Scenario A (Production/Enterprise):** How a team or company uses this in real life.
* **Scenario B (Day-to-day Developer Flow):** How this streamlines an individual's workflow with a brief code/config snippet where applicable.

---

### 5. Simple Analogies & Beginner-Friendly Examples
Explain the method so that anyone (even a complete beginner) can understand:
* 💡 **Everyday Analogy:** A relatable non-technical metaphor (e.g., recipe card, passport control, assembly line).
* 👶 **Beginner Code / Toy Example:** An ultra-simple 3-line before/after snippet demonstrating the contrast.

---

### 6. Alternatives & Selection Criteria

| Alternative Approach | How It Compares | Why Choose This Method Instead? |
| :--- | :--- | :--- |
| **[Alternative 1]** | Description of pros/cons | Reason to prefer current method |
| **[Alternative 2]** | Description of pros/cons | Reason to prefer current method |

**Conclusion / Decision Rule:** A 1–2 sentence rule of thumb on when to choose this method over the alternatives.
```
