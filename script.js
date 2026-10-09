// =====================================================
//  script.js — Portofolio Gustov
//  Isi: 1 Loading · 2 Muncul saat scroll · 3 Scroll pelan
//       4 Menu aktif · 5 Ganti tema · 6 Fitur tambahan
// =====================================================

// Helper singkat untuk mengambil elemen berdasarkan id
const $ = (id) => document.getElementById(id);

// Kalau pengguna mematikan animasi di HP/laptopnya, kita hormati
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;


// ===== 1. LOADING =====
// LOAD_MS = lama loading (milidetik). Makin kecil makin cepat.
const LOAD_MS = 2000;

const loader = $("loader");
const bar = $("bar");
const pct = $("pct");

let pageLoaded = false;
const startTime = performance.now();
addEventListener("load", () => (pageLoaded = true));

function tick(now) {
  let progress = Math.min((now - startTime) / LOAD_MS, 1) * 100;

  // Tahan di 90% sampai semua file selesai dimuat
  if (!pageLoaded) progress = Math.min(progress, 90);

  bar.style.width = progress + "%";
  pct.textContent = Math.round(progress);

  if (progress < 100) {
    requestAnimationFrame(tick);
    return;
  }

  // Selesai: layar terbelah, lalu loader dihapus
  loader.classList.add("done");
  document.body.classList.remove("loading");
  setTimeout(() => loader.remove(), 1200);
}
requestAnimationFrame(tick);


// ===== 2. ELEMEN MUNCUL SAAT DISCROLL =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in");
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".rv").forEach((el) => revealObserver.observe(el));


// ===== 3. SCROLL PELAN SAAT KLIK MENU =====
// DUR = lama scroll (milidetik). Makin besar makin pelan.
const DUR = 1800;

// Rumus supaya gerakan mulai pelan, cepat di tengah, lalu pelan lagi
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function go(targetY) {
  if (reduceMotion) {
    scrollTo(0, targetY);
    return;
  }

  const startY = scrollY;
  const distance = targetY - startY;
  const t0 = performance.now();

  function step(now) {
    const p = Math.min((now - t0) / DUR, 1);
    scrollTo(0, startY + distance * easeInOutCubic(p));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const section = document.querySelector(link.getAttribute("href"));
    const offset = link.hash === "#home" ? 0 : 20;
    go(section.getBoundingClientRect().top + scrollY - offset);
  });
});


// ===== 4. MENU AKTIF =====
// Menu yang bagiannya sedang tampil di tengah layar akan menyala
const navLinks = [...document.querySelectorAll("nav a")];

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("on", link.hash === "#" + entry.target.id);
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);

document.querySelectorAll("section").forEach((s) => sectionObserver.observe(s));


// ===== 5. GANTI TEMA =====
$("theme").onclick = () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
};


// ===== 6. FITUR TAMBAHAN =====

// --- Notifikasi kecil (toast) ---
function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

// --- Garis progress scroll + tombol ke atas ---
addEventListener(
  "scroll",
  () => {
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    const ratio = maxScroll > 0 ? scrollY / maxScroll : 0;

    $("prog").style.transform = "scaleX(" + ratio + ")";
    $("totop").classList.toggle("show", scrollY > 600);
  },
  { passive: true }
);

$("totop").onclick = () => go(0);

// --- Teks mengetik otomatis (tambah/ubah kalimat di daftar ini) ---
const words = [
  "Web Developer Pemula",
  "Penggemar HTML, CSS & JS",
  "Calon Game Developer",
];

if (!reduceMotion) {
  const typedEl = $("typed");
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function type() {
    const word = words[wordIndex];
    typedEl.textContent = word.slice(0, charIndex);

    // Kata selesai diketik → tunggu sebentar, lalu mulai menghapus
    if (!deleting && charIndex === word.length) {
      deleting = true;
      setTimeout(type, 1600);
      return;
    }

    // Kata selesai dihapus → pindah ke kata berikutnya
    if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
    }

    charIndex += deleting ? -1 : 1;
    setTimeout(type, deleting ? 35 : 75);
  }
  type();
}

// --- Cahaya lembut mengikuti kursor di kartu ---
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", e.clientX - rect.left + "px");
    card.style.setProperty("--my", e.clientY - rect.top + "px");
  });
});

// --- Tombol salin email ---
$("copy").onclick = () => {
  navigator.clipboard.writeText("gustovazammahendra@gmail.com").then(
    () => toast("Email disalin ✓"),
    () => toast("Gagal menyalin")
  );
};

// --- Form kontak: pesan dikirim lewat WhatsApp ---
$("cf").onsubmit = (e) => {
  e.preventDefault();

  const text = "Halo Gustov, saya " + $("cn").value + ". " + $("cm").value;
  const url = "https://wa.me/6289510279181?text=" + encodeURIComponent(text);

  window.open(url, "_blank");
  toast("Membuka WhatsApp...");
};
