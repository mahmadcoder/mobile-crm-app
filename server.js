const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Database initialized with realistic Mobile App Development Leads
let leads = [
  {
    id: "LEAD-101",
    name: "Kamran Shah",
    email: "kamran@quickbite.pk",
    phone: "+92 301 8492011",
    company: "QuickBite Logistics",
    source: "Meta Ads",
    metaAccount: "Ad Account #1 (Main Agency)",
    campaign: "AppDev_Founders_Q3",
    appType: "Cross-Platform (Flutter + Node.js)",
    budgetRange: "$12,000 - $18,000",
    stage: "qualified",
    qualityScore: 94,
    qualityTier: "high",
    assignedTo: "Ali (Senior Agent)",
    gclid: null,
    fbclid: "fb.1.171829102.AbCdEf123",
    capiStatus: {
      account1: { pixel: "Pixel-Main-01", status: "Sent (Lead)", timestamp: "2026-09-28 14:10" },
      account2: { pixel: "Pixel-Retarget-02", status: "Sent (Qualified)", timestamp: "2026-09-28 16:30" },
      account3: { pixel: "Pixel-Global-03", status: "Sent (Lead)", timestamp: "2026-09-28 14:10" }
    },
    googleOfflineStatus: null,
    callLogs: [
      { id: 1, agent: "Ali", outcome: "Connected - Pitch Made", note: "Founder has Figma ready. Wants Uber-eats style tracking. Scheduled scope call.", date: "2026-09-28 16:15" },
      { id: 2, agent: "Ali", outcome: "Call Scheduled", note: "Initial WhatsApp message acknowledged.", date: "2026-09-28 14:30" }
    ],
    reminders: [
      { id: 1, title: "Send formal proposal & tech stack estimation", due: "Today at 05:00 PM", status: "pending" }
    ],
    isDuplicate: false,
    createdAt: "2026-09-28 14:05"
  },
  {
    id: "LEAD-102",
    name: "David Miller",
    email: "david@payflowfintech.io",
    phone: "+1 415 882 1920",
    company: "PayFlow Technologies",
    source: "Google Ads",
    metaAccount: null,
    campaign: "US_Search_Hire_Flutter_Developers",
    appType: "Fintech Digital Wallet (iOS + Android)",
    budgetRange: "$25,000 - $40,000",
    stage: "proposal",
    qualityScore: 98,
    qualityTier: "high",
    assignedTo: "Sara (Sales Lead)",
    gclid: "Cj0KCQjwm5e5BhCBARIsAOU24FzX89_K1m9pLo",
    fbclid: null,
    capiStatus: null,
    googleOfflineStatus: {
      status: "Synced to Google Ads API",
      conversionName: "Qualified_Lead_Quote_Sent",
      conversionValue: "$25,000",
      timestamp: "2026-09-29 08:45"
    },
    callLogs: [
      { id: 1, agent: "Sara", outcome: "Connected - Deep Discovery", note: "Compliance requirements in California discussed. Prepared 3-tier milestones quote.", date: "2026-09-29 08:30" }
    ],
    reminders: [
      { id: 1, title: "Follow up on proposal review with CTO", due: "Tomorrow 10:00 AM", status: "pending" }
    ],
    isDuplicate: false,
    createdAt: "2026-09-29 07:15"
  },
  {
    id: "LEAD-103",
    name: "Zubair Ahmed",
    email: "zubair@estatehub.ae",
    phone: "+971 50 1234890",
    company: "EstateHub Dubai",
    source: "Website Form",
    metaAccount: null,
    campaign: "organic_seo_landing_page",
    appType: "Real Estate Property App",
    budgetRange: "$6,000 - $9,000",
    stage: "contacted",
    qualityScore: 78,
    qualityTier: "medium",
    assignedTo: "Ali (Senior Agent)",
    gclid: "Cj0KCQjw7ZOmBhD0ARIsAPTy1tZh28-W",
    fbclid: null,
    capiStatus: null,
    googleOfflineStatus: {
      status: "Synced (Form Lead)",
      conversionName: "Website_App_Lead",
      conversionValue: "$6,000",
      timestamp: "2026-09-29 06:10"
    },
    callLogs: [
      { id: 1, agent: "Ali", outcome: "No Answer", note: "Left WhatsApp intro note with agency app portfolio.", date: "2026-09-29 06:45" }
    ],
    reminders: [
      { id: 1, title: "Second call attempt via WhatsApp", due: "Today at 03:00 PM", status: "pending" }
    ],
    isDuplicate: false,
    createdAt: "2026-09-29 06:00"
  },
  {
    id: "LEAD-104",
    name: "Rashid Mahmood",
    email: "rashid.khan@gmail.com",
    phone: "+92 333 5519283",
    company: "GymFit Workout Tracker",
    source: "Meta Ads",
    metaAccount: "Ad Account #2 (Retargeting)",
    campaign: "MobileApp_Startup_Offers",
    appType: "Fitness Workout Log App",
    budgetRange: "$3,000 - $5,000",
    stage: "new",
    qualityScore: 65,
    qualityTier: "medium",
    assignedTo: "Ali (Senior Agent)",
    gclid: null,
    fbclid: "fb.1.171829999.XyZ890",
    capiStatus: {
      account1: { pixel: "Pixel-Main-01", status: "Sent (Lead)", timestamp: "2026-09-29 08:50" },
      account2: { pixel: "Pixel-Retarget-02", status: "Sent (Lead)", timestamp: "2026-09-29 08:50" }
    },
    googleOfflineStatus: null,
    callLogs: [],
    reminders: [
      { id: 1, title: "Urgent: First contact within 15 min", due: "Right Now", status: "urgent" }
    ],
    isDuplicate: false,
    createdAt: "2026-09-29 08:48"
  },
  {
    id: "LEAD-105",
    name: "Spam / Low Quality Inquirer",
    email: "freeapps123@yahoo.com",
    phone: "+92 300 0000000",
    company: "None (Bhai free me app bana do)",
    source: "Meta Ads",
    metaAccount: "Ad Account #1 (Main Agency)",
    campaign: "Broad_Mobile_App_Traffic",
    appType: "Wants game app like PUBG",
    budgetRange: "500 PKR / No Budget",
    stage: "disqualified",
    qualityScore: 10,
    qualityTier: "junk",
    assignedTo: "Unassigned",
    gclid: null,
    fbclid: "fb.1.99999999.FakeUser",
    capiStatus: {
      blocked: true,
      reason: "Conversion blocked by CRM AI Filter: Protected Ad Account #1, #2, #3 algorithms from learning low quality audience."
    },
    googleOfflineStatus: {
      blocked: true,
      reason: "Conversion NOT sent to Google Ads API"
    },
    callLogs: [
      { id: 1, agent: "System Auto-Filter", outcome: "Disqualified", note: "Fake phone number and unviable budget (500 PKR). Marked as Junk automatically.", date: "2026-09-29 07:00" }
    ],
    reminders: [],
    isDuplicate: false,
    createdAt: "2026-09-29 07:00"
  }
];

// Activity log stream for real-time audit
let activityLogs = [
  { id: 1, text: "Google Ads Offline Conversion synced for LEAD-102 (Value: $25,000, gclid: Cj0KCQ...)", time: "15 min ago", type: "google" },
  { id: 2, text: "Meta CAPI: 'Qualified' event dispatched across 3 Ad Accounts for Kamran Shah", time: "45 min ago", type: "meta" },
  { id: 3, text: "Algorithm Shield: Junk Lead-105 conversion suppressed to prevent bad ad learning", time: "2 hours ago", type: "shield" },
  { id: 4, text: "Round-robin assignment: LEAD-104 auto-routed to Senior Agent Ali", time: "3 hours ago", type: "system" }
];

// 3 Ad Accounts configuration status for client's Meta setup
const metaAccountsConfig = [
  { id: "act_10928374", name: "Agency Primary Ad Account", pixelId: "982374619283011", status: "Active & Connected (CAPI v19.0)", eventsSentToday: 14 },
  { id: "act_20918273", name: "High-Ticket Retargeting Account", pixelId: "472819028374611", status: "Active & Connected (CAPI v19.0)", eventsSentToday: 9 },
  { id: "act_30819284", name: "GCC & Global Outreach Account", pixelId: "847291039481723", status: "Active & Connected (CAPI v19.0)", eventsSentToday: 6 }
];

// Google Ads Integration status
const googleAdsConfig = {
  customerClientId: "839-291-0492",
  developerTokenStatus: "Approved (Production)",
  enhancedConversions: "Enabled (SHA-256 Hashing Active)",
  offlineUploadSchedule: "Real-time on Stage Change ('Qualified' / 'Won')",
  conversionsSyncedToday: 11
};

// Agents list for assignment
const agents = [
  { id: "ali", name: "Ali (Senior Agent)", active: true, leadsCount: 4 },
  { id: "sara", name: "Sara (Sales Lead)", active: true, leadsCount: 3 },
  { id: "hamza", name: "Hamza (App Consultant)", active: true, leadsCount: 2 }
];

// Helper: Normalize phone for duplicate detection
function normalizePhone(phone) {
  if (!phone) return "";
  return phone.replace(/[\s\-\(\)\+]/g, '').slice(-10);
}

// Helper: AI / Heuristic Lead Scoring for Mobile App Agency
function calculateQualityScore(leadData) {
  let score = 50;
  const budget = (leadData.budgetRange || "").toLowerCase();
  const phone = normalizePhone(leadData.phone);
  const desc = ((leadData.company || "") + " " + (leadData.appType || "")).toLowerCase();

  // Phone validation
  if (!phone || phone.length < 8 || /^0+$/.test(phone) || phone === "1234567890") {
    return { score: 10, tier: "junk", reason: "Invalid or dummy phone number" };
  }

  // Budget checks
  if (budget.includes("25,000") || budget.includes("15,000") || budget.includes("10,000") || budget.includes("$")) {
    score += 35;
  } else if (budget.includes("free") || budget.includes("500") || budget.includes("1000")) {
    score -= 40;
  }

  // App scope checks
  if (desc.includes("flutter") || desc.includes("ios") || desc.includes("react native") || desc.includes("fintech") || desc.includes("uber") || desc.includes("delivery") || desc.includes("portal")) {
    score += 15;
  }

  if (score < 30) return { score: Math.max(10, score), tier: "junk", reason: "Unqualified scope or unviable budget" };
  if (score >= 75) return { score: Math.min(99, score), tier: "high", reason: "High-ticket app project with clear scope & budget" };
  return { score: score, tier: "medium", reason: "Standard inquiry - needs phone qualification" };
}

// ---------------- REST API ROUTES ----------------

// 1. Get All Leads with optional filtering
app.get('/api/leads', (req, res) => {
  const { stage, source, quality, agent, search } = req.query;
  let filtered = [...leads];

  if (stage && stage !== 'all') {
    filtered = filtered.filter(l => l.stage === stage);
  }
  if (source && source !== 'all') {
    filtered = filtered.filter(l => l.source.toLowerCase().includes(source.toLowerCase()));
  }
  if (quality && quality !== 'all') {
    filtered = filtered.filter(l => l.qualityTier === quality);
  }
  if (agent && agent !== 'all') {
    filtered = filtered.filter(l => l.assignedTo.toLowerCase().includes(agent.toLowerCase()));
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(l => 
      l.name.toLowerCase().includes(s) || 
      l.phone.toLowerCase().includes(s) || 
      l.company.toLowerCase().includes(s) ||
      l.appType.toLowerCase().includes(s)
    );
  }

  res.json({ success: true, count: filtered.length, leads: filtered });
});

// 2. Overview Stats / KPIs
app.get('/api/stats', (req, res) => {
  const total = leads.length;
  const highQuality = leads.filter(l => l.qualityTier === 'high').length;
  const junkBlocked = leads.filter(l => l.qualityTier === 'junk').length;
  const duplicatesCaught = leads.filter(l => l.isDuplicate).length;
  const activePipelineValue = "$118,000";

  res.json({
    success: true,
    stats: {
      totalLeads: total,
      highQualityCount: highQuality,
      highQualityPercentage: total > 0 ? Math.round((highQuality / total) * 100) : 0,
      junkBlockedCount: junkBlocked,
      duplicatesCaught: duplicatesCaught,
      activePipelineValue,
      metaAccountsConnected: metaAccountsConfig.length,
      googleOfflineSyncedToday: googleAdsConfig.conversionsSyncedToday
    },
    metaAccounts: metaAccountsConfig,
    googleAds: googleAdsConfig,
    recentActivity: activityLogs.slice(0, 8)
  });
});

// Helper: Process Lead Ingestion with Duplicate Check, Quality Scoring, and Ad Sync
function processLeadIngestion(data, res) {
  const normPhone = normalizePhone(data.phone);

  // Duplicate Detection
  const existingLead = leads.find(l => normalizePhone(l.phone) === normPhone || (data.email && l.email.toLowerCase() === data.email.toLowerCase()));

  if (existingLead) {
    existingLead.isDuplicate = true;
    const note = `Duplicate submission received via ${data.source || 'Website'}. App Scope: ${data.appType || 'N/A'}`;
    existingLead.callLogs.unshift({
      id: Date.now(),
      agent: "System Duplicate Detector",
      outcome: "Duplicate Ingestion",
      note: note,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    });

    activityLogs.unshift({
      id: Date.now(),
      text: `Duplicate inquiry detected for ${existingLead.name} (${existingLead.phone}) - Merged into existing record.`,
      time: "Just now",
      type: "system"
    });

    return res.json({
      success: true,
      duplicateDetected: true,
      message: `Duplicate detected! Automatically merged with existing record (${existingLead.id} - ${existingLead.name}).`,
      lead: existingLead
    });
  }

  // Quality calculation
  const quality = calculateQualityScore(data);

  // Round-robin agent assignment
  const activeAgents = agents.filter(a => a.active);
  const assigned = activeAgents[leads.length % activeAgents.length].name;

  const newId = `LEAD-${100 + leads.length + 1}`;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  let capi = null;
  let googleOffline = null;

  // If High or Medium quality, simulate CAPI dispatch for Meta
  if (quality.tier !== 'junk') {
    if (data.source && data.source.includes("Meta")) {
      capi = {
        account1: { pixel: "Pixel-Main-01", status: "Sent (Lead)", timestamp: now },
        account2: { pixel: "Pixel-Retarget-02", status: "Sent (Lead)", timestamp: now },
        account3: { pixel: "Pixel-Global-03", status: "Sent (Lead)", timestamp: now }
      };
      activityLogs.unshift({
        id: Date.now(),
        text: `Meta CAPI 'Lead' event dispatched to 3 Ad Accounts for ${data.name}`,
        time: "Just now",
        type: "meta"
      });
    }

    if (data.gclid) {
      googleOffline = {
        status: "Queued for Offline Conversion API",
        conversionName: "Lead_Captured",
        timestamp: now
      };
      activityLogs.unshift({
        id: Date.now() + 1,
        text: `Google Ads gclid recorded (${data.gclid.slice(0, 14)}...) - Ready for Offline Conversion sync`,
        time: "Just now",
        type: "google"
      });
    }
  } else {
    capi = { blocked: true, reason: "Suppressed: Quality score below threshold. Algorithm protected from junk audience." };
    googleOffline = { blocked: true, reason: "Suppressed: Junk lead." };
    activityLogs.unshift({
      id: Date.now(),
      text: `Shield: Junk lead blocked from Meta CAPI & Google Offline sync (${data.name || 'Anonymous'})`,
      time: "Just now",
      type: "shield"
    });
  }

  const createdLead = {
    id: newId,
    name: data.name || "Anonymous Lead",
    email: data.email || "",
    phone: data.phone || "",
    company: data.company || "App Startup",
    source: data.source || "Website Form",
    metaAccount: data.source && data.source.includes("Meta") ? "Ad Account #1" : null,
    campaign: data.campaign || "Mobile_App_General",
    appType: data.appType || "Mobile Application",
    budgetRange: data.budgetRange || "$5,000 - $10,000",
    stage: quality.tier === 'junk' ? "disqualified" : "new",
    qualityScore: quality.score,
    qualityTier: quality.tier,
    assignedTo: quality.tier === 'junk' ? "Unassigned" : assigned,
    gclid: data.gclid || null,
    fbclid: data.fbclid || (data.source && data.source.includes("Meta") ? "fb.1." + Date.now() : null),
    capiStatus: capi,
    googleOfflineStatus: googleOffline,
    callLogs: quality.tier === 'junk' ? [
      { id: Date.now(), agent: "CRM Filter", outcome: "Disqualified", note: quality.reason, date: now }
    ] : [],
    reminders: quality.tier === 'junk' ? [] : [
      { id: Date.now(), title: "First follow-up call with lead", due: "Within 15 minutes", status: "urgent" }
    ],
    isDuplicate: false,
    createdAt: now
  };

  leads.unshift(createdLead);

  return res.status(201).json({
    success: true,
    duplicateDetected: false,
    message: "New lead captured and processed through quality engine!",
    lead: createdLead
  });
}

// 3. Create or Ingest Lead (Simulates Webhook / Form Submission with Duplicate & Quality Check)
app.post('/api/leads', (req, res) => {
  return processLeadIngestion(req.body, res);
});

// 4. Update Lead Stage (Triggers CAPI & Google Offline Conversion APIs)
app.put('/api/leads/:id/stage', (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;
  const lead = leads.find(l => l.id === id);

  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found" });
  }

  const oldStage = lead.stage;
  lead.stage = stage;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  let syncMessage = "";

  // Trigger Meta CAPI and Google Offline Conversions on milestone stages!
  if (stage === 'qualified' || stage === 'won') {
    const eventName = stage === 'won' ? 'Purchase_Deal_Closed' : 'Qualified_Lead_Scope_Approved';
    const value = stage === 'won' ? lead.budgetRange : "$10,000 (Estimated Value)";

    // Meta CAPI multi-account sync
    lead.capiStatus = {
      account1: { pixel: "Pixel-Main-01", status: `Sent (${eventName})`, timestamp: now },
      account2: { pixel: "Pixel-Retarget-02", status: `Sent (${eventName})`, timestamp: now },
      account3: { pixel: "Pixel-Global-03", status: `Sent (${eventName})`, timestamp: now }
    };

    activityLogs.unshift({
      id: Date.now(),
      text: `Meta CAPI [${eventName}] fired across all 3 Ad Accounts for ${lead.name}`,
      time: "Just now",
      type: "meta"
    });

    // Google Ads Offline Conversion API sync if gclid is present
    if (lead.gclid) {
      lead.googleOfflineStatus = {
        status: "Successfully Synced to Google Ads API",
        conversionName: eventName,
        conversionValue: value,
        gclid: lead.gclid,
        timestamp: now
      };
      googleAdsConfig.conversionsSyncedToday += 1;
      activityLogs.unshift({
        id: Date.now() + 1,
        text: `Google Ads Offline Conversion sent for gclid ${lead.gclid.slice(0, 15)}... (Stage: ${stage.toUpperCase()})`,
        time: "Just now",
        type: "google"
      });
    }

    syncMessage = `Stage updated to ${stage.toUpperCase()}. Meta CAPI (3 Ad Accounts) and Google Ads Offline Conversion synced in background!`;
  } else if (stage === 'disqualified') {
    lead.qualityTier = 'junk';
    lead.capiStatus = { blocked: true, reason: "Suppressed: Junk lead. Algorithm preserved." };
    lead.googleOfflineStatus = { blocked: true, reason: "Suppressed: Junk lead." };
    activityLogs.unshift({
      id: Date.now(),
      text: `Lead ${lead.id} (${lead.name}) marked as Junk. Ad conversions blocked.`,
      time: "Just now",
      type: "shield"
    });
    syncMessage = `Lead marked as Junk. Conversions suppressed from Meta & Google Ads.`;
  } else {
    syncMessage = `Stage changed from ${oldStage} to ${stage}.`;
  }

  res.json({ success: true, message: syncMessage, lead });
});

// 5. Add Call Log
app.post('/api/leads/:id/call-log', (req, res) => {
  const { id } = req.params;
  const { outcome, note, agent } = req.body;
  const lead = leads.find(l => l.id === id);

  if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const newCall = {
    id: Date.now(),
    agent: agent || "Ali (Agent)",
    outcome: outcome || "Connected",
    note: note || "Spoke with client regarding app scope.",
    date: now
  };

  lead.callLogs.unshift(newCall);
  res.json({ success: true, message: "Call logged successfully", callLog: newCall });
});

// 6. Add Reminder
app.post('/api/leads/:id/reminders', (req, res) => {
  const { id } = req.params;
  const { title, due } = req.body;
  const lead = leads.find(l => l.id === id);

  if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

  const newReminder = {
    id: Date.now(),
    title: title || "Follow up call",
    due: due || "Tomorrow 11:00 AM",
    status: "pending"
  };

  lead.reminders.unshift(newReminder);
  res.json({ success: true, message: "Reminder scheduled", reminder: newReminder });
});

// 7. Update Assignment
app.put('/api/leads/:id/assign', (req, res) => {
  const { id } = req.params;
  const { agent } = req.body;
  const lead = leads.find(l => l.id === id);
  if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

  lead.assignedTo = agent;
  res.json({ success: true, message: `Lead reassigned to ${agent}`, lead });
});

// 8. One-Click Simulation Endpoint (for Client Demo)
app.post('/api/simulate-preset', (req, res) => {
  const { type } = req.body;
  let presetData = {};

  if (type === 'meta_high_ticket') {
    presetData = {
      name: "Tariq Jameel",
      email: "tariq@ridehub.co",
      phone: "+92 321 8847192",
      company: "RideHub Cab Booking App",
      source: "Meta Ads",
      campaign: "Scale_AppDev_Founders_Q3",
      appType: "iOS + Android Ride Hailing App with Live GPS & Stripe",
      budgetRange: "$15,000 - $22,000",
      gclid: null
    };
  } else if (type === 'google_ads_lead') {
    presetData = {
      name: "Arthur Pendelton",
      email: "arthur@healthtrack.com",
      phone: "+1 650 928 3491",
      company: "HealthTrack Telemedicine",
      source: "Google Ads",
      campaign: "US_Keywords_Custom_App_Development",
      appType: "HIPAA Compliant Doctor Patient Video Calling App",
      budgetRange: "$20,000+",
      gclid: "Cj0KCQjwr_CgBhDYARIsAChi06G_" + Math.random().toString(36).substring(2, 9)
    };
  } else if (type === 'junk_lead') {
    presetData = {
      name: "Free Game Chahiye",
      email: "fakemail@no-domain.xyz",
      phone: "+92 300 1111111",
      company: "Koi company nahi hai",
      source: "Meta Ads",
      campaign: "Broad_Cheap_Clicks_Campaign",
      appType: "Bhai GTA 5 jesi mobile game bana do",
      budgetRange: "1000 PKR",
      gclid: null
    };
  } else if (type === 'duplicate_test') {
    presetData = {
      name: "Kamran Shah (Duplicate Attempt)",
      email: "kamran@quickbite.pk",
      phone: "+92 301 8492011",
      company: "QuickBite",
      source: "Website Form",
      campaign: "direct_website_contact",
      appType: "Follow up inquiry for my Flutter app",
      budgetRange: "$15,000",
      gclid: null
    };
  }

  // Trigger lead ingestion logic directly
  return processLeadIngestion(presetData, res);
});

// Start server only when run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Mobile App Agency Lead CRM Server running on port ${PORT}`);
    console.log(`👉 Open http://localhost:${PORT} in your browser for the demo`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
