// VettedAuthority - Shareable & Monetizable Prototype
const publishers = [
  { id: 1, name: "HubSpot Blog", niche: "Marketing/Sales", dr: 93, traffic: "8M+", type: "editorial", note: "Selective contributor program. Original insights required.", price: "Free" },
  { id: 2, name: "Entrepreneur", niche: "Business", dr: 92, traffic: "6M+", type: "editorial", note: "Actionable advice preferred.", price: "Free" },
  { id: 3, name: "Search Engine Journal", niche: "SEO/Marketing", dr: 91, traffic: "1.5M+", type: "editorial", note: "Data-driven practitioner content.", price: "Free" },
  { id: 4, name: "USA Today Branded Content", niche: "Business/Lifestyle", dr: 95, traffic: "50M+", type: "sponsored", note: "Official labeled branded content. High production value.", price: "$5,000+" },
  { id: 5, name: "Smashing Magazine", niche: "Design/Dev", dr: 91, traffic: "2M+", type: "editorial", note: "Pays contributors for deep tutorials.", price: "Publisher pays" },
  { id: 6, name: "MarketingProfs", niche: "B2B Marketing", dr: 84, traffic: "180K", type: "editorial", note: "Frameworks and data welcome.", price: "Free" },
  { id: 7, name: "Foundr Sponsored", niche: "Startups", dr: 70, traffic: "500K", type: "sponsored", note: "Labeled sponsored slots available.", price: "$299+" },
  { id: 8, name: "Content Marketing Institute", niche: "Content Strategy", dr: 84, traffic: "500K+", type: "editorial", note: "Practitioner insight.", price: "Free" }
];

let currentUser = JSON.parse(localStorage.getItem("va_user") || "null");

function updateAuthUI() {
  const area = document.getElementById("user-area");
  if (currentUser) {
    area.innerHTML = `<span style="margin-right:12px;">Hi, ${currentUser.name}</span><button id="logout-btn" class="btn-secondary">Log out</button>`;
    document.getElementById("logout-btn").onclick = () => {
      localStorage.removeItem("va_user");
      currentUser = null;
      updateAuthUI();
      renderSubmissions();
    };
  } else {
    area.innerHTML = `<button id="auth-btn" class="btn-primary">Sign In / Sign Up</button>`;
    document.getElementById("auth-btn").onclick = showAuth;
  }
}

function showAuth() {
  const name = prompt("Enter your name to create a free account (demo):");
  if (name) {
    currentUser = { name, email: name.toLowerCase().replace(/\s/g,"") + "@demo.com", id: Date.now() };
    localStorage.setItem("va_user", JSON.stringify(currentUser));
    updateAuthUI();
    alert("Account created! You can now submit and track placements. In production this connects to real auth + payments.");
  }
}

function renderPublishers(filterText = "", filterType = "") {
  const list = document.getElementById("publisher-list");
  const filtered = publishers.filter(p => 
    (p.name.toLowerCase().includes(filterText.toLowerCase()) || p.niche.toLowerCase().includes(filterText.toLowerCase())) &&
    (!filterType || p.type === filterType)
  );
  list.innerHTML = filtered.map(p => `
    <div class="card">
      <h3>${p.name}</h3>
      <div class="meta">DR ${p.dr} · ${p.traffic} · ${p.niche}</div>
      <span class="badge ${p.type}">${p.type}</span>
      <p>${p.note}</p>
      <p><strong>${p.price}</strong></p>
      <button class="btn-primary" style="width:100%;margin-top:10px;" onclick="selectPublisher(${p.id})">Select & Write</button>
    </div>
  `).join("") || "<p>No publishers match.</p>";
}

function selectPublisher(id) {
  document.getElementById("target-pub").value = id;
  document.getElementById("write").scrollIntoView({behavior:"smooth"});
}

function populateSelect() {
  const sel = document.getElementById("target-pub");
  sel.innerHTML = '<option value="">Choose publisher...</option>' + publishers.map(p => `<option value="${p.id}">${p.name} (DR ${p.dr})</option>`).join("");
}

document.getElementById("body")?.addEventListener("input", e => {
  document.getElementById("wc").textContent = e.target.value.trim().split(/\s+/).filter(Boolean).length;
});

document.getElementById("article-form")?.addEventListener("submit", e => {
  e.preventDefault();
  if (!currentUser) { showAuth(); return; }
  const title = document.getElementById("title").value;
  const pubId = +document.getElementById("target-pub").value;
  const body = document.getElementById("body").value;
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  if (words < 300) return showMsg("Minimum 300 words for quality.", "error");
  const pub = publishers.find(p => p.id === pubId);
  const sub = { id: Date.now(), title, publisher: pub.name, type: pub.type, words, status: pub.type === "sponsored" ? "Awaiting Payment" : "Under Review", date: new Date().toLocaleDateString(), user: currentUser.name };
  const subs = JSON.parse(localStorage.getItem("va_subs") || "[]");
  subs.unshift(sub);
  localStorage.setItem("va_subs", JSON.stringify(subs));
  showMsg(`Submitted! ${pub.type === "sponsored" ? "Complete payment in dashboard to proceed." : "Editorial review started."}`, "success");
  e.target.reset();
  document.getElementById("wc").textContent = "0";
  renderSubmissions();
});

function showMsg(text, type) {
  const el = document.getElementById("submit-msg");
  el.textContent = text;
  el.className = type;
}

function renderSubmissions() {
  const list = document.getElementById("submissions-list");
  const subs = JSON.parse(localStorage.getItem("va_subs") || "[]").filter(s => !currentUser || s.user === currentUser.name);
  if (!subs.length) { list.innerHTML = currentUser ? "No submissions yet." : "Sign in to view your submissions."; return; }
  list.innerHTML = subs.map(s => `
    <div class="card" style="margin-bottom:16px;">
      <h3>${s.title}</h3>
      <div class="meta">${s.publisher} · ${s.type} · ${s.words} words · ${s.date}</div>
      <p><strong>Status:</strong> ${s.status}</p>
      ${s.status === "Awaiting Payment" ? `<button class="btn-primary" onclick="payFor(${s.id})">Pay & Confirm Placement</button>` : ""}
    </div>
  `).join("");
}

function payFor(id) {
  alert("Demo payment successful! In production this opens Stripe Checkout. Order marked as paid and sent to publisher for review.");
  const subs = JSON.parse(localStorage.getItem("va_subs") || "[]");
  const s = subs.find(x => x.id === id);
  if (s) s.status = "Paid - Under Editorial Review";
  localStorage.setItem("va_subs", JSON.stringify(subs));
  renderSubmissions();
}

function startEditorial() { document.getElementById("write").scrollIntoView({behavior:"smooth"}); }
function startSponsored() { alert("Select a sponsored publisher and submit. Payment is collected before editorial review. Platform takes commission on each successful placement."); document.getElementById("publishers").scrollIntoView({behavior:"smooth"}); }

document.getElementById("search-pub")?.addEventListener("input", e => renderPublishers(e.target.value, document.getElementById("filter-type").value));
document.getElementById("filter-type")?.addEventListener("change", e => renderPublishers(document.getElementById("search-pub").value, e.target.value));

// Init
updateAuthUI();
populateSelect();
renderPublishers();
renderSubmissions();