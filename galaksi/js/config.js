// ==========================================================
// config.js — semua pengaturan galaksi ada di sini.
// Ubah angkanya untuk bereksperimen.
// ==========================================================
const CONFIG = {
  radius: 4.2,        // jari-jari cakram galaksi
  holeRadius: 0.85,   // tepi dalam cakram (ukuran lubang hitam)
  arms: 4,            // jumlah lengan spiral
  armSpin: 0.9,       // seberapa melengkung lengan (radian per satuan jarak)

  // Jumlah partikel (lebih sedikit di layar kecil agar ringan)
  particles: innerWidth < 700 ? 80000 : 150000,

  // Pembagian jenis partikel (total 1.0)
  share: { ring: 0.10, arms: 0.85, dust: 0.05 },

  // Durasi animasi (detik)
  durations: { form: 3.5, hold: 9, disperse: 2.5 },

  // Gradasi warna dari tepi dalam ke ujung lengan: [posisi, [r, g, b]]
  colorStops: [
    [0,   [1.0, 0.95, 0.85]],  // putih panas
    [0.12, [1.0, 0.78, 0.35]], // emas
    [0.5,  [1.0, 0.45, 0.08]], // oranye
    [1.0,  [0.8, 0.2, 0.04]],  // merah-oranye
    [1.4,  [0.3, 0.05, 0.02]]  // merah gelap (memudar)
  ],

  camera: { fov: 60, dir: [0, 3.4, 6.6] }
};
