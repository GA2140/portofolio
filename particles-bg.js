// =====================================================
//  particles-bg.js — titik-titik melayang di latar belakang
// =====================================================
(function () {
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w, h, dots = [], color = "#ffc83d";

  // Ambil warna dari tema (variabel --cy di style.css)
  function readColor() {
    color = getComputedStyle(document.documentElement)
      .getPropertyValue("--cy").trim() || "#ffc83d";
  }
  readColor();

  // Kalau tema diganti (gelap <-> terang), warna ikut berubah
  new MutationObserver(readColor).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // Buat titik-titiknya. Jumlah menyesuaikan luas layar.
  function makeDots() {
    const count = Math.min(90, Math.max(30, Math.round((w * h) / 18000)));
    dots = [];
    for (let i = 0; i < count; i++) {
      dots.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 1.6,        // ukuran titik
        vx: (Math.random() - 0.5) * 16,       // kecepatan kiri-kanan
        vy: (Math.random() - 0.5) * 16,       // kecepatan atas-bawah
        a: 0.75 + Math.random() * 1,           // tingkat terang
        sp: 0.5 + Math.random() * 1.5,        // kecepatan berkelip
        ph: Math.random() * 6.28,             // awal kelip (acak)
      });
    }
  }

  // Sesuaikan ukuran canvas dengan layar
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeDots();
    if (reduceMotion) draw(0);
  }
  addEventListener("resize", resize);

  // Gambar semua titik
  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    for (const p of dots) {
      const twinkle = 0.6 + 0.4 * Math.sin(now * 0.001 * p.sp + p.ph);
      ctx.globalAlpha = p.a * twinkle;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Loop animasi: geser titik sedikit demi sedikit
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    for (const p of dots) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // Keluar dari satu sisi, masuk dari sisi seberangnya
      if (p.x < -5) p.x = w + 5;
      if (p.x > w + 5) p.x = -5;
      if (p.y < -5) p.y = h + 5;
      if (p.y > h + 5) p.y = -5;
    }

    draw(now);
    requestAnimationFrame(frame);
  }

  resize();
  if (!reduceMotion) requestAnimationFrame(frame);
})();