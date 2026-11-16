/*
 * pipModel.js: builds Pip the owl mage as a Three.js scene.
 * Purpose: keeps all the 3D modelling and animation out of the React components.
 * What it does: createPipScene(canvas) draws Pip with toon shading into the given canvas and
 * returns a small controller: set the mood, pulse the beak while talking, play a short
 * celebration, look left or right, resize, and dispose.
 */
import * as THREE from "three";

const C = {
  brown: 0xb97a4f, wing: 0x9c6440, belly: 0xf8e3c4, chevron: 0xd9b48a, orange: 0xf39a3c,
  hat: 0x6e5cd6, brim: 0x5b4bb7, gold: 0xffd34d, white: 0xffffff, pupil: 0x2b1b14,
  pink: 0xff8fa3, pencil: 0xffc93c, wood: 0xf5d2a0, eraser: 0xff9db5, metal: 0xb8bcc8,
};

function starShape(R, r) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i) s.lineTo(x, y);
    else s.moveTo(x, y);
  }
  s.closePath();
  return s;
}

function starGeo(R, depth) {
  const g = new THREE.ExtrudeGeometry(starShape(R, R * 0.46), {
    depth, bevelEnabled: true, bevelThickness: depth * 0.4, bevelSize: R * 0.1, bevelSegments: 2,
  });
  g.center();
  return g;
}

export function createPipScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 1.9, 9.4);
  camera.lookAt(0, 1.45, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9a8e8, 0.7 * Math.PI));
  const sun = new THREE.DirectionalLight(0xffffff, 0.7 * Math.PI);
  sun.position.set(3, 6, 5);
  scene.add(sun);

  // Track every geometry and material so dispose() can free them.
  const disposables = new Set();
  const keep = (x) => { disposables.add(x); return x; };

  const grad = keep(new THREE.DataTexture(new Uint8Array([110, 185, 255]), 3, 1, THREE.RedFormat));
  grad.minFilter = grad.magFilter = THREE.NearestFilter;
  grad.needsUpdate = true;
  const toon = (c) => keep(new THREE.MeshToonMaterial({ color: c, gradientMap: grad }));
  const flat = (c) => keep(new THREE.MeshBasicMaterial({ color: c }));
  const outlineMat = keep(new THREE.MeshBasicMaterial({ color: 0x3a2418, side: THREE.BackSide }));

  function mesh(geo, mat, o = {}) {
    keep(geo);
    const m = new THREE.Mesh(geo, mat);
    if (o.pos) m.position.set(...o.pos);
    if (o.scale) m.scale.set(...o.scale);
    if (o.rot) m.rotation.set(o.rot[0], o.rot[1], o.rot[2], o.order || "XYZ");
    if (o.outline) {
      const ol = new THREE.Mesh(geo, outlineMat);
      ol.scale.setScalar(1 + o.outline);
      m.add(ol);
    }
    return m;
  }

  const SPH = new THREE.SphereGeometry(1, 40, 28);

  // ---------- Pip ----------
  const dancer = new THREE.Group();
  scene.add(dancer);
  const body = new THREE.Group();
  dancer.add(body);

  body.add(mesh(SPH, toon(C.brown), { pos: [0, 1.1, 0], scale: [1, 0.95, 0.9], outline: 0.03 }));
  body.add(mesh(SPH, toon(C.belly), { pos: [0, 0.85, 0.58], scale: [0.68, 0.62, 0.32] }));
  const chev = new THREE.TorusGeometry(0.07, 0.018, 8, 16, Math.PI);
  [[-0.15, 0.95, 0.885], [0.15, 0.95, 0.885], [0, 0.78, 0.895], [-0.2, 0.62, 0.86], [0.2, 0.62, 0.86]]
    .forEach((p) => body.add(mesh(chev, flat(C.chevron), { pos: p, rot: [0, 0, Math.PI] })));

  [-1, 1].forEach((s) =>
    body.add(mesh(SPH, toon(C.orange), { pos: [0.32 * s, 0.07, 0.45], scale: [0.22, 0.08, 0.28], outline: 0.12 })));

  const eyes = new THREE.Group();
  eyes.position.set(0, 1.33, 0);
  body.add(eyes);
  const pupils = [];
  [-1, 1].forEach((s) => {
    eyes.add(mesh(SPH, toon(C.white), { pos: [0.37 * s, 0, 0.66], scale: [0.34, 0.34, 0.19], outline: 0.08 }));
    const pupil = new THREE.Group();
    pupil.position.set(0.35 * s, -0.02, 0);
    pupil.add(mesh(SPH, flat(C.pupil), { pos: [0, 0, 0.8], scale: [0.2, 0.2, 0.1] }));
    pupil.add(mesh(SPH, flat(C.white), { pos: [0.07, 0.08, 0.89], scale: [0.065, 0.065, 0.03] }));
    pupil.add(mesh(SPH, flat(C.white), { pos: [-0.05, -0.06, 0.89], scale: [0.03, 0.03, 0.015] }));
    eyes.add(pupil);
    pupils.push(pupil);
  });

  const beak = new THREE.Group();
  beak.position.set(0, 1.23, 0.88);
  body.add(beak);
  beak.add(mesh(new THREE.ConeGeometry(0.1, 0.22, 4), toon(C.orange), {
    pos: [0, -0.11, 0.02], rot: [Math.PI - 0.35, Math.PI / 4, 0], outline: 0.12,
  }));

  const blushMat = keep(new THREE.MeshBasicMaterial({ color: C.pink, transparent: true, opacity: 0.7, depthWrite: false }));
  const blushGeo = new THREE.CircleGeometry(0.12, 24);
  [-1, 1].forEach((s) =>
    body.add(mesh(blushGeo, blushMat, { pos: [0.62 * s, 0.98, 0.705], rot: [0, 0.72 * s, 0], scale: [1, 0.55, 1] })));

  function makeWing(side) {
    const g = new THREE.Group();
    g.position.set(0.9 * side, 1.4, 0.05);
    g.add(mesh(SPH, toon(C.wing), { pos: [0, -0.45, 0], scale: [0.2, 0.5, 0.38], outline: 0.06 }));
    body.add(g);
    return g;
  }
  const wingL = makeWing(-1);
  const wingR = makeWing(1);

  // The pencil wand, held in the right wing.
  const pencil = new THREE.Group();
  pencil.position.set(0, -0.82, 0.08);
  wingR.add(pencil);
  pencil.add(mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.12, 16), toon(C.eraser), { pos: [0, 0.06, 0], outline: 0.1 }));
  pencil.add(mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.07, 16), toon(C.metal), { pos: [0, 0.155, 0], outline: 0.1 }));
  pencil.add(mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.75, 6), toon(C.pencil), { pos: [0, 0.565, 0], outline: 0.1 }));
  pencil.add(mesh(new THREE.ConeGeometry(0.065, 0.15, 6), toon(C.wood), { pos: [0, 1.015, 0], outline: 0.1 }));
  pencil.add(mesh(new THREE.ConeGeometry(0.024, 0.05, 12), flat(C.pupil), { pos: [0, 1.068, 0] }));
  const wandStar = mesh(starGeo(0.17, 0.05), toon(C.gold), { pos: [0, 1.32, 0], outline: 0.12 });
  pencil.add(wandStar);

  const hat = new THREE.Group();
  hat.position.set(0, 1.9, 0);
  hat.rotation.set(-0.12, 0, 0.1);
  body.add(hat);
  hat.add(mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.07, 48), toon(C.brim), { outline: 0.04 }));
  hat.add(mesh(new THREE.CylinderGeometry(0.16, 0.62, 0.95, 40), toon(C.hat), { pos: [0, 0.475, 0], outline: 0.04 }));
  hat.add(mesh(new THREE.CylinderGeometry(0.548, 0.618, 0.15, 40), toon(C.gold), { pos: [0, 0.11, 0] }));
  const tip = new THREE.Group();
  tip.position.set(0, 0.93, 0);
  hat.add(tip);
  tip.add(mesh(new THREE.ConeGeometry(0.165, 0.5, 32), toon(C.hat), { pos: [0, 0.24, 0], outline: 0.06 }));
  tip.add(mesh(new THREE.SphereGeometry(0.1, 20, 14), toon(C.gold), { pos: [0, 0.5, 0], outline: 0.12 }));
  const hatStarGeo = starGeo(0.12, 0.02);
  [[0, 0.45, 1], [0.75, 0.24, 0.55], [-0.6, 0.7, 0.6]].forEach(([phi, y, sz]) => {
    const r = 0.62 - (0.46 * y) / 0.95 + 0.02;
    const star = mesh(hatStarGeo, toon(C.gold), { pos: [r * Math.sin(phi), y, r * Math.cos(phi)], rot: [-0.45, phi, 0], order: "YXZ" });
    star.scale.setScalar(sz);
    hat.add(star);
  });

  // Soft shadow under Pip.
  const sc = document.createElement("canvas");
  sc.width = sc.height = 128;
  const sctx = sc.getContext("2d");
  const sg = sctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  sg.addColorStop(0, "rgba(0,0,0,0.5)");
  sg.addColorStop(1, "rgba(0,0,0,0)");
  sctx.fillStyle = sg;
  sctx.fillRect(0, 0, 128, 128);
  const shadowTex = keep(new THREE.CanvasTexture(sc));
  const shadow = mesh(new THREE.PlaneGeometry(2.6, 2.6),
    keep(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })),
    { pos: [0, 0.01, 0], rot: [-Math.PI / 2, 0, 0] });
  scene.add(shadow);

  // Sparkles from the wand tip.
  const sparkGeo = keep(new THREE.ShapeGeometry(starShape(0.07, 0.03)));
  const sparkCols = [C.gold, C.white, C.pink, 0xa8c8ff];
  const sparks = [];
  for (let i = 0; i < 32; i++) {
    const m = new THREE.Mesh(sparkGeo, keep(new THREE.MeshBasicMaterial({
      color: sparkCols[i % 4], transparent: true, side: THREE.DoubleSide, depthWrite: false,
    })));
    m.visible = false;
    m.userData = { life: 0, v: new THREE.Vector3() };
    scene.add(m);
    sparks.push(m);
  }
  let sparkIdx = 0;
  const tipPos = new THREE.Vector3();
  function burst(n) {
    wandStar.getWorldPosition(tipPos);
    for (let i = 0; i < n; i++) {
      const s = sparks[sparkIdx++ % sparks.length];
      s.position.copy(tipPos);
      s.userData.life = 1;
      s.userData.v.set((Math.random() - 0.5) * 1.6, 0.6 + Math.random() * 1.2, (Math.random() - 0.5) * 1.6);
      s.scale.setScalar(0.7 + Math.random() * 0.9);
      s.visible = true;
    }
  }

  // ---------- animation state ----------
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  let mood = "normal";
  let talkPulse = 0;
  let mouthOpen = false;
  let hopT = -1;
  let cheerT = -1;
  let flyT = -1;
  let flyDur = 0.6;
  let flyDir = 1;
  let sparkAcc = 0;
  let lookX = 0;
  let lookCur = 0;
  let t = 0;
  let blinkT = 2.5;
  let blinking = 0;
  const st = { wl: 0.3, wr: 0, hat: 0, sway: 0, y: 0 };
  const clock = new THREE.Clock();

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    const k = 1 - Math.exp(-dt * 12);

    // Target pose: idle breathing, plus mood and talking accents.
    const breath = reduced ? 0 : Math.sin(t * 2.2);
    const surprised = mood === "surprised" ? 0.7 : 0;
    const tilt = mood === "thinking" ? 0.13 : 0;
    let tg = {
      wl: 0.3 + surprised + talkPulse * 0.15,
      wr: 0.1 + surprised * 0.4 + talkPulse * 0.2,
      hat: breath * 0.05 - tilt * 0.6,
      sway: tilt + breath * 0.025,
      y: 0,
    };
    if (cheerT >= 0) {
      cheerT += dt;
      const b = cheerT * 4;
      const hop = Math.abs(Math.sin(b * Math.PI));
      tg = { wl: 0.4 + hop * 1.0, wr: 0.45 * hop, hat: Math.sin(b * Math.PI) * 0.18, sway: Math.sin(b * Math.PI) * 0.06, y: hop * 0.35 };
      if (Math.floor(cheerT * 4) !== Math.floor((cheerT - dt) * 4)) burst(5);
      if (cheerT > 1.6) cheerT = -1;
    }
    for (const key in st) st[key] += (tg[key] - st[key]) * k;

    talkPulse = Math.max(0, talkPulse - dt * 9);
    let hop = 0;
    if (hopT >= 0) {
      hopT += dt;
      hop = Math.sin(Math.min(hopT / 0.36, 1) * Math.PI) * 0.25;
      if (hopT > 0.36) hopT = -1;
    }

    // Flying: fast wing beats, a stretch along the direction of travel, and a sparkle trail.
    let flap = 0;
    let stretch = 0;
    let flyLift = 0;
    let flyLean = 0;
    if (flyT >= 0) {
      flyT += dt;
      const p = Math.min(flyT / flyDur, 1);
      const env = Math.sin(p * Math.PI); // 0 → 1 → 0 over the flight
      flap = Math.abs(Math.sin(t * 26)) * (0.4 + env * 0.6);
      stretch = env * 0.12;
      flyLift = Math.sin(t * 26) * 0.05 * env;
      flyLean = -flyDir * env * 0.25;
      sparkAcc += dt;
      if (sparkAcc > 0.06) { sparkAcc = 0; burst(2); }
      if (p >= 1) { flyT = -1; hopT = 0; } // little bounce on landing
    }

    lookCur += (lookX - lookCur) * Math.min(1, dt * 5);
    dancer.position.set(0, st.y + hop + flyLift, 0);
    dancer.rotation.set(flyLean, lookCur * 0.45, st.sway);
    const sq = talkPulse * 0.025 - stretch;
    body.scale.set(1 + sq * 0.6, 1 - sq, 1 + sq * 0.6);
    beak.rotation.x = -(mouthOpen ? 0.55 : 0) * (0.4 + talkPulse * 0.6);
    wingL.rotation.z = -(0.2 + st.wl + flap * 1.5);
    wingR.rotation.z = 2.15 + st.wr + flap * 0.9;
    pencil.rotation.z = Math.PI + 0.5 + talkPulse * 0.12;
    hat.rotation.z = 0.1 + st.hat;
    tip.rotation.z = -0.75 + st.hat * 1.6;
    wandStar.rotation.y += dt * 3;
    pupils.forEach((p) => { p.position.x = Math.sign(p.position.x) * 0.35 + lookCur * 0.06; });

    const sh = 1 - Math.min(st.y + hop, 0.6) * 0.7;
    shadow.scale.set(sh, sh, 1);
    shadow.material.opacity = sh;

    blinkT -= dt;
    if (blinkT < 0) { blinking = 0.14; blinkT = 2 + Math.random() * 3; }
    if (blinking > 0) blinking -= dt;
    const eyeBase = mood === "happy" ? 0.6 : mood === "surprised" ? 1.15 : 1;
    eyes.scale.y += ((blinking > 0 ? 0.08 : eyeBase) - eyes.scale.y) * Math.min(1, dt * 30);

    sparks.forEach((s) => {
      if (!s.visible) return;
      const u = s.userData;
      u.life -= dt / 1.3;
      if (u.life <= 0) { s.visible = false; return; }
      u.v.y -= dt * 0.9;
      s.position.addScaledVector(u.v, dt);
      s.material.opacity = Math.min(1, u.life * 1.5);
      s.quaternion.copy(camera.quaternion);
    });

    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();
  renderer.setAnimationLoop(tick);

  return {
    setMood(next) {
      if (next === mood) return;
      mood = next;
      if (!reduced && (next === "happy" || next === "surprised")) hopT = 0;
    },
    /** Called for each typed character: flaps the beak. */
    talk(open) {
      mouthOpen = open;
      if (open) talkPulse = 1;
    },
    cheer() {
      if (reduced) { burst(8); return; }
      cheerT = 0;
    },
    /** Flap and stretch for `seconds` while the panel moves. dir: 1 = up, -1 = down. */
    fly(dir = 1, seconds = 0.6) {
      if (reduced) return;
      flyDir = dir;
      flyDur = seconds;
      flyT = 0;
      sparkAcc = 0;
    },
    /** -1 = look left, 0 = straight ahead, 1 = look right. */
    look(x) { lookX = Math.max(-1, Math.min(1, x)); },
    resize,
    dispose() {
      renderer.setAnimationLoop(null);
      disposables.forEach((d) => d.dispose?.());
      SPH.dispose();
      renderer.dispose();
    },
  };
}
