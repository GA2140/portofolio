// ==========================================================
// glow.js — cincin cahaya besar di sekitar lubang hitam.
// Berupa sprite (gambar datar yang selalu menghadap kamera),
// teksturnya digambar sendiri dengan canvas.
// ==========================================================
function createGlow() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0,    'rgba(0,0,0,0)');          // tengah: kosong (lubang hitam)
  g.addColorStop(0.27, 'rgba(0,0,0,0)');
  g.addColorStop(0.33, 'rgba(255,190,100,.5)');
  g.addColorStop(0.36, 'rgba(255,240,200,.95)');  // cincin terang
  g.addColorStop(0.41, 'rgba(255,170,70,.35)');
  g.addColorStop(0.62, 'rgba(200,80,20,.12)');
  g.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvas),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0
  }));
}
