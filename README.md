# LoopAI CRM — Mobile App Agency Lead Engine & Ad Shield

A modern, high-performance Lead Management CRM designed specifically for Mobile App Development Agencies. Features multi-source ingestion (Website forms, Meta Lead Ads, Google Ads), an intelligent Ad Algorithm Shield that filters junk leads, Meta Conversions API (CAPI) multi-account feedback, and Google Ads Offline Conversion sync.

Inspired by the LoopAI B2B SaaS CRM design on Dribbble.

---

## ✨ Key Features

1. **Multi-Channel Inbound Ingestion:**
   - Ingests leads from Website forms, Meta Lead Ads (instant forms), and Google Ads (Search/PMax).
   - Captures `gclid`, `fbclid`, UTM tags, and client project scope.

2. **Ad Algorithm Shield (The Junk Lead Protector):**
   - Automatically identifies unviable budgets and low-quality inquiries.
   - **Suppresses CAPI and Google Offline conversions for junk leads**, preventing ad network AI algorithms from training on bad audiences and saving client ad spend.

3. **High-Value Ad Conversion Feedback Loop:**
   - **Meta CAPI (v19.0):** Dispatches hashed events (`Lead`, `Qualified`, `Purchase`) across up to 3 Ad Accounts simultaneously.
   - **Google Offline Conversion API:** Matches `gclid` and uploads conversion actions and deal values ($10k - $25k) when leads reach milestone stages.

4. **Agency Pipeline & Stages:**
   - Responsive Kanban board: *New Inquiries → Contacted & Discovery → Qualified (Budget Fit) → Proposal Sent → Won / Deal Closed → Disqualified / Junk*.
   - Drag-and-drop or one-click stage moves.

5. **Duplicate Detection & Intelligence:**
   - Real-time normalization of phone numbers and email matching.
   - Merges duplicate inquiries into existing client histories to prevent double-calling.

6. **Role-Based Access (RBAC):**
   - **Super Admin:** Complete oversight, CAPI configuration, and team metrics.
   - **Sales Manager:** Team workload management and lead reassignment.
   - **Agent (Ali):** Focused assigned leads view, quick WhatsApp direct, and call logs.

7. **One-Click Live Simulation Menu:**
   - Easily test and demonstrate inbound Meta High-Ticket leads, Google Ads leads, Junk leads, and Duplicates during client pitches.

---

## 🚀 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/lead_generation_web.git
   cd lead_generation_web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## ⚡ Deploying on Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import this repository from GitHub.
4. Framework Preset: **Other** (Root directory: `./`).
5. Click **"Deploy"**.
6. Done! Your CRM will be live at `https://your-project.vercel.app`.
