import { useState, useEffect } from "react";

const injectFonts = () => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(link);
};

const IL = {
  bg: "#07080E",
  surface: "#0D0F1A",
  surfaceHover: "#111422",
  border: "#1C2035",
  textPrimary: "#FFFFFF",
  textSecondary: "#8892A4",
  textMuted: "#434B60",
  accent: "#6C5DD3",
  accentLight: "#8B7FF0",
  accentDim: "rgba(108,93,211,0.12)",
  accentBorder: "rgba(108,93,211,0.3)",
  gradient: "linear-gradient(135deg, #6C5DD3 0%, #4F46E5 100%)",
  successDim: "rgba(34,211,165,0.1)",
};

const LOGO_URL =
  "https://cdn.prod.website-files.com/6679769d4337a59be71dd5ce/67495c70057522ac3ad9572d_Logo_white.svg";
const STAR_URL =
  "https://cdn.prod.website-files.com/6679769d4337a59be71dd5ce/68f2160d3ccac36ad8183861_Star%207.svg";

const DISPOSITIONS = [
  "My Music::Artist Mapping Issue::My music is on the wrong artist profile",
  "My Music::Artist Mapping Issue::Someone elses music is on my artist profile",
  "My Music::Store Error::Redelivered",
  "My Music::Take Down::Processed All Stores",
  "My Music::Take Down::Reversal processed",
  "My Music::Release Not Live::Sent info - live time",
  "My Music::Uploading Music::Sent info",
  "My Music::Release Changes::Artwork change",
  "My Music::Release Changes::Artist name change",
  "My Music::Release Changes::Audio change",
  "My Music::Release Changes::Metadata::Contributor/Songwriter",
  "My Music::Media Export::Sent Info",
  "My Money::Refunds::Processed Refund",
  "My Money::Payoneer Withdrawals::Forwarded to Payoneer Support",
  "My Stores::Stores General::Artist page",
  "My Stores::Stores General::Live time",
  "My Account::Log In Issues::Two-Factor Authentication::Sent Info",
  "My Account::Close Account::Denied Request",
  "My Account::Close Account::Processed",
  "YouTube::OAC Request::Sent Info",
  "About TuneCore::Cant Understand - More Info Needed",
  "About TuneCore::Need More Info - Didn't provide TuneCore email address/UPC",
];

const SAMPLES = {
  persona: "Both — Artist initiates, Agent executes",
  channels: "Zendesk ticket (artist submits request); handled by Support agent",
  artist_entrypoint:
    "Artist submits a support ticket requesting their release be mapped to the correct artist page",
  agent_entrypoint:
    "Support receives the ticket in Zendesk; pulls up account and release in Studio",
  must_have:
    "Account identifier (TuneCore email); UPC of the affected release; correct Spotify artist URL or URI",
  nice_to_have:
    "Artist name; name of the release; screenshot of the incorrect mapping",
  common_mistakes:
    "Artist sends artist name instead of URL — same-name collisions cause wrong mappings. Sending URI when URL is needed, or vice versa.",
  steps:
    "1. Support receives request\n2. Pull up account in Studio\n3. Find the release by UPC\n4. Check eligibility (no fraud flag, correct ownership)\n5. Execute the action (ATO then edit then save then give back control)\n6. Finalize and redeliver\n7. Send confirmation macro to artist",
  tools:
    "Studio (admin panel), Zendesk macros, Retool refund tool (being deprecated), Spotify Content Relocation Form for edge cases",
  handling_time:
    "~5-10 min for straightforward cases; Unknown for complex ones",
  volume: "~200-300 tickets/month for this disposition",
  data_needed:
    "Account status, release approval status, finalization status, existing Spotify URI linked to release",
  system_of_record: "Studio (admin panel) + Spotify API for URI lookup",
  access_today:
    "UI — agent navigates Studio manually; Spotify URI looked up via Spotify website",
  read_api:
    "Unknown — Studio likely has internal APIs; specific endpoint names not documented. Spotify has a public artist search API returning artist URI.",
  action_name:
    "Save Spotify URI mapping / Clear takedown / Process refund — whichever applies to this disposition",
  action_execution:
    "UI today (Studio admin panel). Underlying backend APIs exist but endpoint names are Unknown.",
  write_api:
    "Unknown — internal API exists (Studio triggers backend calls); specific endpoints not documented. Close account believed to trigger ~6-7 backend API calls.",
  preconditions:
    "1. Release must belong to the authenticated account\n2. No active fraud or copyright flag\n3. For takedown reversal: reason must be Expired, not fraud\n4. For refunds: invoice must be less than 30 days old for auto-approval",
  idempotent:
    "Unknown — redelivery is believed safe to retry; mapping save may overwrite silently (no idempotency key known)",
  rate_limits:
    "Unknown — no documented limits. Redelivery has a priority queue that may throttle.",
  human_approval: "Yes",
  approver:
    "Support agent (initiates action); Stores team (for Deezer/Meta form submissions)",
  approval_what:
    "Agent confirms the artist owns the release before acting; confirms no fraud flag is present",
  approval_where: "Studio admin panel — Release page or Account page",
  audit_log:
    "Unknown — not explicitly documented in current SOPs",
  failure_modes:
    "1. Artist provides wrong Spotify URI — incorrect mapping saved\n2. Redelivery triggers but store still does not ingest (store-side delay)\n3. Takedown reversal succeeds but store does not re-ingest within expected window",
  failure_detection:
    "Artist follows up with a new support ticket; agent notices on follow-up check",
  escalation:
    "If redelivery fails after 2 attempts, agent creates a JIRA bug ticket. If fraud suspected, escalate to Trust and Safety immediately.",
  artist_receives:
    "Confirmation macro: We have updated your artist mapping — please allow 24-48 hours for changes to reflect on Spotify. Exact macro copy lives in Zendesk.",
  agent_receives:
    "Confirmation in Studio that the save was successful; ticket marked resolved in Zendesk",
  error_rate: "Unknown — not formally tracked",
  error_causes:
    "Wrong URI provided by artist; same-name artist collisions; store ingestion delays causing confusion",
  error_discovery:
    "Artist follow-up ticket or complaint; agent spots it during quality review",
  policy_constraints:
    "PII deletion requests must be logged for GDPR compliance. Refunds over 30 days require human review. Fraud-related takedowns must always route to a human — never auto-reverse.",
  always_human:
    "1. Any takedown with reason other than Expired\n2. Refund requests older than 30 days\n3. Account closure with outstanding royalties or invoices\n4. Any case where artist identity cannot be verified",
  open_questions:
    "Does Studio expose a writable API for URI mapping, or UI-only today? Is there a safe idempotency key for redelivery? What is the exact eligibility check for takedown reversal?",
};

const SECTIONS = [
  {
    id: "basic",
    num: "01",
    title: "Basic Info",
    desc: "Fundamentals of this support disposition.",
    fields: [
      {
        id: "persona",
        label: "Primary customer persona",
        type: "pills",
        options: ["Artist", "Agent", "Both"],
        required: true,
      },
      {
        id: "channels",
        label: "Current support channel(s)",
        type: "text",
        placeholder: "e.g. Zendesk ticket, live chat, email",
      },
    ],
  },
  {
    id: "entrypoint",
    num: "02",
    title: "Entrypoint + Required Intake",
    desc: "Where does each party enter, and what do you need upfront?",
    fields: [
      { id: "artist_entrypoint", label: "Artist entrypoint — where they start", type: "textarea", rows: 3 },
      { id: "agent_entrypoint", label: "Agent entrypoint — where they start", type: "textarea", rows: 3 },
      { id: "must_have", label: "Required intake — Must-have fields", type: "textarea", rows: 3, placeholder: "Fields you absolutely need before starting (e.g. UPC, account email)" },
      { id: "nice_to_have", label: "Required intake — Nice-to-have fields", type: "textarea", rows: 2, placeholder: "Helpful but not blocking" },
      { id: "common_mistakes", label: "Common user mistakes in intake", type: "textarea", rows: 3, placeholder: "Wrong formats, missing IDs, name collisions..." },
    ],
  },
  {
    id: "flow",
    num: "03",
    title: "Current Human Flow",
    desc: "What does support actually do today, step by step?",
    fields: [
      { id: "steps", label: "Step-by-step: what does Support do today?", type: "textarea", rows: 7, placeholder: "1. ...\n2. ...\n3. ..." },
      { id: "tools", label: "Tools / screens the agent uses", type: "textarea", rows: 3, placeholder: "e.g. Studio, Zendesk macros, Retool, Spotify form..." },
      { id: "handling_time", label: "Typical handling time (median)", type: "text", placeholder: "e.g. 5 min, 15 min, Unknown" },
      { id: "volume", label: "Volume (tickets/week or month)", type: "text", placeholder: "e.g. ~200/month, Unknown" },
    ],
  },
  {
    id: "reads",
    num: "04",
    title: "System Reads",
    desc: "What data does the bot need to look up?",
    fields: [
      { id: "data_needed", label: "Data needed", type: "textarea", rows: 3, placeholder: "What information must be retrieved?" },
      { id: "system_of_record", label: "System of record", type: "text", placeholder: "Studio / Admin panel / Stripe / Spotify / other" },
      { id: "access_today", label: "How it's accessed today", type: "text", placeholder: "UI / API / SQL / manual check" },
      { id: "read_api", label: "If API exists — endpoint/capability + what it returns", type: "textarea", rows: 3, placeholder: "Endpoint name, what data it returns, or Unknown" },
    ],
  },
  {
    id: "writes",
    num: "05",
    title: "System Writes",
    desc: "What actions does the bot need to execute?",
    fields: [
      { id: "action_name", label: "Action name", type: "text", placeholder: "e.g. Redeliver release, Clear takedown, Disable 2FA" },
      { id: "action_execution", label: "Where the action is executed today", type: "text", placeholder: "UI / API / internal tool" },
      { id: "write_api", label: "If API exists — endpoint/capability + what it does", type: "textarea", rows: 3, placeholder: "Endpoint, what it does, or Unknown" },
      { id: "preconditions", label: "Preconditions / eligibility rules", type: "textarea", rows: 4, placeholder: "What must be true before this action can be taken? Be exact." },
      { id: "idempotent", label: "Idempotent? If yes — idempotency key / safe retry behavior?", type: "text", placeholder: "Yes / No / Unknown — and if yes, the key or retry behavior" },
      { id: "rate_limits", label: "Rate limits / guardrails", type: "textarea", rows: 2, placeholder: "Any throttling, daily limits, or safety rails" },
    ],
  },
  {
    id: "gate",
    num: "06",
    title: "Human Gate",
    desc: "Does a human need to be in the loop before the action executes?",
    fields: [
      { id: "human_approval", label: "Does a human need to approve before action executes?", type: "pills", options: ["Yes", "No", "Unknown"] },
      { id: "approver", label: "Approver role / team", type: "text", placeholder: "e.g. Support agent, Stores team, Unknown" },
      { id: "approval_what", label: "What exactly do they review / approve?", type: "textarea", rows: 3 },
      { id: "approval_where", label: "Where does approval happen? (tool + screen/page)", type: "text", placeholder: "e.g. Studio > Release page, Admin panel > Invoices" },
      { id: "audit_log", label: "Is there an audit log? If yes — where?", type: "text", placeholder: "Yes — [location] / No / Unknown" },
    ],
  },
  {
    id: "failures",
    num: "07",
    title: "Failure Modes + Escalation",
    desc: "What can go wrong, and how is it caught?",
    fields: [
      { id: "failure_modes", label: "Top 3 failure modes", type: "textarea", rows: 4, placeholder: "1. ...\n2. ...\n3. ..." },
      { id: "failure_detection", label: "How are failures detected?", type: "textarea", rows: 2, placeholder: "User complaint, monitoring alert, agent notice..." },
      { id: "escalation", label: "Escalation path (who + when)", type: "textarea", rows: 2, placeholder: "Who gets the ticket and under what condition?" },
    ],
  },
  {
    id: "completion",
    num: "08",
    title: "Completion Output",
    desc: "What does each party receive when the workflow is done?",
    fields: [
      { id: "artist_receives", label: "What does the artist receive when done?", type: "textarea", rows: 3, placeholder: "Message copy, artifact/link, timing" },
      { id: "agent_receives", label: "What does the agent receive when done?", type: "textarea", rows: 2, placeholder: "Confirmation message, where it appears" },
    ],
  },
  {
    id: "quality",
    num: "09",
    title: "Quality + Error Rates",
    desc: "How reliable is the current process?",
    fields: [
      { id: "error_rate", label: "Known error rate today (if tracked)", type: "text", placeholder: "e.g. ~5%, Unknown" },
      { id: "error_causes", label: "Main causes of errors", type: "textarea", rows: 3, placeholder: "What typically goes wrong?" },
      { id: "error_discovery", label: "How errors are discovered", type: "text", placeholder: "User complaint, monitoring, agent review, other" },
    ],
  },
  {
    id: "compliance",
    num: "10",
    title: "Compliance + Risk",
    desc: "Guardrails and cases that must stay with humans.",
    fields: [
      { id: "policy_constraints", label: "Policy constraints", type: "textarea", rows: 3, placeholder: "Money movement rules, PII deletion, fraud triggers, etc." },
      { id: "always_human", label: "Cases that must always route to a human", type: "textarea", rows: 3, placeholder: "Specific edge cases that cannot be automated — be exact" },
      { id: "open_questions", label: "Open questions / anything else eng or design should know", type: "textarea", rows: 3, placeholder: "Gaps, gotchas, unknowns worth flagging" },
    ],
  },
];

function buildNotionContent(disposition, data) {
  const v = (id) => data[id]?.trim() || "Unknown";
  return [
    "## 01 Basic Info", `- Disposition: ${disposition}`, `- Customer persona: ${v("persona")}`, `- Support channels: ${v("channels")}`, "---",
    "## 02 Entrypoint + Required Intake", `- Artist entrypoint: ${v("artist_entrypoint")}`, `- Agent entrypoint: ${v("agent_entrypoint")}`, `- Must-have intake fields: ${v("must_have")}`, `- Nice-to-have fields: ${v("nice_to_have")}`, `- Common user mistakes: ${v("common_mistakes")}`, "---",
    "## 03 Current Human Flow", `Step-by-step: ${v("steps")}`, `- Tools used: ${v("tools")}`, `- Typical handling time: ${v("handling_time")}`, `- Volume: ${v("volume")}`, "---",
    "## 04 System Reads", `- Data needed: ${v("data_needed")}`, `- System of record: ${v("system_of_record")}`, `- Access method: ${v("access_today")}`, `- API endpoint: ${v("read_api")}`, "---",
    "## 05 System Writes", `- Action name: ${v("action_name")}`, `- Executed via: ${v("action_execution")}`, `- API endpoint: ${v("write_api")}`, `- Preconditions: ${v("preconditions")}`, `- Idempotent: ${v("idempotent")}`, `- Rate limits: ${v("rate_limits")}`, "---",
    "## 06 Human Gate", `- Human approval required: ${v("human_approval")}`, `- Approver: ${v("approver")}`, `- What they approve: ${v("approval_what")}`, `- Where: ${v("approval_where")}`, `- Audit log: ${v("audit_log")}`, "---",
    "## 07 Failure Modes", `Top 3: ${v("failure_modes")}`, `- Detection: ${v("failure_detection")}`, `- Escalation: ${v("escalation")}`, "---",
    "## 08 Completion Output", `- Artist receives: ${v("artist_receives")}`, `- Agent receives: ${v("agent_receives")}`, "---",
    "## 09 Quality + Error Rates", `- Error rate: ${v("error_rate")}`, `- Main causes: ${v("error_causes")}`, `- Discovery: ${v("error_discovery")}`, "---",
    "## 10 Compliance + Risk", `- Policy constraints: ${v("policy_constraints")}`, `- Always human: ${v("always_human")}`, `- Open questions: ${v("open_questions")}`,
  ].join("\n\n");
}

async function submitToNotion(disposition, formData) {
  const content = buildNotionContent(disposition, formData);
  const v = (id) => formData[id]?.trim() || "";
  const apiExists = v("write_api") && v("write_api").toLowerCase() !== "unknown" && v("write_api").length > 5 ? "Yes" : "Unknown";
  const prompt = `Create a Notion page in the TuneCore dispositions database using the notion MCP.\n\ndata_source_id: c6c3431b-0b7d-45cf-be5e-9c13ad36b423\n\nProperties:\n- Service: "${disposition}"\n- Entrypoint: "${v("artist_entrypoint")} | Agent: ${v("agent_entrypoint")}"\n- Required intake fields: "${v("must_have")}"\n- System reads: "${v("data_needed")} via ${v("system_of_record")}"\n- System writes: "${v("action_name")} — ${v("action_execution")}"\n- Human gate: "${v("human_approval")} — ${v("approver")}"\n- Done output: "${v("artist_receives")}"\n- API exists?: "${apiExists}"\n- API notes: "${v("write_api")}"\n- Category: "Complete"\n\nPage body:\n${content}\n\nRespond with only the Notion page URL.`;
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, mcp_servers: [{ type: "url", url: "https://mcp.notion.com/mcp", name: "notion" }], messages: [{ role: "user", content: prompt }] }),
  });
  const data = await resp.json();
  if (data.error) throw new Error(data.error.message || "API error");
  const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join(" ");
  const match = text.match(/https:\/\/(?:www\.)?notion\.so\/\S+/);
  return match ? match[0].replace(/[.,)\]]+$/, "") : null;
}

function SampleHint({ fieldId }) {
  const [open, setOpen] = useState(false);
  const sample = SAMPLES[fieldId];
  if (!sample) return null;
  return (
    <div style={{ marginTop: "8px" }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", padding: 0, color: open ? IL.accentLight : IL.textMuted, fontFamily: "'DM Mono', monospace", fontSize: "11px", transition: "color 0.15s" }}>
        <span style={{ display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.18s ease", fontSize: "9px" }}>&#9658;</span>
        {open ? "hide example" : "see example answer"}
      </button>
      {open && (
        <div style={{ marginTop: "8px", borderRadius: "8px", padding: "14px 16px", background: IL.accentDim, border: `1px solid ${IL.accentBorder}`, fontFamily: "'DM Mono', monospace", fontSize: "11.5px", color: "#A8B2D8", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
          <span style={{ display: "block", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: IL.accent, marginBottom: "8px", fontWeight: 600 }}>EXAMPLE ANSWER</span>
          {sample}
        </div>
      )}
    </div>
  );
}

const baseInput = { width: "100%", boxSizing: "border-box", background: "#0D0F1A", borderRadius: "8px", padding: "12px 16px", color: "#FFFFFF", fontSize: "14px", fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", caretColor: "#8B7FF0", transition: "border-color 0.2s, background 0.2s" };

function TextField({ field, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", fontWeight: 500, color: IL.textSecondary, marginBottom: "8px" }}>{field.label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ""} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ ...baseInput, border: `1px solid ${focused ? IL.accent : IL.border}`, background: focused ? "#111422" : "#0D0F1A" }} />
      <SampleHint fieldId={field.id} />
    </div>
  );
}

function TextareaField({ field, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", fontWeight: 500, color: IL.textSecondary, marginBottom: "8px" }}>{field.label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={field.rows || 3} placeholder={field.placeholder || ""} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ ...baseInput, resize: "none", lineHeight: "1.7", border: `1px solid ${focused ? IL.accent : IL.border}`, background: focused ? "#111422" : "#0D0F1A" }} />
      <SampleHint fieldId={field.id} />
    </div>
  );
}

function PillsField({ field, value, onChange }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", fontWeight: 500, color: IL.textSecondary, marginBottom: "10px" }}>
        {field.label}{field.required && <span style={{ color: IL.accent, marginLeft: "4px" }}>*</span>}
      </label>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
        {field.options.map((opt) => {
          const active = value === opt;
          return (
            <button key={opt} type="button" onClick={() => onChange(opt)} style={{ padding: "8px 20px", borderRadius: "6px", fontSize: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: active ? 700 : 500, border: `1px solid ${active ? "transparent" : IL.border}`, background: active ? IL.gradient : "transparent", color: active ? "#fff" : IL.textSecondary, cursor: "pointer", transition: "all 0.2s" }}>
              {opt}
            </button>
          );
        })}
      </div>
      <SampleHint fieldId={field.id} />
    </div>
  );
}

function FieldRenderer({ field, value, onChange }) {
  if (field.type === "pills") return <PillsField field={field} value={value} onChange={onChange} />;
  if (field.type === "textarea") return <TextareaField field={field} value={value} onChange={onChange} />;
  return <TextField field={field} value={value} onChange={onChange} />;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [disposition, setDisposition] = useState("");
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { injectFonts(); }, []);

  const updateField = (id, val) => setFormData((prev) => ({ ...prev, [id]: val }));
  const totalSteps = SECTIONS.length;
  const isLastStep = step === totalSteps;
  const section = step > 0 ? SECTIONS[step - 1] : null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try { setResult({ success: true, url: await submitToNotion(disposition, formData) }); }
    catch (e) { setResult({ success: false, error: e.message }); }
    setSubmitting(false);
  };

  const wrap = { minHeight: "100vh", background: IL.bg, color: IL.textPrimary, fontFamily: "'Plus Jakarta Sans', sans-serif" };

  const Header = ({ progress }) => (
    <div style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(7,8,14,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${IL.border}` }}>
      {progress !== undefined && <div style={{ height: "2px", background: IL.border }}><div style={{ height: "100%", width: `${progress * 100}%`, background: IL.gradient, transition: "width 0.4s ease" }} /></div>}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px", height: "54px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src={LOGO_URL} alt="IntuitioLabs" style={{ height: "20px", opacity: 0.9 }} />
        {progress !== undefined && section ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {SECTIONS.map((s, i) => <div key={s.id} style={{ borderRadius: "999px", background: i + 1 < step ? IL.accent : i + 1 === step ? IL.accentLight : IL.border, width: i + 1 === step ? "18px" : "6px", height: "6px", transition: "all 0.3s" }} />)}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <img src={STAR_URL} alt="" style={{ height: "13px", opacity: 0.75 }} />
            <span style={{ fontSize: "10px", color: IL.textMuted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em" }}>AI PRACTICE</span>
          </div>
        )}
      </div>
    </div>
  );

  if (step === 0) return (
    <div style={wrap}>
      <Header />
      <div style={{ maxWidth: "540px", margin: "0 auto", padding: "72px 24px 120px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: IL.accentDim, border: `1px solid ${IL.accentBorder}`, borderRadius: "999px", padding: "5px 14px", marginBottom: "28px" }}>
          <img src={STAR_URL} alt="" style={{ height: "11px" }} />
          <span style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", color: IL.accentLight, letterSpacing: "0.12em" }}>TUNECORE AI — SERVICE MANAGER QUESTIONNAIRE</span>
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 800, lineHeight: 1.12, marginBottom: "16px", letterSpacing: "-0.025em" }}>
          Which disposition<br /><span style={{ color: IL.accentLight }}>are you documenting?</span>
        </h1>
        <p style={{ color: IL.textSecondary, fontSize: "15px", lineHeight: 1.7, marginBottom: "36px" }}>
          Select a support disposition, walk through 10 short sections, and submit. Your answers are saved directly to Notion.
        </p>
        <div style={{ position: "relative", marginBottom: "14px" }}>
          <select value={disposition} onChange={(e) => setDisposition(e.target.value)} style={{ width: "100%", boxSizing: "border-box", appearance: "none", background: IL.surface, border: `1px solid ${disposition ? IL.accent : IL.border}`, borderRadius: "10px", padding: "14px 48px 14px 18px", color: disposition ? "#fff" : IL.textMuted, fontSize: "14px", fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: "pointer", outline: "none", transition: "border-color 0.2s" }}>
            <option value="">&#8212; Select a disposition &#8212;</option>
            {DISPOSITIONS.map((d) => <option key={d} value={d} style={{ background: "#0D0F1A" }}>{d}</option>)}
          </select>
          <span style={{ position: "absolute", right: "18px", top: "50%", transform: "translateY(-50%)", color: IL.textMuted, pointerEvents: "none", fontSize: "12px" }}>&#9660;</span>
        </div>
        <button onClick={() => disposition && setStep(1)} disabled={!disposition} style={{ width: "100%", padding: "15px", background: disposition ? IL.gradient : IL.surface, border: `1px solid ${disposition ? "transparent" : IL.border}`, borderRadius: "10px", color: disposition ? "#fff" : IL.textMuted, fontSize: "15px", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: disposition ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
          Begin questionnaire &#8594;
        </button>
        <p style={{ textAlign: "center", color: IL.textMuted, fontSize: "11px", marginTop: "18px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>10 SECTIONS &middot; ~10 MIN &middot; SAVES TO NOTION</p>
      </div>
    </div>
  );

  if (result) return (
    <div style={wrap}>
      <Header />
      <div style={{ maxWidth: "460px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        {result.success ? (
          <>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: IL.successDim, border: "1px solid rgba(34,211,165,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22D3A5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 style={{ fontSize: "30px", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.02em" }}>Saved to Notion</h2>
            <p style={{ color: IL.textSecondary, fontSize: "13px", marginBottom: "8px" }}>Questionnaire filed for</p>
            <p style={{ color: IL.accentLight, fontSize: "11px", fontFamily: "'DM Mono', monospace", padding: "8px 16px", background: IL.accentDim, borderRadius: "8px", border: `1px solid ${IL.accentBorder}`, display: "inline-block", marginBottom: "32px" }}>{disposition}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
              {result.url && <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: IL.gradient, color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Open in Notion &#8599;</a>}
              <button onClick={() => { setStep(0); setDisposition(""); setFormData({}); setResult(null); }} style={{ background: "none", border: "none", color: IL.textMuted, fontSize: "13px", cursor: "pointer", padding: "8px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Fill out another disposition</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "22px", color: "#EF4444" }}>!</div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px" }}>Submission failed</h2>
            <p style={{ color: IL.textSecondary, fontSize: "14px", marginBottom: "28px" }}>{result.error}</p>
            <button onClick={() => setResult(null)} style={{ padding: "12px 28px", background: IL.gradient, border: "none", borderRadius: "8px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Try again</button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={wrap}>
      <Header progress={step / totalSteps} />
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "44px 24px 130px" }}>
        <div style={{ marginBottom: "36px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: IL.accentDim, border: `1px solid ${IL.accentBorder}`, borderRadius: "999px", padding: "4px 14px", marginBottom: "16px" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: IL.accentLight, letterSpacing: "0.15em" }}>SECTION {section.num} OF {totalSteps}</span>
          </div>
          <h2 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "8px" }}>{section.title}</h2>
          <p style={{ color: IL.textSecondary, fontSize: "14px", lineHeight: 1.65 }}>{section.desc}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          {section.fields.map((field) => <FieldRenderer key={field.id} field={field} value={formData[field.id] || ""} onChange={(v) => updateField(field.id, v)} />)}
        </div>
        <div style={{ marginTop: "44px", paddingTop: "20px", borderTop: `1px solid ${IL.border}` }}>
          <p style={{ color: IL.textMuted, fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>FILING FOR: <span style={{ color: "#555F78" }}>{disposition}</span></p>
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(7,8,14,0.95)", backdropFilter: "blur(12px)", borderTop: `1px solid ${IL.border}`, padding: "16px 24px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setStep((s) => s - 1)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: `1px solid ${IL.border}`, borderRadius: "8px", padding: "10px 18px", color: IL.textSecondary, fontSize: "13px", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: "pointer" }}>
            &#8592; Back
          </button>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: IL.textMuted, letterSpacing: "0.08em" }}>{section.title.toUpperCase()}</span>
          {isLastStep ? (
            <button onClick={handleSubmit} disabled={submitting} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 24px", background: submitting ? IL.surface : IL.gradient, border: `1px solid ${submitting ? IL.border : "transparent"}`, borderRadius: "8px", color: submitting ? IL.textMuted : "#fff", fontSize: "14px", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting && <span style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />}
              {submitting ? "Saving to Notion\u2026" : "Submit to Notion \u2192"}
            </button>
          ) : (
            <button onClick={() => setStep((s) => s + 1)} style={{ padding: "11px 24px", background: IL.gradient, border: "none", borderRadius: "8px", color: "#fff", fontSize: "14px", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: "pointer" }}>
              Continue &#8594;
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
