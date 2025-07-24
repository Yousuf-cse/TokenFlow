# 🌱 TokenFlow — Optimize Prompts. Save Tokens. Protect the Planet.

**TokenFlow** is a privacy-first Chrome extension that rewrites your AI prompts *locally* before they’re sent to models like ChatGPT, Claude, or Gemini. Using **winkNLP** and semantic heuristics, it eliminates filler, sharpens clarity, and reduces token count—cutting down the environmental footprint of every interaction.

> ⚡ Run faster, cost less, and do good—without changing your workflow.

---

## 🚀 Features

- ✅ **Automatic Prompt Optimization**  
  Silently intercepts and rewrites your prompts with smarter, cleaner phrasing.

- ✅ **Shallow Semantic Compression**  
  Uses NLP (winkNLP) and in-browser heuristics to remove redundancy while preserving intent.

- ✅ **Instant Token Savings Feedback**  
  Get real-time stats on how many tokens you saved after every prompt.

- ✅ **Sensitive Data Masking**  
  Automatically masks API keys, passwords, and secrets with `****`.

- ✅ **Sustainability Impact Tracking**  
  Tracks estimated reductions in:  
  ⚡ Electricity (kWh)  
  💧 Water (litres)  
  🌍 Carbon (gCO₂)

- ✅ **Full Privacy. Zero APIs.**  
  All processing is done 100% locally inside the browser—no servers, no tracking.

- ✅ **Impact Dashboard**  
  View cumulative stats on your eco-savings over time.

---

## 📸 Demo

Coming soon 

---

## 🧠 How It Works

1. **Prompt Detection**  
   Listens for prompts on ChatGPT, Claude, Gemini, etc., without altering UI.

2. **In-Browser NLP Optimization**  
   Applies winkNLP and semantic heuristics to compress and clean the prompt.

3. **Token Comparison Engine**  
   Calculates the token difference between the original and optimized prompt.

4. **Toast Notification**  
   After sending, shows token savings and environmental impact.

5. **Dashboard Display**  
   Tracks total tokens saved, water and energy conserved, and CO₂ avoided.

---

## 🛠 Tech Stack

- **Browser**: Chrome Extension (Manifest V3)  
- **Language**: TypeScript  
- **Build Tool**: Vite  
- **UI**: Tailwind CSS v4.1 + [shadcn/ui](https://ui.shadcn.com)  
- **NLP Engine**: [winkNLP](https://winkjs.org)  
- **Storage**: Chrome Local Storage  
- **Runtime**: 100% offline, WASM-free (no model inference required)

---

## 🔐 Privacy First

TokenFlow processes everything **locally** inside your browser.  
No prompts are sent to external servers. No tracking. No analytics.  
Your data stays yours.

---

## 📆 Installation

> Chrome Web Store release coming soon!

To install manually:

```bash
# 1. Clone the repo
git clone https://github.com/Yousuf-cse/TokenFlow.git 
cd tokenflow

# 2. Install dependencies
pnpm install

# 3. Build the project
pnpm run build
```

Then:

1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `/dist` (or `/build`) folder

---

## 🧪 Use Cases

- 🧑‍💻 Developers avoiding prompt bloat in ChatGPT  
- 📵 Journalists working with sensitive data  
- 🧑‍⚖ Legal researchers prioritizing privacy  
- 🧑‍🏫 Educators and students learning sustainable AI  
- 🏢 Organizations measuring eco-impact from LLM usage  

---

## 🌍 Why TokenFlow?

Every LLM prompt consumes:

- ⚡ Electricity (to run models)
- 💧 Water (for data center cooling)
- 🌍 Carbon (indirect emissions)

Cutting just a few tokens per prompt—at scale—saves:

- Thousands of litres of water  
- Kilowatt-hours of electricity  
- Measurable CO₂ emissions

> TokenFlow helps you reduce compute load, improve model speed, and use AI more responsibly.

---

## 🧑‍💻 Authors

Built with care by the **TokenFlow Team**  
at the *HexaFalls Hackathon*, JIS University, 2025

- Yousuf Mallik 
- Sree Gopal Saha  
- Kartik Barman  
- Sushanta Ruidas

---

## 📄 License

MIT License  
Feel free to fork, improve, or build your own version. We encourage it!

---

## 💡 Contribute

Have ideas or want to add support for other LLMs (e.g., Mistral, Perplexity)?  
Open an issue or a PR — contributions are welcome!

---

## ⚠ Disclaimer

TokenFlow provides **estimated** impact metrics based on public LLM energy benchmarks.  
Actual values may vary depending on model, provider, and usage patterns.

---
