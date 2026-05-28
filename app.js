const STORAGE_KEY = "grcflow-demo-state-v1";

const seedControls = [
  {
    id: "SOC2-CC6.1",
    framework: "SOC 2",
    title: "Logical Access Provisioning",
    owner: "identity@company.com",
    evidence: "User access export, approval tickets, active user list, and audit-period timestamp.",
    procedure: "Verify access was approved, active users match the population, and evidence covers Q2 2026.",
    keywords: ["approved", "active users", "q2 2026", "access", "ticket"],
  },
  {
    id: "ISO-A.5.15",
    framework: "ISO 27001",
    title: "Access Control Policy",
    owner: "security@company.com",
    evidence: "Current access control policy with owner, approval date, and annual review record.",
    procedure: "Confirm policy is current, reviewed within the audit period, approved, and mapped to access controls.",
    keywords: ["policy", "approved", "reviewed", "q2 2026", "owner"],
  },
  {
    id: "SOC2-CC6.6",
    framework: "SOC 2",
    title: "Multi-Factor Authentication",
    owner: "it-ops@company.com",
    evidence: "MFA configuration report showing enabled status for all active users during Q2 2026.",
    procedure: "Confirm MFA is enforced for all active users, includes date, and lists any exceptions.",
    keywords: ["mfa", "enabled", "all active users", "q2 2026", "exceptions"],
  },
  {
    id: "PCI-10.2",
    framework: "PCI DSS",
    title: "Audit Logging",
    owner: "platform@company.com",
    evidence: "Logging configuration, sample logs, retention settings, and monitoring alerts.",
    procedure: "Verify logs capture user activity, retention is configured, alerts are enabled, and evidence is dated.",
    keywords: ["logs", "retention", "alerts", "q2 2026", "user activity"],
  },
  {
    id: "SOX-ITGC-LA1",
    framework: "SOX ITGC",
    title: "User Access Provisioning",
    owner: "sox-itgc@company.com",
    evidence: "SOX in-scope application access requests, manager approvals, role mapping, and provisioning timestamps.",
    procedure:
      "Verify sampled new users for SOX applications were approved before access was granted and role access matches job responsibilities.",
    keywords: ["sox", "approved", "provisioned", "role", "timestamp"],
  },
  {
    id: "SOX-ITGC-LA2",
    framework: "SOX ITGC",
    title: "Terminated User Access Removal",
    owner: "sox-itgc@company.com",
    evidence: "Terminated user population, HR termination date, deactivation evidence, and access removal timestamps.",
    procedure:
      "Verify terminated users were removed from SOX in-scope systems within policy timeframe and no access remained active.",
    keywords: ["sox", "terminated", "deactivated", "timestamp", "active access"],
  },
  {
    id: "SOX-ITGC-PA1",
    framework: "SOX ITGC",
    title: "Privileged Access Review",
    owner: "identity@company.com",
    evidence: "Privileged user listing, reviewer certification, exception approvals, and remediation evidence.",
    procedure:
      "Verify privileged access to SOX systems was reviewed, approved by appropriate management, and exceptions were remediated.",
    keywords: ["sox", "privileged", "reviewed", "approved", "remediated"],
  },
  {
    id: "SOX-ITGC-CM1",
    framework: "SOX ITGC",
    title: "Production Change Approval",
    owner: "engineering-ops@company.com",
    evidence: "Change tickets, approvals, testing evidence, deployment record, and segregation of duties support.",
    procedure:
      "Verify sampled production changes affecting SOX systems were approved, tested, and deployed by authorized personnel.",
    keywords: ["sox", "change", "approved", "tested", "deployed"],
  },
  {
    id: "SOX-ITGC-CO1",
    framework: "SOX ITGC",
    title: "Job Monitoring and Incident Resolution",
    owner: "platform@company.com",
    evidence: "Batch job monitoring logs, failed job alerts, incident tickets, rerun evidence, and resolution approvals.",
    procedure:
      "Verify SOX-relevant scheduled jobs were monitored and failures were investigated, resolved, and approved when rerun.",
    keywords: ["sox", "job", "alert", "resolved", "rerun"],
  },
];

const seedRequests = [
  {
    id: crypto.randomUUID(),
    controlId: "SOC2-CC6.1",
    owner: "identity@company.com",
    due: "2026-06-07",
    status: "submitted",
    evidenceText:
      "Q2 2026 user access export includes active users, access ticket approvals, and manager approval references.",
    submittedBy: "Avery Patel",
    sourceType: "Ticket export",
    comment: "",
    result: null,
  },
  {
    id: crypto.randomUUID(),
    controlId: "SOC2-CC6.6",
    owner: "it-ops@company.com",
    due: "2026-06-04",
    status: "needs-review",
    evidenceText: "MFA is enabled for most active users. Three contractor exceptions are listed without approval dates.",
    submittedBy: "Jordan Lee",
    sourceType: "System report",
    comment: "Evidence needs exception approval details and a dated population report.",
    result: { status: "needs-review", confidence: 72, findings: ["Missing complete active-user population.", "Exceptions require approval evidence."] },
  },
  {
    id: crypto.randomUUID(),
    controlId: "ISO-A.5.15",
    owner: "security@company.com",
    due: "2026-06-12",
    status: "requested",
    evidenceText: "",
    submittedBy: "",
    sourceType: "Policy",
    comment: "",
    result: null,
  },
];

let state = loadState();
let selectedRequestId = state.requests[0]?.id || null;
let activeFilter = "all";
let lastResult = null;

const views = document.querySelectorAll(".view");
const navItems = document.querySelectorAll(".nav-item");
const requestRows = document.querySelector("#requestRows");
const controlSelect = document.querySelector("#controlSelect");
const dialogControl = document.querySelector("#dialogControl");
const controlBrief = document.querySelector("#controlBrief");
const aiContract = document.querySelector("#aiContract");
const evidenceText = document.querySelector("#evidenceText");
const submittedBy = document.querySelector("#submittedBy");
const sourceType = document.querySelector("#sourceType");
const reviewerComment = document.querySelector("#reviewerComment");
const testResult = document.querySelector("#testResult");
const selectedStatus = document.querySelector("#selectedStatus");
const confidencePill = document.querySelector("#confidencePill");
const requestDialog = document.querySelector("#requestDialog");
const controlDialog = document.querySelector("#controlDialog");
const reportDialog = document.querySelector("#reportDialog");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    const knownIds = new Set(parsed.controls.map((control) => control.id));
    const missingControls = seedControls.filter((control) => !knownIds.has(control.id));
    if (missingControls.length > 0) {
      parsed.controls.push(...missingControls);
      parsed.audit.push(
        auditEntry(
          "System",
          "Control library updated",
          `${missingControls.length} SOX ITGC controls added to the demo library.`,
        ),
      );
    }
    return parsed;
  }
  return {
    controls: seedControls,
    requests: seedRequests,
    audit: [
      auditEntry("System", "Workspace initialized", "Seeded controls and request queue for Q2 2026."),
      auditEntry("AI Tester", "Evidence flagged", "SOC2-CC6.6 needs exception approval details."),
    ],
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function auditEntry(actor, action, detail) {
  return {
    id: crypto.randomUUID(),
    actor,
    action,
    detail,
    at: new Date().toISOString(),
  };
}

function getControl(id) {
  return state.controls.find((control) => control.id === id);
}

function getSelectedRequest() {
  return state.requests.find((request) => request.id === selectedRequestId);
}

function setView(viewId) {
  views.forEach((view) => view.classList.toggle("active", view.id === viewId));
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
}

function normalizeStatus(status) {
  return status.replace("-", " ");
}

function statusClass(status) {
  if (status === "accepted") return "";
  if (status === "needs-review") return "warn";
  if (status === "failed") return "bad";
  return "subtle";
}

function resultLabel(status) {
  if (status === "pass") return "Pass";
  if (status === "fail") return "Fail";
  return "Needs Review";
}

function renderControls() {
  const options = state.controls
    .map(
      (control) =>
        `<option value="${escapeHtml(control.id)}">${escapeHtml(control.id)} - ${escapeHtml(control.title)}</option>`,
    )
    .join("");
  controlSelect.innerHTML = options;
  dialogControl.innerHTML = options;

  const request = getSelectedRequest();
  if (request) controlSelect.value = request.controlId;
  renderControlBrief();
}

function renderControlBrief() {
  const control = getControl(controlSelect.value);
  if (!control) return;
  controlBrief.innerHTML = `
    <strong>${escapeHtml(control.framework)}: ${escapeHtml(control.title)}</strong>
    <span>${escapeHtml(control.evidence)}</span>
    <span>${escapeHtml(control.procedure)}</span>
  `;
  aiContract.textContent = JSON.stringify(buildAiContract(control), null, 2);
}

function buildAiContract(control) {
  return {
    task: "Evaluate whether submitted evidence is sufficient for a GRC control test.",
    output_schema: {
      status: "pass | fail | needs-review",
      confidence: "0-100",
      findings: ["specific gap or support statement"],
      reviewer_comment: "audit-ready comment for the control owner or reviewer",
      missing_items: ["additional evidence needed"],
    },
    control: {
      id: control.id,
      framework: control.framework,
      title: control.title,
      evidence_required: control.evidence,
      test_procedure: control.procedure,
      required_terms: control.keywords,
    },
  };
}

function renderMetrics() {
  const accepted = state.requests.filter((request) => request.status === "accepted").length;
  const readiness = Math.round((accepted / state.controls.length) * 100);
  document.querySelector("#metricControls").textContent = state.controls.length;
  document.querySelector("#metricOpen").textContent = state.requests.filter((request) => request.status === "requested").length;
  document.querySelector("#metricReview").textContent = state.requests.filter((request) => request.status === "needs-review").length;
  document.querySelector("#metricReady").textContent = `${Number.isFinite(readiness) ? readiness : 0}%`;
}

function renderChart() {
  const byFramework = state.controls.reduce((acc, control) => {
    acc[control.framework] ||= { total: 0, accepted: 0 };
    acc[control.framework].total += 1;
    const request = state.requests.find((item) => item.controlId === control.id && item.status === "accepted");
    if (request) acc[control.framework].accepted += 1;
    return acc;
  }, {});

  document.querySelector("#readinessChart").innerHTML = Object.entries(byFramework)
    .map(([framework, counts]) => {
      const pct = Math.round((counts.accepted / counts.total) * 100);
      return `
        <div class="bar-row">
          <strong>${framework}</strong>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <span>${pct}%</span>
        </div>
      `;
    })
    .join("");
}

function renderPriorityQueue() {
  const priority = [...state.requests]
    .sort((a, b) => {
      const rank = { "needs-review": 0, requested: 1, submitted: 2, accepted: 3 };
      return rank[a.status] - rank[b.status] || new Date(a.due) - new Date(b.due);
    })
    .slice(0, 5);

  document.querySelector("#priorityQueue").innerHTML = priority
    .map((request) => {
      const control = getControl(request.controlId);
      return `
        <button class="queue-item" type="button" data-open-request="${escapeHtml(request.id)}">
          <strong>${escapeHtml(control.id)} ${escapeHtml(control.title)}</strong>
          <div class="queue-meta">
            <span>${escapeHtml(request.owner)}</span>
            <span>${escapeHtml(request.due)}</span>
          </div>
          <span class="pill ${statusClass(request.status)}">${escapeHtml(normalizeStatus(request.status))}</span>
        </button>
      `;
    })
    .join("");
}

function renderControlLibrary() {
  document.querySelector("#controlsGrid").innerHTML = state.controls
    .map((control) => {
      const requests = state.requests.filter((request) => request.controlId === control.id);
      const latest = requests.at(-1);
      const latestStatus = latest?.status || "not requested";
      return `
        <article class="control-card">
          <div class="control-card-top">
            <div>
              <strong>${escapeHtml(control.id)}</strong>
              <span>${escapeHtml(control.framework)}</span>
            </div>
            <span class="pill ${statusClass(latestStatus)}">${escapeHtml(normalizeStatus(latestStatus))}</span>
          </div>
          <h3>${escapeHtml(control.title)}</h3>
          <dl>
            <dt>Owner</dt>
            <dd>${escapeHtml(control.owner)}</dd>
            <dt>Evidence</dt>
            <dd>${escapeHtml(control.evidence)}</dd>
            <dt>Procedure</dt>
            <dd>${escapeHtml(control.procedure)}</dd>
          </dl>
          <div class="keyword-row">
            ${control.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}
          </div>
          <button class="secondary-button" type="button" data-request-control="${escapeHtml(control.id)}">Request Evidence</button>
        </article>
      `;
    })
    .join("");
}

function renderRequests() {
  const visible = state.requests.filter((request) => activeFilter === "all" || request.status === activeFilter);
  requestRows.innerHTML = visible
    .map((request) => {
      const control = getControl(request.controlId);
      const evidenceLabel = request.evidenceText ? `${request.sourceType} from ${request.submittedBy || "owner"}` : "Not submitted";
      return `
        <tr>
          <td>
            <div class="control-name">
              <strong>${escapeHtml(control.id)}</strong>
              <span>${escapeHtml(control.title)}</span>
            </div>
          </td>
          <td>${escapeHtml(request.owner)}</td>
          <td>${escapeHtml(request.due)}</td>
          <td><span class="pill ${statusClass(request.status)}">${escapeHtml(normalizeStatus(request.status))}</span></td>
          <td><span class="evidence-note">${escapeHtml(evidenceLabel)}</span></td>
          <td>
            <div class="table-actions">
              <button class="secondary-button" type="button" data-load="${escapeHtml(request.id)}">Open</button>
              <button class="primary-button" type="button" data-test="${escapeHtml(request.id)}">Test</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderSelectedRequest() {
  const request = getSelectedRequest();
  if (!request) return;

  controlSelect.value = request.controlId;
  evidenceText.value = request.evidenceText || "";
  submittedBy.value = request.submittedBy || "";
  sourceType.value = request.sourceType || "Screenshot";
  reviewerComment.value = request.comment || "";
  lastResult = request.result;
  selectedStatus.textContent = normalizeStatus(request.status);
  selectedStatus.className = `pill ${statusClass(request.status)}`;
  confidencePill.textContent = `Confidence ${request.result?.confidence || 0}%`;
  renderControlBrief();
  renderTestResult(request.result);
}

function renderTestResult(result) {
  if (!result) {
    testResult.innerHTML = `<div class="empty-state">Select a control and run an evidence test.</div>`;
    return;
  }

  const pillClass = result.status === "pass" ? "" : result.status === "fail" ? "bad" : "warn";
  testResult.innerHTML = `
    <div class="result-summary">
      <strong>${resultLabel(result.status)}</strong>
      <span class="pill ${pillClass}">${result.confidence}%</span>
    </div>
    <ul class="finding-list">
      ${result.findings.map((finding) => `<li>${escapeHtml(finding)}</li>`).join("")}
    </ul>
  `;
}

function renderAudit() {
  document.querySelector("#auditTimeline").innerHTML = [...state.audit]
    .reverse()
    .map((entry) => {
      const date = new Date(entry.at);
      return `
        <article class="timeline-item">
          <div class="timeline-time">${date.toLocaleDateString()}<br />${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          <div class="timeline-copy">
            <strong>${escapeHtml(entry.actor)} · ${escapeHtml(entry.action)}</strong>
            <p>${escapeHtml(entry.detail)}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAll() {
  renderControls();
  renderMetrics();
  renderChart();
  renderPriorityQueue();
  renderControlLibrary();
  renderRequests();
  renderSelectedRequest();
  renderAudit();
}

function testEvidence(control, text) {
  const normalized = text.toLowerCase();
  const findings = [];
  let score = 0;

  control.keywords.forEach((keyword) => {
    if (normalized.includes(keyword)) score += 16;
    else findings.push(`Missing or unclear: ${keyword}.`);
  });

  if (normalized.length > 120) score += 8;
  else findings.push("Evidence extract is too short to support a full conclusion.");

  const hasExceptionLanguage = /(exception|exceptions|gap|missing|failed|most)/i.test(text);
  const hasApprovalContext = /(approved|approval|approvals|exception register)/i.test(text);
  if (hasExceptionLanguage && !hasApprovalContext) {
    score -= 15;
    findings.push("Potential exception language detected; reviewer follow-up is recommended.");
  }

  const confidence = Math.max(35, Math.min(96, score));
  const status = confidence >= 82 ? "pass" : confidence < 52 ? "fail" : "needs-review";

  if (status === "pass") {
    findings.unshift("Evidence appears complete for the stated audit period and test procedure.");
  }

  return { status, confidence, findings: findings.slice(0, 5) };
}

function generateComment(control, result) {
  if (result.status === "pass") {
    return `Evidence appears sufficient for ${control.id}. It addresses the required control objective, includes the audit period, and supports the stated test procedure.`;
  }

  if (result.status === "fail") {
    return `Evidence is not sufficient for ${control.id}. The submission does not demonstrate the required control operation. Request updated evidence showing ${control.evidence.toLowerCase()}`;
  }

  return `Evidence for ${control.id} requires reviewer follow-up. ${result.findings.join(" ")} Please request a complete, dated submission before acceptance.`;
}

function buildRequestMessage(control, due) {
  return `Hello,

Please provide evidence for ${control.id} - ${control.title} by ${due || "the due date"}.

Evidence needed:
${control.evidence}

Test procedure:
${control.procedure}

Please include the audit period, source system, export date, and any exception approvals.`;
}

function buildAuditPacket() {
  const rows = state.requests.map((request) => {
    const control = getControl(request.controlId);
    return {
      control_id: control.id,
      framework: control.framework,
      title: control.title,
      owner: request.owner,
      due: request.due,
      status: request.status,
      source_type: request.sourceType,
      submitted_by: request.submittedBy,
      test_status: request.result?.status || "not-tested",
      confidence: request.result?.confidence || 0,
      reviewer_comment: request.comment || "",
      findings: request.result?.findings || [],
    };
  });

  return JSON.stringify(
    {
      product: "GRCFlow Evidence Automation",
      audit_period: "Q2 2026",
      exported_at: new Date().toISOString(),
      summary: {
        controls: state.controls.length,
        requests: state.requests.length,
        accepted: state.requests.filter((request) => request.status === "accepted").length,
        needs_review: state.requests.filter((request) => request.status === "needs-review").length,
      },
      requests: rows,
      audit_log: state.audit,
    },
    null,
    2,
  );
}

function saveCurrentSubmission(statusOverride) {
  const request = getSelectedRequest();
  if (!request) return;

  request.evidenceText = evidenceText.value.trim();
  request.submittedBy = submittedBy.value.trim();
  request.sourceType = sourceType.value;
  request.comment = reviewerComment.value.trim();
  request.result = lastResult;
  request.status = statusOverride || (lastResult?.status === "pass" ? "submitted" : lastResult?.status || "submitted");

  state.audit.push(
    auditEntry(
      request.submittedBy || "Reviewer",
      "Submission saved",
      `${request.controlId} marked ${normalizeStatus(request.status)}.`,
    ),
  );
  saveState();
  renderAll();
}

navItems.forEach((item) => {
  item.addEventListener("click", () => setView(item.dataset.view));
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
    renderRequests();
  });
});

document.addEventListener("click", (event) => {
  const loadButton = event.target.closest("[data-load]");
  const testButton = event.target.closest("[data-test]");
  const queueButton = event.target.closest("[data-open-request]");
  const controlRequestButton = event.target.closest("[data-request-control]");
  if (controlRequestButton) {
    openRequestDialog(controlRequestButton.dataset.requestControl);
    return;
  }

  const id = loadButton?.dataset.load || testButton?.dataset.test || queueButton?.dataset.openRequest;
  if (!id) return;

  selectedRequestId = id;
  renderSelectedRequest();
  setView(testButton ? "testing" : "requests");
});

controlSelect.addEventListener("change", () => {
  const request = state.requests.find((item) => item.controlId === controlSelect.value);
  if (request) selectedRequestId = request.id;
  renderSelectedRequest();
});

document.querySelector("#runTest").addEventListener("click", () => {
  const control = getControl(controlSelect.value);
  lastResult = testEvidence(control, evidenceText.value);
  reviewerComment.value = generateComment(control, lastResult);
  confidencePill.textContent = `Confidence ${lastResult.confidence}%`;
  renderTestResult(lastResult);
});

document.querySelector("#saveSubmission").addEventListener("click", () => saveCurrentSubmission());
document.querySelector("#acceptEvidence").addEventListener("click", () => saveCurrentSubmission("accepted"));
document.querySelector("#requestClarification").addEventListener("click", () => saveCurrentSubmission("needs-review"));

document.querySelector("#newRequest").addEventListener("click", () => {
  openRequestDialog(state.controls[0].id);
});

function openRequestDialog(controlId) {
  const control = getControl(controlId);
  dialogControl.value = control.id;
  document.querySelector("#dialogOwner").value = control.owner;
  document.querySelector("#dialogDue").value = "2026-06-14";
  document.querySelector("#dialogMessage").value = buildRequestMessage(control, "2026-06-14");
  requestDialog.showModal();
}

dialogControl.addEventListener("change", () => {
  const control = getControl(dialogControl.value);
  document.querySelector("#dialogOwner").value = control.owner;
  document.querySelector("#dialogMessage").value = buildRequestMessage(
    control,
    document.querySelector("#dialogDue").value,
  );
});

document.querySelector("#generateRequestMessage").addEventListener("click", () => {
  const control = getControl(dialogControl.value);
  document.querySelector("#dialogMessage").value = buildRequestMessage(control, document.querySelector("#dialogDue").value);
});

document.querySelector("#createRequest").addEventListener("click", () => {
  const control = getControl(dialogControl.value);
  const request = {
    id: crypto.randomUUID(),
    controlId: control.id,
    owner: document.querySelector("#dialogOwner").value.trim() || control.owner,
    due: document.querySelector("#dialogDue").value || "2026-06-14",
    status: "requested",
    evidenceText: "",
    submittedBy: "",
    sourceType: "Screenshot",
    comment: "",
    result: null,
  };
  state.requests.push(request);
  selectedRequestId = request.id;
  state.audit.push(auditEntry("Reviewer", "Request created", `${control.id} sent to ${request.owner}.`));
  saveState();
  renderAll();
  setView("requests");
});

document.querySelector("#newControl").addEventListener("click", () => {
  document.querySelector("#controlIdInput").value = "";
  document.querySelector("#frameworkInput").value = "";
  document.querySelector("#controlTitleInput").value = "";
  document.querySelector("#controlOwnerInput").value = "";
  document.querySelector("#controlEvidenceInput").value = "";
  document.querySelector("#controlProcedureInput").value = "";
  document.querySelector("#controlKeywordsInput").value = "";
  controlDialog.showModal();
});

document.querySelector("#createControl").addEventListener("click", () => {
  const id = document.querySelector("#controlIdInput").value.trim();
  const title = document.querySelector("#controlTitleInput").value.trim();
  if (!id || !title || getControl(id)) return;

  const control = {
    id,
    framework: document.querySelector("#frameworkInput").value.trim() || "Custom",
    title,
    owner: document.querySelector("#controlOwnerInput").value.trim() || "unassigned@company.com",
    evidence: document.querySelector("#controlEvidenceInput").value.trim() || "Evidence requirement not yet defined.",
    procedure: document.querySelector("#controlProcedureInput").value.trim() || "Test procedure not yet defined.",
    keywords: document
      .querySelector("#controlKeywordsInput")
      .value.split(",")
      .map((keyword) => keyword.trim().toLowerCase())
      .filter(Boolean),
  };

  if (control.keywords.length === 0) {
    control.keywords = [control.id.toLowerCase(), "approved", "q2 2026"];
  }

  state.controls.push(control);
  state.audit.push(auditEntry("Reviewer", "Control added", `${control.id} added to the control library.`));
  saveState();
  renderAll();
  setView("controls");
});

document.querySelector("#exportReport").addEventListener("click", () => {
  document.querySelector("#reportOutput").value = buildAuditPacket();
  reportDialog.showModal();
});

document.querySelector("#resetData").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state = loadState();
  selectedRequestId = state.requests[0]?.id || null;
  renderAll();
});

renderAll();
