/**
 * LoopAI CRM - Front-End Logic
 * Clean, Modern SaaS B2B Lead Engine & CAPI Integration
 */

// Global State
let allLeads = [];
let filteredLeads = [];
let currentRole = 'admin'; // 'admin' | 'manager' | 'agent'
let currentView = 'kanban'; // 'kanban' | 'table' | 'shield'
let selectedLead = null;

// Pipeline Stages Definition
const STAGES = [
  { id: 'new', label: 'New Inquiries', dot: 'dot-new', icon: 'fa-inbox' },
  { id: 'contacted', label: 'Contacted & Discovery', dot: 'dot-contacted', icon: 'fa-phone' },
  { id: 'qualified', label: 'Qualified (Budget Fit)', dot: 'dot-qualified', icon: 'fa-certificate' },
  { id: 'proposal', label: 'Proposal Sent', dot: 'dot-proposal', icon: 'fa-file-invoice-dollar' },
  { id: 'won', label: 'Won / Deal Closed', dot: 'dot-won', icon: 'fa-trophy' },
  { id: 'disqualified', label: 'Disqualified / Junk', dot: 'dot-disqualified', icon: 'fa-ban', isJunk: true }
];

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  fetchStats();
  fetchLeads();
  
  // Close dropdown when clicked outside
  document.addEventListener('click', (e) => {
    const simDropdown = document.querySelector('.dropdown');
    const simMenu = document.getElementById('simMenu');
    if (simDropdown && !simDropdown.contains(e.target)) {
      simMenu.classList.remove('show');
    }
  });
});

// ==========================================================================
// API Calls & Data Fetching
// ==========================================================================

async function fetchLeads() {
  try {
    const res = await fetch('/api/leads');
    const data = await res.json();
    if (data.success) {
      allLeads = data.leads;
      applyFilters();
    }
  } catch (err) {
    showToast('Error', 'Unable to fetch leads from server.', 'danger');
  }
}

async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.success) {
      renderStats(data.stats);
      renderIntegrationsModal(data.metaAccounts, data.googleAds);
      renderActivityFeed(data.recentActivity);
    }
  } catch (err) {
    console.error('Stats error:', err);
  }
}

function renderStats(stats) {
  document.getElementById('statTotalLeads').textContent = stats.totalLeads;
  document.getElementById('statQualityRate').textContent = `${stats.highQualityPercentage}%`;
  document.getElementById('statJunkBlocked').textContent = `${stats.junkBlockedCount} Blocked`;
  
  const sidebarBadge = document.getElementById('sidebarTotalBadge');
  if (sidebarBadge) sidebarBadge.textContent = stats.totalLeads;
}

function renderIntegrationsModal(metaAccounts, googleAds) {
  const metaContainer = document.getElementById('metaAccountsList');
  if (metaContainer && metaAccounts) {
    metaContainer.innerHTML = metaAccounts.map((acct, idx) => `
      <div style="background: #f8f9fb; border: 1px solid var(--border-light); border-radius: 8px; padding: 0.85rem; font-size: 0.8rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.25rem;">
          <strong style="color: var(--text-primary);">Account #${idx + 1}: ${acct.name}</strong>
          <span style="font-size: 0.68rem; font-weight: 700; color: #4338ca; background: #e0e7ff; padding: 0.1rem 0.4rem; border-radius: 4px;">Active</span>
        </div>
        <div style="color: var(--text-muted); font-size: 0.74rem;">Pixel ID: ${acct.pixelId}</div>
        <div style="color: var(--text-muted); font-size: 0.74rem; margin-top: 0.15rem;">Events Today: <strong>${acct.eventsSentToday} events</strong></div>
        <div style="font-size: 0.72rem; color: #027a48; margin-top: 0.35rem; font-weight: 500;">
          <i class="fa-solid fa-check"></i> Junk leads suppressed automatically
        </div>
      </div>
    `).join('');
  }

  const googleContainer = document.getElementById('googleAdsConfigCard');
  if (googleContainer && googleAds) {
    googleContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.4rem;">
        <strong style="color: var(--text-primary);">Customer ID: ${googleAds.customerClientId}</strong>
        <span style="font-size: 0.68rem; font-weight: 700; color: #b54708; background: #fef0c7; padding: 0.1rem 0.4rem; border-radius: 4px;">Connected</span>
      </div>
      <div style="color: var(--text-secondary); margin-bottom: 0.2rem;"><strong>Developer Token:</strong> ${googleAds.developerTokenStatus}</div>
      <div style="color: var(--text-secondary); margin-bottom: 0.2rem;"><strong>Enhanced Conversions:</strong> ${googleAds.enhancedConversions}</div>
      <div style="color: var(--text-secondary); margin-bottom: 0.2rem;"><strong>Offline Upload Trigger:</strong> Real-time on 'Qualified' / 'Won'</div>
      <div style="color: #027a48; font-weight: 600; margin-top: 0.3rem;">Total Conversions Synced: ${googleAds.conversionsSyncedToday} (gclid tracked)</div>
    `;
  }
}

function renderActivityFeed(activities) {
  const feed = document.getElementById('liveActivityFeed');
  if (!feed || !activities) return;

  feed.innerHTML = activities.map(act => `
    <div style="background: #ffffff; border: 1px solid var(--border-light); padding: 0.7rem 0.85rem; border-radius: 6px; font-size: 0.78rem; display: flex; align-items: flex-start; gap: 0.5rem; box-shadow: var(--shadow-xs);">
      <i class="fa-solid fa-circle-check" style="color: #4f46e5; margin-top: 2px;"></i>
      <div style="flex-grow: 1;">
        <div style="color: var(--text-primary); font-weight: 500;">${act.text}</div>
        <div style="font-size: 0.7rem; color: var(--text-tertiary); margin-top: 0.15rem;">${act.time}</div>
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// Views & Filtering
// ==========================================================================

function switchView(viewName) {
  currentView = viewName;

  // Update Toolbar pills
  document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  document.getElementById('kanbanView').style.display = 'none';
  document.getElementById('tableView').style.display = 'none';
  document.getElementById('shieldView').style.display = 'none';

  if (viewName === 'kanban') {
    document.getElementById('tabKanban')?.classList.add('active');
    document.getElementById('navKanban')?.classList.add('active');
    document.getElementById('kanbanView').style.display = 'block';
    renderKanban();
  } else if (viewName === 'table') {
    document.getElementById('tabTable')?.classList.add('active');
    document.getElementById('navTable')?.classList.add('active');
    document.getElementById('tableView').style.display = 'block';
    renderTable();
  } else if (viewName === 'shield') {
    document.getElementById('tabShield')?.classList.add('active');
    document.getElementById('navShield')?.classList.add('active');
    document.getElementById('shieldView').style.display = 'block';
    fetchStats();
  }
}

function switchRole(role) {
  currentRole = role;
  const avatar = document.getElementById('sidebarAvatar');
  const userName = document.getElementById('sidebarUserName');
  const banner = document.getElementById('roleContextBanner');
  const bannerText = document.getElementById('roleContextText');

  if (role === 'agent') {
    if (avatar) avatar.textContent = 'AA';
    if (userName) userName.textContent = 'Agent (Ali)';
    if (banner) {
      banner.style.display = 'flex';
      bannerText.innerHTML = `<strong>Agent View Active:</strong> Showing leads assigned to Senior Agent Ali. Quick dialer and call logging enabled.`;
    }
    showToast('Agent View', 'Showing assigned leads for Ali.', 'info');
  } else if (role === 'manager') {
    if (avatar) avatar.textContent = 'FM';
    if (userName) userName.textContent = 'Manager (Fahad)';
    if (banner) {
      banner.style.display = 'flex';
      bannerText.innerHTML = `<strong>Sales Manager View:</strong> You have full oversight over all team members (Ali, Sara, Hamza) and lead reassignment controls.`;
    }
    showToast('Manager View', 'Team oversight mode activated.', 'info');
  } else {
    if (avatar) avatar.textContent = 'SA';
    if (userName) userName.textContent = 'Super Admin';
    if (banner) banner.style.display = 'none';
    showToast('Super Admin', 'Full system access & CAPI API configuration active.', 'purple');
  }

  applyFilters();
}

function applyFilters() {
  const searchVal = document.getElementById('searchInput').value.toLowerCase().trim();
  const sourceVal = document.getElementById('sourceFilter').value;
  const qualityVal = document.getElementById('qualityFilter').value;
  const agentVal = document.getElementById('agentFilter').value;

  filteredLeads = allLeads.filter(lead => {
    // Role filter
    if (currentRole === 'agent' && !lead.assignedTo.includes('Ali') && lead.stage !== 'disqualified') {
      return false;
    }

    // Search filter
    if (searchVal) {
      const match = lead.name.toLowerCase().includes(searchVal) ||
                    lead.phone.toLowerCase().includes(searchVal) ||
                    lead.company.toLowerCase().includes(searchVal) ||
                    lead.appType.toLowerCase().includes(searchVal);
      if (!match) return false;
    }

    // Source filter
    if (sourceVal !== 'all' && !lead.source.includes(sourceVal)) {
      return false;
    }

    // Quality filter
    if (qualityVal !== 'all' && lead.qualityTier !== qualityVal) {
      return false;
    }

    // Agent dropdown filter (when in Admin/Manager)
    if (agentVal !== 'all' && !lead.assignedTo.includes(agentVal)) {
      return false;
    }

    return true;
  });

  if (currentView === 'kanban') {
    renderKanban();
  } else if (currentView === 'table') {
    renderTable();
  }
}

function handleSearch(val) {
  const clearBtn = document.getElementById('searchClearBtn');
  clearBtn.style.display = val ? 'block' : 'none';
  applyFilters();
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  input.value = '';
  document.getElementById('searchClearBtn').style.display = 'none';
  applyFilters();
}

// ==========================================================================
// Kanban Pipeline Renderer (LoopAI Clean Style)
// ==========================================================================

function renderKanban() {
  const board = document.getElementById('kanbanBoard');
  board.innerHTML = '';

  STAGES.forEach(stage => {
    const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
    const colEl = document.createElement('div');
    colEl.className = `kanban-col ${stage.isJunk ? 'col-disqualified' : ''}`;
    colEl.dataset.stageId = stage.id;

    // Drag-over handlers
    colEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      colEl.style.borderColor = '#6366f1';
    });
    colEl.addEventListener('dragleave', () => {
      colEl.style.borderColor = '';
    });
    colEl.addEventListener('drop', (e) => {
      e.preventDefault();
      colEl.style.borderColor = '';
      const leadId = e.dataTransfer.getData('text/plain');
      if (leadId) {
        updateLeadStage(leadId, stage.id);
      }
    });

    colEl.innerHTML = `
      <div class="col-header">
        <div class="col-header-left">
          <span class="col-dot ${stage.dot}"></span>
          <span class="col-name">${stage.label}</span>
        </div>
        <span class="col-badge">${stageLeads.length}</span>
      </div>
      <div class="cards-stack" id="col-${stage.id}">
        ${stageLeads.length === 0 ? '<div style="text-align:center; padding:2rem 1rem; font-size:0.75rem; color:var(--text-tertiary);">No leads in this stage</div>' : ''}
      </div>
    `;

    const cardsContainer = colEl.querySelector(`#col-${stage.id}`);
    stageLeads.forEach(lead => {
      const card = createLeadCard(lead);
      cardsContainer.appendChild(card);
    });

    board.appendChild(colEl);
  });
}

function createLeadCard(lead) {
  const card = document.createElement('div');
  card.className = `lead-card ${lead.qualityTier === 'junk' ? 'card-junk' : (lead.qualityTier === 'high' ? 'card-high' : '')}`;
  card.draggable = true;

  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', lead.id);
    card.style.opacity = '0.5';
  });
  card.addEventListener('dragend', () => {
    card.style.opacity = '1';
  });

  card.addEventListener('click', (e) => {
    if (!e.target.closest('button')) {
      openLeadDrawer(lead.id);
    }
  });

  // Source Icon
  let sourceIcon = 'fa-globe';
  if (lead.source.includes('Meta')) { sourceIcon = 'fa-brands fa-meta'; }
  else if (lead.source.includes('Google')) { sourceIcon = 'fa-brands fa-google'; }

  // Quality Tag
  let qualityBadge = `<span class="pill-intent pill-intent-${lead.qualityTier}">${lead.qualityScore}% Intent</span>`;
  if (lead.qualityTier === 'junk') {
    qualityBadge = `<span class="pill-intent pill-intent-junk"><i class="fa-solid fa-shield"></i> Blocked</span>`;
  }

  // Conversion badge
  let convBadge = '';
  if (lead.qualityTier === 'junk') {
    convBadge = `<span class="card-conv-tag tag-blocked" title="Shield active: 0 conversion sent to Meta/Google"><i class="fa-solid fa-ban"></i> CAPI Blocked</span>`;
  } else if (lead.stage === 'qualified' || lead.stage === 'won') {
    convBadge = `<span class="card-conv-tag tag-synced" title="Meta CAPI (3 Accts) & Google Offline Synced"><i class="fa-solid fa-bolt"></i> CAPI Synced</span>`;
  }

  card.innerHTML = `
    <div class="card-row-top">
      <div style="display:flex; align-items:center; gap:0.35rem;">
        <span class="card-id-text">${lead.id}</span>
        ${lead.isDuplicate ? `<span class="pill-intent pill-intent-medium"><i class="fa-solid fa-clone"></i> Dup</span>` : ''}
      </div>
      ${qualityBadge}
    </div>

    <div>
      <div class="card-client-title">${escapeHtml(lead.name)}</div>
      <div class="card-client-company">${escapeHtml(lead.company)}</div>
    </div>

    <div class="card-app-scope">
      <i class="fa-solid fa-mobile-screen"></i>
      <span>${escapeHtml(lead.appType)}</span>
    </div>

    <div class="card-budget-row">
      <span class="card-budget">${lead.budgetRange}</span>
      <span class="card-source"><i class="${sourceIcon}"></i> ${lead.source}</span>
    </div>

    <div class="card-footer-row">
      <div class="card-agent-badge">
        <div class="card-agent-avatar">${lead.assignedTo.charAt(0)}</div>
        <span>${lead.assignedTo.split(' ')[0]}</span>
      </div>
      <div style="display:flex; align-items:center; gap:0.35rem;">
        ${convBadge}
        <button class="btn btn-xs btn-white" title="Move Stage" onclick="event.stopPropagation(); promptQuickMove('${lead.id}')">
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `;

  return card;
}

// Quick Move to Next Stage
function promptQuickMove(leadId) {
  const lead = allLeads.find(l => l.id === leadId);
  if (!lead) return;

  const order = ['new', 'contacted', 'qualified', 'proposal', 'won'];
  const currentIndex = order.indexOf(lead.stage);
  if (currentIndex >= 0 && currentIndex < order.length - 1) {
    const nextStage = order[currentIndex + 1];
    updateLeadStage(leadId, nextStage);
  } else if (lead.stage === 'disqualified') {
    updateLeadStage(leadId, 'new');
  } else {
    updateLeadStage(leadId, 'won');
  }
}

// ==========================================================================
// Table View Renderer
// ==========================================================================

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const countBadge = document.getElementById('tableCountBadge');
  countBadge.textContent = `Showing ${filteredLeads.length} leads`;
  tbody.innerHTML = '';

  if (filteredLeads.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:2rem; color:var(--text-tertiary);">No leads matching the criteria.</td></tr>`;
    return;
  }

  filteredLeads.forEach(lead => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.onclick = (e) => {
      if (!e.target.closest('button') && !e.target.closest('select')) {
        openLeadDrawer(lead.id);
      }
    };

    let capiSummary = `<span style="color:#b42318; font-size:0.75rem;"><i class="fa-solid fa-ban"></i> Blocked (Junk)</span>`;
    if (lead.capiStatus && !lead.capiStatus.blocked) {
      capiSummary = `<span style="color:#027a48; font-size:0.75rem; font-weight:600;"><i class="fa-solid fa-check"></i> Synced (3 Accts)</span>`;
    }

    let googleSummary = `<span style="color:var(--text-tertiary); font-size:0.75rem;">N/A (No gclid)</span>`;
    if (lead.googleOfflineStatus) {
      if (lead.googleOfflineStatus.blocked) {
        googleSummary = `<span style="color:#b42318; font-size:0.75rem;"><i class="fa-solid fa-ban"></i> Blocked</span>`;
      } else {
        googleSummary = `<span style="color:#b54708; font-size:0.75rem; font-weight:600;"><i class="fa-solid fa-check"></i> ${lead.googleOfflineStatus.status}</span>`;
      }
    }

    tr.innerHTML = `
      <td>
        <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(lead.name)}</div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${lead.phone} • ${lead.id}</div>
      </td>
      <td>
        <div style="color:#3538cd; font-weight:500;">${escapeHtml(lead.appType)}</div>
      </td>
      <td>
        <strong style="color:#027a48;">${lead.budgetRange}</strong>
      </td>
      <td>
        <div><strong>${lead.source}</strong></div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${lead.campaign || 'Direct'}</div>
      </td>
      <td>
        <span class="pill-intent pill-intent-${lead.qualityTier}">${lead.qualityScore}% Intent</span>
      </td>
      <td>
        <select class="clean-input" style="padding:0.25rem 0.5rem; font-size:0.75rem; width:auto;" onchange="updateLeadStage('${lead.id}', this.value)" onclick="event.stopPropagation()">
          ${STAGES.map(s => `<option value="${s.id}" ${lead.stage === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
        </select>
      </td>
      <td>${capiSummary}</td>
      <td>${googleSummary}</td>
      <td><span style="font-size:0.78rem;">${lead.assignedTo.split(' ')[0]}</span></td>
      <td>
        <button class="btn btn-xs btn-white" onclick="openLeadDrawer('${lead.id}')">
          <i class="fa-solid fa-eye"></i> View
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================================================
// Lead Detail Drawer
// ==========================================================================

function openLeadDrawer(leadId) {
  const lead = allLeads.find(l => l.id === leadId);
  if (!lead) return;
  selectedLead = lead;

  document.getElementById('drawerLeadId').textContent = lead.id;
  document.getElementById('drawerLeadName').textContent = lead.name;
  document.getElementById('drawerLeadCompany').textContent = `${lead.company} • ${lead.phone} • ${lead.email || 'No email'}`;
  
  // Quick links
  document.getElementById('drawerPhoneBtn').href = `tel:${lead.phone}`;
  document.getElementById('drawerWhatsAppBtn').href = `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(lead.name)},%20this%20is%20regarding%20your%20mobile%20app%20inquiry.`;

  // Stage select
  document.getElementById('drawerStageSelect').value = lead.stage;

  // App Project Scope
  document.getElementById('drawerAppType').textContent = lead.appType;
  document.getElementById('drawerBudget').textContent = lead.budgetRange;
  document.getElementById('drawerSource').textContent = `${lead.source} (${lead.campaign || 'Direct'})`;
  document.getElementById('drawerQuality').textContent = `${lead.qualityScore}% (${lead.qualityTier.toUpperCase()} INTENT)`;

  // Assignee
  document.getElementById('drawerAssignedTo').textContent = lead.assignedTo;

  // Ad Tracking Details
  renderDrawerAdTracking(lead);

  // Call Logs & Reminders
  renderDrawerCallLogs(lead);
  renderDrawerReminders(lead);

  // Open Drawer
  document.getElementById('drawerOverlay').classList.add('open');
  document.getElementById('leadDrawer').classList.add('open');
}

function closeLeadDrawer() {
  document.getElementById('drawerOverlay').classList.remove('open');
  document.getElementById('leadDrawer').classList.remove('open');
  selectedLead = null;
}

function renderDrawerAdTracking(lead) {
  const container = document.getElementById('drawerAdDetails');
  
  if (lead.qualityTier === 'junk') {
    container.innerHTML = `
      <div style="background: #fef3f2; border: 1px solid #fecdca; padding: 0.75rem; border-radius: 6px;">
        <strong style="color: #b42318; font-size: 0.8rem; display: flex; align-items: center; gap: 0.35rem;">
          <i class="fa-solid fa-shield-halved"></i> Ad Algorithm Shield Active
        </strong>
        <p style="font-size: 0.75rem; color: #475467; margin-top: 0.25rem; line-height: 1.4;">
          This lead was flagged as low quality/unviable. <strong>No conversion was fired to Meta or Google.</strong> Your ad algorithm will NOT target similar users!
        </p>
      </div>
    `;
    return;
  }

  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8f9fb; border:1px solid #eaecf0; padding:0.65rem 0.75rem; border-radius:6px;">
      <div>
        <strong style="font-size:0.8rem; color:var(--text-primary);"><i class="fa-brands fa-meta" style="color:#4f46e5;"></i> Meta CAPI (3 Ad Accounts)</strong>
        <div style="font-size:0.72rem; color:var(--text-muted);">Hashed with SHA-256 (phone/email)</div>
      </div>
      <span class="card-conv-tag tag-synced">Synced (v19.0)</span>
    </div>
  `;

  if (lead.gclid) {
    html += `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#f8f9fb; border:1px solid #eaecf0; padding:0.65rem 0.75rem; border-radius:6px;">
        <div>
          <strong style="font-size:0.8rem; color:var(--text-primary);"><i class="fa-brands fa-google" style="color:#ea4335;"></i> Google Offline Conversion</strong>
          <div style="font-size:0.72rem; font-family:var(--font-mono); color:#175cd3;">gclid: ${lead.gclid.slice(0, 20)}...</div>
        </div>
        <span class="card-conv-tag tag-synced">${lead.googleOfflineStatus ? lead.googleOfflineStatus.status : 'Ready to Sync'}</span>
      </div>
    `;
  }

  container.innerHTML = html;
}

function renderDrawerCallLogs(lead) {
  const container = document.getElementById('drawerCallLogs');
  if (!lead.callLogs || lead.callLogs.length === 0) {
    container.innerHTML = `<div style="font-size:0.75rem; color:var(--text-tertiary); text-align:center; padding:0.5rem;">No call logs recorded yet.</div>`;
    return;
  }

  container.innerHTML = lead.callLogs.map(call => `
    <div style="background:#f8f9fb; border:1px solid #eaecf0; padding:0.65rem 0.75rem; border-radius:6px; font-size:0.78rem;">
      <div style="display:flex; justify-content:space-between; margin-bottom:0.2rem;">
        <span style="font-weight:600; color:#3538cd;"><i class="fa-solid fa-headset"></i> ${call.agent}</span>
        <span style="font-size:0.7rem; color:var(--text-tertiary);">${call.date}</span>
      </div>
      <div style="font-weight:600; color:#b54708; margin-bottom:0.15rem;">${call.outcome}</div>
      <div style="color:var(--text-secondary); font-size:0.75rem;">${escapeHtml(call.note)}</div>
    </div>
  `).join('');
}

function renderDrawerReminders(lead) {
  const container = document.getElementById('drawerReminders');
  if (!lead.reminders || lead.reminders.length === 0) {
    container.innerHTML = `<div style="font-size:0.75rem; color:var(--text-tertiary); text-align:center; padding:0.5rem;">No active reminders.</div>`;
    return;
  }

  container.innerHTML = lead.reminders.map(rem => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8f9fb; border:1px solid #eaecf0; padding:0.5rem 0.75rem; border-radius:6px; font-size:0.78rem;">
      <div style="color:var(--text-primary);"><i class="fa-solid fa-bell" style="color:#b54708; margin-right:0.35rem;"></i>${escapeHtml(rem.title)}</div>
      <span style="font-size:0.7rem; font-weight:600; color:#b54708;">${rem.due}</span>
    </div>
  `).join('');
}

// ==========================================================================
// Actions: Update Stage, Log Call, Reminders, Reassign
// ==========================================================================

async function updateLeadStage(leadId, newStage) {
  try {
    const res = await fetch(`/api/leads/${leadId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage })
    });

    const data = await res.json();
    if (data.success) {
      const leadIndex = allLeads.findIndex(l => l.id === leadId);
      if (leadIndex !== -1) {
        allLeads[leadIndex] = data.lead;
      }

      applyFilters();
      fetchStats();

      if (newStage === 'qualified' || newStage === 'won') {
        showToast('CAPI & Google Offline Synced!', data.message, 'success');
      } else if (newStage === 'disqualified') {
        showToast('Conversion Blocked', 'Junk lead filtered! Meta & Google ad algorithms protected.', 'danger');
      } else {
        showToast('Stage Updated', data.message, 'info');
      }

      if (selectedLead && selectedLead.id === leadId) {
        openLeadDrawer(leadId);
      }
    }
  } catch (err) {
    showToast('Error', 'Failed to update lead stage.', 'danger');
  }
}

function updateLeadStageFromDrawer(newStage) {
  if (selectedLead) {
    updateLeadStage(selectedLead.id, newStage);
  }
}

async function reassignLead(agentName) {
  if (!selectedLead || !agentName) return;
  try {
    const res = await fetch(`/api/leads/${selectedLead.id}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: agentName })
    });
    const data = await res.json();
    if (data.success) {
      selectedLead.assignedTo = agentName;
      document.getElementById('drawerAssignedTo').textContent = agentName;
      applyFilters();
      showToast('Lead Reassigned', `Assigned to ${agentName}`, 'info');
    }
  } catch (err) {
    showToast('Error', 'Failed to reassign lead.', 'danger');
  }
}

function toggleAddCallForm() {
  const form = document.getElementById('addCallForm');
  form.style.display = form.style.display === 'none' ? 'flex' : 'none';
}

async function submitCallLog() {
  if (!selectedLead) return;
  const outcome = document.getElementById('callOutcomeSelect').value;
  const note = document.getElementById('callNoteText').value.trim();

  if (!note) {
    showToast('Note Required', 'Please enter notes about the call.', 'warning');
    return;
  }

  const agentName = currentRole === 'agent' ? 'Ali (Senior Agent)' : (currentRole === 'manager' ? 'Fahad (Manager)' : 'Admin');

  try {
    const res = await fetch(`/api/leads/${selectedLead.id}/call-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome, note, agent: agentName })
    });

    const data = await res.json();
    if (data.success) {
      selectedLead.callLogs.unshift(data.callLog);
      renderDrawerCallLogs(selectedLead);
      document.getElementById('callNoteText').value = '';
      toggleAddCallForm();
      showToast('Call Logged', 'Call recorded on client history.', 'success');
    }
  } catch (err) {
    showToast('Error', 'Failed to save call log.', 'danger');
  }
}

function toggleAddReminderForm() {
  const form = document.getElementById('addReminderForm');
  form.style.display = form.style.display === 'none' ? 'flex' : 'none';
}

async function submitReminder() {
  if (!selectedLead) return;
  const title = document.getElementById('reminderTitleInput').value.trim();
  const due = document.getElementById('reminderDueInput').value.trim();

  if (!title) {
    showToast('Title Required', 'Please enter a reminder title.', 'warning');
    return;
  }

  try {
    const res = await fetch(`/api/leads/${selectedLead.id}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, due: due || 'Tomorrow 11:00 AM' })
    });

    const data = await res.json();
    if (data.success) {
      selectedLead.reminders.unshift(data.reminder);
      renderDrawerReminders(selectedLead);
      document.getElementById('reminderTitleInput').value = '';
      document.getElementById('reminderDueInput').value = '';
      toggleAddReminderForm();
      showToast('Reminder Scheduled', 'Follow-up alert set.', 'info');
    }
  } catch (err) {
    showToast('Error', 'Failed to schedule reminder.', 'danger');
  }
}

// ==========================================================================
// Simulation & Demo Presets
// ==========================================================================

function toggleSimMenu() {
  const menu = document.getElementById('simMenu');
  menu.classList.toggle('show');
}

async function triggerPreset(presetType) {
  document.getElementById('simMenu').classList.remove('show');

  try {
    const res = await fetch('/api/simulate-preset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: presetType })
    });

    const data = await res.json();

    if (data.duplicateDetected) {
      showToast('Duplicate Detected', data.message, 'warning');
    } else if (data.lead && data.lead.qualityTier === 'junk') {
      showToast('Junk Lead Filtered', `Auto-disqualified! ${data.lead.name} blocked from Meta CAPI & Google Ads.`, 'danger');
    } else {
      showToast('Inbound Lead Ingested', `New App Project from ${data.lead.name} (${data.lead.budgetRange}). Meta CAPI dispatched.`, 'success');
    }

    fetchLeads();
    fetchStats();
  } catch (err) {
    showToast('Error', 'Simulation failed.', 'danger');
  }
}

// ==========================================================================
// Manual Lead Creation
// ==========================================================================

async function handleNewLeadSubmit(event) {
  event.preventDefault();

  const payload = {
    name: document.getElementById('newLeadName').value.trim(),
    phone: document.getElementById('newLeadPhone').value.trim(),
    email: document.getElementById('newLeadEmail').value.trim(),
    company: document.getElementById('newLeadCompany').value.trim() || 'App Startup',
    source: document.getElementById('newLeadSource').value,
    budgetRange: document.getElementById('newLeadBudget').value,
    appType: document.getElementById('newLeadAppType').value.trim(),
    gclid: document.getElementById('newLeadGclid').value.trim() || null,
    campaign: document.getElementById('newLeadCampaign').value.trim() || 'Direct_Inbound'
  };

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.duplicateDetected) {
      showToast('Duplicate Detected', data.message, 'warning');
    } else {
      showToast('Lead Created', `Quality Score: ${data.lead.qualityScore}%. Assigned to ${data.lead.assignedTo}.`, 'success');
    }

    closeModal('newLeadModal');
    document.getElementById('newLeadForm').reset();
    fetchLeads();
    fetchStats();
  } catch (err) {
    showToast('Error', 'Failed to save lead.', 'danger');
  }
}

// ==========================================================================
// Modals & Toasts
// ==========================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

function showToast(title, message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `clean-toast toast-${type}`;

  let icon = 'fa-info-circle';
  let iconColor = '#0ba5ec';
  if (type === 'success') { icon = 'fa-circle-check'; iconColor = '#12b76a'; }
  else if (type === 'warning') { icon = 'fa-triangle-exclamation'; iconColor = '#f79009'; }
  else if (type === 'danger') { icon = 'fa-ban'; iconColor = '#f04438'; }
  else if (type === 'purple') { icon = 'fa-satellite-dish'; iconColor = '#7f56d9'; }

  toast.innerHTML = `
    <i class="fa-solid ${icon}" style="color:${iconColor}; font-size:1.1rem; margin-top:2px;"></i>
    <div style="flex-grow:1;">
      <strong style="display:block; font-size:0.84rem; color:var(--text-primary);">${escapeHtml(title)}</strong>
      <span style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(message)}</span>
    </div>
    <button onclick="this.parentElement.remove()" style="background:transparent; border:none; color:var(--text-tertiary); cursor:pointer;">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
