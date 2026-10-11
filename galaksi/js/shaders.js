// ==========================================================
// shaders.js — kode GLSL yang dijalankan di GPU.
// Vertex shader: menghitung posisi tiap partikel (membentuk,
//   berputar, bergetar, gelombang saat diketuk).
// Fragment shader: menggambar tiap titik jadi bulatan lembut.
// ==========================================================
const VERTEX_SHADER = `
  attribute vec3 aStart;     // posisi awal (saat menyebar)
  attribute vec3 aColor;     // warna partikel
  attribute float aDelay;    // jeda sebelum partikel mulai bergerak
  attribute float aSize;     // ukuran dasar titik
  attribute float aRnd;      // angka acak per partikel

  uniform float uProg;       // progres pembentukan 0..1
  uniform float uPx;         // pixel ratio layar
  uniform float uTime;       // waktu (detik)
  uniform float uSpin;       // sudut putar galaksi
  uniform float uTap;        // detik sejak layar diketuk

  varying vec3 vC;

  void main() {
    // Progres tiap partikel (dengan jeda), dihaluskan
    float p = clamp((uProg - aDelay) / .6, 0., 1.);
    float e = p * p * p * (p * (p * 6. - 15.) + 10.);

    // Putaran galaksi: bagian dalam sedikit lebih cepat
    float rr = length(position.xz);
    float om = .5 * (.12 + .1 / (1. + rr * rr * .35));
    float sa = uSpin * om;
    float sc = cos(sa), ss = sin(sa);
    vec3 tp = position;
    tp.xz = mat2(sc, -ss, ss, sc) * tp.xz;

    // Getaran halus tiap partikel
    tp += vec3(sin(uTime * 1.1 + aRnd * 40.),
               sin(uTime * 1.4 + aRnd * 77.) * .5,
               cos(uTime * 1.2 + aRnd * 53.)) * .035;

    // Pindah dari posisi awal ke posisi galaksi sambil berputar
    vec3 q = mix(aStart, tp, e);
    float an = (1. - e) * 2.5;
    float cs = cos(an), sn = sin(an);
    q.xz = mat2(cs, -sn, sn, cs) * q.xz;

    // Gelombang kejut saat layar diketuk
    float dd = length(q.xz);
    float ring = exp(-pow((dd - uTap * 4.) / .9, 2.)) * exp(-uTap * 1.1) * e;
    q.xz += normalize(q.xz + vec2(1e-4)) * ring * .9;
    q.y += ring * .5 * sin(aRnd * 6.283);

    // Warna: oranye saat menyebar, lalu berubah ke warna aslinya + berkelip
    vC = mix(vec3(1., .5, .15), aColor, e) * (.82 + .28 * sin(uTime * 2. + aRnd * 90.));

    vec4 mv = modelViewMatrix * vec4(q, 1.);
    gl_PointSize = max(aSize * uPx * 1.5 / (-mv.z), 1.6 * uPx);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vC;
  void main() {
    float d = length(gl_PointCoord - .5);
    float a = smoothstep(.5, .05, d);   // tepi titik memudar lembut
    gl_FragColor = vec4(vC, a);
  }
`;
