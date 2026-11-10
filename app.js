(() => {
  const P = window.PROFILE, LIST = window.PROJECTS;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const CATS = {
    all: { label: "הכל" },
    ai: { label: "AI וסוכנים", c1: "#7b5cff", c2: "#22c1c3" },
    fullstack: { label: "Full-Stack", c1: "#ff5e8a", c2: "#ff9f43" },
    frontend: { label: "Frontend", c1: "#2e86ff", c2: "#7be0ff" },
    backend: { label: "Backend", c1: "#13b07c", c2: "#9be15d" },
  };
  const DESIGN = {
    original: "בעיצוב המקורי של הפרויקט",
    new: "עיצוב client חדש",
    code: "קוד אמיתי מהפרויקט",
  };
  const SKILLS = [
    ["🤖", "AI וסוכנים", "סוכנים, RAG, MCP והנדסת פרומפטים", ["Claude API", "Agent SDK", "LangChain", "LangGraph", "LlamaIndex Workflows", "MCP", "Gemini", "Ollama", "Pinecone", "Cohere", "Tavily"]],
    ["🎨", "Frontend", "ממשקים מהירים ומעוצבים", ["Angular 20", "React", "Redux Toolkit", "RTK Query", "PrimeReact", "TypeScript", "JavaScript", "HTML", "CSS"]],
    ["⚙️", "Backend", "שרתים, APIs ומיקרו-שירותים", ["C#", ".NET Web API", "EF Core", "Node.js", "Express", "Python", "Django", "Flask"]],
    ["🐳", "תשתיות וכלים", "פריסה, תורים ונתונים", ["Docker", "RabbitMQ", "SQLite", "Playwright", "Streamlit", "Gradio"]],
  ];
  const imgs = (p) => p.images || [];
  const url = (p) => `${p.id}.local`;

  /* theme */
  const root = document.documentElement;
  try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch {}
  $("#themeBtn").onclick = () => {
    const t = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch {}
  };

  /* profile */
  $("#brandName").textContent = P.name;
  $("#heroName").textContent = P.name;
  $("#footName").textContent = `© ${new Date().getFullYear()} ${P.name} · נבנה באהבה ❤`;
  $("#role").textContent = P.role;
  $("#intro").textContent = P.intro;
  $("#ghHero").href = P.github;

  const techCount = {};
  LIST.forEach((p) => p.tech.forEach((t) => (techCount[t] = (techCount[t] || 0) + 1)));
  const stats = [
    [LIST.length, "פרויקטים"],
    [LIST.filter((p) => p.category === "ai").length, "פרויקטי AI"],
    [Object.keys(techCount).length, "טכנולוגיות"],
    [LIST.reduce((n, p) => n + imgs(p).length, 0), "מסכים"],
  ];
  $("#stats").innerHTML = stats.map(([n, l]) => `<div class="stat"><b data-n="${n}">${n}</b><span>${l}</span></div>`).join("");
  document.querySelectorAll(".stat b").forEach((b) => {
    const n = +b.dataset.n, t0 = performance.now();
    const tick = (t) => { const k = Math.min(1, (t - t0) / 900); b.textContent = Math.round(k * n); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });

  const browser = (src, alt, u, cls = "") =>
    `<div class="browser ${cls}"><div class="browser-bar"><i></i><i></i><i></i><span>${esc(u)}</span></div><div class="browser-view"><img src="${src}" alt="${esc(alt)}" loading="lazy"></div></div>`;

  /* hero collage */
  const heroPick = ["jewelry-store", "jobsearch-agent", "chinese-auction"].map((id) => LIST.find((p) => p.id === id)).filter(Boolean);
  $("#heroArt").innerHTML = heroPick.map((p, i) => browser(imgs(p)[0][0], p.title, url(p), "b" + (i + 1)).replace('<div class="browser', `<div data-id="${p.id}" class="browser`)).join("");
  $("#heroArt").onclick = (e) => { const b = e.target.closest("[data-id]"); if (b) openProject(b.dataset.id); };

  /* marquee */
  const names = Object.keys(techCount);
  $("#marquee").innerHTML = [...names, ...names].map((t) => `<span>${esc(t)}</span>`).join("");

  /* featured */
  const featured = LIST.filter((p) => p.featured);
  $("#featuredList").innerHTML = featured.map((p, i) => {
    const im = imgs(p);
    return `<article class="feature">
      <div class="feature-shot" data-id="${p.id}">
        ${browser(im[0][0], im[0][1], url(p))}
        ${im[1] ? `<div class="peek"><img src="${im[1][0]}" alt="" loading="lazy"></div>` : ""}
      </div>
      <div>
        <span class="feature-num">${String(i + 1).padStart(2, "0")} / ${String(featured.length).padStart(2, "0")}</span>
        <div class="tags" style="margin-top:8px"><span class="tag-cat">${CATS[p.category].label}</span></div>
        <h3>${esc(p.title)}</h3>
        <p class="sub">${esc(p.subtitle)}</p>
        <p class="sum">${esc(p.summary)}</p>
        <ul>${(p.details || []).slice(0, 3).map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
        <div class="techs">${p.tech.map((t) => `<span class="tech">${esc(t)}</span>`).join("")}</div>
        <div class="links">
          <button class="btn primary small" data-open="${p.id}">🖼 ${im.length} מסכים · פרטים</button>
          ${p.github ? `<a class="btn ghost small" href="${p.github}" target="_blank" rel="noopener">קוד ב-GitHub ↗</a>` : ""}
        </div>
      </div>
    </article>`;
  }).join("");
  $("#featuredList").onclick = (e) => {
    const o = e.target.closest("[data-open]") || e.target.closest(".feature-shot");
    if (o) openProject(o.dataset.open || o.dataset.id);
  };

  /* filters */
  let cat = "all", q = "";
  const counts = { all: LIST.length };
  LIST.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
  $("#chips").innerHTML = Object.entries(CATS).filter(([k]) => counts[k])
    .map(([k, v]) => `<button class="chip${k === cat ? " active" : ""}" data-cat="${k}">${v.label}<small>${counts[k]}</small></button>`).join("");
  const setCat = (c) => { cat = c; document.querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x.dataset.cat === c)); };
  $("#chips").onclick = (e) => { const b = e.target.closest(".chip"); if (!b) return; setCat(b.dataset.cat); render(); };
  $("#search").oninput = (e) => { q = e.target.value.trim().toLowerCase(); render(); };

  /* grid */
  function render() {
    const items = LIST
      .filter((p) => cat === "all" || p.category === cat)
      .filter((p) => !q || [p.title, p.subtitle, p.summary, ...p.tech].join(" ").toLowerCase().includes(q));
    $("#grid").innerHTML = items.map((p, i) => {
      const im = imgs(p), c = CATS[p.category];
      return `<article class="card" tabindex="0" data-id="${p.id}" style="animation-delay:${i * 40}ms;--c1:${c.c1};--c2:${c.c2}">
        <div class="cover">${browser(im[0][0], im[0][1], url(p))}${im.length > 1 ? `<span class="badge-count">🖼 ${im.length}</span>` : ""}</div>
        <div class="card-body">
          <div class="tags"><span class="tag-cat">${c.label}</span></div>
          <h3>${esc(p.title)}</h3>
          <p class="sub">${esc(p.subtitle)}</p>
          <p class="sum">${esc(p.summary)}</p>
          <div class="techs">${p.tech.slice(0, 4).map((t) => `<span class="tech">${esc(t)}</span>`).join("")}${p.tech.length > 4 ? `<span class="tech">+${p.tech.length - 4}</span>` : ""}</div>
        </div>
      </article>`;
    }).join("");
    $("#empty").hidden = items.length > 0;
  }
  $("#grid").onclick = (e) => { const c = e.target.closest(".card"); if (c) openProject(c.dataset.id); };
  $("#grid").onkeydown = (e) => { if (e.key === "Enter") { const c = e.target.closest(".card"); if (c) openProject(c.dataset.id); } };

  /* skills */
  $("#skillGroups").innerHTML = SKILLS.map(([ic, h, d, list]) =>
    `<div class="sg"><h4><i>${ic}</i>${h}</h4><p>${d}</p><div class="techs">${list.map((t) => `<span class="tech" data-t="${esc(t)}">${esc(t)}</span>`).join("")}</div></div>`).join("");
  $("#skillGroups").onclick = (e) => {
    const t = e.target.closest(".tech"); if (!t) return;
    $("#search").value = t.dataset.t; q = t.dataset.t.toLowerCase(); setCat("all"); render();
    $("#projects").scrollIntoView();
  };

  /* modal */
  let cur = null, idx = 0;
  function openProject(id) {
    cur = LIST.find((p) => p.id === id); if (!cur) return;
    idx = 0;
    $("#mCat").textContent = CATS[cur.category].label;
    $("#mTitle").textContent = cur.title;
    $("#mSub").textContent = cur.subtitle;
    $("#mSummary").textContent = cur.summary;
    $("#mDetails").innerHTML = (cur.details || []).map((x) => `<li>${esc(x)}</li>`).join("");
    $("#mStats").innerHTML = (cur.stats || []).map(([n, l]) => `<div><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join("");
    $("#mTech").innerHTML = cur.tech.map((t) => `<span class="tech">${esc(t)}</span>`).join("");
    const links = [];
    if (cur.github) links.push(`<a class="btn primary" href="${cur.github}" target="_blank" rel="noopener">קוד ב-GitHub ↗</a>`);
    (cur.links || []).forEach(([l, u]) => links.push(`<a class="btn ghost" href="${u}" target="_blank" rel="noopener">${esc(l)} ↗</a>`));
    $("#mLinks").innerHTML = links.join("");
    $("#mUrl").textContent = url(cur);
    const im = imgs(cur);
    $("#mThumbs").innerHTML = im.length > 1 ? im.map((x, i) => `<img src="${x[0]}" data-i="${i}" alt="">`).join("") : "";
    showImg();
    $("#modal").hidden = false;
    document.body.style.overflow = "hidden";
    history.replaceState(null, "", "#" + cur.id);
    $(".modal-card").scrollTop = 0;
  }
  function showImg() {
    const im = imgs(cur), x = im[idx];
    $("#mImg").src = x[0]; $("#mImg").alt = x[1];
    $("#mCap").textContent = `${x[1]}${im.length > 1 ? `  ·  ${idx + 1}/${im.length}` : ""}`;
    $("#gPrev").hidden = $("#gNext").hidden = im.length < 2;
    document.querySelectorAll("#mThumbs img").forEach((t, i) => t.classList.toggle("on", i === idx));
  }
  const step = (d) => { const n = imgs(cur).length; if (n < 2) return; idx = (idx + d + n) % n; showImg(); };
  $("#gPrev").onclick = () => step(-1);
  $("#gNext").onclick = () => step(1);
  $("#mThumbs").onclick = (e) => { if (e.target.dataset.i) { idx = +e.target.dataset.i; showImg(); } };
  $("#mImg").onclick = () => { $("#lbImg").src = $("#mImg").src; $("#lightbox").hidden = false; };
  const closeLb = () => ($("#lightbox").hidden = true);
  $("#lightbox").onclick = closeLb;
  function closeModal() {
    $("#modal").hidden = true; document.body.style.overflow = "";
    history.replaceState(null, "", location.pathname + location.search);
  }
  document.querySelectorAll("[data-close]").forEach((b) => (b.onclick = closeModal));
  document.addEventListener("keydown", (e) => {
    if (!$("#lightbox").hidden) { if (e.key === "Escape") closeLb(); return; }
    if (!$("#modal").hidden) {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") step(1);
      if (e.key === "ArrowRight") step(-1);
      return;
    }
    if (e.key === "/" && document.activeElement !== $("#search")) { e.preventDefault(); $("#search").focus(); }
  });

  render();
  const h = decodeURIComponent(location.hash.slice(1));
  if (LIST.some((p) => p.id === h)) openProject(h);
})();
