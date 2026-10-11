# Galaksi Partikel (black hole)

Animasi partikel 3D dengan HTML, CSS, dan JavaScript + Three.js.

## Cara menjalankan
1. Buka folder ini di VS Code.
2. Pasang ekstensi **Live Server**, lalu klik kanan `index.html` > **Open with Live Server**.
   (Butuh internet karena Three.js dimuat dari CDN.)

## Susunan file
```
index.html        halaman utama
css/style.css     tampilan judul dan tombol
js/config.js      semua pengaturan (jumlah partikel, warna, durasi, dll)
js/shaders.js     kode GLSL (gerak dan gambar partikel di GPU)
js/particles.js   pembuat partikel (cincin, lengan, debu)
js/glow.js        cahaya cincin di sekitar lubang hitam
js/main.js        scene, kamera, interaksi, dan loop animasi
```
Urutan `<script>` di `index.html` penting: `config` -> `shaders` -> `particles` -> `glow` -> `main`.
