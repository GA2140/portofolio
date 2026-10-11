// ==========================================================
// particles.js — membuat semua partikel galaksi
// (cincin cahaya, lengan spiral, debu) lalu merangkumnya
// jadi satu objek THREE.Points.
// ==========================================================

// Angka acak berdistribusi mirip lonceng, rentang -1..1
const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;

// Warna berdasarkan posisi t (0 = tepi dalam, 1.4 = ujung paling luar)
function colorAt(t) {
  const stops = CONFIG.colorStops;
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const a = stops[i - 1], b = stops[i];
      const f = (t - a[0]) / (b[0] - a[0]);
      return a[1].map((v, k) => v + (b[1][k] - v) * f);
    }
  }
  return stops[stops.length - 1][1];
}

// --- Tiga jenis partikel. Masing-masing mengembalikan { x, y, z, t, size, bright } ---

// Cincin cahaya tipis di tepi lubang hitam
function makeRingParticle() {
  const r = CONFIG.holeRadius - 0.07 + gauss() * 0.05 + Math.random() * 0.08;
  const th = Math.random() * Math.PI * 2;
  return { x: r * Math.cos(th), y: gauss() * 0.03, z: r * Math.sin(th),
           t: 0, size: 14 + Math.random() * 12, bright: 1.3 };
}

// Lengan spiral: mulai dari cincin, menyapu keluar, memudar di ujung
function makeArmParticle(i) {
  const R = CONFIG.radius, H = CONFIG.holeRadius;
  const r = (H + (R - H) * Math.pow(Math.random(), 1.2)) * (1 + 0.4 * Math.pow(Math.random(), 2));
  const a = (r - H) * CONFIG.armSpin + (i % CONFIG.arms) * Math.PI * 2 / CONFIG.arms;

  // Sebaran di sekitar garis lengan (lebih tebal ke arah luar)
  const w = 0.2 + 0.12 * r;
  const p = Math.pow(Math.random(), 2.2) * w * (Math.random() < 0.5 ? -1 : 1);
  const q = Math.pow(Math.random(), 2.2) * w * (Math.random() < 0.5 ? -1 : 1);

  const t = Math.max(0, (r - H) / (R - H));
  const fade = 1 - 0.55 * Math.min(1, Math.max(0, (t - 0.8) / 0.6)); // redup di ujung
  return {
    x: Math.cos(a) * (r + q) - Math.sin(a) * p,
    y: gauss() * 0.07 * Math.exp(-r * 0.3),
    z: Math.sin(a) * (r + q) + Math.cos(a) * p,
    t, size: 9 + Math.random() * 12 + t * 6,
    bright: (0.6 + Math.random() * 0.4) * (1 + 0.4 * Math.min(t, 1)) * fade
  };
}

// Debu halus yang tersebar di sekitar cakram
function makeDustParticle() {
  const r = 1 + CONFIG.radius * Math.pow(Math.random(), 0.7);
  const a = Math.random() * Math.PI * 2;
  return { x: Math.cos(a) * r, y: gauss() * 0.35, z: Math.sin(a) * r,
           t: 0.7, size: 6 + Math.random() * 8, bright: 0.5 };
}

// --- Merakit semuanya ---
function createParticles(renderer) {
  const N = CONFIG.particles;
  const position = new Float32Array(N * 3);  // posisi akhir (bentuk galaksi)
  const start    = new Float32Array(N * 3);  // posisi awal (menyebar)
  const color    = new Float32Array(N * 3);
  const delay    = new Float32Array(N);
  const size     = new Float32Array(N);
  const rnd      = new Float32Array(N);

  const { ring, arms } = CONFIG.share;

  for (let i = 0; i < N; i++) {
    const kind = Math.random();
    const p = kind < ring ? makeRingParticle()
            : kind < ring + arms ? makeArmParticle(i)
            : makeDustParticle();

    const c = colorAt(Math.min(1.4, p.t));
    position.set([p.x, p.y, p.z], i * 3);
    color.set([c[0] * p.bright, c[1] * p.bright, c[2] * p.bright], i * 3);
    size[i] = p.size;
    rnd[i] = Math.random();
    delay[i] = Math.min(0.4, 0.22 * p.t + Math.random() * 0.18); // bagian dalam terbentuk lebih dulu

    // Posisi awal acak di ruang sekitar galaksi
    const d = new THREE.Vector3(gauss(), gauss(), gauss())
      .normalize().multiplyScalar(0.3 + Math.sqrt(Math.random()) * 7);
    start.set([d.x, d.y, d.z], i * 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geometry.setAttribute('aStart',   new THREE.BufferAttribute(start, 3));
  geometry.setAttribute('aColor',   new THREE.BufferAttribute(color, 3));
  geometry.setAttribute('aDelay',   new THREE.BufferAttribute(delay, 1));
  geometry.setAttribute('aSize',    new THREE.BufferAttribute(size, 1));
  geometry.setAttribute('aRnd',     new THREE.BufferAttribute(rnd, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uProg: { value: 0 },
      uPx:   { value: renderer.getPixelRatio() },
      uTime: { value: 0 },
      uSpin: { value: 0 },
      uTap:  { value: 99 }
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, material };
}
