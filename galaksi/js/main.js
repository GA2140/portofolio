// ==========================================================
// main.js — menyatukan semuanya: scene, kamera, kontrol,
// interaksi, dan loop animasi.
// ==========================================================

// ---------- Renderer, scene, kamera ----------
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.setClearColor(0x000005);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, 1, 0.1, 100);
const camDir = new THREE.Vector3(...CONFIG.camera.dir).normalize();

// ---------- Kontrol (geser untuk memutar, cubit untuk zoom) ----------
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.6;
controls.minDistance = 3;
controls.maxDistance = 30;

// ---------- Objek di scene ----------
const { points, material } = createParticles(renderer);
const glow = createGlow();
scene.add(points);
scene.add(glow);

// ---------- Menyesuaikan ukuran layar ----------
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  // Jauhkan kamera di layar sempit supaya galaksi tidak terpotong
  const dist = Math.max(7.6, (CONFIG.radius + 0.8) / (0.577 * camera.aspect));
  camera.position.copy(camDir).multiplyScalar(dist);
  controls.update();
}
addEventListener('resize', resize);
resize();

// ---------- Status animasi ----------
const FORM = 1, HOLD = 2, DISPERSE = 3;   // tahap animasi
let mode = FORM;
let progress = 0;      // 0 = menyebar, 1 = galaksi terbentuk
let holdTime = 0;
let spin = 0;          // sudut putar galaksi
let tapTime = 99;      // detik sejak layar terakhir diketuk
let lastFrame = performance.now() + 300;
const { form, hold, disperse } = CONFIG.durations;

// Tombol: menyebar / membentuk ulang
document.getElementById('replay').onclick = () => {
  mode = (mode === DISPERSE) ? FORM : DISPERSE;
};

// Ketukan singkat (bukan geseran) memicu gelombang kejut
let pointerDown = null;
renderer.domElement.addEventListener('pointerdown', e => {
  pointerDown = [e.clientX, e.clientY, performance.now()];
});
renderer.domElement.addEventListener('pointerup', e => {
  const isTap = pointerDown
    && Math.hypot(e.clientX - pointerDown[0], e.clientY - pointerDown[1]) < 8
    && performance.now() - pointerDown[2] < 300;
  if (isTap) tapTime = 0;
  pointerDown = null;
});

// ---------- Loop animasi ----------
function loop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  spin += dt;
  tapTime += dt;

  // Siklus: membentuk -> bertahan -> menyebar -> membentuk lagi
  if (mode === FORM) {
    progress += dt / form;
    if (progress >= 1) { progress = 1; mode = HOLD; holdTime = 0; }
  } else if (mode === HOLD) {
    holdTime += dt;
    if (holdTime >= hold) mode = DISPERSE;
  } else {
    progress -= dt / disperse;
    if (progress <= 0) { progress = 0; mode = FORM; spin = 0; }
  }

  // Kirim data ke shader
  const u = material.uniforms;
  u.uTime.value = now * 0.001;
  u.uSpin.value = spin;
  u.uTap.value = tapTime;
  u.uProg.value = progress;

  // Cahaya di sekitar lubang hitam ikut muncul seiring pembentukan
  const eased = progress * progress * (3 - 2 * progress);
  const pulse = 1 + 0.05 * Math.sin(now * 0.002);
  glow.material.opacity = Math.min(1, eased * 1.1 * pulse);
  glow.scale.setScalar(0.8 + 3.6 * eased);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
