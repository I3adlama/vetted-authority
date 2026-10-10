const publishers = [
  { id: 1, name: "HubSpot Blog", niche: "Marketing & Sales", dr: 93, traffic: "8M+", type: "editorial", note: "Selective contributor program. Requires original data or unique insight.", price: "Free" },
  { id: 2, name: "Entrepreneur", niche: "Business", dr: 92, traffic: "6M+", type: "editorial", note: "Strong preference for actionable, practical business advice.", price: "Free" },
  { id: 3, name: "Search Engine Journal", niche: "SEO & Marketing", dr: 91, traffic: "1.5M+", type: "editorial", note: "Practitioner-focused. Data and unique analysis preferred.", price: "Free" },
  { id: 4, name: "USA Today Branded Content", niche: "Business & Lifestyle", dr: 95, traffic: "50M+", type: "sponsored", note: "Official labeled branded content program. High production standards.", price: "$5,000+" },
  { id: 5, name: "Smashing Magazine", niche: "Design & Development", dr: 91, traffic: "2M+", type: "editorial", note: "Pays accepted contributors for in-depth tutorials.", price: "Publisher pays" },
  { id: 6, name: "MarketingProfs", niche: "B2B Marketing", dr: 84, traffic: "180K", type: "editorial", note: "Welcomes original frameworks and data-driven pieces.", price: "Free" },
  { id: 7, name: "Foundr", niche: "Startups", dr: 70, traffic: "500K", type: "sponsored", note: "Labeled sponsored placements available.", price: "$299+" },
  { id: 8, name: "Content Marketing Institute", niche: "Content Strategy", dr: 84, traffic: "500K+", type: "editorial", note: "Looking for practitioner-level insight.", price: "Free" }
];

let currentUser = JSON.parse(localStorage.getItem("va_user") || "null");

function updateAuthUI() {
  const area = document.getElementById("user-area");
  if (currentUser) {
    area.innerHTML = `
      <span style="font-weight:500;font-size:0.95rem;">${currentUser.name}</span>
      <button id="logout-btn" class="btn btn-secondary">Log out</button>
    `;
    document.getElementById("logout-btn").onclick = () => {
      localStorage.removeItem("va_user");
      currentUser = null;
      updateAuthUI();
      renderSubmissions();
    };
  } else {
    area.innerHTML = `<button id="auth-btn" class="btn btn-primary">Sign in</button>`;
    document.getElementById("auth-btn").onclick = showAuth;
  }
}

function showAuth() {
  const name = prompt("Enter your name to continue (demo account):");
  if (name && name.trim()) {
    currentUser = { name: name.trim(), id: Date.now() };
    localStorage.setItem("va_user", JSON.stringify(currentUser));
    updateAuthUI();
    renderSubmissions();
  }
}

function renderPublishers(filterText = "", filterType = "") {
  const list = document.getElementById("publisher-list");
  const filtered = publishers.filter(p =>
    (p.name.toLowerCase().includes(filterText.toLowerCase()) || p.niche.toLowerCase().includes(filterText.toLowerCase())) &&
    (!filterType || p.type === filterType)
  );

  if (!filtered.length) {
    list.innerHTML = `<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;">No publishers match your filters.</p>`;
    return;
  }

  list.innerHTML = filtered.map(p => `
    <div class="card">
      <h3>${p.name}</h3>
      <div class="meta">DR ${p.dr} · ${p.traffic} monthly visits · ${p.niche}</div>
      <span class="badge ${p.type}">${p.type === "editorial" ? "Editorial" : "Sponsored"}</span>
      <p>${p.note}</p>
      <div class="price-tag">${p.price}</div>
      <button class="btn btn-primary" style="width:100%" onclick="selectPublisher(${p.id})">Select publisher</button>
    </div>
  `).join("");
}

function selectPublisher(id) {
  document.getElementById("target-pub").value = id;
  document.getElementById("write").scrollIntoView({ behavior: "smooth" });
}

function populateSelect() {
  const sel = document.getElementById("target-pub");
  sel.innerHTML = `<option value="">Choose a publisher...</option>` +
    publishers.map(p => `<option value="${p.id}">${p.name} · DR ${p.dr} · ${p.type}</option>`).join("");
}

const bodyEl = document.getElementById("body");
if (bodyEl) {
  bodyEl.addEventListener("input", () => {
    const words = bodyEl.value.trim().split(/\s+/).filter(Boolean).length;
    document.getElementById("wc").textContent = words;
  });
}

document.getElementById("article-form")?.addEventListener("submit", e => {
  e.preventDefault();
  if (!currentUser) {
    showAuth();
    return;
  }
  const title = document.getElementById("title").value.trim();
  const pubId = Number(document.getElementById("target-pub").value);
  const body = document.getElementById("body").value.trim();
  const words = body.split(/\s+/).filter(Boolean).length;

  if (words < 400) {
    showMsg("Please write at least 400 words for a quality submission.", "error");
    return;
  }

  const pub = publishers.find(p => p.id === pubId);
  const submission = {
    id: Date.now(),
    title,
    publisher: pub.name,
    type: pub.type,
    words,
    status: pub.type === "sponsored" ? "Awaiting payment" : "Under review",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    user: currentUser.name
  };

  const subs = JSON.parse(localStorage.getItem("va_subs") || "[]");
  subs.unshift(submission);
  localStorage.setItem("va_subs", JSON.stringify(subs));

  showMsg(pub.type === "sponsored"
    ? "Submitted. Complete payment in your dashboard to send it to the publisher."
    : "Submitted for editorial review.", "success");

  e.target.reset();
  document.getElementById("wc").textContent = "0";
  renderSubmissions();
});

function showMsg(text, type) {
  const el = document.getElementById("submit-msg");
  el.textContent = text;
  el.className = `form-message ${type}`;
}

function renderSubmissions() {
  const list = document.getElementById("submissions-list");
  const all = JSON.parse(localStorage.getItem("va_subs") || "[]");
  const mine = currentUser ? all.filter(s => s.user === currentUser.name) : [];

  if (!currentUser) {
    list.innerHTML = `<p style="text-align:center;color:var(--text-muted);">Sign in to see your submissions.</p>`;
    return;
  }
  if (!mine.length) {
    list.innerHTML = `<p style="text-align:center;color:var(--text-muted);">No submissions yet. Write an article to get started.</p>`;
    return;
  }

  list.innerHTML = mine.map(s => `
    <div class="dashboard-item">
      <div>
        <h3>${s.title}</h3>
        <div class="dashboard-meta">${s.publisher} · ${s.type} · ${s.words} words · ${s.date}</div>
      </div>
      <div style="text-align:right;">
        <div class="status">${s.status}</div>
        ${s.status === "Awaiting payment" ? `<button class="btn btn-primary" style="margin-top:8px;" onclick="payFor(${s.id})">Pay now</button>` : ""}
      </div>
    </div>
  `).join("");
}

function payFor(id) {
  const subs = JSON.parse(localStorage.getItem("va_subs") || "[]");
  const sub = subs.find(s => s.id === id);
  if (sub) {
    sub.status = "Paid · Under review";
    localStorage.setItem("va_subs", JSON.stringify(subs));
    renderSubmissions();
    alert("Payment recorded (demo). In production this would open Stripe Checkout and notify the publisher.");
  }
}

document.getElementById("search-pub")?.addEventListener("input", e => {
  renderPublishers(e.target.value, document.getElementById("filter-type").value);
});
document.getElementById("filter-type")?.addEventListener("change", e => {
  renderPublishers(document.getElementById("search-pub").value, e.target.value);
});

updateAuthUI();
populateSelect();
renderPublishers();
renderSubmissions();