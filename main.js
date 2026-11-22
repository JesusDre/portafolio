/* ─────────────────────────────────────────────────────────────
   JD/ARCHIVO — interacción
   ───────────────────────────────────────────────────────────── */
(() => {
  const { PROFILE: P, ROADMAP, EXPERIENCE, ATTRS, BASE } = window;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ── Tema ─────────────────────────────────────────────── */
  const root = document.documentElement;
  const darkQuery = matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.dataset.theme || (darkQuery.matches ? "dark" : "light");
  const paintThemeLabel = () => {
    $("#theme-value").textContent = currentTheme() === "dark" ? "NOCHE" : "DÍA";
  };
  const toggleTheme = () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    paintThemeLabel();
    field.refreshColor();
    inspectorArt.redraw();
    window.Sound?.sfx.theme();
  };
  $("#theme-toggle").addEventListener("click", () => { toggleTheme(); });

  /* ── Audio (apagado por defecto) ──────────────────────── */
  const sound = window.Sound;
  const soundBtn = $("#sound-toggle");
  if (!sound || !sound.supported) soundBtn.hidden = true;
  else {
    soundBtn.addEventListener("click", () => sound.toggle());
    sound.onChange((on) => {
      soundBtn.classList.toggle("on", on);
      soundBtn.setAttribute("aria-pressed", String(on));
      soundBtn.setAttribute("aria-label", on ? "Apagar música y sonidos" : "Activar música y sonidos");
      $("#sound-value").textContent = on ? "ON" : "OFF";
    });
  }
  darkQuery.addEventListener?.("change", () => { paintThemeLabel(); field.refreshColor(); inspectorArt.redraw(); });

  /* ── Contenido ────────────────────────────────────────── */
  $("#id-handle").textContent = P.handle.toUpperCase();
  $("#id-name").innerHTML = P.name.split(" ").map(esc).join("<br />");
  $("#id-role").textContent = `${P.role} — ${P.location}`;
  $("#hero-copy").textContent = P.headline;
  $("#hero-gh").href = P.github;
  $("#year").textContent = new Date().getFullYear();

  // Personaje: valores acumulados por paso (0 = origen)
  const STEPS = [{ ...BASE }];
  EXPERIENCE.forEach((e, i) => {
    const prev = STEPS[i];
    STEPS.push(Object.fromEntries(ATTRS.map((a) => [a.id, Math.min(100, prev[a.id] + (e.gains[a.id] || 0))])));
  });
  const XP_PER_LVL = 40;
  const totalXP = (s) => ATTRS.reduce((t, a) => t + s[a.id], 0);
  const levelOf = (xp) => Math.floor(xp / XP_PER_LVL) + 1;

  const techCount = new Set(P.stack.flatMap((c) => c.v)).size;
  $("#hero-stats").innerHTML = [
    [levelOf(totalXP(STEPS[STEPS.length - 1])), "Nivel actual"],
    [techCount, "Tecnologías"],
    [ROADMAP.length, "En construcción"],
  ].map(([n, l]) => `<div class="stat"><b>${pad(n)}</b><span>${l}</span></div>`).join("");

  // Archivo: solo los proyectos que vienen
  $("#archive-count").textContent = `${pad(ROADMAP.length)} REGISTROS`;
  const meter = (p) => `<div class="meter"><span class="meter-bar" style="--p:${p}%"><i></i></span><span>${pad(p)}%</span></div>`;
  const bullets = (arr) => `<ul class="bullets">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const chips = (arr) => `<ul class="chips">${arr.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`;
  $("#rows").innerHTML = ROADMAP.map((p, i) => `
    <li class="row" tabindex="0" data-i="${i}">
      <span class="idx">${pad(i + 1)}</span>
      <span class="ttl">${esc(p.name)}</span>
      <span class="typ"><span class="state">● ${esc(p.state)}</span></span>
      <div class="row-desc">
        <p>${esc(p.tagline)}</p>
        ${bullets(p.points)}
        ${chips(p.stack)}
        ${meter(p.progress)}
      </div>
    </li>`).join("");

  const inspector = $("#inspector");
  let activeRow = -1;
  const selectRow = (i) => {
    if (i === activeRow) return;
    activeRow = i;
    $$(".row").forEach((r) => r.classList.toggle("active", +r.dataset.i === i));
    const p = ROADMAP[i];
    inspector.innerHTML = `
      <div class="ins-head"><span>REG. ${pad(i + 1)} / ${pad(ROADMAP.length)}</span><span class="muted">${esc(p.type.toUpperCase())}</span></div>
      <div class="ins-visual"><canvas id="ins-canvas"></canvas><span class="code" data-text="${esc(p.code)}">${esc(p.code)}</span></div>
      <div class="ins-body">
        <h3>${esc(p.name)}</h3>
        <p class="muted">${esc(p.tagline)}</p>
        ${bullets(p.points)}
        ${chips(p.stack)}
        <div class="ins-state"><span>ESTADO · <b>${esc(p.state.toUpperCase())}</b></span></div>
        ${meter(p.progress)}
      </div>
      <a class="link-line" href="${esc(P.github)}" target="_blank" rel="noopener"><span>Seguir el avance en GitHub</span><span>↗</span></a>`;
    inspectorArt.draw(p.code);
    scramble($(".ins-visual .code"));
  };
  const isNarrow = () => matchMedia("(max-width: 960px)").matches;
  $$(".row").forEach((row) => {
    const i = +row.dataset.i;
    row.addEventListener("mouseenter", () => { if (!isNarrow()) selectRow(i); });
    row.addEventListener("focus", () => selectRow(i));
    row.addEventListener("click", () => {
      if (isNarrow() && activeRow === i) {
        row.classList.remove("active");
        activeRow = -1;
      } else selectRow(i);
    });
  });

  // Perfil
  $("#about").innerHTML = P.about.map((t) => `<p>${esc(t)}</p>`).join("");
  $("#langs").innerHTML = P.languages.map((l) => `
    <li><span class="lg-name">${esc(l.name)}</span><span class="lg-lvl muted">${esc(l.level)}</span>
    <span class="lg-bar"><i style="--p:${l.value}%"></i></span></li>`).join("");
  $("#soft").innerHTML = P.soft.map((s) => `<li>${esc(s)}</li>`).join("");
  $("#stack").innerHTML = P.stack.map((c, i) => `
    <section class="cat">
      <header><span class="cat-n">${pad(i + 1)}</span><h5>${esc(c.k)}</h5></header>
      ${chips(c.v)}
    </section>`).join("");

  // Enlace
  const links = [
    P.email && ["Correo", P.email, `mailto:${P.email}`],
    P.linkedin && ["LinkedIn", "in/jesus-juarez-perez", P.linkedin],
    ["GitHub", P.github.replace("https://", ""), P.github],
  ].filter(Boolean);
  $("#links").innerHTML = links.map(([k, v, href]) => `
    <li><a href="${esc(href)}" ${href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>
      <span class="k">${esc(k)}</span><span class="v">${esc(v)}</span><span>↗</span>
    </a></li>`).join("");
  $("#cta-mail").href = `mailto:${P.email}`;
  $("#copy-mail").addEventListener("click", async () => {
    const label = $("#copy-label");
    try { await navigator.clipboard.writeText(P.email); label.textContent = "¡Copiado!"; }
    catch (e) { label.textContent = P.email; }
    setTimeout(() => (label.textContent = "Copiar correo"), 2000);
  });

  /* ── Hoja de personaje ────────────────────────────────── */
  const character = (() => {
    $("#char-class").textContent = P.role.toUpperCase();
    $("#char-name").textContent = P.fullName;

    // línea de tiempo
    const stepsMeta = [
      { label: "Origen", sub: "Formación" },
      ...EXPERIENCE.map((e, i) => ({ label: `Misión ${pad(i + 1)}`, sub: `${e.org.split(" · ")[0].split(" (")[0]} · ${e.period}` })),
    ];
    $("#timeline").innerHTML = stepsMeta.map((s, i) => `
      <li><button type="button" data-step="${i}">
        <span class="tl-dot"></span><span class="tl-label">${esc(s.label)}</span><span class="tl-sub muted">${esc(s.sub)}</span>
      </button></li>`).join("") +
      `<li class="tl-play"><button type="button" id="replay" aria-label="Reproducir progreso">▶ REPRODUCIR</button></li>`;

    $("#attrs").innerHTML = ATTRS.map((a) => `
      <li data-attr="${a.id}">
        <span class="a-name">${esc(a.name)}</span>
        <span class="a-bar"><i class="a-prev"></i><i class="a-fill"></i></span>
        <span class="a-val">00</span>
        <span class="a-delta"></span>
      </li>`).join("");

    // radar
    const svg = $("#radar");
    const N = ATTRS.length, R = 92;
    const pt = (i, v) => {
      const ang = -Math.PI / 2 + (i / N) * Math.PI * 2;
      return [Math.cos(ang) * R * (v / 100), Math.sin(ang) * R * (v / 100)];
    };
    const poly = (vals) => vals.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");
    const rings = [25, 50, 75, 100].map((r) => `<polygon class="r-ring" points="${poly(Array(N).fill(r))}"/>`).join("");
    const spokes = ATTRS.map((a, i) => {
      const [x, y] = pt(i, 100);
      const [lx, ly] = pt(i, 122);
      const anchor = Math.abs(lx) < 4 ? "middle" : lx > 0 ? "start" : "end";
      return `<line class="r-spoke" x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>
        <text class="r-label" x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="${anchor}">${esc(a.name.split(" ")[0].toUpperCase())}</text>`;
    }).join("");
    svg.innerHTML = `${rings}${spokes}<polygon class="r-prev" id="r-prev"/><polygon class="r-shape" id="r-shape"/><g id="r-dots"></g>`;

    let shown = ATTRS.map(() => 0);
    let step = -1, anim = 0, autoTimer = 0, played = false, finished = false;

    function render(vals, prevVals) {
      $("#r-shape").setAttribute("points", poly(vals));
      $("#r-prev").setAttribute("points", poly(prevVals));
      $("#r-dots").innerHTML = vals.map((v, i) => {
        const [x, y] = pt(i, v);
        return `<rect class="r-dot" x="${(x - 2.5).toFixed(1)}" y="${(y - 2.5).toFixed(1)}" width="5" height="5"/>`;
      }).join("");
      const xp = Math.round(vals.reduce((a, b) => a + b, 0));
      const lvl = levelOf(xp);
      $("#lvl").textContent = pad(lvl);
      $("#xp-text").textContent = `XP ${xp}`;
      $("#xp-next").textContent = `FALTAN ${lvl * XP_PER_LVL - xp} XP`;
      $("#xp-fill").style.width = `${((xp % XP_PER_LVL) / XP_PER_LVL) * 100}%`;
      ATTRS.forEach((a, i) => {
        const li = $(`[data-attr="${a.id}"]`);
        $(".a-fill", li).style.width = `${vals[i]}%`;
        $(".a-prev", li).style.width = `${prevVals[i]}%`;
        $(".a-val", li).textContent = pad(Math.round(vals[i]));
      });
    }

    function renderQuest(s) {
      const q = $("#quest");
      if (s === 0) {
        q.innerHTML = `
          <div class="q-head"><span>ORIGEN</span><span class="muted">FORMACIÓN TÉCNICA</span></div>
          <div class="q-body">
            <h3>Punto de partida</h3>
            <p class="muted">Bases de programación orientada a objetos, bases de datos, APIs REST y Git. Desde aquí, cada misión real suma experiencia.</p>
          </div>`;
        return;
      }
      const e = EXPERIENCE[s - 1];
      const gains = ATTRS.filter((a) => e.gains[a.id]).sort((a, b) => e.gains[b.id] - e.gains[a.id]);
      q.innerHTML = `
        <div class="q-head"><span>MISIÓN ${pad(s)} · ${esc(e.kind.toUpperCase())}</span><span class="muted">${esc(e.period.toUpperCase())}</span></div>
        <div class="q-body">
          <div class="q-main">
            <p class="eyebrow">${esc(e.org.toUpperCase())} // ${esc(e.role.toUpperCase())}</p>
            <h3>${esc(e.title)}</h3>
            ${bullets(e.points)}
          </div>
          <div class="q-side">
            <h4 class="sub">Recompensas</h4>
            <ul class="gains">${gains.map((a) => `<li><span>${esc(a.name)}</span><b>+${e.gains[a.id]}</b></li>`).join("")}</ul>
            <h4 class="sub">Equipo obtenido</h4>
            ${chips(e.loot)}
            <h4 class="sub">Logros</h4>
            <ul class="achv">${e.achievements.map((x) => `<li><span class="trophy"></span>${esc(x)}</li>`).join("")}</ul>
          </div>
        </div>`;
    }

    function goTo(s) {
      if (s === step) return;
      const target = ATTRS.map((a) => STEPS[s][a.id]);
      const prevVals = s > 0 ? ATTRS.map((a) => STEPS[s - 1][a.id]) : target;
      const from = shown.slice();
      const forward = s === step + 1;
      step = s;
      $$("#timeline [data-step]").forEach((b) => {
        const k = +b.dataset.step;
        b.classList.toggle("active", k === s);
        b.classList.toggle("passed", k < s);
      });
      ATTRS.forEach((a, i) => {
        const d = $(`[data-attr="${a.id}"] .a-delta`);
        const g = s > 0 ? EXPERIENCE[s - 1].gains[a.id] : 0;
        d.textContent = g ? `+${g}` : "";
        d.classList.remove("pop");
        if (g && forward) { void d.offsetWidth; d.classList.add("pop"); }
      });
      renderQuest(s);
      cancelAnimationFrame(anim);
      if (reduceMotion) { shown = target; render(target, prevVals); return; }
      const t0 = performance.now(), dur = 1100;
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        shown = from.map((v, i) => v + (target[i] - v) * e);
        render(shown, prevVals);
        if (k < 1) anim = requestAnimationFrame(tick);
      };
      anim = requestAnimationFrame(tick);
    }

    function play() {
      clearTimeout(autoTimer);
      shown = ATTRS.map(() => 0);
      step = -1;
      let s = 0;
      finished = false;
      const next = () => {
        goTo(s);
        if (++s < STEPS.length) autoTimer = setTimeout(next, 1700);
        else finished = true;
      };
      next();
    }

    $("#timeline").addEventListener("click", (e) => {
      const b = e.target.closest("[data-step]");
      if (b) { clearTimeout(autoTimer); finished = true; goTo(+b.dataset.step); }
      if (e.target.closest("#replay")) play();
    });

    return {
      enter() { if (!played) { played = true; play(); } },
      leave() { clearTimeout(autoTimer); if (!finished) played = false; },
    };
  })();

  /* ── Efecto de descifrado ─────────────────────────────── */
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>=+*";
  function scramble(el) {
    if (!el || reduceMotion) return;
    const final = el.dataset.text || el.textContent;
    let frame = 0;
    cancelAnimationFrame(el._raf);
    const tick = () => {
      const reveal = frame / 2.2;
      el.textContent = [...final].map((c, i) =>
        c === " " ? " " : i < reveal ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      ).join("");
      frame++;
      if (reveal < final.length) el._raf = requestAnimationFrame(tick);
      else el.textContent = final;
    };
    tick();
  }
  $$(".nav a").forEach((a) => {
    a.addEventListener("mouseenter", () => scramble($(".t", a)));
    a.addEventListener("focus", () => scramble($(".t", a)));
  });

  /* ── Navegación por secciones ─────────────────────────── */
  const SECTIONS = $$(".nav a").map((a) => a.dataset.section);
  let current = null;
  function show(id, { focus = false } = {}) {
    if (!SECTIONS.includes(id)) id = "inicio";
    if (id === current) return;
    if (current) window.Sound?.sfx.section();
    current = id;
    $$(".view").forEach((v) => (v.hidden = v.dataset.view !== id));
    $$(".nav a").forEach((a) => {
      const on = a.dataset.section === id;
      a.classList.toggle("active", on);
      on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
    const idx = SECTIONS.indexOf(id);
    $("#section-readout").textContent = `SECCIÓN ${pad(idx)} / ${pad(SECTIONS.length - 1)}`;
    $("#panel").scrollTop = 0;
    if (id === "archivo" && activeRow < 0 && !isNarrow()) selectRow(0);
    if (id === "experiencia") character.enter(); else character.leave();
    if (focus) $(`.nav a[data-section="${id}"]`).focus({ preventScroll: true });
    field.pulse();
  }
  const fromHash = () => show(location.hash.slice(1) || "inicio");
  window.addEventListener("hashchange", fromHash);

  const go = (id) => { if (location.hash !== `#${id}`) location.hash = id; else show(id); };

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.matches("input, textarea")) return;
    const idx = SECTIONS.indexOf(current);
    if (e.key === "ArrowDown" && !e.target.closest(".rows")) {
      e.preventDefault(); go(SECTIONS[(idx + 1) % SECTIONS.length]);
    } else if (e.key === "ArrowUp" && !e.target.closest(".rows")) {
      e.preventDefault(); go(SECTIONS[(idx - 1 + SECTIONS.length) % SECTIONS.length]);
    } else if (/^[0-9]$/.test(e.key) && +e.key < SECTIONS.length) {
      go(SECTIONS[+e.key]);
    } else if (e.key.toLowerCase() === "t") {
      toggleTheme();
    } else if (e.key.toLowerCase() === "m") {
      window.Sound?.toggle();
    }
  });
  // Flechas dentro de la lista del archivo
  $("#rows").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const rows = $$(".row");
    const i = Math.max(0, rows.indexOf(document.activeElement));
    const n = e.key === "ArrowDown" ? Math.min(rows.length - 1, i + 1) : Math.max(0, i - 1);
    rows[n].focus();
  });

  /* ── Reloj y coordenadas ──────────────────────────────── */
  const clock = $("#clock");
  const tickClock = () => {
    const d = new Date();
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  tickClock();
  setInterval(tickClock, 1000);
  const coords = $("#coords");
  window.addEventListener("pointermove", (e) => {
    coords.textContent = `X ${pad(Math.round(e.clientX), 4)} · Y ${pad(Math.round(e.clientY), 4)}`;
  });

  /* ── Ruido de valor 2D ────────────────────────────────── */
  const perm = new Uint8Array(512);
  {
    const p = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  }
  const fade = (t) => t * t * (3 - 2 * t);
  const hash = (x, y) => perm[(perm[x & 255] + y) & 511] / 255;
  function noise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    const u = fade(xf), v = fade(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }

  /* ── Campo generativo de fondo ────────────────────────── */
  const field = (() => {
    const cvs = $("#field");
    const ctx = cvs.getContext("2d");
    let w, h, dpr, cols, rows, step, rgb = "31,29,26", accent = "#e2401c";
    let mx = -9999, my = -9999, sx = -9999, sy = -9999;
    let t = Math.random() * 100, pulseT = 0;

    const refreshColor = () => {
      const cs = getComputedStyle(root);
      rgb = cs.getPropertyValue("--field").trim() || rgb;
      accent = cs.getPropertyValue("--accent").trim() || accent;
      if (reduceMotion) draw();
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      cvs.width = w * dpr; cvs.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      step = w < 760 ? 26 : 30;
      cols = Math.ceil(w / step) + 1;
      rows = Math.ceil(h / step) + 1;
      if (reduceMotion) draw();
    };

    function draw() {
      ctx.clearRect(0, 0, w, h);
      sx += (mx - sx) * 0.12;
      sy += (my - sy) * 0.12;
      const pulse = pulseT > 0 ? pulseT : 0;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x0 = i * step, y0 = j * step;
          const n = noise(i * 0.09 + t, j * 0.09 - t * 0.6);
          const ang = n * Math.PI * 4;
          let dx = Math.cos(ang) * 6, dy = Math.sin(ang) * 6;
          // repulsión del cursor
          const ddx = x0 - sx, ddy = y0 - sy;
          const dist = Math.hypot(ddx, ddy);
          const R = 160;
          let near = 0;
          if (dist < R) {
            near = 1 - dist / R;
            const f = near * near * 26;
            dx += (ddx / (dist || 1)) * f;
            dy += (ddy / (dist || 1)) * f;
          }
          const x = x0 + dx, y = y0 + dy;
          const a = 0.08 + n * 0.22 + near * 0.5 + pulse * 0.25 * n;
          const s = 1.5 + near * 3;
          if (near > 0.55 && ((i + j) % 3 === 0)) {
            ctx.fillStyle = accent;
            ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
          } else if (n > 0.62) {
            ctx.strokeStyle = `rgba(${rgb},${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
            ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
            ctx.stroke();
          } else {
            ctx.fillStyle = `rgba(${rgb},${a})`;
            ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
          }
        }
      }
    }
    function loop() {
      t += 0.0016;
      if (pulseT > 0) pulseT -= 0.02;
      draw();
      requestAnimationFrame(loop);
    }

    addEventListener("resize", resize);
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; if (sx < -9000) { sx = mx; sy = my; } });
    document.addEventListener("pointerleave", () => { mx = my = -9999; });

    return {
      start() { refreshColor(); resize(); reduceMotion ? draw() : loop(); },
      refreshColor,
      pulse() { pulseT = 1; },
    };
  })();

  /* ── Arte del inspector (determinista por código) ─────── */
  const inspectorArt = (() => {
    let lastCode = null;
    function seeded(str) {
      let h = 2166136261;
      for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
      return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
    }
    function draw(code) {
      lastCode = code;
      const cvs = $("#ins-canvas");
      if (!cvs) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = cvs.clientWidth, h = cvs.clientHeight;
      cvs.width = w * dpr; cvs.height = h * dpr;
      const ctx = cvs.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cs = getComputedStyle(root);
      const rgb = cs.getPropertyValue("--field").trim();
      const accent = cs.getPropertyValue("--accent").trim();
      const rnd = seeded(code);
      const mode = (rnd() * 3) | 0;

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = `rgba(${rgb},0.55)`;
      ctx.lineWidth = 1;

      if (mode === 0) {
        // líneas de contorno
        const cx = w * (0.55 + rnd() * 0.3), cy = h * (0.2 + rnd() * 0.5);
        for (let r = 8; r < w; r += 9) {
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.08) {
            const k = 1 + 0.18 * Math.sin(a * 3 + r * 0.03) * rnd();
            const x = cx + Math.cos(a) * r * k, y = cy + Math.sin(a) * r * k * 0.7;
            a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (mode === 1) {
        // barras tipo espectrograma
        const n = 48, bw = w / n;
        for (let i = 0; i < n; i++) {
          const v = noise(i * 0.15 + rnd() * 3, rnd()) * h * 0.85;
          ctx.fillStyle = `rgba(${rgb},${0.15 + (v / h) * 0.6})`;
          ctx.fillRect(i * bw + 1, h - v, bw - 2, v);
        }
      } else {
        // retícula de bloques
        const s = 14;
        for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) {
          const v = noise(x * 0.02 + rnd() * 2, y * 0.03);
          if (v > 0.5) { ctx.fillStyle = `rgba(${rgb},${(v - 0.5) * 1.4})`; ctx.fillRect(x + 1, y + 1, s - 2, s - 2); }
          else ctx.strokeRect(x + s / 2 - 0.5, y + s / 2 - 0.5, 1, 1);
        }
      }
      // marca de acento
      ctx.fillStyle = accent;
      ctx.fillRect(w - 18, 10, 8, 8);
    }
    return { draw, redraw: () => lastCode && draw(lastCode) };
  })();
  addEventListener("resize", () => inspectorArt.redraw());

  /* ── Arranque ─────────────────────────────────────────── */
  function boot() {
    const el = $("#boot");
    let seen = false;
    try { seen = sessionStorage.getItem("booted") === "1"; } catch (e) {}
    if (reduceMotion || seen) { el.classList.add("done"); return; }
    try { sessionStorage.setItem("booted", "1"); } catch (e) {}

    const lines = [
      "<b>JD/ARCHIVO</b> — sistema de registro personal",
      "inicializando módulos ............ <i>OK</i>",
      `cargando hoja de personaje [${pad(EXPERIENCE.length)} misiones] ... <i>OK</i>`,
      `montando archivo [${pad(ROADMAP.length)} registros] ...... <i>OK</i>`,
      `enlace remoto: github.com/${P.handle} ... <i>OK</i>`,
      "",
      "<b>&gt; bienvenido.</b>",
    ];
    const log = $("#boot-log");
    let i = 0, finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      el.classList.add("done");
      removeEventListener("keydown", finish);
      el.removeEventListener("click", finish);
    };
    addEventListener("keydown", finish);
    el.addEventListener("click", finish);
    const next = () => {
      if (finished) return;
      if (i < lines.length) {
        log.innerHTML += lines[i++] + "\n";
        setTimeout(next, i === lines.length ? 420 : 130 + Math.random() * 90);
      } else setTimeout(finish, 300);
    };
    next();
  }

  paintThemeLabel();
  field.start();
  fromHash();
  boot();
})();
