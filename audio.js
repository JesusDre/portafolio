/* ─────────────────────────────────────────────────────────────
   JD/ARCHIVO — audio
   Música ambiental generativa (original, sintetizada en vivo con
   Web Audio: no usa archivos) y efectos de interfaz.
   Apagado por defecto: solo suena cuando el visitante lo activa.
   ───────────────────────────────────────────────────────────── */
(() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  let ctx = null, master, musicBus, sfxBus, reverb, revSend;
  let enabled = false, schedTimer = 0, suspendTimer = 0;
  let nextTime = 0, step = 0, melodyIdx = 3;

  /* ── Armonía: progresión melancólica en La menor ──────── */
  const BPM = 66;
  const EIGHTH = 60 / BPM / 2;
  const STEPS_PER_CHORD = 16; // 2 compases
  const CHORDS = [
    { bass: 45, pad: [57, 60, 64, 71] }, // Am(add9)
    { bass: 41, pad: [53, 57, 60, 64] }, // Fmaj7
    { bass: 48, pad: [52, 55, 60, 62] }, // C(add9)
    { bass: 40, pad: [55, 59, 64, 66] }, // Em(add9)
    { bass: 45, pad: [57, 60, 64, 67] }, // Am7
    { bass: 38, pad: [53, 57, 62, 65] }, // Dm
    { bass: 41, pad: [53, 57, 60, 67] }, // Fmaj9
    { bass: 40, pad: [56, 59, 62, 64] }, // E7 (sus)
  ];
  const SCALE = [69, 71, 72, 74, 76, 79, 81, 83, 84]; // La menor natural
  const ARP = [0, 1, 2, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 3, 1, 2];

  /* ── Inicialización ───────────────────────────────────── */
  function impulse(seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function init() {
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(comp).connect(ctx.destination);

    reverb = ctx.createConvolver();
    reverb.buffer = impulse(4.2, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    reverb.connect(wet).connect(master);
    revSend = ctx.createGain();
    revSend.gain.value = 1;
    revSend.connect(reverb);

    musicBus = ctx.createGain();
    musicBus.gain.value = 0;
    musicBus.connect(master);
    musicBus.connect(revSend);

    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.55;
    sfxBus.connect(master);
    const sfxRev = ctx.createGain();
    sfxRev.gain.value = 0.25;
    sfxBus.connect(sfxRev).connect(revSend);

    document.addEventListener("visibilitychange", () => {
      if (!enabled) return;
      document.hidden ? ctx.suspend() : ctx.resume();
    });
  }

  /* ── Voces ────────────────────────────────────────────── */
  function env(g, t, peak, a, hold, r) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + r);
    return t + a + hold + r + 0.05;
  }

  function pad(note, t, dur) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 950;
    f.Q.value = 0.4;
    const g = ctx.createGain();
    const end = env(g, t, 0.035, 2.4, Math.max(0, dur - 2.4), 3.2);
    f.connect(g).connect(musicBus);
    for (const det of [-8, 7]) {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = midi(note);
      o.detune.value = det;
      o.connect(f);
      o.start(t);
      o.stop(end);
    }
  }

  // "Coro" etéreo: diente de sierra a través de formantes de vocal "a"
  function choir(note, t, dur) {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = midi(note);
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 4.6;
    lfoG.gain.value = 5;
    lfo.connect(lfoG).connect(o.detune);
    const out = ctx.createGain();
    const end = env(out, t, 0.022, 3, Math.max(0, dur - 3), 3.5);
    for (const [fq, q, lvl] of [[750, 7, 1], [1150, 9, 0.6], [2600, 12, 0.25]]) {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = fq;
      bp.Q.value = q;
      const lg = ctx.createGain();
      lg.gain.value = lvl;
      o.connect(bp).connect(lg).connect(out);
    }
    out.connect(musicBus);
    o.start(t); lfo.start(t);
    o.stop(end); lfo.stop(end);
  }

  // Piano suave: seno + armónico con caída rápida
  function pluck(note, t, vel = 0.06, decay = 2.2) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(3200, t);
    f.frequency.exponentialRampToValueAtTime(700, t + decay);
    f.connect(g).connect(musicBus);
    const o1 = ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.value = midi(note);
    const o2 = ctx.createOscillator();
    o2.type = "triangle";
    o2.frequency.value = midi(note) * 2;
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o1.connect(f);
    o2.connect(g2).connect(f);
    o1.start(t); o2.start(t);
    o1.stop(t + decay + 0.05); o2.stop(t + decay + 0.05);
  }

  function bass(note, t, dur) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = midi(note);
    const g = ctx.createGain();
    const end = env(g, t, 0.09, 0.8, Math.max(0, dur - 1.5), 2);
    o.connect(g).connect(musicBus);
    o.start(t);
    o.stop(end);
  }

  /* ── Secuenciador ─────────────────────────────────────── */
  function scheduleStep(t) {
    const chordIdx = Math.floor(step / STEPS_PER_CHORD) % CHORDS.length;
    const chord = CHORDS[chordIdx];
    const s = step % STEPS_PER_CHORD;
    const chordDur = STEPS_PER_CHORD * EIGHTH;

    if (s === 0) {
      chord.pad.forEach((n) => pad(n, t, chordDur));
      bass(chord.bass, t, chordDur);
      if (chordIdx % 2 === 0) choir(chord.pad[2] + 12, t + EIGHTH * 2, chordDur * 1.6);
    }

    // arpegio (más escaso en la primera vuelta para que entre suave)
    const density = step < CHORDS.length * STEPS_PER_CHORD ? 0.55 : 0.8;
    if (s % 2 === 0 || Math.random() < density * 0.6) {
      const n = chord.pad[ARP[s]] + 12;
      const human = (Math.random() - 0.5) * 0.02;
      pluck(n, t + human, 0.03 + Math.random() * 0.025, 1.8);
    }

    // melodía: paseo aleatorio por la escala
    if (s % 4 === 0 && Math.random() < 0.4) {
      melodyIdx = Math.max(0, Math.min(SCALE.length - 1, melodyIdx + [-2, -1, -1, 1, 1, 2][(Math.random() * 6) | 0]));
      pluck(SCALE[melodyIdx], t, 0.055, 3.4);
    }
    step++;
  }

  function scheduler() {
    while (nextTime < ctx.currentTime + 0.3) {
      scheduleStep(nextTime);
      nextTime += EIGHTH;
    }
  }

  /* ── Efectos de interfaz ──────────────────────────────── */
  function blip(freqs, { type = "sine", dur = 0.06, vol = 0.05, gap = 0.045, filter = 4000 } = {}) {
    if (!enabled || !ctx) return;
    const t0 = ctx.currentTime + 0.005;
    freqs.forEach((fq, i) => {
      const t = t0 + i * gap;
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(fq, t);
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = filter;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f).connect(g).connect(sfxBus);
      o.start(t);
      o.stop(t + dur + 0.02);
    });
  }

  function noiseSweep(from, to, dur, vol) {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime + 0.005;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 2;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(sfxBus);
    src.start(t);
  }

  let lastHover = 0;
  const SFX = {
    hover() {
      const now = performance.now();
      if (now - lastHover < 45) return;
      lastHover = now;
      blip([2093], { type: "sine", dur: 0.035, vol: 0.03 });
    },
    click() { blip([1318.5, 1975.5], { type: "square", dur: 0.07, vol: 0.022, gap: 0.04, filter: 2600 }); },
    section() {
      noiseSweep(400, 3200, 0.35, 0.05);
      blip([880, 1318.5, 1760], { type: "triangle", dur: 0.22, vol: 0.04, gap: 0.06 });
    },
    theme() { blip([1760, 1174.7, 880], { type: "triangle", dur: 0.18, vol: 0.045, gap: 0.05 }); },
    step() { blip([1046.5, 1568], { type: "triangle", dur: 0.16, vol: 0.04, gap: 0.07 }); },
    on() { blip([659.3, 987.8, 1318.5, 1975.5], { type: "triangle", dur: 0.4, vol: 0.05, gap: 0.08 }); },
  };

  /* ── Encendido / apagado ──────────────────────────────── */
  const listeners = new Set();
  function setEnabled(on) {
    if (on === enabled) return;
    if (on && !AC) return;
    enabled = on;
    if (on) {
      if (!ctx) init();
      clearTimeout(suspendTimer);
      ctx.resume();
      const t = ctx.currentTime;
      musicBus.gain.cancelScheduledValues(t);
      musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), t);
      musicBus.gain.linearRampToValueAtTime(0.85, t + 4);
      nextTime = t + 0.15;
      step = 0;
      clearInterval(schedTimer);
      schedTimer = setInterval(scheduler, 60);
      scheduler();
      SFX.on();
    } else if (ctx) {
      const t = ctx.currentTime;
      musicBus.gain.cancelScheduledValues(t);
      musicBus.gain.setValueAtTime(musicBus.gain.value, t);
      musicBus.gain.linearRampToValueAtTime(0, t + 1.2);
      clearInterval(schedTimer);
      suspendTimer = setTimeout(() => { if (!enabled) ctx.suspend(); }, 4500);
    }
    listeners.forEach((fn) => fn(enabled));
  }

  /* ── Efectos conectados a la interfaz por delegación ──── */
  const HOVERABLE = ".nav a, .row, .btn, .timeline button, .links a, .theme-toggle, .link-line, .cat";
  const CLICKABLE = ".row, .btn, .links a, .link-line";
  let lastEl = null;
  document.addEventListener("pointerover", (e) => {
    const el = e.target.closest(HOVERABLE);
    if (el && el !== lastEl) SFX.hover();
    lastEl = el;
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest(CLICKABLE)) SFX.click();
    else if (e.target.closest(".timeline [data-step], #replay")) SFX.step();
  });

  window.Sound = {
    get enabled() { return enabled; },
    supported: !!AC,
    toggle() { setEnabled(!enabled); },
    set: setEnabled,
    onChange(fn) { listeners.add(fn); },
    sfx: SFX,
  };
})();
