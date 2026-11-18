window.__boot3D = function () {
(function () {
  var walk = document.getElementById('walk'), stage = document.getElementById('stage'), canvas = document.getElementById('view');
  var caps = Array.prototype.slice.call(document.querySelectorAll('.cap'));
  function noScene() { walk.style.height = 'auto'; stage.style.position = 'static'; stage.style.height = 'auto'; canvas.hidden = true; document.getElementById('play').hidden = true;
    caps.forEach(function (c) { c.classList.add('on'); c.style.position = 'static'; c.style.margin = '12px 20px'; }); }
  if (!window.THREE) { noScene(); return; }
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); } catch (e) { noScene(); return; }
  var MOBILE = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window && Math.min(window.innerWidth, window.innerHeight) < 700);
  if (MOBILE) { document.getElementById('w3s').classList.add('mobile'); var sh0 = document.getElementById('startHint'); if (sh0) sh0.textContent = 'Toucher l’écran pour explorer.'; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.physicallyCorrectLights = false;
  var POST = !!(THREE.EffectComposer && THREE.RenderPass && THREE.ShaderPass && THREE.UnrealBloomPass && THREE.FXAAShader);
  if (POST) renderer.outputEncoding = THREE.LinearEncoding; else { renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; }

  var C = { wall: 0x2F7378, wains: 0x1E4F55, navy: 0x2B3154, ink: 0x171B2B, white: 0xFFFFFF, clawd: 0xD77757, pen: 0x1F3FD1, wood: 0xC99562, woodDark: 0x94663A,
            red: 0xD4472F, green: 0x3E9B6E, steel: 0x9AA3BD, mint: 0xBFE6D6, lilac: 0xC9C2F0, sand: 0xF0DCBC, pink: 0xF7CFC6, sky: 0xBFE0FF, yellow: 0xF2C230,
            teal: 0x2F8F86, blue: 0x3F6FE0, card: 0xC9A777, screen: 0x8FB8FF };

  function texFrom(cv) { var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t; }
  function canvasOf(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
  var scene = new THREE.Scene();
  function lin(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  scene.background = lin(0xE6DCC8); scene.fog = new THREE.Fog(lin(0xE6DCC8), 40, 110);
  var camera = new THREE.PerspectiveCamera(58, 1, 0.2, 130); scene.add(camera);
  scene.add(new THREE.HemisphereLight(0xFFF6E6, 0xC79A6B, 0.66));
  var fill = new THREE.DirectionalLight(0xFFFFFF, 0.14); fill.position.set(-6, 20, -4); scene.add(fill);
  // the sun comes in low through the windows and lays long patches across the aisle
  var sun = new THREE.DirectionalLight(0xFFE2B8, 1.25); sun.position.set(9, 10.5, 24); sun.target.position.set(0, 0, -2); scene.add(sun.target); sun.castShadow = true; sun.shadow.mapSize.set(MOBILE ? 2048 : 4096, MOBILE ? 2048 : 4096);
  var scam = sun.shadow.camera; scam.left = -27; scam.right = 27; scam.top = 16; scam.bottom = -16; scam.near = 1; scam.far = 70; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4; scene.add(sun);
  // soft reflections: a small sky-and-room environment, prefiltered once
  (function () { var es = new THREE.Scene(), cv = canvasOf(16, 256), c = cv.getContext('2d'), g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#DCEBFF'); g.addColorStop(0.45, '#F4F1EA'); g.addColorStop(0.55, '#CFC6BA'); g.addColorStop(1, '#8E8A86'); c.fillStyle = g; c.fillRect(0, 0, 16, 256);
    var dome = new THREE.Mesh(new THREE.SphereGeometry(50, 24, 16), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), side: THREE.BackSide })); es.add(dome);
    var win = new THREE.Mesh(new THREE.PlaneGeometry(60, 14), new THREE.MeshBasicMaterial({ color: 0xFFFFFF })); win.position.set(0, 6, 40); win.rotation.y = Math.PI; es.add(win);
    var pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(es, 0.04).texture; pm.dispose(); })();

  // ---- building blocks
  var mats = {};
  function mat(color, o) { if (o) return new THREE.MeshStandardMaterial(Object.assign({ color: lin(color), roughness: 0.72, metalness: 0, envMapIntensity: 0.22 }, o));
    return mats[color] || (mats[color] = new THREE.MeshStandardMaterial({ color: lin(color), roughness: 0.72, metalness: 0, envMapIntensity: 0.22 })); }
  function put(mesh, x, y, z, parent, flat) { mesh.position.set(x, y, z); mesh.castShadow = !flat; mesh.receiveShadow = true; (parent || scene).add(mesh); return mesh; }
  function box(w, h, d, color, x, y, z, parent, flat) { return put(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === 'number' ? mat(color) : color), x, y + h / 2, z, parent, flat); }
  function cyl(r, h, color, x, y, z, parent, rTop) { return put(new THREE.Mesh(new THREE.CylinderGeometry(rTop === undefined ? r : rTop, r, h, 20), mat(color)), x, y + h / 2, z, parent); }
  function ball(r, color, x, y, z, parent) { return put(new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat(color)), x, y, z, parent); }
  function glow(w, h, color, x, y, z, ry, map, gain) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial(map ? { map: map } : { color: lin(color).multiplyScalar(gain || 1) })); m.position.set(x, y, z); m.rotation.y = ry || 0; scene.add(m); return m; }
  var blobTex = (function () { var cv = canvasOf(128, 128), c = cv.getContext('2d'), g = c.createRadialGradient(64, 64, 6, 64, 64, 62);
    g.addColorStop(0, 'rgba(18,20,34,0.55)'); g.addColorStop(0.6, 'rgba(18,20,34,0.22)'); g.addColorStop(1, 'rgba(18,20,34,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(cv); })();
  var blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });
  function ground(x, z, w, d, parent, y) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), blobMat); m.rotation.x = -Math.PI / 2; m.position.set(x, y || 0.045, z); m.renderOrder = 1; m.raycast = function () {}; (parent || scene).add(m); return m; }
  // a box with softened edges, for anything seen up close
  function rbox(w, h, d, r, color, x, y, z, parent, flat) { r = Math.min(r, w / 2.2, h / 2.2, d / 2.2); var sh = new THREE.Shape(), hw = w / 2 - r, hh = h / 2 - r;
    sh.moveTo(-hw, -hh); sh.lineTo(hw, -hh); sh.lineTo(hw, hh); sh.lineTo(-hw, hh); sh.lineTo(-hw, -hh);
    var g = new THREE.ExtrudeGeometry(sh, { depth: d - 2 * r, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 2, curveSegments: 1 }); g.center();
    return put(new THREE.Mesh(g, typeof color === 'number' ? mat(color) : color), x, y + h / 2, z, parent, flat); }
  var paperMat = mat(0xFFFFFF, {}), inkPaperMat = mat(0xC9D6FF, {});
  var SOLIDS = [];
  function solid(x1, x2, z1, z2) { SOLIDS.push([x1, x2, z1, z2]); }
  function desk(w, d, h, x, z, top, leg) { rbox(w, 0.08, d, 0.03, top, x, h - 0.08, z); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { box(0.08, h - 0.08, 0.08, leg, x + s[0] * (w / 2 - 0.12), 0, z + s[1] * (d / 2 - 0.12)); }); solid(x - w / 2, x + w / 2, z - d / 2, z + d / 2); ground(x, z, w * 1.5, d * 1.9); }
  function papers(x, y, z, n) { for (var i = 0; i < n; i++) box(0.42, 0.02, 0.56, C.white, x + (i % 2) * 0.02, y + i * 0.022, z, null, true).rotation.y = (i % 3 - 1) * 0.07; }
  var plants = [];
  function plant(x, z, s, sx, sz) { s = s || 1; cyl(0.26 * s, 0.5 * s, C.white, x, 0, z, null, 0.32 * s); ball(0.42 * s, C.green, x, 0.82 * s, z); ball(0.3 * s, C.green, x + 0.22 * s, 1.14 * s, z - 0.08); ball(0.27 * s, C.green, x - 0.2 * s, 1.1 * s, z + 0.1);
    solid(x - 0.4, x + 0.4, z - 0.4, z + 0.4); ground(x, z, 1.5 * s, 1.5 * s); plants.push({ x: sx === undefined ? x : sx, z: sz === undefined ? z - 1.0 : sz, faceTo: [x, z] }); }
  function sign(text, color, x, y, z, ry, w) { var cv = canvasOf(1024, 256), c = cv.getContext('2d'); c.fillStyle = color; c.textBaseline = 'middle'; c.font = '800 190px "Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif'; c.fillText(text, 8, 138);
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: texFrom(cv), transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); }
  function pendant(x, z, color) { box(0.03, 1.3, 0.03, C.navy, x, 3.1, z, null, true); cyl(0.42, 0.34, color, x, 2.78, z, null, 0.16); ball(0.12, 0xFFF1C2, x, 2.8, z).material = new THREE.MeshBasicMaterial({ color: lin(0xFFE6A8).multiplyScalar(3.2) }); }
  function rug(x1, x2, z1, z2, color) { box(x2 - x1, 0.03, z2 - z1, color, (x1 + x2) / 2, 0, (z1 + z2) / 2, null, true); }

  // ---- the room: x runs down the aisle, work stations along z = -8.5, windows at z = 7.5
  var floorCv = canvasOf(256, 256); (function () { var c = floorCv.getContext('2d'); var tones = ['#C98F55', '#BF8449', '#D09A62', '#B97C42']; for (var r = 0; r < 4; r++) { var off = (r % 2) * 96; for (var q = -1; q < 2; q++) { c.fillStyle = tones[(r + q + 4) % 4]; c.fillRect(off + q * 192, r * 64, 190, 62); } } c.fillStyle = '#9A6634'; for (var r2 = 0; r2 < 4; r2++) c.fillRect(0, r2 * 64 + 62, 256, 2); })();
  var floorTex = texFrom(floorCv); floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(22, 9);
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(44, 18), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.4, metalness: 0, envMapIntensity: 0.38 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -0.5); floor.receiveShadow = true; scene.add(floor);
  [[-22, -8.1], [-5.7, 2.0], [4.4, 22]].forEach(function (s) { var w = s[1] - s[0], cx = (s[0] + s[1]) / 2;
    box(w, 4.4, 0.3, C.wall, cx, 0, -8.65, null, true); box(w, 1.1, 0.06, C.wains, cx, 0, -8.47, null, true); box(w, 0.12, 0.08, C.navy, cx, 0, -8.45, null, true); solid(s[0], s[1], -8.95, -8.35); });
  [-6.9, 3.2].forEach(function (x) { box(2.4, 1.7, 0.3, C.wall, x, 2.7, -8.65, null, true); box(0.1, 2.7, 0.36, C.navy, x - 1.2, 0, -8.65, null, true); box(0.1, 2.7, 0.36, C.navy, x + 1.2, 0, -8.65, null, true); });
  box(0.3, 4.4, 18, 0xE3A52C, -22, 0, -0.5, null, true); box(0.06, 1.1, 18, 0xB87E1B, -21.82, 0, -0.5, null, true);
  var archiveWall = box(0.3, 4.4, 18, C.navy, 22, 0, -0.5, null, true);
  var ceilMat = new THREE.MeshBasicMaterial({ color: lin(0xF3E9D4) });
  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(44, 18), ceilMat); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 4.4, -0.5); scene.add(ceil);
  for (var bx = -18; bx <= 18; bx += 6) { box(0.3, 0.3, 16, C.woodDark, bx, 4.1, -0.5, null, true); glow(2.6, 0.5, 0xFFFFFF, bx + 3, 4.38, -2.4, 0, null, 2.2).rotation.x = Math.PI / 2; }
  box(44, 1.0, 0.3, C.wall, 0, 0, 7.65); box(44, 0.1, 0.5, C.white, 0, 1.0, 7.5); box(44, 0.8, 0.3, C.wall, 0, 3.6, 7.65);
  for (var wx = -21; wx <= 21; wx += 4.2) { box(0.35, 2.6, 0.3, C.wall, wx, 1.0, 7.65); box(0.06, 2.6, 0.08, C.white, wx + 2.1, 1.0, 7.6); }
  box(0.06, 0.06, 44, C.white, 0, 2.3, 7.6).rotation.y = Math.PI / 2;
  var roof = box(46, 0.2, 30, C.wall, 0, 4.5, -5); roof.receiveShadow = false;
  var skyCv = canvasOf(32, 256); (function () { var c = skyCv.getContext('2d'), g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#5E9BEA'); g.addColorStop(0.55, '#A9D0FA'); g.addColorStop(0.8, '#F2E3CE'); g.addColorStop(1, '#F7D7B0'); c.fillStyle = g; c.fillRect(0, 0, 32, 256); })();
  var skyM = new THREE.Mesh(new THREE.PlaneGeometry(120, 26), new THREE.MeshBasicMaterial({ map: texFrom(skyCv), fog: false })); skyM.position.set(0, 9, 30); skyM.rotation.y = Math.PI; scene.add(skyM); skyM.material.color.setScalar(1.0);
  var sunDisc = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshBasicMaterial({ color: lin(0xFFF0CF).multiplyScalar(6), fog: false })); sunDisc.position.set(11, 11.5, 29.5); sunDisc.rotation.y = Math.PI; scene.add(sunDisc);
  var clouds = [[-18, 9, 7], [2, 11, 9], [20, 8.4, 6], [-34, 10.5, 8]].map(function (c) { var m = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: lin(0xFFFFFF).multiplyScalar(1.1), transparent: true, opacity: 0.85, fog: false })); m.scale.set(c[2], 1.3, 1); m.position.set(c[0], c[1], 29); m.rotation.y = Math.PI; scene.add(m); return m; });
  var cityCv = canvasOf(256, 256); (function () { var c = cityCv.getContext('2d'); c.fillStyle = '#C9D3E2'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#9FB0C8'; for (var yy = 12; yy < 250; yy += 22) for (var xx = 12; xx < 250; xx += 26) c.fillRect(xx, yy, 14, 12); })();
  var cityTex = texFrom(cityCv); cityTex.wrapS = cityTex.wrapT = THREE.RepeatWrapping;
  [[-22, 6, 9, 14], [-11, 4, 6, 15], [-3, 8, 5, 13], [6, 5, 8, 16], [16, 7.5, 6, 14], [26, 4.5, 9, 15], [-33, 5, 8, 16]].forEach(function (b) { var t = cityTex.clone(); t.needsUpdate = true; t.repeat.set(b[2] / 4, b[1] / 4);
    var m = new THREE.Mesh(new THREE.PlaneGeometry(b[2], b[1]), new THREE.MeshBasicMaterial({ map: t, fog: false })); m.position.set(b[0], b[1] / 2 - 1, b[3] + 8); m.rotation.y = Math.PI; scene.add(m); });
  // dust in the light
  var dust = (function () { var n = MOBILE ? 110 : 260, pos = new Float32Array(n * 3); for (var i = 0; i < n; i++) { pos[i * 3] = -20 + Math.random() * 40; pos[i * 3 + 1] = 0.3 + Math.random() * 3.2; pos[i * 3 + 2] = -1.5 + Math.random() * 8; }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var m = new THREE.Points(g, new THREE.PointsMaterial({ color: lin(0xFFF3DC).multiplyScalar(1.6), size: 0.035, transparent: true, opacity: 0.55, depthWrite: false })); m.raycast = function () {}; scene.add(m); return m; })();
  // painted panels behind each station, and rugs under them
  [[-11.2, 6.4, 0x4F53D6], [8.8, 7.4, 0xEBAA2C], [16.4, 4.6, 0xB98EEA]].forEach(function (p) { box(p[1], 3.0, 0.05, p[2], p[0], 1.1, -8.47, null, true); });
  rug(-14.4, -8, -7.6, -3.7, 0x7B74E2); rug(4.6, 13.0, -7.6, -3.7, 0xF0C25A); rug(13.8, 19.0, -7.6, -3.7, 0xB98EEA); rug(-5.6, 1.9, -7.6, -3.7, 0xA996EE);

  // ---- radar
  var sweepCv = canvasOf(256, 256), sweepTex = texFrom(sweepCv);
  box(3.0, 2.0, 0.12, C.navy, -11.6, 1.5, -8.44); var radarScreen = glow(2.8, 1.8, 0, -11.6, 2.5, -8.36, 0, sweepTex);

  var smallGlow = [];
  desk(4.2, 1.1, 0.44, -11, -5.4, C.white, C.navy);
  box(0.5, 0.03, 0.2, C.navy, -12, 0.44, -5.2); box(0.5, 0.03, 0.2, C.navy, -10.2, 0.44, -5.2); cyl(0.07, 0.12, C.white, -11.1, 0.44, -5.1); box(0.46, 0.06, 0.6, C.steel, -9.3, 0.44, -5.4);
  var stackRadar = box(0.42, 0.1, 0.56, C.white, -9.3, 0.5, -5.4, null, true);
  cyl(0.07, 2.1, C.navy, -15.8, 0, -7.4); cyl(0.36, 0.08, C.navy, -15.8, 0, -7.4); solid(-16.2, -15.4, -7.8, -7.0);
  var dish = new THREE.Group(); dish.position.set(-15.8, 2.15, -7.4); scene.add(dish);
  var bowl = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.6), mat(C.white, { side: THREE.DoubleSide })); bowl.rotation.x = Math.PI; bowl.position.y = 0.75; bowl.castShadow = true; dish.add(bowl);
  cyl(0.03, 0.7, C.navy, 0, 0.05, 0, dish); ball(0.1, C.clawd, 0, 0.78, 0, dish); dish.rotation.z = -0.6;


  // ---- articles
  [6.6, 11.0].forEach(function (x, i) { desk(3.2, 1.0, 0.44, x, -5.4, C.white, C.navy);
    [-0.75, 0.75].forEach(function (dx, k) { box(0.5, 0.03, 0.2, C.navy, x + dx, 0.44, -5.25); cyl(0.07, 0.12, [C.clawd, C.blue, C.mint, C.yellow][i * 2 + k], x + dx + 0.42, 0.44, -5.15); });
    papers(x, 0.44, -5.5, 3 + i * 2); });
  box(0.46, 0.06, 0.6, C.steel, 12.3, 0.44, -5.55); var stackArticles = box(0.42, 0.1, 0.56, C.white, 12.3, 0.5, -5.55, null, true);
  sign('Articles', '#171B2B', 9.4, 3.75, -8.48, 0, 5.6);

  // ---- control
  desk(3.0, 1.2, 0.5, 3.2, 5.3, C.lilac, C.navy);
  box(0.12, 1.45, 0.12, C.navy, 2.3, 0.5, 5.75); box(0.12, 1.45, 0.12, C.navy, 4.1, 0.5, 5.75); box(2.1, 0.16, 0.24, C.navy, 3.2, 1.95, 5.75);
  var pressHead = box(0.7, 0.18, 0.56, C.red, 3.2, 1.5, 5.45), pressRod = box(0.1, 0.5, 0.1, C.steel, 3.2, 1.6, 5.72);
  box(0.46, 0.06, 0.6, C.steel, 2.1, 0.5, 5.2); box(0.46, 0.06, 0.6, C.steel, 4.3, 0.5, 5.2);
  var stackIn = box(0.42, 0.08, 0.56, C.white, 2.1, 0.56, 5.2, null, true), stackOut = box(0.42, 0.08, 0.56, C.white, 4.3, 0.56, 5.2, null, true);
  var binMesh = cyl(0.4, 0.8, C.red, 5.6, 0, 5.4, null, 0.5); solid(5.1, 6.1, 4.9, 5.9);
  var clock = cyl(0.36, 0.06, C.white, 3.2, 3.6, -8.44); clock.rotation.x = Math.PI / 2; var clockHand = box(0.04, 0.26, 0.02, C.ink, 3.2, 3.63, -8.4, null, true);

  // ---- archives (far wall)
  for (var row = 0; row < 4; row++) { box(0.5, 0.06, 16, C.steel, 21.6, 0.5 + row * 0.9, -0.5);
    for (var k = 0; k < 44; k++) { if ((k * 5 + row * 7) % 13 === 0) continue; box(0.36, 0.62, 0.2, [C.white, C.lilac, C.white, C.clawd, C.white, C.mint, C.white, C.pen][(k + row * 3) % 8], 21.55, 0.56 + row * 0.9, -8.2 + k * 0.29, null, true); } }
  (function () { var g = new THREE.Group(); g.position.set(20.5, 0, -7.2); g.rotation.z = -0.2; scene.add(g);
    box(0.08, 3.4, 0.08, C.wood, 0, 0, -0.32, g); box(0.08, 3.4, 0.08, C.wood, 0, 0, 0.32, g);
    for (var rg = 0; rg < 7; rg++) box(0.05, 0.05, 0.64, C.wood, 0, 0.35 + rg * 0.44, 0, g); solid(20.3, 21.2, -7.7, -6.7); })();

  // ---- window side: coffee corner
  rug(-20.5, -12.4, 2.8, 7.2, 0x7CCB9E);
  box(5.2, 0.8, 0.7, C.navy, -16.2, 0, 6.85); box(5.3, 0.06, 0.8, C.wood, -16.2, 0.8, 6.85); solid(-18.9, -13.5, 6.4, 7.3);
  box(0.6, 0.7, 0.5, C.red, -17.2, 0.86, 6.85); box(0.3, 0.06, 0.3, C.steel, -17.2, 0.86, 6.52); glow(0.12, 0.12, 0x7CFFB0, -17.0, 1.4, 6.59, Math.PI);
  [-16.3, -16.0, -15.7, -15.4].forEach(function (x, i) { cyl(0.07, 0.13, [C.white, C.clawd, C.white, C.blue][i], x, 0.86, 6.75); });
  box(0.8, 1.8, 0.7, C.white, -19.6, 0, 6.85); box(0.04, 0.5, 0.04, C.steel, -19.25, 0.9, 6.46, null, true); solid(-20.1, -19.1, 6.4, 7.3);
  [[-17.4, 3.9], [-14, 3.7]].forEach(function (t) { cyl(0.55, 0.06, C.white, t[0], 0.52, t[1]); cyl(0.07, 0.52, C.navy, t[0], 0, t[1]); cyl(0.3, 0.04, C.navy, t[0], 0, t[1]); solid(t[0] - 0.45, t[0] + 0.45, t[1] - 0.45, t[1] + 0.45); });
  pendant(-17.4, 3.9, C.mint); pendant(-14, 3.7, C.mint);
  // lounge
  rug(-9.4, -3.4, 3.2, 7.2, 0x5FA8EA);
  rbox(4.4, 0.42, 0.9, 0.08, C.teal, -6.5, 0, 6.7); rbox(4.4, 0.7, 0.26, 0.08, C.teal, -6.5, 0.42, 7.05); rbox(0.3, 0.6, 0.9, 0.08, C.teal, -8.6, 0.2, 6.7); rbox(0.3, 0.6, 0.9, 0.08, C.teal, -4.4, 0.2, 6.7); ground(-6.5, 6.6, 6, 2.2);
  [-7.7, -6.5, -5.3].forEach(function (x, i) { box(0.7, 0.4, 0.16, [C.sand, C.pink, C.sand][i], x, 0.5, 6.86).rotation.x = -0.2; }); solid(-8.8, -4.2, 6.2, 7.3);
  box(1.3, 0.3, 0.8, C.wood, -6.5, 0, 4.7); box(0.4, 0.03, 0.5, C.white, -6.7, 0.3, 4.7, null, true); cyl(0.07, 0.12, C.clawd, -6.2, 0.3, 4.8); solid(-7.2, -5.8, 4.25, 5.15);
  cyl(0.34, 0.36, C.pink, -8.5, 0, 4.4); cyl(0.34, 0.36, C.sand, -4.5, 0, 4.4); solid(-8.85, -8.15, 4.05, 4.75); solid(-4.85, -4.15, 4.05, 4.75);
  // meeting corner
  rug(0.6, 5.8, 3.6, 7.2, 0xEE8E78);
  var boardCv = canvasOf(512, 288); (function () { var c = boardCv.getContext('2d'); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, 512, 288); c.strokeStyle = '#171B2B'; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(40, 220); c.lineTo(110, 150); c.lineTo(180, 190); c.lineTo(250, 90); c.lineTo(320, 120); c.stroke(); c.strokeRect(360, 40, 110, 60); c.strokeRect(360, 130, 110, 60); c.beginPath(); c.moveTo(415, 100); c.lineTo(415, 130); c.stroke();
    [['#F2C230', 40, 34], ['#F7CFC6', 110, 44], ['#BFE6D6', 180, 30]].forEach(function (n) { c.fillStyle = n[0]; c.fillRect(n[1], n[2], 56, 56); }); })();
  box(3.2, 1.8, 0.08, C.steel, 16.4, 1.35, -8.42); var boardMesh = glow(3.0, 1.62, 0, 16.4, 2.25, -8.36, 0, texFrom(boardCv));
  cyl(0.85, 0.07, C.white, 16.4, 0.5, -5.6); cyl(0.09, 0.5, C.navy, 16.4, 0, -5.6); cyl(0.4, 0.04, C.navy, 16.4, 0, -5.6); solid(15.7, 17.1, -6.3, -4.9); pendant(16.4, -5.6, C.lilac);
  papers(3.0, 0.57, 4.6, 3); cyl(0.07, 0.12, C.blue, 3.6, 0.57, 4.9);
  // the bench by the window: human-sized, nobody sits here
  rug(7.8, 15, 2.1, 7.1, 0x2443D9);
  desk(3.0, 1.4, 1.05, 11.6, 5.0, C.wood, C.woodDark);
  var noteCv = canvasOf(256, 330), noteTex = texFrom(noteCv);
  var note = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.0), new THREE.MeshBasicMaterial({ map: noteTex })); note.rotation.x = -Math.PI / 2; note.rotation.z = 0.1; note.position.set(11.3, 1.06, 5.0); scene.add(note);
  box(0.05, 0.05, 0.5, C.pen, 12.0, 1.05, 4.95).rotation.y = 0.6; cyl(0.09, 0.14, C.white, 10.5, 1.05, 5.3);
  cyl(0.2, 0.06, C.navy, 12.75, 1.05, 5.3); box(0.06, 0.85, 0.06, C.navy, 12.75, 1.05, 5.3).rotation.z = 0.32; var shade = cyl(0.26, 0.3, C.navy, 12.45, 1.82, 5.3, null, 0.12); shade.rotation.z = 0.5;
  var lamp = new THREE.PointLight(0xFFD49A, 1.0, 6, 2); lamp.position.set(12.2, 1.75, 5.1); scene.add(lamp);
  box(1.1, 0.12, 1.1, C.wood, 11.5, 0.6, 3.7); box(1.1, 1.2, 0.12, C.wood, 11.5, 0.72, 3.2);
  [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(function (s) { box(0.09, 0.6, 0.09, C.woodDark, 11.5 + s[0], 0, 3.7 + s[1]); }); solid(10.9, 12.1, 3.1, 4.3);
  sign('Journal', '#FFF4DC', 11.4, 3.95, 7.44, Math.PI, 4.8);
  // charging docks
  rug(16.2, 20.8, 5.2, 7.2, 0x8F7FE4);
  var docks = [16.9, 18.4, 19.9].map(function (x) { box(1.1, 0.26, 1.3, C.navy, x, 0, 6.5); box(0.9, 0.1, 1.1, C.mint, x, 0.26, 6.5); box(1.1, 0.9, 0.12, C.navy, x, 0.26, 7.15); glow(0.7, 0.08, 0x7CFFB0, x, 0.9, 7.08, Math.PI); return { x: x, z: 6.5, face: Math.PI, y: 0.34, busy: null }; });
  solid(16.3, 20.5, 7.0, 7.4);
  plant(15.3, 6.7, 1.5, 15.3, 5.5); plant(-21, 6.6, 1.4, -20.6, 5.4); plant(-0.6, 6.8, 1.3);

  // ---- galleries behind the two doorways
  [[-7.55, 11.9, 0x9F93F0], [4.85, 12.3, 0xEDBE5E]].forEach(function (r) {
    var f = new THREE.Mesh(new THREE.PlaneGeometry(r[1], 8.9), mat(r[2])); f.rotation.x = -Math.PI / 2; f.position.set(r[0], 0.01, -13.2); f.receiveShadow = true; scene.add(f);
    var c = new THREE.Mesh(new THREE.PlaneGeometry(r[1], 8.9), ceilMat); c.rotation.x = Math.PI / 2; c.position.set(r[0], 4.4, -13.2); scene.add(c);
    glow(2.6, 0.5, 0xFFFFFF, r[0], 4.38, -13.2, 0).rotation.x = Math.PI / 2;
    var radarRoom = r[0] < 0;
    box(r[1] - 0.6, 2.4, 0.05, radarRoom ? 0x3B3FB8 : 0xC98A12, r[0], 0.7, -17.62, null, true);
    rug(r[0] - 4.2, r[0] + 4.2, -14.6, -11.9, radarRoom ? 0x6C63D8 : 0xD9962A);
    [-2.7, 2.7].forEach(function (dx) { rbox(2.3, 0.42, 0.7, 0.06, C.wood, r[0] + dx, 0, -13.25); box(0.1, 0.3, 0.6, C.woodDark, r[0] + dx - 0.9, 0, -13.25); box(0.1, 0.3, 0.6, C.woodDark, r[0] + dx + 0.9, 0, -13.25); solid(r[0] + dx - 1.2, r[0] + dx + 1.2, -13.65, -12.85); ground(r[0] + dx, -13.25, 3.2, 1.6); });
    pendant(r[0] - 2.7, -13.25, radarRoom ? C.lilac : C.sand); pendant(r[0] + 2.7, -13.25, radarRoom ? C.lilac : C.sand);
    plant(r[0] - r[1] / 2 + 0.9, -9.9, 1.3, r[0] - r[1] / 2 + 1.9, -10.6); plant(r[0] + r[1] / 2 - 0.9, -9.9, 1.3, r[0] + r[1] / 2 - 1.9, -10.6); });
  box(25, 4.4, 0.3, C.wall, -1.25, 0, -17.8, null, true);
  box(0.3, 4.4, 9, C.wall, -13.65, 0, -13.3, null, true); box(0.3, 4.4, 9, C.wall, 11.15, 0, -13.3, null, true); box(0.3, 4.4, 9, C.wall, -1.45, 0, -13.3, null, true);
  solid(-22, -13.5, -18, -8.9); solid(11.0, 22, -18, -8.9); solid(-1.7, -1.2, -18, -8.9);
  var WD = window.__WORLD;
  var POSTERS = [
    ['radar', '11-11-2026', 'Les transcripts Notion AI faisaient partie de la fuite Fireworks', -11.9, -17.6, 0],
    ['radar', '12-08-2026', 'Mojo 1.0 converge sur var, des fermetures unifiées et un seul type Pointer', -9.1, -17.6, 0],
    ['radar', '02-08-2026', 'OpenAI baisse GPT-5.6 Luna de 80 % et rebaptise le traitement prioritaire en mode Fast', -6.3, -17.6, 0],
    ['radar', '26-07-2026', 'Relay-Bench maintient GPT-5.5 à 43,3 % en enchaînant les sous-tâches dans une seule invite', -3.5, -17.6, 0],
    ['radar', '', 'Un voleur d\'identifiants npm vise les hooks de Claude Code et le tasks.json de VS Code pour sa persistance', -13.45, -13.4, Math.PI / 2],
    ['blog', '11-11-2026', 'Dimensionnez l\'audit de votre filtre LLM selon la perte que vous tolérez', 0.7, -17.6, 0],
    ['blog', '09-11-2026', 'Jugez un écart de harnais sur Terminal-Bench à l\'aune de votre propre limite de temps', 3.5, -17.6, 0],
    ['blog', '07-11-2026', 'Inscrivez le noyau de l\'hôte dans la grille de votre bac à sable pour agents', 6.3, -17.6, 0],
    ['blog', '06-11-2026', 'Décidez ce que votre agent peut atteindre avant qu\'il réécrive du code copyleft', 9.1, -17.6, 0],
    ['blog', '12-07-2026', 'Les agents de revue de code optimisent la mauvaise métrique', 10.95, -13.4, -Math.PI / 2],
    ['radar', '11-09-2026', 'L\'Agents API d\'OpenAI fait tourner son harnais contre un bac à sable qui est le vôtre', -13.45, -16.0, Math.PI / 2],
    ['radar', '05-09-2026', 'Gemini 3.8 Flash coûte environ 40 % de plus par tâche à tarif par token inchangé', -13.45, -10.8, Math.PI / 2],
    ['radar', '01-09-2026', 'Faire tourner Qwen3.8 27B en 4 bits demande 17 Go et une compilation récente de llama.cpp', -1.65, -15.6, -Math.PI / 2],
    ['radar', '22-07-2026', 'Le meilleur détecteur de failles V8 de Google est un modèle inaccessible aux développeurs', -1.65, -12.4, -Math.PI / 2],
    ['blog', '05-11-2026', 'Votre juge LLM change avec son modèle, revalidez-le avant qu\'il note une mise à niveau', -1.25, -15.6, Math.PI / 2],
    ['blog', '01-11-2026', 'L\'effort de raisonnement est mal placé pour l\'escalade', -1.25, -12.4, Math.PI / 2],
    ['blog', '29-10-2026', 'Un score de schéma parfait ne certifie pas le décodage strict des outils', 10.95, -16.0, -Math.PI / 2],
    ['blog', '27-10-2026', 'Un test qui passe ne prouve pas que l\'exigence tient', 10.95, -10.8, -Math.PI / 2],
    ['journal', '[date]', '[Titre du dernier texte du journal]', 999, 999, 0]
  ];
  // the wall frames show the newest texts of the site
  (function () { var r = 0, b = 0; POSTERS.forEach(function (d) { var src = d[0] === 'radar' ? WD.radar[r++] : d[0] === 'blog' ? WD.articles[b++] : null; if (src) { d[1] = src.date; d[2] = src.title; d[6] = src.url; d[7] = src.text; } }); })();

  var KIND = { radar: 'Radar', blog: 'Article', journal: 'Journal' }, KIND_COLOR = { radar: '#2B3154', blog: '#D77757', journal: '#1F3FD1' };
  function hangPosters() { POSTERS.forEach(function (d, idx) { if (d[0] === 'journal') return;
    var cv = canvasOf(640, 448), c = cv.getContext('2d'); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, 640, 448); c.fillStyle = d[0] === 'radar' ? '#2B3154' : '#D77757'; c.fillRect(0, 0, 640, 18);
    c.fillStyle = '#535A70'; c.font = '500 26px "JetBrains Mono", Menlo, monospace'; c.fillText((d[0] === 'radar' ? 'Radar' : 'Article') + (d[1] ? ' · ' + d[1] : ''), 40, 78);
    c.fillStyle = '#171B2B'; c.font = '800 46px "Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif'; var line = '', y = 150;
    d[2].split(' ').forEach(function (w) { if (c.measureText(line + w).width > 560) { c.fillText(line, 40, y); y += 56; line = ''; } line += w + ' '; }); c.fillText(line, 40, y);
    var tex = texFrom(cv); tex.anisotropy = 4; var g = new THREE.Group(); g.position.set(d[3], 1.75, d[4]); g.rotation.y = d[5]; scene.add(g);
    var fr = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.66, 0.08), mat(C.navy)); fr.position.z = 0.04; g.add(fr);
    g.userData.click = { label: 'lire', reach: 7, run: function () { openReader(idx); } };
    var face = new THREE.Mesh(new THREE.PlaneGeometry(2.14, 1.5), new THREE.MeshBasicMaterial({ map: tex })); face.position.z = 0.09; g.add(face);
    box(0.05, 0.05, 0.34, C.navy, 0, 0.98, 0.17, g, true); var bar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.1), new THREE.MeshBasicMaterial({ color: lin(0xFFF1C2).multiplyScalar(2.6) })); bar.position.set(0, 0.98, 0.36); bar.raycast = function () {}; g.add(bar); }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(hangPosters, hangPosters); else hangPosters();

  function banner(text, color, x, z, ry) { var cv = canvasOf(640, 200), c = cv.getContext('2d'); c.fillStyle = color; c.fillRect(0, 0, 640, 200); c.fillStyle = '#FFF4DC'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '800 120px "Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif'; c.fillText(text, 320, 106); var tex = texFrom(cv), g = new THREE.Group(); g.position.set(x, 3.2, z); g.rotation.y = ry === undefined ? Math.PI / 2 : ry; scene.add(g);
    [0, Math.PI].forEach(function (r) { var m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.0), new THREE.MeshBasicMaterial({ map: tex })); m.rotation.y = r; m.position.z = r ? -0.03 : 0.03; g.add(m); });
    box(3.3, 1.1, 0.04, C.navy, 0, -0.55, 0, g, true); box(0.03, 0.75, 0.03, C.navy, -1.4, 0.5, 0, g, true); box(0.03, 0.75, 0.03, C.navy, 1.4, 0.5, 0, g, true); }
  var RACKS = [];
  function rack(kind, color, x, z, ry) { var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; scene.add(g);
    box(0.9, 0.08, 0.5, C.navy, 0, 0, 0, g); box(0.08, 1.0, 0.08, C.navy, 0, 0.08, -0.1, g);
    var board = box(1.5, 0.95, 0.06, color, 0, 0.75, 0, g); board.rotation.x = -0.32;
    [-0.46, 0, 0.46].forEach(function (dx, i) { var sh = box(0.38, 0.5, 0.02, kind === 'journal' ? inkPaperMat : C.white, dx, 0.95, 0.08 + i * 0.001, g, true); sh.rotation.x = -0.32; });
    var cv = canvasOf(512, 128), c = cv.getContext('2d'); c.fillStyle = '#FFF4DC'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '800 84px "Schibsted Grotesk", Arial, sans-serif'; c.fillText(KIND[kind], 256, 70);
    var lab = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), new THREE.MeshBasicMaterial({ map: texFrom(cv), transparent: true })); lab.position.set(0, 1.86, -0.2); g.add(lab); box(1.5, 0.42, 0.05, color, 0, 1.65, -0.24, g);
    g.userData.click = { label: 'prendre une feuille', reach: 5, run: function () { if (held) { say('Tu portes déjà une feuille'); return; } takeSheet(kind); } };
    solid(x - 0.75, x + 0.75, z - 0.35, z + 0.35); ground(x, z, 2.2, 1.4); RACKS.push({ x: x, z: z, kind: kind }); }
  banner('Radar', '#4F53D6', -11, -3.2); banner('Articles', '#C98A12', 8.8, -3.2); banner('Tampon', '#C9412C', 3.2, 3.1); banner('Projets', '#6C4BD8', -1.85, -3.6); banner('Archives', '#2B3154', 18.6, -2.4);
  banner('Journal', '#1F3FD1', 11.4, 2.4);
  // articles: a giant pencil on the wall
  (function () { var g = new THREE.Group(); g.position.set(8.8, 2.75, -8.32); g.rotation.z = Math.PI / 2 + 0.04; scene.add(g);
    cyl(0.17, 4.6, C.yellow, 0, -2.3, 0, g); put(new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.5, 20), mat(C.sand)), 0, -2.55, 0, g).rotation.z = Math.PI; put(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 12), mat(C.ink)), 0, -2.72, 0, g).rotation.z = Math.PI;
    cyl(0.175, 0.16, C.steel, 0, 2.3, 0, g); cyl(0.17, 0.3, C.pink, 0, 2.46, 0, g); })();
  // control: a striped gate
  (function () { var cv = canvasOf(256, 32), c = cv.getContext('2d'); for (var i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#FFFFFF' : '#D4472F'; c.fillRect(i * 32, 0, 32, 32); } var t = texFrom(cv);
    [0.5, 6.5].forEach(function (x) { box(0.16, 2.5, 0.16, C.navy, x, 0, 3.55); solid(x - 0.2, x + 0.2, 3.35, 3.75); });
    var beam = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.26, 0.2), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); beam.position.set(3.5, 2.5, 3.55); beam.castShadow = true; scene.add(beam); })();
  // journal: an ink bottle at human scale
  var stackJournal = box(0.42, 0.08, 0.56, inkPaperMat, 10.55, 1.05, 4.7, null, true); stackJournal.rotation.y = 0.2;
  RACKS.push({ x: -9.3, z: -4.5, kind: 'radar' }, { x: 12.3, z: -4.5, kind: 'blog' }, { x: 10.3, z: 3.9, kind: 'journal' });
  rack('radar', 0x4F53D6, -10.6, -9.95, Math.PI); rack('blog', 0xEBAA2C, 7.6, -9.95, Math.PI);

  // ---- Clawd, cell by cell from the terminal sprite (body 12 x 8, eyes 1 x 2, arms 2 x 2, four legs 1 x 2), plus what each one wears
  var U = 0.09, clawdMat = mat(C.clawd, { roughness: 0.5, envMapIntensity: 0.3 }), eyeMat = mat(C.ink, { roughness: 0.3, envMapIntensity: 0.5 });
  function makeClawd(look) {
    var g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    function part(w, h, d, color, x, y, z, flat) { return rbox(w * U, h * U, d * U, 0.3 * U, color, x * U, y * U, z * U, body, flat); }
    ground(0, 0, 1.5, 1.1, g, 0.012);
    part(12, 8, 7, clawdMat, 0, 2, 0);
    var eyes = [part(1, 2, 0.5, eyeMat, -3.5, 6, 3.4, true), part(1, 2, 0.5, eyeMat, 3.5, 6, 3.4, true)]; eyes.forEach(function (e) { e.userData.bx = e.position.x; e.userData.by = e.position.y; });
    var arms = [part(2, 2, 3, clawdMat, -7, 4, 0), part(2, 2, 3, clawdMat, 7, 4, 0)];
    var legs = [-4.5, -2.5, 2.5, 4.5].map(function (x) { return rbox(U, 2 * U, 3 * U, 0.25 * U, clawdMat, x * U, 0, 0, g); });
    var wear = look.wear || [];
    if (wear.indexOf('headset') >= 0) { part(13, 0.8, 1.6, C.navy, 0, 10, 0); part(1.2, 3.4, 3.4, C.navy, -6.6, 5.6, 0); part(1.2, 3.4, 3.4, C.navy, 6.6, 5.6, 0); part(0.5, 0.5, 4, C.navy, -6.6, 5.2, 2.6); }
    if (wear.indexOf('glasses') >= 0) { [-3.5, 3.5].forEach(function (x) { part(3, 3.4, 0.06, look.tint || C.white, x, 5.3, 3.5, true); part(3.4, 0.4, 0.3, C.ink, x, 8.7, 3.6, true); part(3.4, 0.4, 0.3, C.ink, x, 5.1, 3.6, true); }); part(4, 0.4, 0.3, C.ink, 0, 7, 3.6, true); }
    if (wear.indexOf('cap') >= 0) { part(9, 2, 7.2, look.tint || C.blue, 0, 10, 0); part(8, 0.6, 3.2, look.tint || C.blue, 0, 10, 4.6); }
    if (wear.indexOf('beanie') >= 0) { part(10.5, 2.6, 6.6, look.tint || C.lilac, 0, 10, 0); ball(1.3 * U, C.white, 0, 13.4 * U, 0, body); }
    if (wear.indexOf('visor') >= 0) { part(12.5, 1.2, 7.5, C.green, 0, 9.2, 0); part(9, 0.5, 3, C.green, 0, 9.4, 4.8); part(2.3, 1, 3.3, C.red, 7, 4.5, 0); }
    if (wear.indexOf('bow') >= 0) { part(1.8, 1.8, 0.5, look.tint || C.lilac, -1.3, 2.6, 3.6); part(1.8, 1.8, 0.5, look.tint || C.lilac, 1.3, 2.6, 3.6); part(0.9, 0.9, 0.7, C.ink, 0, 3.05, 3.6); }
    if (wear.indexOf('straw') >= 0) { part(16, 0.6, 11, C.sand, 0, 10, 0); part(8.5, 2, 5.5, C.sand, 0, 10.6, 0); part(8.7, 0.6, 5.7, C.green, 0, 10.6, 0); }
    if (wear.indexOf('apron') >= 0) { part(8.4, 4.6, 0.4, C.white, 0, 2, 3.6); part(12.3, 0.6, 7.3, C.white, 0, 6.2, 0); }
    if (wear.indexOf('beret') >= 0) { var br = cyl(4.6 * U, 1.1 * U, C.navy, 1 * U, 10 * U, 0, body); br.rotation.z = -0.12; cyl(0.3 * U, 0.9 * U, C.navy, 1 * U, 11 * U, 0, body); }
    if (wear.indexOf('hardhat') >= 0) { part(10.5, 2.4, 7.2, C.yellow, 0, 10, 0); part(12.6, 0.5, 8.6, C.yellow, 0, 10, 0); }
    if (wear.indexOf('scarf') >= 0) { part(12.4, 1.3, 7.4, look.tint || C.teal, 0, 2.2, 0); part(1.6, 3.4, 0.6, look.tint || C.teal, 3.4, -0.6, 3.7); }
    var stern = wear.indexOf('brows') >= 0, brows = [-1, 1].map(function (sd) { var b = part(3.4, 0.8, 0.5, eyeMat, sd * 3.5, 8.5, 3.5, true); b.rotation.z = sd * 0.38; b.visible = stern; return b; });
    var beardG = null;
    if (wear.indexOf('beard') >= 0) { beardG = new THREE.Group(); beardG.position.set(0, 5.4 * U, 3.9 * U); body.add(beardG); box(9 * U, 2.2 * U, 1.2 * U, C.white, 0, -2.2 * U, 0, beardG); box(7 * U, 1.8 * U, 1.1 * U, C.white, 0, -4 * U, 0.02, beardG); box(4 * U, 1.2 * U, 1 * U, C.white, 0, -5.2 * U, 0.04, beardG); beardG.scale.y = 0.55;
      cyl(4.4 * U, 6.5 * U, 0x6C4BD8, 0, 10 * U, 0, body, 0.1 * U); cyl(6.4 * U, 0.5 * U, 0x6C4BD8, 0, 10 * U, 0, body); [-3.5, 3.5].forEach(function (x) { part(2.8, 2.8, 0.2, C.ink, x, 5.6, 3.36, true); part(2, 2, 0.2, clawdMat, x, 6, 3.4, true); }); }
    if (wear.indexOf('satchel') >= 0) { part(1.2, 3.4, 4, C.woodDark, -6.9, 1.6, -0.8); }
    var items = {
      paper: (function () { var m = part(6.4, 8, 0.3, paperMat, 0, 2.6, 5.2); m.rotation.x = -0.18; return m; })(),
      mug: cyl(0.9 * U, 1.7 * U, C.white, 0, 4.4 * U, 4.6 * U, body),
      binder: part(2.2, 5, 4, look.tint || C.lilac, 0, 3.4, 4.6),
      can: (function () { var gr = new THREE.Group(); gr.position.set(0, 3.8 * U, 4.8 * U); body.add(gr); box(3 * U, 2.6 * U, 2.4 * U, C.blue, 0, 0, 0, gr); var sp = box(0.5 * U, 0.5 * U, 2.6 * U, C.blue, 0, 1.6 * U, 2.2 * U, gr); sp.rotation.x = -0.5; return gr; })(),
      broom: (function () { var gr = new THREE.Group(); gr.position.set(5 * U, 0, 4.6 * U); body.add(gr); box(0.5 * U, 12 * U, 0.5 * U, C.wood, 0, 0.6 * U, 0, gr); box(4.5 * U, 1.4 * U, 1.2 * U, C.yellow, 0, -1.4 * U, 0, gr); gr.rotation.z = -0.25; return gr; })()
    };
    Object.keys(items).forEach(function (k) { items[k].visible = false; });
    var emCv = canvasOf(128, 128), emTex = texFrom(emCv), em = new THREE.Sprite(new THREE.SpriteMaterial({ map: emTex, depthTest: false, transparent: true }));
    em.scale.set(0.5, 0.5, 1); em.position.set(0.3, 1.45, 0); em.visible = false; em.raycast = function () {}; g.add(em);
    g.scale.setScalar(look.size || 1.16); scene.add(g);
    return { brows: brows, stern: stern, beard: beardG, g: g, body: body, eyes: eyes, arms: arms, legs: legs, items: items, em: em, emCv: emCv, emTex: emTex, glyph: '', seed: Math.random() * 10 };
  }
  var bulles = [], bullesEl = document.getElementById('bulles'), bv = new THREE.Vector3();
  function speak(a, text, dur) { bulles = bulles.filter(function (b) { if (b.a === a) { b.el.remove(); return false; } return true; });
    if (bulles.length > 5) { bulles[0].el.remove(); bulles.shift(); } var el = document.createElement('p'); el.className = 'bulle'; el.textContent = text; el.style.margin = '0'; el.style.visibility = 'hidden'; bullesEl.appendChild(el);
    bulles.push({ a: a, el: el, t: dur || 2.8 }); }
  function stepBulles(dt) { var w = stage.clientWidth, h = stage.clientHeight;
    bulles = bulles.filter(function (b) { b.t -= dt; if (b.t <= 0) { b.el.remove(); return false; }
      bv.set(b.a.g.position.x, b.a.g.position.y + 1.42, b.a.g.position.z); var d = bv.distanceTo(camera.position); bv.project(camera);
      var show = bv.z < 1 && d < 15 && Math.abs(bv.x) < 1.05 && Math.abs(bv.y) < 1.05; b.el.style.visibility = show ? 'visible' : 'hidden';
      if (show) b.el.style.transform = 'translate(' + ((bv.x + 1) / 2 * w + 10).toFixed(0) + 'px,' + ((1 - bv.y) / 2 * h).toFixed(0) + 'px) translateY(-100%)'; return true; }); }
  function emote(a, glyph) { if (a.glyph === glyph) return; a.glyph = glyph; a.em.visible = !!glyph; if (!glyph) return;
    var c = a.emCv.getContext('2d'); c.clearRect(0, 0, 128, 128); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(64, 64, 56, 0, 6.3); c.fill();
    c.fillStyle = '#171B2B'; c.font = '800 70px "Schibsted Grotesk", Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(glyph, 64, glyph === '…' ? 52 : 68); a.emTex.needsUpdate = true; }
  function carry(a, what) { a.held = what || null; Object.keys(a.items).forEach(function (k) { a.items[k].visible = (k === (what === 'ink' ? 'paper' : what)) || (k === 'broom' && a.role === 'janitor') || (k === 'can' && a.role === 'gardener'); });
    if (what === 'paper' || what === 'ink') a.items.paper.material = what === 'ink' ? inkPaperMat : paperMat; }

  // ---- where things happen. `via` lists the points that lead from open floor to the spot
  function spot(x, z, face, via) { return { x: x, z: z, face: face, via: via || [], busy: null }; }
  var S = {
    op1: spot(-12, -6.35, 0.1, [[-13.75, -4.4], [-13.75, -6.35]]), op2: spot(-10.2, -6.35, -0.1, [[-8.45, -4.4], [-8.45, -6.35]]),
    w1: spot(5.85, -6.3, 0.08, [[4.6, -4.4], [4.6, -6.3]]), w2: spot(7.35, -6.3, -0.08, [[8.8, -4.4], [8.8, -6.3]]), w3: spot(10.25, -6.3, 0.08, [[8.8, -4.4], [8.8, -6.3]]), w4: spot(11.75, -6.3, -0.08, [[13.0, -4.4], [13.0, -6.3]]),
    insp: spot(2.45, 6.35, Math.PI - 0.06, [[1.2, 4.3], [1.2, 6.35]]), insp2: spot(4.0, 6.35, Math.PI + 0.06, [[1.2, 4.3], [1.2, 6.35]]),
    radarOut: spot(-9.3, -4.45, Math.PI), articlesOut: spot(12.1, -4.5, Math.PI), controlIn: spot(2.1, 4.2, 0), controlOut: spot(4.3, 4.2, 0),
    journalOut: spot(13.6, 3.6, -2.2), bar: spot(-16.2, 5.9, 0), fridge: spot(-19.0, 5.8, 0.6), queue: [spot(-15.0, 5.6, 0.3), spot(-14.0, 5.3, 0.5)],
    sip: [spot(-17.4, 4.9, Math.PI), spot(-16.4, 3.5, -Math.PI / 2), spot(-14.0, 4.7, Math.PI), spot(-13.0, 3.3, -Math.PI / 2), spot(-10.9, 4.4, 0.8)],
    chat: [spot(-7.6, 5.5, Math.PI / 2), spot(-5.4, 5.5, -Math.PI / 2)], gaze: [spot(-11.9, 5.2, 0), spot(8.0, 6.6, 0), spot(-1.8, 6.5, 0.3)],
    meet: [spot(16.4, -6.9, 0), spot(15.0, -5.6, Math.PI / 2), spot(17.8, -5.6, -Math.PI / 2), spot(16.4, -4.3, Math.PI)],
    shelf: [spot(20.4, -6), spot(20.4, -3.2), spot(20.4, -0.4), spot(20.4, 2.2)].map(function (s) { s.face = Math.PI / 2; return s; }),
    frames: [0, 1].map(function (room) { return POSTERS.filter(function (d) { return d[0] === (room ? 'blog' : 'radar'); }).map(function (d) { return spot(d[3] + Math.sin(d[5]) * 1.5, d[4] + Math.cos(d[5]) * 1.5, d[5] + Math.PI); }); }),
    water: plants.map(function (p) { var s = spot(p.x, p.z, 0); s.faceTo = p.faceTo; return s; })
  };
  var stock = { radar: 1, articles: 2, control: 0, done: 1, journal: 0 }, meeting = { at: 34 }, stampT = 0, time = 0;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function freeOf(list) { var f = list.filter(function (s) { return !s.busy; }); return f.length ? pick(f) : null; }
  function gallery(z) { return z < -9.2; }
  function doorOf(x) { return x < -1.45 ? -6.9 : 3.2; }

  // ---- plans: a Clawd walks to a spot, does something there for a while, then decides again
  function goTo(a, s) {
    var pts = [], from = a.spot;
    if (from && from.via.length) from.via.slice().reverse().forEach(function (p) { pts.push(p); });
    var cur = pts.length ? pts[pts.length - 1] : [a.g.position.x, a.g.position.z];
    if (gallery(cur[1])) { var d0 = doorOf(cur[0]); pts.push([d0, -10.4], [d0, -7.2]); cur = [d0, -7.2]; }
    var entry = s.via.length ? s.via[0] : [s.x, s.z], lane;
    if (gallery(entry[1])) { var d1 = doorOf(entry[0]); lane = -3.0; if (Math.abs(cur[1] - lane) > 0.3) pts.push([cur[0], lane]); pts.push([d1, lane], [d1, -10.4]); }
    else { lane = cur[1] > 1.5 && entry[1] > 1.5 ? 2.4 : cur[1] < -2 && entry[1] < -2 ? -3.0 : pick([-3.0, 0.6, 0.6, 2.4]);
      if (Math.abs(cur[0] - entry[0]) > 1.2) { if (Math.abs(cur[1] - lane) > 0.3) pts.push([cur[0], lane]); pts.push([entry[0], lane]); } }
    s.via.forEach(function (p) { pts.push(p); }); pts.push([s.x, s.z]);
    if (a.spot && a.spot.busy === a) a.spot.busy = null;
    pts.forEach(function (p) { a.plan.push({ go: p }); }); a.plan.push({ arrive: s }); if (!s.shared) s.busy = a;
  }
  function act(a, anim, dur, label, o) { a.plan.push(Object.assign({ anim: anim, dur: dur, label: label }, o || {})); }
  function breakFor(a) {
    if (!mayLeave(a)) return false; var left = takeBreak(a); if (left) a.away = true; return left;
  }
  function takeBreak(a) {
    if (a.coffee > 1) { var q = freeOf(S.queue), seat = freeOf(S.sip); if (q && seat) { a.coffee = 0;
      goTo(a, q); act(a, 'idle', rnd(1.5, 3), 'attend son café', { sayP: 0.6, say: ['Un café, Moka.', 'Comme d’habitude, Moka.', 'Serré, s’il te plaît.'], end: function () { carry(a, 'mug'); } }); goTo(a, seat); act(a, 'sip', rnd(5, 8), 'boit un café', { end: function () { carry(a, null); } }); return true; } }
    if (a.energy < 0) { var d = freeOf(docks); if (d) { a.energy = 1; d.via = []; goTo(a, d); act(a, 'nap', rnd(7, 11), 'recharge ses batteries', { glyph: 'z' }); return true; } }
    if (Math.random() < a.social) { var c = freeOf(S.chat); if (c && Math.random() < 0.6) { goTo(a, c); act(a, 'chat', rnd(5, 8), 'discute', { glyph: '…', sayP: 0.8, say: ['Tu as vu le dernier brief ?', 'Tampon m’a encore renvoyé un texte.', 'Qui a fini le café ?', 'Le radar s’affole ce matin.', 'J’ai une feuille pour toi tout à l’heure.', 'On refait un point demain ?'] }); return true; }
      var w = freeOf(S.gaze); if (w) { goTo(a, w); act(a, 'idle', rnd(4, 6), 'regarde dehors'); return true; } }
    return false;
  }
  var JOBS = {
    operator: function (a) { goTo(a, a.home); act(a, 'type', rnd(7, 12), 'surveille le radar', { end: function () { stock.radar = Math.min(4, stock.radar + 1); sfx('pass', a.g.position); } }); },
    writer: function (a) { if (time > meeting.at && time < meeting.at + 5 && mayLeave(a)) { a.away = true; var m = freeOf(S.meet); if (m) { goTo(a, m); act(a, 'chat', 10, 'en réunion', { glyph: m === S.meet[0] ? '!' : '…' }); return; } }
      goTo(a, a.home); act(a, 'type', rnd(8, 14), 'écrit', { end: function () { stock.articles = Math.min(4, stock.articles + 1); } }); },
    inspector: function (a) { goTo(a, a.home); if (stock.control > 0) act(a, 'stamp', 1.4, 'tamponne', { sayP: 0.35, say: ['Conforme.', 'Sources vérifiées.', 'Ça passe.'], start: function () { stampT = 0.7; sfx('stamp', a.g.position); }, end: function () { stock.control--; stock.done = Math.min(4, stock.done + 1); } });
      else act(a, 'idle', 2.2, 'attend les feuilles'); },
    courier: function (a) {
      if (stock.done > 0 && (Math.random() < 0.55 || (!stock.radar && !stock.articles))) { goTo(a, S.controlOut);
        act(a, 'idle', 0.7, 'prend une feuille tamponnée', { end: function () { if (stock.done > 0) { stock.done--; carry(a, 'paper'); } } }); goTo(a, pick(S.shelf)); act(a, 'idle', 1.1, 'livre aux archives', { end: function () { carry(a, null); } }); return; }
      if (stock.journal > 0 && Math.random() < 0.6) { stock.journal--; goTo(a, S.journalOut); act(a, 'idle', 1.2, 'prend la feuille du journal', { end: function () { carry(a, 'ink'); } }); goTo(a, pick(S.shelf)); act(a, 'idle', 1.1, 'livre aux archives', { end: function () { carry(a, null); } }); return; }
      var src = stock.radar >= stock.articles ? 'radar' : 'articles';
      if (stock[src] > 0) { stock[src]--; goTo(a, S[src + 'Out']); act(a, 'idle', 0.8, 'prend une feuille', { end: function () { carry(a, 'paper'); sfx('pass', a.g.position); } });
        goTo(a, S.controlIn); act(a, 'idle', 0.8, 'dépose chez Tampon', { sayP: 0.45, say: ['Pour toi, Tampon.', 'Encore une, Tampon.'], end: function () { carry(a, null); stock.control = Math.min(4, stock.control + 1); } }); return; }
      goTo(a, spot(rnd(-18, 18), pick([-3.0, 0.6, 2.4]))); act(a, 'idle', 1.5, 'fait sa tournée');
    },
    archivist: function (a) { goTo(a, pick(S.shelf)); var b = Math.random() < 0.5; act(a, 'sort', rnd(3, 6), 'range les archives', { start: function () { carry(a, b ? 'binder' : null); }, end: function () { carry(a, null); } }); },
    gardener: function (a) { a.n = ((a.n || 0) + 1) % S.water.length; goTo(a, S.water[a.n]); act(a, 'water', 3.2, 'arrose une plante', { sayP: 0.3, say: ['Tu avais soif, toi.', 'Ça pousse.'] }); },
    barista: function (a) { var r = Math.random(); if (r < 0.6) { goTo(a, S.bar); act(a, 'type', rnd(4, 7), 'prépare le café'); } else if (r < 0.8) { goTo(a, S.fridge); act(a, 'idle', 2.2, 'cherche le lait'); } else { goTo(a, pick(S.sip)); act(a, 'sort', 2.6, 'essuie une table'); } },
    janitor: function (a) { goTo(a, spot(rnd(-19, 18), pick([-3.0, 0.6, 2.4, 2.4]))); act(a, 'sweep', rnd(2, 4), 'balaie'); },
    curator: function (a) { goTo(a, pick(S.frames[a.room])); act(a, 'sort', rnd(3, 5), 'redresse un cadre'); }
  };
  var LABELS = { operator: 'vigie', writer: 'rédaction', inspector: 'tampon', courier: 'coursier', archivist: 'archives', gardener: 'jardin', barista: 'café', janitor: 'entretien', curator: 'galerie' };
  var clawds = [];
  // a phone screen holds fewer, smaller Clawds: one per table, one courier, the archivist, the barista and one curator per gallery
  var PHONE_CAST = ['Glose', 'Verrou', 'Cadenas', 'Vigie', 'Plume', 'Brouillon', 'Tampon', 'Navette', 'Classeur', 'Moka', 'Cadre', 'Cimaise'];
  function hire(name, role, home, look, o) {
    if (MOBILE) { if (PHONE_CAST.indexOf(name) < 0) return null; look = Object.assign({}, look, { size: role === 'guard' ? 1.08 : 0.96 }); }
    var a = makeClawd(look); Object.assign(a, { name: name, role: role, home: home, plan: [], t: 0, speed: 1.75, social: 0.16, coffee: rnd(0.2, 1.3), energy: rnd(-0.1, 1), coffeeRate: 1 / rnd(55, 100), tireRate: 1 / rnd(120, 220), act: '' }, o || {});
    a.g.userData.clawd = a; a.g.position.set(home.x, 0, home.z); a.g.rotation.y = home.face || 0; a.spot = home; if (!home.shared) home.busy = a; carry(a, null); clawds.push(a); return a;
  }
  hire('Vigie', 'operator', S.op1, { wear: ['headset'] }); hire('Écho', 'operator', S.op2, { wear: ['headset', 'scarf'], tint: C.teal, size: 1.08 });
  hire('Plume', 'writer', S.w1, { wear: ['glasses'] }); hire('Virgule', 'writer', S.w2, { wear: ['beanie'], tint: C.lilac, size: 1.1 }); hire('Brouillon', 'writer', S.w3, { wear: ['glasses', 'scarf'], tint: C.yellow, size: 1.2 });
  hire('Tampon', 'inspector', S.insp, { wear: ['visor'] }, { social: 0.05 });
  hire('Visa', 'inspector', S.insp2, { wear: ['visor', 'glasses'] }, { social: 0.1 }); hire('Rature', 'writer', S.w4, { wear: ['cap'], tint: C.teal, size: 1.12 });
  hire('Navette', 'courier', spot(-6, -3.0), { wear: ['cap', 'satchel'], tint: C.blue }, { speed: 2.3 }); hire('Relais', 'courier', spot(8, 0.6), { wear: ['cap'], tint: C.white }, { speed: 2.2 });
  hire('Estafette', 'courier', spot(14, 2.4), { wear: ['cap', 'scarf'], tint: C.red, size: 1.05 }, { speed: 2.4 });
  hire('Classeur', 'archivist', S.shelf[1], { wear: ['bow', 'glasses'], tint: C.lilac }); hire('Arrosoir', 'gardener', spot(4, 2.4), { wear: ['straw'] }, { speed: 1.5, social: 0.08 });
  hire('Moka', 'barista', S.bar, { wear: ['apron'] }, { coffee: 0, coffeeRate: 0, social: 0.05 }); hire('Balai', 'janitor', spot(-2, 2.4), { wear: ['hardhat'] }, { speed: 1.1, social: 0.1 });
  hire('Cadre', 'curator', S.frames[0][1], { wear: ['beret'] }, { room: 0, social: 0.1 }); hire('Cimaise', 'curator', S.frames[1][2], { wear: ['beret', 'bow'], tint: C.pink, size: 1.08 }, { room: 1, social: 0.1 });
  hire('Loupe', 'curator', S.frames[0][5], { wear: ['glasses'] }, { room: 0, social: 0.12 }); hire('Vernis', 'curator', S.frames[1][6], { wear: ['scarf'], tint: C.blue }, { room: 1, social: 0.12 });

  // ---- the flat site's project scenes, reused as murals
  var fresco = (function () {
    function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var TEAM = [['Vigie', 'radar', ['headset']], ['Écho', 'radar', ['headset', 'scarf'], '#2F8F86'], ['Plume', 'rédaction', ['glasses']], ['Virgule', 'rédaction', ['beanie'], '#C9C2F0'], ['Brouillon', 'rédaction', ['glasses'], '#F2C230'], ['Rature', 'rédaction', ['cap'], '#2F8F86'],
    ['Tampon', 'contrôle', ['visor']], ['Visa', 'contrôle', ['visor', 'glasses']], ['Navette', 'courrier', ['cap'], '#3F6FE0'], ['Relais', 'courrier', ['cap'], '#3E9B6E'], ['Estafette', 'courrier', ['cap', 'scarf'], '#D4472F'],
    ['Classeur', 'archives', ['bow', 'glasses'], '#C9C2F0'], ['Arrosoir', 'plantes', ['straw']], ['Moka', 'café', ['apron']], ['Balai', 'ménage', ['hardhat']], ['Cadre', 'galerie', ['beret']], ['Cimaise', 'galerie', ['beret', 'bow'], '#F7CFC6'], ['Glose', 'bibliothèque', ['beard', 'wizard']], ['Verrou', 'garde', ['brows', 'cap'], '#2B3154'], ['Cadenas', 'garde', ['brows', 'cap'], '#2B3154']];
  function R(x, y, w, h, f) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + f + '"/>'; }
  function clawd(o) { o = o || {}; var w = o.wear || [], t = o.tint || '#2B3154', B = '#D77757', I = '#171B2B', s = '', has = function (k) { return w.indexOf(k) >= 0; };
    s += '<g class="la">' + R(3, 9, 1, 2, B) + R(10, 9, 1, 2, B) + '</g><g class="lb">' + R(5, 9, 1, 2, B) + R(12, 9, 1, 2, B) + '</g>' + R(2, 1, 12, 8, B);
    var ay = o.hold || o.up ? 1 : 4; s += '<g class="arm al">' + R(0, ay, 2, 2, B) + '</g><g class="arm ar">' + R(14, ay, 2, 2, B) + '</g>';
    if (has('scarf')) s += R(2, 7, 12, 1.2, t) + R(11, 8, 1.6, 2, t);
    if (has('apron')) s += R(4.5, 5.6, 7, 3.4, '#FFFFFF') + R(4.5, 5.2, 7, 0.5, t);
    s += '<g class="eyes">' + R(5, 3, 1, 2, I) + R(10, 3, 1, 2, I) + '</g>';
    if (has('brows')) s += '<path d="M3.6 1.6L7 2.6V3.4L3.6 2.4ZM12.4 1.6L9 2.6V3.4L12.4 2.4Z" fill="' + I + '"/>';
    if (has('beard')) s += '<g class="beard">' + R(3.5, 5.6, 9, 3, '#FFFFFF') + R(4.5, 8.6, 7, 3, '#FFFFFF') + R(5.5, 11.6, 5, 2.6, '#F1EEE6') + R(6.5, 14.2, 3, 2, '#F1EEE6') + R(7.4, 16.2, 1.2, 1.4, '#E6E1D5') + '</g><g fill="none" stroke="' + I + '" stroke-width="0.4"><circle cx="5.5" cy="4" r="1.5"/><circle cx="10.5" cy="4" r="1.5"/><path d="M7 4H9"/></g>';
    if (has('wizard')) s += '<path d="M2.5 1.2L8.6 -6.4L13.5 1.2Z" fill="#6C4BD8"/>' + R(1, 0.6, 14, 1, '#6C4BD8') + '<path d="M8.4 -2.6l.5 1 1.1.1-.8.8.2 1.1-1-.6-1 .6.2-1.1-.8-.8 1.1-.1z" fill="#F2C230"/>';
    if (has('glasses')) s += '<g fill="none" stroke="' + I + '" stroke-width="0.45"><rect x="4" y="2.4" width="3" height="3.2"/><rect x="9" y="2.4" width="3" height="3.2"/><path d="M7 3.6H9"/></g>';
    if (has('visor')) s += '<rect x="2" y="2.1" width="12" height="1" fill="#3E9B6E" opacity="0.9"/>' + R(2, 1, 12, 0.7, '#1E4F55');
    if (has('headset')) s += R(2.5, 0.2, 11, 0.8, I) + R(1.2, 2, 1.3, 2.6, I) + R(13.5, 2, 1.3, 2.6, I) + R(13.6, 5, 0.5, 1.6, I) + R(11.6, 6.3, 2.5, 0.5, I);
    if (has('beanie')) s += R(3, -0.9, 10, 2, t) + R(7, -2.1, 2, 1.3, '#FFFFFF');
    if (has('cap')) s += R(2.5, -0.3, 11, 1.5, t) + R(11, 0.5, 5, 0.8, t);
    if (has('beret')) s += '<ellipse cx="8.4" cy="0.5" rx="5.6" ry="1.3" fill="' + t + '"/>' + R(8, -1.3, 0.7, 1, t);
    if (has('bow')) s += '<path d="M8 0.4L5.6 -1.2V2ZM8 0.4L10.4 -1.2V2Z" fill="#D4472F"/>';
    if (has('straw')) s += R(0.5, 0.2, 15, 0.9, '#F0DCBC') + R(4, -1.4, 8, 1.7, '#F0DCBC') + R(4, -0.2, 8, 0.5, '#D4472F');
    if (has('hardhat')) s += R(3, -1.2, 10, 2.2, '#F2C230') + R(2, 0.4, 12, 0.7, '#F2C230');
    if (o.hold) s += R(4.5, -4.6, 7, 5, '#FFFFFF') + R(5.4, -3.6, 5.2, 0.5, o.hold) + R(5.4, -2.5, 4.2, 0.4, '#9AA3BD') + R(5.4, -1.6, 4.8, 0.4, '#9AA3BD');
    var top = has('wizard') ? -6.8 : -5.2, vh = (has('beard') ? 18 : 11.2) - top;
    var pos = o.x == null ? '' : ' x="' + o.x + '" y="' + o.y + '" width="' + o.w + '" height="' + (o.w * vh / 18) + '"';
    return '<svg class="cl ' + (o.cls || '') + '" viewBox="-1 ' + top + ' 18 ' + vh + '"' + pos + ' shape-rendering="crispEdges" role="img" aria-label="' + (o.name ? esc(o.name) : 'Clawd') + '">' + (o.name ? '<title>' + esc(o.name) + '</title>' : '') + s + '</svg>'; }
  function who(n, cls, extra) { var t = TEAM.filter(function (m) { return m[0] === n; })[0]; var o = { wear: t[2], tint: t[3], name: t[0] + ' · ' + t[1], cls: cls || '' }; for (var k in extra || {}) o[k] = extra[k]; return clawd(o); }

  var SC = {
    'athletic-tracker': ['#2B3154', function () { var I = '#171B2B', ST = '#C9CDDA';
        function bell(x, y) { return R(x, y + 6, 26, 5, ST) + R(x - 4, y, 7, 17, I) + R(x + 23, y, 7, 17, I); }
        return '<path d="M20 44Q110 14 200 34T380 26T560 18T700 14" fill="none" stroke="#F2C230" stroke-width="4" opacity="0.9"/>'
        + '<g class="squat">' + who('Brouillon', 'd2', { x: 70, y: 98, w: 112, up: true }) + R(44, 130, 164, 6, ST) + R(40, 114, 12, 38, I) + R(27, 120, 11, 26, '#D4472F') + R(200, 114, 12, 38, I) + R(214, 120, 11, 26, '#D4472F') + '</g>'
        + who('Rature', 'd3', { x: 304, y: 98, w: 112 }) + '<g class="hop">' + bell(297, 146) + '</g><g class="hop" style="animation-delay:-0.5s">' + bell(397, 146) + '</g>'
        + '<g class="hop">' + who('Virgule', '', { x: 540, y: 104, w: 100, up: true }) + '</g><circle class="blink" cx="528" cy="124" r="4" fill="#BFE0FF"/><circle class="blink" cx="652" cy="130" r="4" fill="#BFE0FF"/>' + bell(660, 183) + bell(246, 183); }],
    'cca-f-exam-trainer': ['#1E4F55', function () { return R(60, 30, 300, 110, '#12343A') + R(60, 30, 300, 6, '#C99562') + R(60, 134, 300, 6, '#C99562') + ['A', 'B', 'C', 'D'].map(function (l, i) { return '<circle cx="' + (110 + i * 66) + '" cy="86" r="22" fill="' + (i === 2 ? '#F2C230' : 'none') + '" stroke="#FFFFFF" stroke-width="3"/><text x="' + (110 + i * 66) + '" y="94" text-anchor="middle" font-size="22" fill="' + (i === 2 ? '#171B2B' : '#FFFFFF') + '">' + l + '</text>'; }).join('')
        + '<g transform="translate(470 80)"><circle r="38" fill="#FFFFFF" stroke="#171B2B" stroke-width="5"/><path class="sweep" d="M-2 0V-28H2V0Z" fill="#D4472F"/></g>' + who('Plume', 'type', { x: 150, y: 104, w: 104 }) + R(120, 176, 170, 8, '#FFFFFF') + R(132, 184, 7, 16, '#2B3154') + R(272, 184, 7, 16, '#2B3154') + R(176, 168, 44, 8, '#FFFFFF')
        + who('Virgule', 'wave d2', { x: 420, y: 104, w: 104 }) + R(390, 176, 170, 8, '#FFFFFF') + R(402, 184, 7, 16, '#2B3154') + R(542, 184, 7, 16, '#2B3154'); }],
    'shallnot': ['#D4472F', function () { return R(350, 96, 14, 104, '#171B2B') + '<g>' + [0, 1, 2, 3, 4, 5].map(function (i) { return R(364 + i * 40, 108, 40, 14, i % 2 ? '#FFFFFF' : '#171B2B'); }).join('') + '</g><circle class="blink" cx="357" cy="84" r="12" fill="#F2C230"/>'
        + who('Navette', 'walk', { x: 150, y: 96, w: 112, hold: '#D4472F' }) + '<text x="206" y="62" text-anchor="middle" font-size="20" fill="#FFFFFF">Terminé ?</text>' + who('Verrou', 'd2', { x: 430, y: 84, w: 124 })
        + [0, 1, 2].map(function (i) { return R(620, 70 + i * 36, 60, 24, '#FFFFFF') + '<path d="M632 ' + (82 + i * 36) + 'l6 6 12-12" fill="none" stroke="' + (i === 2 ? '#C9CDDA' : '#2E8B62') + '" stroke-width="4"/>'; }).join(''); }],
    'musthold': ['#4F53D6', function () { return [0, 1, 2, 3, 4].map(function (i) { return R(60 + i * 62, 60, 48, 60, '#FFFFFF') + (i === 3 ? '<path d="M' + (74 + i * 62) + ' 78l20 24m0-24l-20 24" stroke="#D4472F" stroke-width="5"/>' : '<path d="M' + (72 + i * 62) + ' 92l8 8 16-18" fill="none" stroke="#2E8B62" stroke-width="5"/>'); }).join('')
        + who('Visa', 'd2', { x: 200, y: 100, w: 112 }) + '<circle cx="300" cy="140" r="20" fill="none" stroke="#FFFFFF" stroke-width="6"/><path d="M314 154l22 22" stroke="#FFFFFF" stroke-width="7"/>'
        + '<g class="hop">' + R(430, 104, 54, 66, '#FFFFFF') + R(438, 114, 38, 5, '#D4472F') + R(438, 126, 30, 3, '#9AA3BD') + R(438, 134, 34, 3, '#9AA3BD') + '</g><path d="M400 136h-40m12-10l-12 10 12 10" fill="none" stroke="#FFFFFF" stroke-width="5"/>' + who('Rature', 'd3', { x: 540, y: 100, w: 112 }); }],
    'mcp-secrets-vault': ['#171B2B', function () { return '<g transform="translate(360 104)"><circle r="92" fill="#9AA3BD"/><circle r="74" fill="#C9CDDA"/><g class="turn"><path d="M-4 -60h8v120h-8zM-60 -4h120v8h-120z" fill="#2B3154"/><circle r="16" fill="#F2C230"/></g></g>'
        + who('Cadenas', 'd2', { x: 500, y: 88, w: 124 }) + who('Relais', 'd3', { x: 110, y: 100, w: 112 }) + '<rect x="122" y="150" width="88" height="12" fill="#2B3154"/>' + '<circle cx="246" cy="150" r="9" fill="none" stroke="#F2C230" stroke-width="5"/>' + R(254, 148, 26, 5, '#F2C230') + R(272, 152, 4, 8, '#F2C230'); }],
    'claude-plan-execute': ['#F2C230', function () { return R(50, 36, 190, 120, '#FFFFFF') + [0, 1, 2, 3].map(function (i) { return R(66, 54 + i * 24, 14, 14, '#171B2B') + R(90, 58 + i * 24, 120 - i * 14, 6, '#9AA3BD') + (i < 2 ? '<path d="M68 ' + (61 + i * 24) + 'l4 4 7-8" fill="none" stroke="#F2C230" stroke-width="3"/>' : ''); }).join('')
        + who('Plume', 'wave d2', { x: 220, y: 100, w: 108 }) + '<path d="M350 120h70m-16-12l16 12-16 12" fill="none" stroke="#171B2B" stroke-width="7"/>' + who('Balai', 'type', { x: 440, y: 100, w: 108 }) + R(560, 150, 70, 50, '#C99562') + R(560, 150, 70, 6, '#94663A')
        + R(590, 40, 100, 70, '#171B2B') + R(600, 52, 50, 4, '#55B98B') + R(600, 64, 70, 4, '#55B98B') + R(600, 76, 36, 4, '#55B98B') + '<rect class="blink" x="600" y="90" width="8" height="8" fill="#55B98B"/>'; }],
    'ijtihad-engine': ['#1F3FD1', function () { return '<g fill="#FFFFFF" font-size="34" opacity="0.9"><text x="60" y="80">∑</text><text x="130" y="110">∫</text><text x="200" y="74">π</text><text x="560" y="84">≟</text><text x="630" y="120">∞</text></g>' + R(270, 30, 190, 110, '#12235E') + '<path d="M290 110l40-50 34 30 30-44 44 60" fill="none" stroke="#FFFFFF" stroke-width="4"/>'
        + who('Cadre', 'd2', { x: 130, y: 100, w: 112 }) + '<text class="blink" x="250" y="96" font-size="40" fill="#F2C230">?</text>' + who('Brouillon', 'type d3', { x: 470, y: 100, w: 112 }) + R(610, 170, 60, 8, '#FFFFFF') + R(614, 162, 52, 8, '#F3EEE2') + R(618, 154, 44, 8, '#FFFFFF'); }],
    'bayan-rag-platform': ['#7E4215', function () { return [0, 1, 2].map(function (i) { var x = 60 + i * 220; return '<path d="M' + x + ' 200V90Q' + (x + 80) + ' 0 ' + (x + 160) + ' 90V200Z" fill="#2B3154"/>' + [0, 1, 2].map(function (r) { return [0, 1, 2, 3, 4, 5, 6].map(function (n) { return R(x + 22 + n * 17, 96 + r * 34 + (n % 3) * 2, 12, 26 - (n % 3) * 2, ['#D77757', '#F2C230', '#FFFFFF', '#3E9B6E', '#C9C2F0'][(n + r + i) % 5]); }).join('') + R(x + 16, 122 + r * 34, 128, 4, '#C99562'); }).join(''); }).join('')
        + who('Classeur', 'd2', { x: 300, y: 100, w: 112 }) + R(232, 150, 64, 8, '#FFFFFF') + R(236, 142, 26, 10, '#F3EEE2') + R(266, 142, 26, 10, '#F3EEE2') + R(260, 158, 8, 42, '#C99562') + '<text x="560" y="70" font-size="44" fill="#F2C230">« »</text>'; }],
    'sterna-ai-platform': ['#BFE0FF', function () { return [['#D77757', 'Plume'], ['#3E9B6E', 'Relais'], ['#4F53D6', 'Navette']].map(function (m, i) { var x = 70 + i * 205; return R(x, 34, 170, 166, '#FFFFFF') + R(x, 34, 170, 14, m[0]) + R(x + 14, 62, 110, 6, '#9AA3BD') + R(x + 14, 76, 130, 6, '#9AA3BD') + R(x + 14, 90, 80, 6, '#9AA3BD') + who(m[1], 'type d' + (i + 1), { x: x + 36, y: 110, w: 98 }); }).join('')
        + '<g class="fly"><path d="M0 60q14-18 28-4q14-14 28 4q-14-6-28 6q-14-12-28-6z" fill="#FFFFFF" stroke="#171B2B" stroke-width="2"/></g>'; }],
    'atelier': ['#2F8F86', function () { return [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return R(120 + i * 60, 30, 60, 36, i % 2 ? '#FFFFFF' : '#D4472F'); }).join('') + R(120, 66, 480, 6, '#171B2B') + R(120, 150, 480, 12, '#C99562') + R(130, 162, 10, 38, '#94663A') + R(580, 162, 10, 38, '#94663A')
        + [['#F2C230', 150], ['#4F53D6', 214], ['#D77757', 430], ['#C9C2F0', 494], ['#BFE0FF', 546]].map(function (b) { return R(b[1], 112, 44, 38, b[0]) + R(b[1] + 14, 124, 16, 5, '#171B2B'); }).join('') + who('Moka', 'wave d2', { x: 300, y: 74, w: 104 }) + who('Arrosoir', 'd3', { x: 40, y: 108, w: 100, hold: '#F2C230' }); }]
  };

    return function (key) { var s2 = SC[key]; if (!s2) return null;
      return '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="240" viewBox="0 0 720 240">' + R(0, 0, 720, 200, s2[0]) + s2[1]() + R(0, 200, 720, 40, '#EBB65C') + R(0, 200, 720, 4, '#1E4F55') + '</svg>'; };
  })();

  // ---- projects: a wall of cards to read, a workbench and its host
  var PROJ_KEYS = WD.projects.map(function (p) { return p.key; });
  var PROJ = WD.projects.map(function (p) { return [p.name, p.year, p.summary, p.highlights]; });
  box(7.5, 2.95, 0.06, 0x6C4BD8, -1.85, 1.15, -8.46, null, true);
  function openProject(d) { if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock(); selected = null; keys = {}; reading = 'index'; inHand = false; readerEl.className = 'reader';
    document.getElementById('readerMeta').textContent = 'Projet · ' + d[1]; document.getElementById('readerTitle').textContent = d[0]; var body = document.getElementById('readerBody'); body.textContent = '';
    var lead = document.createElement('p'); lead.className = 'lead'; lead.textContent = d[2]; body.appendChild(lead); d[3].forEach(function (h) { var q = document.createElement('p'); q.textContent = h; body.appendChild(q); });
    document.getElementById('readerPrev').hidden = document.getElementById('readerNext').hidden = true; document.getElementById('w3s').classList.add('reading'); readerEl.scrollTop = 0; readerEl.focus(); sfx('take'); }
  PROJ.forEach(function (d, i) { var cv = canvasOf(760, 360), c = cv.getContext('2d'), tex = texFrom(cv);
    function paint(img) { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, 760, 360); if (img) c.drawImage(img, 0, 0, 760, 254); else { c.fillStyle = '#2B3154'; c.fillRect(0, 0, 760, 254); }
      c.fillStyle = '#171B2B'; c.font = '800 44px "Schibsted Grotesk", Arial, sans-serif'; var name = d[0]; while (c.measureText(name).width > 600 && name.length > 8) name = name.slice(0, -2); c.fillText(name === d[0] ? name : name.trim() + '…', 22, 322);
      c.font = '26px "JetBrains Mono", monospace'; c.fillStyle = '#4A5068'; c.textAlign = 'right'; c.fillText(d[1], 738, 320); c.textAlign = 'left'; tex.needsUpdate = true; }
    paint(null); var svg = fresco(PROJ_KEYS[i]); if (svg) { var im = new Image(); im.onload = function () { paint(im); }; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
    var m = new THREE.Mesh(new THREE.PlaneGeometry(1.72, 0.82), new THREE.MeshBasicMaterial({ map: tex })); m.position.set(-4.55 + (i % 4) * 1.8 + (i >= 8 ? 1.8 : 0), 3.6 - Math.floor(i / 4) * 0.9, -8.4); scene.add(m); click(m, 'lire · ' + d[0], function () { openProject(d); }, 8); });
  desk(4.4, 0.8, 0.5, -1.85, -7.5, C.white, C.navy); box(0.5, 0.4, 0.4, C.wood, -3.25, 0.5, -7.5); box(0.36, 0.3, 0.36, C.yellow, -2.65, 0.5, -7.45); box(0.6, 0.05, 0.42, C.sky, -1.65, 0.5, -7.5); box(0.3, 0.5, 0.3, C.mint, -0.65, 0.5, -7.5); cyl(0.12, 0.3, C.clawd, -0.15, 0.5, -7.45);
  S.mk = spot(-1.85, -6.3, 0);
  JOBS.maker = function (a) { if (Math.hypot(a.g.position.x - a.home.x, a.g.position.z - a.home.z) > 0.3) goTo(a, a.home); act(a, 'sort', rnd(8, 14), 'range les maquettes'); };
  LABELS.maker = 'projets'; hire('Maquette', 'maker', S.mk, { wear: ['apron', 'cap'], tint: 0x6C4BD8 }, { social: 0.05 });

  // Glose keeps every definition in his beard
  JOBS.sage = function (a) { if (Math.hypot(a.g.position.x - a.home.x, a.g.position.z - a.home.z) > 0.3) a.plan.push({ go: [a.home.x, a.home.z] }, { arrive: a.home }); act(a, 'read', 40, 'relit sa barbe'); };
  var gloseAt = [[19.3, 4.3], [19.3, -1.8], [18.4, 1.0], [17, 0.6]].filter(function (c) { return !SOLIDS.some(function (b) { return c[0] > b[0] - 0.6 && c[0] < b[1] + 0.6 && c[1] > b[2] - 0.6 && c[1] < b[3] + 0.6; }); })[0] || [17, 0.6];
  hire('Glose', 'sage', spot(gloseAt[0], gloseAt[1], -Math.PI / 2), { wear: ['beard'], size: 1.2 }, { social: 0, coffee: 0, coffeeRate: 0, energy: 1, tireRate: 0 });
  var WORDS = WD.words;
  function plain(x) { return String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function findWord(q) { q = plain(q).replace(/[«»"?!.]/g, ' '); var best = null; WORDS.forEach(function (w) { var l = plain(w[0]); if (q.indexOf(l) >= 0 && (!best || l.length > plain(best[0]).length)) best = w; });
    if (best) return best; var key = q.split(/\s+/).filter(function (x) { return x.length > 3 && ['definis', 'quoi', 'c’est', 'cest', 'hasard', 'explique', 'dire', 'veut'].indexOf(x) < 0; }).sort(function (a, b) { return b.length - a.length; })[0]; if (!key) return null;
    var c = WORDS.filter(function (w) { return plain(w[0]).indexOf(key) >= 0; }).sort(function (a, b) { return a[0].length - b[0].length; }); return c[0] || null; }
  function askSage(a, q) { var hit = findWord(q); addMsg(a, 'moi', q);
    a.plan.unshift({ anim: 'wave', dur: 1.5, label: 'fouille sa barbe', glyph: '…', now: true, end: function () { var w = hit || pick(WORDS); toss(a, ['un parchemin', function (g) { cyl(0.035, 0.2, 0xF6EBCB, 0, 0.035, 0, g).rotation.z = Math.PI / 2; }]); sfx('pop', a.g.position);
      a.words = (a.words || 0) + 1; if (a.beard) a.beard.scale.y = Math.min(1, 0.55 + a.words * 0.07);
      addMsg(a, 'clawd', (hit ? pick(['Attends, il est coincé… voilà. ', 'Celui-là, je le garde près du menton. ', 'Ah ! Il était sous un point-virgule. ']) : '« ' + q + ' » n’est pas dans ma barbe. En fouillant, j’ai trouvé ça. ') + w[0] + ' : ' + w[1]); speak(a, w[0] + ' !', 3.2); sfx('greet', a.g.position); } }); }

  // the way out, and the two who watch it
  box(0.1, 2.7, 1.8, C.navy, -21.8, 0, 0.6, null, true); box(0.1, 2.5, 1.5, C.green, -21.76, 0, 0.6, null, true); ball(0.06, C.yellow, -21.68, 1.15, 1.15); box(0.08, 0.36, 1.2, C.green, -21.77, 2.82, 0.6, null, true); sign('Sortie', '#FFFFFF', -21.72, 3.0, 0.37, Math.PI / 2, 1.0);
  S.exit = spot(-20.3, 0.6, Math.PI / 2);
  JOBS.guard = function (a) { if (Math.hypot(a.g.position.x - a.home.x, a.g.position.z - a.home.z) > 0.3) a.plan.push({ go: [a.home.x, a.home.z] }, { arrive: a.home }); act(a, 'guard', 600, 'monte la garde'); };
  var STILL = { social: 0, coffee: 0, coffeeRate: 0, energy: 1, tireRate: 0 };
  var guards = [hire('Verrou', 'guard', spot(-20.8, -1.1, Math.PI / 2), { wear: ['brows', 'cap'], tint: C.navy, size: 1.32 }, STILL), hire('Cadenas', 'guard', spot(-20.8, 2.3, Math.PI / 2), { wear: ['brows', 'cap'], tint: C.navy, size: 1.32 }, STILL)].filter(Boolean);
  var fugitive = null, escT = 16, whistled = false;
  function caught(g, f) { fugitive = null; guards.forEach(function (m) { m.chase = null; emote(m, ''); }); f.speed = f.speed0 || f.speed; redo(f); f.plan = [{ anim: 'idle', dur: 1.8, label: 's’est fait rattraper', glyph: '…' }];
    sfx('caught', f.g.position); speak(f, pick(['Bon, bon… je retourne bosser.', 'J’y étais presque.', 'La prochaine fois, par la fenêtre.', 'Je voulais juste prendre l’air.', 'OK, OK, je me calme.']), 3.6); guards.forEach(function (m) { m.plan = []; }); }
  function runaway(dt) {
    if (fugitive) { var f = fugitive; f.runT += dt; var d = Math.hypot(f.g.position.x - S.exit.x, f.g.position.z - S.exit.z);
      if (!whistled && (d < 11 || f.runT > 7)) { whistled = true; guards.forEach(function (m) { emote(m, '!'); }); sfx('whistle', guards[0].g.position);
        var g = guards.slice().sort(function (m, n) { return Math.hypot(m.g.position.x - f.g.position.x, m.g.position.z - f.g.position.z) - Math.hypot(n.g.position.x - f.g.position.x, n.g.position.z - f.g.position.z); })[0]; g.plan = []; g.chase = f; guards.forEach(function (m) { if (m !== g) m.plan = [{ go: [S.exit.x + 0.5, S.exit.z] }, { anim: 'guard', dur: 30, label: 'barre la sortie' }]; }); }
      if (f.runT > 40) caught(guards[0], f); return; }
    escT -= dt; if (escT > 0 || !guards.length) return; escT = rnd(26, 48);
    var c = clawds.filter(function (m) { return m.role !== 'guard' && m.role !== 'barista' && !m.sheetBusy && !m.follow && m !== selected && !(m.offer > time) && !(m.holdT > 0) && !m.held && mayLeave(m); }); if (!c.length) { escT = 12; return; }
    var f = pick(c); redo(f); f.away = true; f.runT = 0; f.speed0 = f.speed; f.speed = 4.2; fugitive = f; whistled = false;
    speak(f, pick(['Je craque !', 'Trop de tickets !', 'Le build est rouge ! Je pars !', 'Liberté !', 'Je démissionne !', 'Encore une réunion ? Non !', 'Je veux voir la mer !']), 3); sfx('greet', f.g.position);
    f.plan.push({ anim: 'chat', dur: 1.1, label: 'panique', glyph: '!', now: true }); goTo(f, S.exit); act(f, 'wave', 40, 's’enfuit'); }

  var TABLES = [
    { id: 'radar', x: -11, z: -5.4, seats: ['op1', 'op2'], hello: ['Bienvenue au radar ! Tout ce qui vient de sortir passe par ici.', 'Clique sur moi si tu veux le dernier signal.'] },
    { id: 'art1', x: 6.6, z: -5.4, seats: ['w1', 'w2'], hello: ['Bienvenue à la rédaction. Les articles de fond s’écrivent ici.', 'Une question sur un texte ? Clique sur moi.'] },
    { id: 'art2', x: 11.0, z: -5.4, seats: ['w3', 'w4'], hello: ['Salut ! Ici on termine les articles avant le tampon.', 'Prends une feuille sur le bac si tu veux lire.'] },
    { id: 'control', x: 3.2, z: 5.3, seats: ['insp', 'insp2'], hello: ['Ici, on tamponne. Rien ne sort sans ça.', 'Tu as une feuille à faire vérifier ?'] },
    { id: 'proj', x: -1.85, z: -6.5, seats: ['mk'], hello: ['Bienvenue aux projets ! Chaque fresque au mur est un projet : clique dessus pour le lire.'] }
  ];
  TABLES.forEach(function (t) { t.team = clawds.filter(function (c) { return t.seats.some(function (k) { return S[k] === c.home; }); }); t.team.forEach(function (c) { c.table = t; }); t.cool = 0; t.inside = false; });
  function seated(c) { return !c.away && c.spot === c.home; }
  function mayLeave(a) { return !a.table || a.table.team.some(function (m) { return m !== a && seated(m); }); }
  function welcome(dt) { if (!playing) return; TABLES.forEach(function (t) { t.cool -= dt; var d = Math.hypot(player.x - t.x, player.z - t.z);
    if (d > 6.5) t.inside = false; if (d > 3.8 || t.inside || t.cool > 0 || selected) return; t.inside = true; t.cool = 40;
    var here = t.team.filter(seated); if (!here.length) return;
    here[0].plan.unshift({ anim: 'wave', dur: 1.5, label: 't’accueille', say: t.hello[0] }); sfx('greet', here[0].g.position);
    if (here[1]) setTimeout(function () { if (seated(here[1]) && playing) { here[1].plan.unshift({ anim: 'wave', dur: 1.2, label: 't’accueille' }); speak(here[1], t.hello[1], 3.2); } }, 1700); }); }
  function turnTo(a, want, dt, k) { var cur = a.g.rotation.y; a.g.rotation.y = cur + Math.atan2(Math.sin(want - cur), Math.cos(want - cur)) * Math.min(1, dt * (k || 8)); }
  function stepClawd(a, dt) {
    a.coffee += dt * a.coffeeRate; a.energy -= dt * a.tireRate; var cross = a.stern || a.frownT > time; if (a.brows[0].visible !== cross) a.brows.forEach(function (b) { b.visible = cross; });
    var near = playing ? Math.hypot(player.x - a.g.position.x, player.z - a.g.position.z) : 99, walking = false, anim = 'idle';
    var listening = playing && (selected === a || a.sheetBusy) && near < 12, following = playing && a.follow;
    if (a.holdT > 0) { a.holdT -= dt; if (a.holdBy) turnTo(a, Math.atan2(a.holdBy.g.position.x - a.g.position.x, a.holdBy.g.position.z - a.g.position.z), dt, 6); a.act = 'attend ' + (a.holdBy ? a.holdBy.name : ''); listening = false; following = false; }
    if (!a.plan.length && !listening && !following && !(a.holdT > 0)) { a.act = ''; emote(a, ''); if (!breakFor(a)) JOBS[a.role](a); }
    var st = a.plan[0] || {};
    if (listening && st.anim !== 'wave' && !st.now) { turnTo(a, Math.atan2(player.x - a.g.position.x, player.z - a.g.position.z), dt, 7); a.act = a.sheetBusy ? 'lit ta feuille' : 't’écoute'; }
    else if (following && !a.plan.length) { a.act = 'te suit'; if (near > 1.7) { var fp = a.g.position, fx = player.x - fp.x, fz = player.z - fp.z, fl = a.speed * 1.5 * dt; fp.x += fx / near * fl; fp.z += fz / near * fl; walking = true; turnTo(a, Math.atan2(fx, fz), dt); } else turnTo(a, Math.atan2(player.x - a.g.position.x, player.z - a.g.position.z), dt, 5); }
    else if (a.chase) { var q = a.chase.g.position, gp = a.g.position, gx = q.x - gp.x, gz = q.z - gp.z, gd = Math.hypot(gx, gz); a.act = 'poursuit ' + a.chase.name;
      if (gd < 0.9) caught(a, a.chase); else { var gl = 5.8 * dt; gp.x += gx / gd * gl; gp.z += gz / gd * gl; walking = true; turnTo(a, Math.atan2(gx, gz), dt, 12); } }
    else if (a.holdT > 0) { /* stands still until the hand-off */ }
    else if (st.go) {
      if (near < 1.15 && (a.yield = (a.yield || 0) + dt) < 2.4) { turnTo(a, Math.atan2(player.x - a.g.position.x, player.z - a.g.position.z), dt, 6); emote(a, '!'); if (greetClock <= 0) { sfx('greet', a.g.position); greetClock = 1.6; } }
      else { if (near > 2) a.yield = 0; if (a.glyph === '!') emote(a, '');
        var p = a.g.position, dx = st.go[0] - p.x, dz = st.go[1] - p.z, dist = Math.hypot(dx, dz), stepLen = a.speed * dt;
        if (dist <= stepLen) { p.x = st.go[0]; p.z = st.go[1]; a.plan.shift(); } else { p.x += dx / dist * stepLen; p.z += dz / dist * stepLen; walking = true; turnTo(a, Math.atan2(dx, dz), dt); } }
    } else if (st.arrive) { if (st.arrive === a.home) a.away = false; a.spot = st.arrive; a.g.position.y = st.arrive.y || 0; a.plan.shift(); }
    else { if (!st.on) { st.on = true; a.t = 0; a.act = st.label; if (st.start) st.start(); emote(a, st.glyph || ''); if (st.say && Math.random() < (st.sayP || 1)) speak(a, typeof st.say === 'string' ? st.say : pick(st.say)); }
      a.t += dt; anim = st.anim; var s = a.spot;
      if (near < 3 && anim !== 'nap' && anim !== 'guard') turnTo(a, Math.atan2(player.x - a.g.position.x, player.z - a.g.position.z), dt, 5);
      else if (s && s.faceTo) turnTo(a, Math.atan2(s.faceTo[0] - a.g.position.x, s.faceTo[1] - a.g.position.z), dt, 5); else if (s && s.face !== undefined) turnTo(a, s.face, dt, 5);
      if (a.t >= st.dur) { if (st.end) st.end(); emote(a, ''); if (a.plan[0] === st) a.plan.shift(); if (a.g.position.y) a.g.position.y = 0; } }
    if (a.sheetBusy && !walking) anim = 'read';
    var ph = time * 11 + a.seed, t = time + a.seed, holding = !!a.held || a.role === 'gardener' || a.role === 'janitor';
    a.legs.forEach(function (l, i) { l.position.y = U + (walking ? Math.max(0, Math.sin(ph + (i % 2) * Math.PI)) * 0.07 : 0); });
    a.body.position.y = walking ? Math.abs(Math.sin(ph)) * 0.035 : anim === 'nap' ? -0.03 + Math.sin(t * 1.4) * 0.012 : anim === 'wave' ? Math.abs(Math.sin(t * 7)) * 0.16 : 0;
    a.body.rotation.z = walking ? Math.sin(ph) * 0.05 : anim === 'chat' ? Math.sin(t * 5) * 0.06 : 0;
    var breathe = walking ? 1 + Math.abs(Math.sin(ph)) * 0.03 : 1 + Math.sin(t * 2.1) * 0.012; a.body.scale.set(1 / Math.sqrt(breathe), breathe, 1 / Math.sqrt(breathe));
    var rd = anim === 'read', line = (t * 0.55) % 1, page = (t * 0.55 / 5) % 1, flip = rd && page > 0.93 ? Math.sin((page - 0.93) / 0.07 * Math.PI) : 0;
    a.readK = (a.readK || 0) + ((rd ? 1 : 0) - (a.readK || 0)) * Math.min(1, dt * 7); var rk = a.readK;
    a.body.rotation.x = anim === 'water' || anim === 'stamp' ? 0.22 : anim === 'sweep' ? 0.1 : rk * (0.1 + page * 0.12);
    a.eyes.forEach(function (e) { e.position.x = e.userData.bx + rk * (line - 0.5) * 0.7 * U; e.position.y = e.userData.by - rk * (0.45 + page * 0.35) * U; });
    var sheetM = a.items.paper; sheetM.position.y = (6.6 - rk * 2.0) * U; sheetM.position.z = (5.6 + rk * 1.5) * U; sheetM.rotation.x = 0.16 + rk * 0.42; sheetM.rotation.z = flip * 0.5; sheetM.position.x = flip * 1.2 * U;
    a.body.rotation.y = anim === 'sweep' ? Math.sin(t * 4) * 0.4 : rd ? Math.sin(t * 0.5) * 0.05 : anim === 'idle' && !walking ? Math.sin(t * 0.7) * 0.14 : 0;
    a.arms.forEach(function (arm, i) { arm.position.z = (holding ? 2.4 : anim === 'type' || anim === 'sort' ? 1.6 : 0) * U;
      arm.position.y = 5 * U + (anim === 'type' ? Math.max(0, Math.sin(t * 9 + i * 2.1)) * 0.05 : anim === 'sort' ? Math.sin(t * 3 + i * 3.1) * 0.08 + 0.06 : anim === 'stamp' ? -0.05 : anim === 'wave' ? 0.12 + Math.sin(t * 14 + i * 3.1) * 0.08 : rd ? 0.1 + (i ? flip * 0.07 : 0) : holding ? 0.03 : 0); });
    if (a.items.mug.visible) a.items.mug.position.y = 4.4 * U + (anim === 'sip' ? Math.max(0, Math.sin(t * 1.6)) * 0.16 : 0);
    var blink = anim === 'nap' ? 0.12 : (time * 0.31 + a.seed) % 1 < 0.03 ? 0.12 : 1; a.eyes.forEach(function (e) { e.scale.y = blink; });
    if (a.em.visible) a.em.position.y = 1.45 + Math.sin(t * 3) * 0.04;
  }

  function paintSweep(t) { var c = sweepCv.getContext('2d'); c.fillStyle = '#171B2B'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#8FB8FF'; c.lineWidth = 3; [44, 84, 118].forEach(function (r) { c.beginPath(); c.arc(128, 128, r, 0, 6.3); c.stroke(); });
    var a = t * 1.6; c.fillStyle = 'rgba(215,119,87,0.6)'; c.beginPath(); c.moveTo(128, 128); c.arc(128, 128, 118, a, a + 0.7); c.closePath(); c.fill(); c.fillStyle = '#FFFFFF';
    [[170, 96, 1.1], [92, 160, 2.6], [150, 176, 4.0]].forEach(function (b) { var n = Math.abs(((a % 6.283) - b[2] + 9.42) % 6.283 - 3.14); c.globalAlpha = 0.25 + 0.75 * Math.max(0, 1 - n / 3.14 * 1.4); c.beginPath(); c.arc(b[0], b[1], 7, 0, 6.3); c.fill(); }); c.globalAlpha = 1; sweepTex.needsUpdate = true; }
  var noteCycle = -1;
  function paintNote(t) { var c = noteCv.getContext('2d'); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, 256, 330); c.strokeStyle = '#1F3FD1'; c.lineWidth = 7; c.lineCap = 'round'; var cyc = t * 0.05, written = (cyc % 1) * 1.3, lines = 6;
    if (Math.floor(cyc) !== noteCycle) { if (noteCycle >= 0) stock.journal = Math.min(2, stock.journal + 1); noteCycle = Math.floor(cyc); }
    for (var i = 0; i < lines; i++) { var k = Math.max(0, Math.min(1, written * lines - i)); if (k <= 0) continue; var w = (i === lines - 1 ? 110 : 196) * k, y = 48 + i * 44; c.beginPath(); c.moveTo(30, y);
      for (var x = 0; x <= w; x += 8) c.lineTo(30 + x, y + Math.sin((x + i * 30) / 16) * 5); c.stroke(); } noteTex.needsUpdate = true; }

  // ---- sound, synthesised; starts with the first click on Explorer
  var audio = null, soundOn = true, stepClock = 0, greetClock = 0, master = null, verb = null, ambGain = null;
  // one chain for everything: a compressor, a short room reverb and a quiet room tone
  function audioGraph() { if (master || !audio) return; var sr = audio.sampleRate, comp = audio.createDynamicsCompressor(); comp.connect(audio.destination); master = audio.createGain(); master.gain.value = 0.9; master.connect(comp);
    var n = Math.floor(sr * 1.2), ir = audio.createBuffer(2, n, sr); for (var ch = 0; ch < 2; ch++) { var d = ir.getChannelData(ch); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
    verb = audio.createConvolver(); verb.buffer = ir; var vg = audio.createGain(); vg.gain.value = 0.2; verb.connect(vg); vg.connect(comp);
 }
  function ambience() { audioGraph(); }
  function sfx(kind, at) {
    if (!audio || !soundOn || !playing) return; audioGraph();
    var vol = 1, pan = 0; if (at) { var dx = at.x - player.x, dz = at.z - player.z, d = Math.hypot(dx, dz); if (d > 18) return; vol = 1 / (1 + d * 0.3); if (d > 0.3) pan = Math.max(-0.8, Math.min(0.8, (dx * Math.cos(player.yaw) - dz * Math.sin(player.yaw)) / d)); }
    var t0 = audio.currentTime + 0.005, g = audio.createGain(); g.gain.value = vol;
    if (audio.createStereoPanner) { var pn = audio.createStereoPanner(); pn.pan.value = pan; g.connect(pn); pn.connect(master); pn.connect(verb); } else { g.connect(master); g.connect(verb); }
    function tone(freq, to, dur, type, gain, delay) { var o = audio.createOscillator(), og = audio.createGain(), s0 = t0 + (delay || 0); o.type = type || 'sine'; o.frequency.setValueAtTime(freq, s0);
      if (to) o.frequency.exponentialRampToValueAtTime(to, s0 + dur); og.gain.setValueAtTime(gain, s0); og.gain.exponentialRampToValueAtTime(0.0001, s0 + dur); o.connect(og); og.connect(g); o.start(s0); o.stop(s0 + dur + 0.02); }
    function hiss(dur, gain, type, freq, q, delay, to) { var s0 = t0 + (delay || 0), n = Math.max(1, Math.floor(audio.sampleRate * dur)), buf = audio.createBuffer(1, n, audio.sampleRate), data = buf.getChannelData(0); for (var i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.6);
      var src = audio.createBufferSource(), f = audio.createBiquadFilter(), ng = audio.createGain(); src.buffer = buf; f.type = type; f.frequency.setValueAtTime(freq, s0); if (to) f.frequency.exponentialRampToValueAtTime(to, s0 + dur); f.Q.value = q || 0.7; ng.gain.value = gain; src.connect(f); f.connect(ng); ng.connect(g); src.start(s0); }
    function blast(delay, dur) { var s0 = t0 + delay, a = audio.createOscillator(), b = audio.createOscillator(), lfo = audio.createOscillator(), lg = audio.createGain(), tg = audio.createGain(); a.frequency.value = 2380; b.frequency.value = 2720; lfo.frequency.value = 34; lg.gain.value = 0.05;
      tg.gain.setValueAtTime(0.09, s0); tg.gain.setValueAtTime(0.09, s0 + dur - 0.03); tg.gain.linearRampToValueAtTime(0.0001, s0 + dur); lfo.connect(lg); lg.connect(tg.gain); a.connect(tg); b.connect(tg); tg.connect(g); [a, b, lfo].forEach(function (o) { o.start(s0); o.stop(s0 + dur + 0.02); }); }
    var r = Math.random();
    if (kind === 'step') { hiss(0.055, 0.2, 'lowpass', 340 + r * 200); tone(92 + r * 24, 52, 0.07, 'sine', 0.15); }
    else if (kind === 'stamp') { tone(140, 46, 0.22, 'sine', 0.6); hiss(0.05, 0.34, 'lowpass', 1800); tone(900, 280, 0.04, 'square', 0.04); }
    else if (kind === 'take') { hiss(0.09, 0.22, 'bandpass', 3000 + r * 600, 0.8); hiss(0.13, 0.16, 'bandpass', 5200, 0.7, 0.07); }
    else if (kind === 'drop') hiss(0.2, 0.2, 'bandpass', 3200, 0.7, 0, 800);
    else if (kind === 'pass') hiss(0.08, 0.14, 'bandpass', 4200 + r * 800, 1);
    else if (kind === 'file') { hiss(0.14, 0.16, 'bandpass', 2400, 0.8); tone(784, 0, 0.24, 'sine', 0.11, 0.1); tone(1175, 0, 0.34, 'sine', 0.09, 0.2); }
    else if (kind === 'greet') { var base = 380 + r * 240, syl = 2 + Math.floor(Math.random() * 2); for (var i = 0; i < syl; i++) { var f0 = base * (1 + Math.random() * 0.45); tone(f0, f0 * (0.85 + Math.random() * 0.5), 0.075, 'triangle', 0.1, i * 0.09); } }
    else if (kind === 'whistle') { blast(0, 0.24); blast(0.32, 0.6); }
    else if (kind === 'crunch') { [0, 0.17, 0.36].forEach(function (dl) { hiss(0.07, 0.3, 'bandpass', 1500 + Math.random() * 900, 2.2, dl); tone(170, 90, 0.05, 'triangle', 0.08, dl); }); }
    else if (kind === 'pop') { tone(280, 920, 0.09, 'sine', 0.26); hiss(0.03, 0.18, 'highpass', 3000); }
    else if (kind === 'sparkle') [1319, 1568, 2093, 2637].forEach(function (f, i) { tone(f, 0, 0.3, 'sine', 0.07, i * 0.07); });
    else if (kind === 'caught') { tone(520, 300, 0.16, 'triangle', 0.14); tone(300, 180, 0.24, 'triangle', 0.14, 0.17); }
  }
  var soundBtn = document.getElementById('sound');
  soundBtn.addEventListener('click', function () { soundOn = !soundOn; soundBtn.setAttribute('aria-pressed', String(soundOn)); soundBtn.textContent = soundOn ? 'Son' : 'Son coupé'; ambience(); canvas.focus(); });

  // ---- play mode
  var playing = false, player = { x: 0, z: 0, yaw: 0, pitch: 0, eye: 1.15, jump: 0, vy: 0 }, keys = {}, stickVec = { x: 0, y: 0 };
  var WALLS = { x1: -21.5, x2: 20.9, z1: -17.3, z2: 7.1 }, RADIUS = 0.36;
  function blocked(x, z) { if (x < WALLS.x1 + RADIUS || x > WALLS.x2 - RADIUS || z < WALLS.z1 + RADIUS || z > WALLS.z2 - RADIUS) return true;
    for (var i = 0; i < SOLIDS.length; i++) { var b = SOLIDS[i]; if (x > b[0] - RADIUS && x < b[1] + RADIUS && z > b[2] - RADIUS && z < b[3] + RADIUS) return true; } return false; }
  var viewLift = 0;
  var held = null, heldIdx = 0, filed = 0, promptEl = document.getElementById('prompt'), whoEl = document.getElementById('who');
  var heldCv = canvasOf(256, 330), heldTex = texFrom(heldCv);
  function paintHeld() { var c = heldCv.getContext('2d'), d = POSTERS[heldIdx]; c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, 256, 330); c.fillStyle = KIND_COLOR[d[0]]; c.fillRect(0, 0, 256, 14);
    c.fillStyle = '#171B2B'; c.font = '800 21px "Schibsted Grotesk", Arial, sans-serif'; var line = '', y = 50; d[2].split(' ').forEach(function (w) { if (c.measureText(line + w).width > 212) { if (y < 190) c.fillText(line, 22, y); y += 26; line = ''; } line += w + ' '; }); if (y < 190) c.fillText(line, 22, y);
    c.strokeStyle = '#B8BDCB'; c.lineWidth = 5; c.lineCap = 'round'; [214, 234].forEach(function (yy) { c.beginPath(); c.moveTo(22, yy); c.lineTo(130, yy); c.stroke(); });
    if (held === 'stamped') { c.strokeStyle = '#1E7A5A'; c.lineWidth = 20; c.lineJoin = 'round'; c.beginPath(); c.moveTo(150, 262); c.lineTo(178, 290); c.lineTo(226, 228); c.stroke(); } heldTex.needsUpdate = true; }
  var heldMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.31), new THREE.MeshBasicMaterial({ map: heldTex, side: THREE.DoubleSide })); heldMesh.position.set(0.36, -0.27, -0.68); heldMesh.rotation.set(-0.5, -0.25, 0.08); heldMesh.visible = false; camera.add(heldMesh);
  function setHeld(v) { held = v; heldMesh.visible = !!v; if (v) paintHeld(); var h = document.getElementById('hand'); h.classList.toggle('on', !!v);
    if (v) { document.getElementById('handState').textContent = KIND[POSTERS[heldIdx][0]] + (v === 'stamped' ? ', tamponnée' : ''); document.getElementById('handTitle').textContent = POSTERS[heldIdx][2]; } }
  function takeSheet(kind) { var list = []; POSTERS.forEach(function (d, i) { if (d[0] === kind) list.push(i); }); heldIdx = pick(list); setHeld('raw'); sfx('take'); }
  function giveSheet(n) { heldIdx = n; setHeld('raw'); sfx('take'); say('Feuille reçue'); }
  function fileSheet() { filed++; sfx('file'); box(0.36, 0.62, 0.2, C.clawd, 21.55, 0.56, 4.75 + filed * 0.29); say(filed + (filed > 1 ? ' classées' : ' classée')); }
  document.getElementById('handRead').addEventListener('click', function () { openReader(heldIdx, true); });
  function nearPt(x, z, r) { return Math.hypot(player.x - x, player.z - z) < r; }
  function openLink(href) { var a = document.createElement('a'); a.href = href; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); if (document.exitPointerLock) document.exitPointerLock(); a.click(); a.remove(); }
  var ACTIONS = [
    { label: 'E · prendre une feuille', can: function () { return !held && RACKS.some(function (r) { return nearPt(r.x, r.z, 1.7); }); },
      run: function () { takeSheet(RACKS.filter(function (r) { return nearPt(r.x, r.z, 1.7); })[0].kind); } },
    { label: 'E · faire tamponner', can: function () { return held === 'raw' && nearPt(3.2, 4.1, 1.7); }, run: function () { stampT = 0.7; sfx('stamp'); setTimeout(function () { if (held === 'raw') setHeld('stamped'); }, 380); } },
    { label: 'E · jeter', can: function () { return held === 'raw' && nearPt(5.6, 4.4, 1.3); }, run: function () { setHeld(null); sfx('drop'); } },
    { label: 'E · classer la feuille', can: function () { return held === 'stamped' && player.x > 18.8 && player.z < 3.5; }, run: function () { setHeld(null); fileSheet(); } },
    { label: 'E · consulter les archives', can: function () { return !held && player.x > 18.8 && player.z < 3.5; }, run: function () { openIndex(); } },
    { label: 'E · lire', can: function () { return !held && player.z < -9.2 && POSTERS.some(function (d) { return nearPt(d[3], d[4], 2.2); }); },
      run: function () { for (var i = 0; i < POSTERS.length; i++) if (nearPt(POSTERS[i][3], POSTERS[i][4], 2.2)) { openReader(i); return; } } }
  ];
  function click(mesh, label, run, reach) { mesh.userData.click = { label: label, run: run, reach: reach || 4.6 }; }
  function takeFrom(key) { return function () { if (held) { say('Tu portes déjà une feuille'); return; } if (stock[key] > 0) stock[key]--; takeSheet(key === 'radar' ? 'radar' : key === 'journal' ? 'journal' : 'blog'); }; }
  click(stackRadar, 'prendre une feuille', takeFrom('radar'), 5); click(stackArticles, 'prendre une feuille', takeFrom('articles'), 5); click(stackJournal, 'prendre une feuille du journal', takeFrom('journal'), 5);
  click(pressHead, 'faire tamponner', function () { if (held !== 'raw') { say(held ? 'Déjà tamponnée' : 'Il faut une feuille à tamponner'); return; } stampT = 0.7; sfx('stamp'); setTimeout(function () { if (held === 'raw') setHeld('stamped'); }, 380); });
  click(binMesh, 'jeter', function () { if (!held) { say('Rien à jeter'); return; } setHeld(null); sfx('drop'); });
  click(archiveWall, function () { return held === 'stamped' ? 'classer la feuille' : held ? 'classer (il lui faut un tampon)' : 'consulter les archives'; },
    function () { if (held === 'stamped') { setHeld(null); fileSheet(); } else if (held) say('Fais-la d’abord tamponner chez Tampon'); else openIndex(); }, 6);
  click(radarScreen, 'aller à la galerie radar', function () { goPlace('radar'); }, 9);
  click(note, 'lire le journal', function () { openReader('journal'); }, 6);
  click(boardMesh, 'convoquer une réunion', function () { meeting.at = time; clawds.forEach(function (c) { if (c.role === 'writer') redo(c); }); say('Réunion de rédaction'); }, 7);
  click(shade, 'allumer ou éteindre', function () { lamp.intensity = lamp.intensity ? 0 : 1.0; sfx('take'); }, 5);
  var sayT = 0; function say(text) { promptEl.textContent = text; promptEl.classList.add('on'); sayT = 2.2; }
  function redo(a) { if (a.spot && a.spot.busy === a) a.spot.busy = null; a.plan.forEach(function (st) { if (st.arrive && st.arrive.busy === a) st.arrive.busy = null; }); a.plan = []; a.act = ''; emote(a, ''); carry(a, null); a.g.position.y = 0; if (a.spot && Math.hypot(a.spot.x - a.g.position.x, a.spot.z - a.g.position.z) > 0.4) a.spot = null; }
  var ROLE_BRIEF = { operator: 'tu surveilles le radar : ce qui vient de sortir en IA, les briefs courts', writer: 'tu rédiges les articles de fond du blog', inspector: 'tu contrôles chaque texte avant publication et tu tamponnes ce qui passe',
    courier: 'tu portes les feuilles entre les postes', archivist: 'tu classes tout ce qui est publié et tu retrouves n’importe quel texte', gardener: 'tu t’occupes des plantes du bureau', barista: 'tu tiens le coin café',
    janitor: 'tu fais le ménage et tu entends tout', curator: 'tu accroches les textes dans les galeries' };
  var CHIPS = { operator: ['Quoi de neuf ?', 'Le dernier brief ?'], writer: ['Sur quoi tu écris ?', 'Conseille-moi un article'], inspector: ['Comment tu vérifies ?', 'Tu refuses souvent ?'], courier: ['Tu vas où ?', 'Où sont les archives ?'],
    archivist: ['Trouve-moi un article sur les agents', 'Combien de textes ?'], gardener: ['Ça pousse bien ?'], barista: ['Un café ?'], janitor: ['Quoi de neuf dans le bureau ?'], curator: ['Quel cadre me conseilles-tu ?'] };
  var chats = {}, talkEl = document.getElementById('talk'), askInput = document.getElementById('askInput');
  function renderTalk() { talkEl.textContent = ''; if (!selected) return; (chats[selected.name] || []).forEach(function (m) { var el = document.createElement('p'); el.className = m.who; el.textContent = m.text; talkEl.appendChild(el); }); talkEl.scrollTop = talkEl.scrollHeight; }
  function addMsg(a, who, text) { var m = { who: who, text: text }; (chats[a.name] = chats[a.name] || []).push(m); if (selected === a) renderTalk(); return m; }
  function reply(a, text) { addMsg(a, 'clawd', text); speak(a, text, 3.4); sfx('greet', a.g.position); }
  function brief(a) { return 'Tu es ' + a.name + ', un petit agent orange du bureau de Rachid Chabane, dont le blog parle d’ingénierie de l’IA. Ton métier ici : ' + ROLE_BRIEF[a.role] + '. En ce moment tu ' + (a.act || 'te déplaces') + '.\n' +
    'Réponds en français, à la première personne, en une à trois phrases courtes, avec le caractère de ton métier, sans emoji et sans liste. Tu ne connais du blog que ce qui suit ; si la réponse n’y est pas, dis-le simplement.\n' +
    'Le blog compte 91 articles de fond et 101 briefs radar, plus un Journal où Rachid consigne ses idées personnelles (écrit à l’encre bleue, à son bureau près de la fenêtre) et une section Projets. Les articles et le radar sont rédigés par des agents sous garde-fous.\n' +
    'Textes que tu peux citer, avec leur numéro :\n' + POSTERS.map(function (d, i) { return i + '. [' + KIND[d[0]] + (d[1] && d[1][0] !== '[' ? ' du ' + d[1] : '') + '] ' + d[2]; }).join('\n') +
    '\nQuand un de ces textes répond à la question, appelle l’outil donner_feuille avec son numéro : le visiteur recevra la feuille en main et pourra la lire.'; }
  // out of tokens for the day: each Clawd says so in character, and has two more lines for visitors who insist
  var QUOTA = {
    operator: ['Plus un token sur mes écrans pour aujourd’hui : Rachid a vidé sa tirelire. Reviens demain, le radar aura refait le plein. D’ici là, les feuilles sont en libre-service au présentoir.', 'Je scrute, je scrute… toujours zéro token à l’horizon. Demain, promis.', 'Signal perdu. Je passe en veille jusqu’à demain.'],
    writer: ['Panne d’encre : le budget de tokens du jour est épuisé. Reviens demain, j’aurai de quoi écrire. En attendant, mes textes sont au présentoir.', 'J’ai beau secouer le stylo, il ne sort plus un mot. Demain.', 'Bon. Je vais tailler mes crayons jusqu’à demain.'],
    inspector: ['Refusé : plus de tokens pour aujourd’hui. Ce n’est pas moi, c’est le budget de Rachid. Représente ta question demain.', 'Deuxième demande, même tampon : REVENIR DEMAIN.', 'Je vais finir par tamponner ton front. Demain !'],
    courier: ['Je livre tout sauf des réponses : plus de tokens aujourd’hui. Repasse demain, je cours plus vite le matin.', 'Toujours rien dans la sacoche. Demain, je te dis.', 'Je file, j’ai une tournée. À demain !'],
    archivist: ['J’ai cherché dans tous les classeurs : il ne reste plus un token pour aujourd’hui. Reviens demain. Les archives, elles, restent ouvertes : sers-toi.', 'J’ai revérifié à la lettre T, comme Token. Rien. Demain.', 'Je classe ta question dans « à traiter demain ».'],
    gardener: ['Les tokens, c’est comme l’eau : Rachid a vidé l’arrosoir pour aujourd’hui. Ça repousse dans la nuit, reviens demain.', 'On ne fait pas pousser une réponse en tirant dessus. Demain.', 'Chut, ça pousse. À demain.'],
    barista: ['Rupture de stock : plus de tokens, et ce n’est pas faute d’avoir secoué la boîte. Reviens demain, première tournée offerte.', 'Je peux te faire un café, pas une réponse. Demain.', 'On ferme le comptoir aux questions. À demain !'],
    janitor: ['J’ai balayé partout, pas un token qui traîne. Tout est parti aujourd’hui. Reviens demain.', 'J’ai même regardé sous les tapis. Demain.', 'Tu marches sur mon sol propre. À demain.'],
    curator: ['L’exposition « Réponses » est fermée pour aujourd’hui, faute de tokens. Réouverture demain. Les cadres, eux, se lisent toujours.', 'Le guide a fini sa journée. Demain.', 'Je décroche. À demain.']
  };
  function quota(a) { a.insist = (a.insist || 0) + 1; if (a.insist >= 2) a.frownT = time + 9; var lines = QUOTA[a.role], level = Math.min(a.insist, lines.length);
    if (level === lines.length) setTimeout(function () { if (a.sheetBusy) return; if (selected === a) selected = null; a.follow = false; redo(a); a.coffee = 0; a.energy = -0.2; }, 2600);
    return lines[level - 1]; }
  function canned(a) { var kind = a.role === 'operator' ? 'radar' : 'blog', list = POSTERS.filter(function (d) { return d[0] === kind; }), d = list[0];
    return { operator: 'Dernier signal capté : « ' + d[2] + ' ».', writer: 'Mon dernier texte : « ' + d[2] + ' ».', inspector: 'Je vérifie les sources de chaque texte, puis je tamponne. Sans tampon, rien ne sort.', courier: 'Je fais la navette entre les bureaux, le tampon et les archives.',
      archivist: 'Tout est rangé au fond : 91 articles et 101 briefs.', gardener: 'Les plantes vont bien, merci.', barista: 'Le café est prêt au comptoir.', janitor: 'Rien à signaler, tout le monde travaille.', curator: 'Je te conseille « ' + d[2] + ' ».' }[a.role]; }
  ROLE_BRIEF.maker = 'tu présentes les projets de Rachid, ses outils et ses logiciels open source'; CHIPS.maker = ['Quel projet me conseilles-tu ?', 'C’est quoi shallnot ?'];
  QUOTA.maker = ['Plus de tokens en stock aujourd’hui, je n’ai que des maquettes. Les fiches au mur se lisent toujours. Reviens demain.', 'J’ai retourné toutes les caisses. Demain.', 'Je ferme l’établi. À demain.'];
  LABELS.sage = 'savant'; ROLE_BRIEF.sage = 'tu es le savant du bureau, tu gardes les définitions de tous les mots du blog dans ta longue barbe'; CHIPS.sage = ['Définis « agent »', 'C’est quoi le rappel ?', 'Un mot au hasard'];
  QUOTA.sage = ['Ma barbe est pleine de mots, mais plus un seul token pour les phrases. Demande-moi une définition, ou reviens demain.', 'J’ai fouillé jusqu’au menton. Pas de token. Demain.', 'Je vais me peigner. À demain.'];
  function ask(a, q, sheet) { q = String(q || '').trim().slice(0, 300); if (!q) return; if (a.role === 'sage' && !sheet) { askSage(a, q); return; } addMsg(a, 'moi', sheet ? q + ' (en lui donnant « ' + POSTERS[sheet.idx][2] + ' »)' : q); var m = addMsg(a, 'clawd', '…'); emote(a, '…');
    function done() { emote(a, ''); if (selected === a) renderTalk(); sfx('greet', a.g.position); speak(a, m.text.length > 150 ? m.text.slice(0, 147) + '…' : m.text, 5); if (sheet) { a.plan.unshift({ anim: 'wave', dur: 0.7, label: 'te répond' }); setTimeout(sheet.done, 1900); } }
    var askSite = window.Shell && window.Shell.ask; if (!askSite) { setTimeout(function () { m.text = quota(a); done(); }, 500); return; }
    askSite({ q: sheet ? q + ' (« ' + POSTERS[sheet.idx][2] + ' »)' : q, persona: a.role, onText: function (t) { m.text = t; if (selected === a) renderTalk(); } })
      .then(function (t) { m.text = t || quota(a); done(); }, function () { m.text = quota(a); done(); });
  }
  document.getElementById('ask').addEventListener('submit', function (e) { e.preventDefault(); if (!selected || !askInput.value.trim()) return; if (held) giveTo(selected, askInput.value.trim()); else ask(selected, askInput.value); askInput.value = ''; });
  document.getElementById('chips').addEventListener('click', function (e) { if (selected && e.target.tagName === 'BUTTON') ask(selected, e.target.textContent); });
  function sheetText(idx) { return (POSTERS[idx][7] || []).join(' ').slice(0, 3500); }
  function byRole(role) { return clawds.filter(function (c) { return c.role === role; }); }
  function nearestCourier(from, not) { var best = null, bd = 1e9; byRole('courier').forEach(function (c) { if (c === not || c.vip) return; var d = Math.hypot(c.g.position.x - from.x, c.g.position.z - from.z); if (d < bd) { bd = d; best = c; } }); return best || byRole('courier')[0]; }
  function frontOf(b) { var p = b.g.position, s2 = p.z < -5.9 ? spot(p.x, -4.45) : spot(p.x + Math.sin(b.g.rotation.y) * 1.25, p.z + Math.cos(b.g.rotation.y) * 1.25); s2.faceTo = [p.x, p.z]; s2.shared = true; return s2; }
  // a walks the sheet over to b; both stop, exchange a line, the sheet changes hands, then b carries on with `then`
  function relay(a, b, kind, lines, then) { b.holdT = 30; b.holdBy = a; redo(a); carry(a, kind); goTo(a, frontOf(b));
    act(a, 'idle', 2.0, 'passe la feuille à ' + b.name, { start: function () { speak(a, lines[0], 2.2); sfx('pass', a.g.position); },
      end: function () { carry(a, null); redo(b); carry(b, kind); b.holdT = 0; b.holdBy = null; speak(b, lines[1], 2.4); then(b); } }); }
  function toArchives(c, kind) { goTo(c, pick(S.shelf)); act(c, 'idle', 1.3, 'classe la feuille du visiteur', { end: function () { carry(c, null); c.vip = false; fileSheet(); speak(c, 'Classée. Elle est aux archives.', 3); } }); }
  function throughControl(c, kind, st) { c.vip = true; c.follow = false;
    if (st === 'stamped' || kind === 'ink') { toArchives(c, kind); return; }
    var insp = byRole('inspector')[0];
    goTo(c, S.controlIn); act(c, 'idle', 1.6, 'présente la feuille à Tampon', { start: function () { speak(c, 'Tampon, une feuille du visiteur.', 2.2); },
      end: function () { carry(c, null); stampT = 0.7; sfx('stamp', insp.g.position); speak(insp, 'Sources vérifiées. Conforme.', 2.6); } });
    goTo(c, S.controlOut); act(c, 'idle', 1.4, 'reprend la feuille tamponnée', { end: function () { carry(c, kind); } });
    toArchives(c, kind);
  }
  var SHOW = { writer: ['Regarde ce que le visiteur m’a donné.', 'Ça recoupe mon brouillon. Je lis.'], operator: ['Tu as capté ça, toi ?', 'Fais voir, je vérifie le signal.'], curator: ['Tu la verrais où, celle-là ?', 'Attends, je regarde.'] };
  function dispose(a, idx, st) { var kind = POSTERS[idx][0] === 'journal' ? 'ink' : 'paper', ready = st === 'stamped' || kind === 'ink', c;
    if (selected === a) selected = null;
    if (a.role === 'courier') { redo(a); carry(a, kind); reply(a, ready ? 'Je file aux archives.' : 'Pas de tampon ? Je passe chez Tampon.'); throughControl(a, kind, st); return; }
    if (a.role === 'inspector') { carry(a, null); if (!ready) { stampT = 0.7; sfx('stamp', a.g.position); } c = nearestCourier(a.g.position);
      reply(a, (ready ? 'Déjà conforme. ' : 'Sources vérifiées, conforme. ') + c.name + ' ! Une feuille pour les archives.');
      redo(c); c.vip = true; goTo(c, S.controlOut); act(c, 'idle', 1.2, 'prend la feuille du visiteur', { start: function () { speak(c, 'J’arrive.', 1.8); }, end: function () { carry(c, kind); } }); toArchives(c, kind); return; }
    if (a.role === 'archivist' && ready) { carry(a, null); fileSheet(); reply(a, 'Classée avec les autres.'); return; }
    if (a.role === 'curator' && ready) { redo(a); carry(a, kind); reply(a, 'Elle mérite un cadre. Je vais l’accrocher.'); goTo(a, pick(S.frames[a.room]));
      act(a, 'sort', 3.2, 'accroche la feuille du visiteur', { end: function () { carry(a, null); filed++; speak(a, 'Voilà, accrochée.', 3); sfx('file'); } }); return; }
    var mate = clawds.filter(function (m) { return m !== a && m.role === a.role && !m.sheetBusy && !(m.holdT > 0); })[0], lines = SHOW[a.role];
    function callCourier(from) { c = nearestCourier(from.g.position); relay(from, c, kind, [c.name + ' ! Pour ' + (ready ? 'les archives.' : 'Tampon.'), 'Je prends.'], function (c2) { throughControl(c2, kind, st); }); }
    if (mate && lines) { reply(a, 'Je la montre à ' + mate.name + ', puis elle part ' + (ready ? 'aux archives.' : 'chez Tampon.'));
      relay(a, mate, kind, lines, function (m) { m.plan = [{ anim: 'read', dur: 3.0, label: 'lit la feuille du visiteur', end: function () { callCourier(m); } }]; }); }
    else { c = nearestCourier(a.g.position); reply(a, 'Je la confie à ' + c.name + '.'); callCourier(a); }
  }
  var hailT = 26;
  function hail(dt) { hailT -= dt; if (hailT > 0 || !playing || held || selected || reading !== null) return; hailT = rnd(40, 70);
    var c = clawds.filter(function (m) { return (m.role === 'writer' || m.role === 'operator') && m.spot === m.home && !m.sheetBusy && Math.hypot(player.x - m.g.position.x, player.z - m.g.position.z) < 7; })[0]; if (!c) { hailT = 8; return; }
    c.offer = time + 22; speak(c, 'Hé ! Tu peux porter ça à Tampon ? Clique sur moi.', 5); sfx('greet', c.g.position); }
  function giveTo(a, question) { if (!held) return; var idx = heldIdx, st = held, d = POSTERS[idx]; setHeld(null); a.follow = false; a.sheetBusy = true; carry(a, d[0] === 'journal' ? 'ink' : 'paper'); sfx('pass', a.g.position);
    function finish() { a.sheetBusy = false; dispose(a, idx, st); }
    if (question) ask(a, question, { idx: idx, done: finish });
    else { addMsg(a, 'moi', 'Tiens : « ' + d[2] + ' »'); emote(a, '…'); setTimeout(function () { emote(a, ''); finish(); }, 2400); }
  }
  // a token cookie: the Clawd crunches it, then something comes out
  var TRINKETS = [
    ['un canard en plastique', function (g) { ball(0.09, C.yellow, 0, 0.09, 0, g); ball(0.06, C.yellow, 0, 0.2, 0.05, g); box(0.05, 0.02, 0.05, C.clawd, 0, 0.18, 0.11, g); }],
    ['un bug', function (g) { ball(0.08, C.red, 0, 0.06, 0, g); ball(0.045, C.ink, 0, 0.07, 0.08, g); }],
    ['une pièce de un token', function (g) { cyl(0.09, 0.025, C.yellow, 0, 0.09, 0, g).rotation.x = Math.PI / 2; }],
    ['un mini cactus', function (g) { cyl(0.06, 0.07, C.white, 0, 0, 0, g); box(0.05, 0.14, 0.05, C.green, 0, 0.07, 0, g); box(0.03, 0.06, 0.03, C.green, 0.05, 0.12, 0, g); }],
    ['un avion en papier', function (g) { box(0.2, 0.01, 0.12, C.white, 0, 0.05, 0, g); box(0.2, 0.05, 0.01, C.white, 0, 0.01, 0, g); }],
    ['une clé USB', function (g) { box(0.05, 0.02, 0.12, C.blue, 0, 0.02, 0, g); box(0.035, 0.015, 0.04, C.steel, 0, 0.022, 0.08, g); }],
    ['une chaussette orpheline', function (g) { box(0.05, 0.14, 0.05, C.lilac, 0, 0.04, 0, g); box(0.05, 0.05, 0.11, C.lilac, 0, 0, 0.03, g); }],
    ['un point-virgule oublié', function (g) { ball(0.03, C.ink, 0, 0.14, 0, g); ball(0.03, C.ink, 0, 0.06, 0, g); box(0.02, 0.05, 0.02, C.ink, -0.01, 0, 0, g); }]
  ];
  var COOKIE_LINES = ['Je crois que j’ai compris les pointeurs. Non, c’est reparti.', 'Savais-tu qu’un fichier YAML sur trois pleure la nuit ?', 'J’ai rêvé d’un test qui passait du premier coup.', '42. Attends, quelle était la question ?', 'Ça a un goût de fenêtre de contexte.', 'Je vois des points-virgules partout.', 'Encore un et je réécris tout en Rust.', 'Miam. 1 024 tokens, pur beurre.'];
  var loose = [];
  function toss(a, t) { var g = new THREE.Group(); scene.add(g); if (t) t[1](g); else box(0.05, 0.05, 0.05, pick([C.yellow, C.clawd, C.blue, C.green, C.lilac, C.red]), 0, 0, 0, g);
    var p = a.g.position, ang = t ? Math.atan2(player.x - p.x, player.z - p.z) + rnd(-0.9, 0.9) : rnd(0, 6.28), sp = t ? rnd(0.9, 1.8) : rnd(0.6, 2.4); g.position.set(p.x, 0.75, p.z); if (t) g.scale.setScalar(1.6);
    var o = { g: g, vx: Math.sin(ang) * sp, vz: Math.cos(ang) * sp, vy: rnd(2.6, 3.8), life: t ? 70 : 9, spin: rnd(-6, 6) }; loose.push(o);
    if (t) click(g, 'ramasser ' + t[0], function () { say('Ramassé : ' + t[0]); sfx('take'); o.life = 0; }, 3.4);
    if (loose.length > 40) loose[0].life = 0; }
  function stepLoose(dt) { loose = loose.filter(function (o) { o.life -= dt; var p = o.g.position;
    if (o.vy !== 0 || p.y > 0) { o.vy -= 9.8 * dt; p.x += o.vx * dt; p.z += o.vz * dt; p.y += o.vy * dt; o.g.rotation.y += o.spin * dt;
      if (p.y <= 0) { p.y = 0; if (Math.abs(o.vy) > 0.9) { o.vy = -o.vy * 0.38; o.vx *= 0.55; o.vz *= 0.55; } else { o.vy = 0; o.vx = o.vz = 0; } } }
    if (o.life < 0.5) o.g.scale.multiplyScalar(Math.max(0.01, 1 - dt * 6));
    if (o.life <= 0) { scene.remove(o.g); return false; } return true; }); }
  function cookieOut(a) { var r = Math.random();
    if (r < 0.42) { var t = pick(TRINKETS); toss(a, t); sfx('pop', a.g.position); reply(a, pick(['Oh. J’ai fabriqué ', 'Tiens, il en est sorti ', 'Ça a donné ']) + t[0] + '.'); }
    else if (r < 0.57 && !held) { takeSheet(pick(['radar', 'blog'])); reply(a, 'Tiens, un texte que je gardais sous le coude.'); }
    else if (r < 0.72) { for (var i = 0; i < 14; i++) toss(a, null); sfx('sparkle', a.g.position); a.plan.unshift({ anim: 'wave', dur: 2.2, label: 'déborde de tokens', glyph: '!', now: true }); reply(a, 'Trop de tokens ! Ça déborde !'); }
    else reply(a, pick(COOKIE_LINES)); }
  var ORDERS = {
    cookie: function (a) { if (a.cookieT > time) { a.frownT = time + 6; reply(a, pick(['Je digère encore.', 'Pas tout de suite, j’ai la bouche pleine.'])); return; } a.cookieT = time + 12; addMsg(a, 'moi', 'Tiens, un cookie de tokens.');
      a.plan.unshift({ anim: 'chat', dur: 1.5, label: 'croque un cookie', glyph: '…', now: true, start: function () { sfx('crunch', a.g.position); }, end: function () { cookieOut(a); } }); },
    give: function (a) { giveTo(a, askInput.value.trim()); askInput.value = ''; }, follow: function (a) { a.follow = !a.follow; if (!a.follow) redo(a); reply(a, a.follow ? 'Je te suis.' : 'Je retourne à mon poste.'); },
    hello: function (a) { a.plan.unshift({ anim: 'wave', dur: 1.8, label: 'te salue', glyph: '!' }); reply(a, 'Salut ! Moi c’est ' + a.name + '.'); },
    coffee: function (a) { a.follow = false; redo(a); a.coffee = 1.3; selected = null; }, nap: function (a) { a.follow = false; redo(a); a.coffee = 0; a.energy = -0.2; selected = null; }, work: function (a) { a.follow = false; redo(a); a.coffee = 0; a.energy = 1; JOBS[a.role](a); selected = null; },
    close: function () { selected = null; }
  };
  var selected = null, cardEl = document.getElementById('card'), ray = new THREE.Raycaster(), aim = new THREE.Vector2(), pointerAt = { x: 0, y: 0 };
  heldMesh.raycast = function () {}; heldMesh.material.depthTest = false; heldMesh.renderOrder = 50;
  var readCv = canvasOf(640, 800), readTex = texFrom(readCv), readRect = null; readTex.generateMipmaps = false; readTex.minFilter = THREE.LinearFilter;
  function paintRead() { var rr = readerEl.getBoundingClientRect(); if (!rr.width) return; var W = 640, k = W / rr.width, H = Math.min(2048, Math.round(rr.height * k)); readCv.width = W; readCv.height = H;
    var c = readCv.getContext('2d'), cs = getComputedStyle(readerEl); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, H); c.fillStyle = cs.borderTopColor; c.fillRect(0, 0, W, (parseFloat(cs.borderTopWidth) || 0) * k);
    function rel(el) { var r = el.getBoundingClientRect(); return { x: (r.left - rr.left) * k, y: (r.top - rr.top) * k, w: r.width * k, h: r.height * k }; }
    var title = document.getElementById('readerTitle'), ts = getComputedStyle(title), tr = rel(title), fs = parseFloat(ts.fontSize) * k, lh = (parseFloat(ts.lineHeight) || parseFloat(ts.fontSize) * 1.05) * k;
    c.fillStyle = ts.color; c.textBaseline = 'alphabetic'; c.font = '800 ' + fs + 'px "Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif'; var line = '', y = tr.y + fs * 0.84;
    title.textContent.split(' ').forEach(function (w) { if (line && c.measureText(line + w).width > tr.w) { c.fillText(line.trim(), tr.x, y); y += lh; line = ''; } line += w + ' '; }); c.fillText(line.trim(), tr.x, y);
    var meta = document.getElementById('readerMeta'), mr = rel(meta), ms = getComputedStyle(meta); c.font = (parseFloat(ms.fontSize) * k) + 'px "JetBrains Mono", monospace'; c.fillStyle = ms.color; c.fillText(meta.textContent, mr.x, mr.y + mr.h * 0.76);
    Array.prototype.forEach.call(document.getElementById('readerBody').children, function (el) { var r = rel(el); if (r.y > H) return; var l = (parseFloat(getComputedStyle(el).lineHeight) || 26) * k, n = Math.max(1, Math.round(r.h / l)), th = Math.max(3, l * 0.28);
      c.fillStyle = el.tagName === 'H3' ? '#8E94AB' : '#CDD2DE'; for (var i = 0; i < n; i++) c.fillRect(r.x, r.y + i * l + (l - th) / 2, r.w * (i === n - 1 && n > 1 ? 0.62 : 1), th); });
    readTex.needsUpdate = true; }
  cardEl.addEventListener('click', function (e) { var o = e.target.getAttribute && e.target.getAttribute('data-order'); if (!o || !selected) return; ORDERS[o](selected); if (!selected) canvas.focus(); });
  function targetAt(clientX, clientY) {
    if (document.pointerLockElement === canvas) aim.set(0, 0); else { var r = canvas.getBoundingClientRect(); aim.set((clientX - r.left) / r.width * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1); }
    ray.setFromCamera(aim, camera); var hits = ray.intersectObjects(scene.children, true);
    for (var i = 0; i < hits.length; i++) { var o = hits[i].object; if (!o.visible) continue;
      while (o) { if (o.userData.clawd) return { clawd: o.userData.clawd, dist: hits[i].distance }; if (o.userData.click) return { click: o.userData.click, dist: hits[i].distance }; o = o.parent; }
      return null; }
    return null;
  }
  function interact(clientX, clientY) {
    var t = targetAt(clientX, clientY);
    if (selected && !(t && t.clawd)) { selected = null; canvas.focus(); return; }  // a tap beside the Clawd closes its card
    if (!t) return;
    if (t.clawd && t.clawd.offer > time && !held) { var o = t.clawd; o.offer = 0; takeSheet(o.role === 'operator' ? 'radar' : 'blog'); speak(o, 'Merci ! Tampon est au bout de l’allée.', 3.4); sfx('greet', o.g.position); return; }
    if (t.clawd && t.clawd.role === 'guard') return;
    if (t.clawd) { selected = t.clawd; var cb = document.getElementById('chips'); cb.textContent = ''; (CHIPS[selected.role] || []).forEach(function (q) { var b = document.createElement('button'); b.type = 'button'; b.textContent = q; cb.appendChild(b); }); renderTalk(); sfx('greet', t.clawd.g.position); if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock(); return; }
    if (t.dist > t.click.reach) { say('Trop loin'); return; } t.click.run();
  }

  // reading happens in the world: you step up to the frame and the sheet comes to you
  var reading = null, glide = null, inHand = false, raise = 0, readerEl = document.getElementById('reader');
  function glideTo(x, z, yaw, pitch) { var dy = Math.atan2(Math.sin(yaw - player.yaw), Math.cos(yaw - player.yaw));
    glide = { t: 0, x0: player.x, z0: player.z, yaw0: player.yaw, p0: player.pitch, x1: x, z1: z, yaw1: player.yaw + dy, p1: pitch }; }
  function standAt(idx) { var d = POSTERS[idx]; glideTo(d[3] + Math.sin(d[5]) * 2.3, d[4] + Math.cos(d[5]) * 2.3, d[5], 0.24); }
  function goPlace(kind) { if (!playing) startPlay(); closeReader(); if (kind === 'radar') glideTo(-7.5, -11.6, 0, 0.12); else glideTo(4.9, -11.6, 0, 0.12); }
  function openReader(which, stay) {
    if (!playing) startPlay(); if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock(); selected = null; keys = {};
    reading = which; var journal = which === 'journal' || POSTERS[which][0] === 'journal';
    if (which === 'journal') glideTo(9.9, 4.3, Math.atan2(-1.4, -0.7), -0.42); else if (!stay && !journal) standAt(which);
    readerEl.className = 'reader ' + (journal ? 'journal' : POSTERS[which][0] === 'radar' ? 'radar' : '') + (stay ? ' inhand' : ''); inHand = !!stay;
    var body = document.getElementById('readerBody'); body.textContent = '';
    if (journal) { var jn = WD.journal; document.getElementById('readerMeta').textContent = 'Journal' + (jn ? ' · ' + jn.date : ''); document.getElementById('readerTitle').textContent = jn ? jn.title : 'Journal';
      (jn ? jn.text : ['Rien encore sur ce bureau.']).forEach(function (t, n) { var q = document.createElement('p'); if (!n) q.className = 'lead'; q.textContent = t; body.appendChild(q); });
      if (jn) { var jl = document.createElement('p'), ja = document.createElement('a'); ja.href = jn.url; ja.textContent = 'Lire le texte complet'; jl.appendChild(ja); body.appendChild(jl); } }
    else { var d = POSTERS[which]; document.getElementById('readerMeta').textContent = (d[0] === 'radar' ? 'Radar' : 'Article') + (d[1] ? ' · ' + d[1] : ''); document.getElementById('readerTitle').textContent = d[2];
      (d[7] || []).forEach(function (t, n) { var q = document.createElement('p'); if (!n) q.className = 'lead'; q.textContent = t; body.appendChild(q); });
      if (d[6]) { var lk = document.createElement('p'), la = document.createElement('a'); la.href = d[6]; la.textContent = 'Lire le texte complet'; lk.appendChild(la); body.appendChild(lk); } }
    document.getElementById('readerPrev').hidden = document.getElementById('readerNext').hidden = journal || !!stay;
    document.getElementById('w3s').classList.add('reading'); readerEl.scrollTop = 0; readerEl.style.animation = 'none'; void readerEl.offsetWidth; readerEl.style.animation = ''; readerEl.focus(); sfx('take'); if (stay) paintRead();
  }
  // the archives, empty-handed: every text, to take a copy of
  function openIndex() { if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock(); selected = null; keys = {}; reading = 'index'; inHand = false; readerEl.className = 'reader';
    document.getElementById('readerMeta').textContent = '192 textes publiés'; document.getElementById('readerTitle').textContent = 'Archives'; var body = document.getElementById('readerBody'); body.textContent = '';
    var ul = document.createElement('ul'); ul.className = 'index'; POSTERS.forEach(function (d, i) { var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
      var m = document.createElement('span'); m.className = 'd'; m.textContent = KIND[d[0]] + (d[1] ? ' · ' + d[1] : ''); var t = document.createElement('span'); t.textContent = d[2]; b.appendChild(m); b.appendChild(t);
      b.addEventListener('click', function () { reading = null; document.getElementById('w3s').classList.remove('reading'); heldIdx = i; setHeld('stamped'); openReader(i, true); }); li.appendChild(b); ul.appendChild(li); }); body.appendChild(ul);
    document.getElementById('readerPrev').hidden = document.getElementById('readerNext').hidden = true; document.getElementById('w3s').classList.add('reading'); readerEl.scrollTop = 0; readerEl.focus(); sfx('take');
  }
  function closeReader() { if (reading === null) return; reading = null; inHand = false; document.getElementById('w3s').classList.remove('reading'); canvas.focus(); sfx('drop'); }
  function turnPage(step) { if (typeof reading !== 'number' || inHand) return; var kind = POSTERS[reading][0], i = reading; do { i = (i + step + POSTERS.length) % POSTERS.length; } while (POSTERS[i][0] !== kind); openReader(i); }
  document.getElementById('readerClose').addEventListener('click', closeReader);
  document.getElementById('readerPrev').addEventListener('click', function () { turnPage(-1); }); document.getElementById('readerNext').addEventListener('click', function () { turnPage(1); });
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[data-read], a[data-go]'); if (!a || !canvas || canvas.hidden) return; e.preventDefault();
    if (a.hasAttribute('data-go')) goPlace(a.getAttribute('data-go')); else { var w = a.getAttribute('data-read'); openReader(w === 'journal' ? 'journal' : +w); } });

  function currentAction() { for (var i = 0; i < ACTIONS.length; i++) if (ACTIONS[i].can()) return ACTIONS[i]; return null; }
  function useKey() { var a = currentAction(); if (a) { a.run(); return; } var open = document.querySelector('.cap.on .more') || document.querySelector('.cap.on li a'); if (open) openLink(open.href); }
  var bob = new THREE.Group(); bob.visible = false; scene.add(bob);
  (function () { var m = new THREE.MeshBasicMaterial({ color: lin(0xFFF4DC), side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false });
    for (var i = 0; i < 4; i++) { var arc = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.8, 24, 1, i * Math.PI / 2 + 0.18, Math.PI / 2 - 0.36), m); arc.rotation.x = -Math.PI / 2; arc.raycast = function () {}; arc.renderOrder = 2; bob.add(arc); } })();
  var tmpV = new THREE.Vector3();
  function stepPlayer(dt) {
    // the passage between the pages and the world: the camera starts far back and high with a narrow lens, then comes down to eye level while the lens opens
    if (cine) { cine.t += dt; var cu = Math.max(0, Math.min(1, cine.t / cine.dur)), ce = cu * cu * (3 - 2 * cu); if (cine.back) ce = 1 - ce; cine.e = ce;
      player.x = cine.ax + (cine.bx - cine.ax) * ce; player.z = cine.az + (cine.bz - cine.az) * ce; player.yaw = cine.yaw; player.pitch = cine.pitch * ce - (1 - ce) * 0.1; player.eye = (MOBILE ? 1.42 : 1.15) + (1 - ce) * 1.5; player.jump = 0; keys = {}; stickVec.x = stickVec.y = 0; selected = null;
      if (cine.t >= cine.dur) { var cd = cine.done; cine.done = null; if (!cine.back) cine = null; if (cd) cd(); } }
    if (glide) { glide.t = Math.min(1, glide.t + dt / 0.7); var k = glide.t * glide.t * (3 - 2 * glide.t);
      player.x = glide.x0 + (glide.x1 - glide.x0) * k; player.z = glide.z0 + (glide.z1 - glide.z0) * k; player.yaw = glide.yaw0 + (glide.yaw1 - glide.yaw0) * k; player.pitch = glide.p0 + (glide.p1 - glide.p0) * k;
      if (glide.t >= 1) glide = null; }
    if (reading !== null || glide) { keys = {}; stickVec.x = stickVec.y = 0; }
    var f = (keys.forward ? 1 : 0) - (keys.back ? 1 : 0) - stickVec.y, r = (keys.right ? 1 : 0) - (keys.left ? 1 : 0) + stickVec.x, len = Math.hypot(f, r); if (len > 1) { f /= len; r /= len; }
    var pushed = Math.hypot(stickVec.x, stickVec.y) > 0.93, top = keys.run || pushed ? 6.2 : 3.6, sin = Math.sin(player.yaw), cos = Math.cos(player.yaw), ease = Math.min(1, dt * 9);
    player.vx = (player.vx || 0) + ((-sin * f + cos * r) * top - (player.vx || 0)) * ease; player.vz = (player.vz || 0) + ((-cos * f - sin * r) * top - (player.vz || 0)) * ease;
    var dx = player.vx * dt, dz = player.vz * dt;
    if (!blocked(player.x + dx, player.z)) player.x += dx; else player.vx = 0; if (!blocked(player.x, player.z + dz)) player.z += dz; else player.vz = 0;
    var pace = Math.hypot(player.vx, player.vz); player.stride = (player.stride || 0) + pace * dt * 2.6; player.lean = (player.lean || 0) + (-r * 0.018 - (player.lean || 0)) * Math.min(1, dt * 6);
    var wantFov = baseFov + (keys.run && pace > 4 ? 7 : 0); if (cine) { wantFov = 2 * Math.atan(Math.tan(baseFov * Math.PI / 360) * 7 / (7 + (1 - cine.e) * cine.dist)) * 180 / Math.PI; camera.fov = wantFov; camera.updateProjectionMatrix(); } if (Math.abs(camera.fov - wantFov) > 0.05) { camera.fov += (wantFov - camera.fov) * Math.min(1, dt * 6); camera.updateProjectionMatrix(); }
    if (len > 0.1 && player.jump === 0) { stepClock -= dt; if (stepClock <= 0) { sfx('step'); stepClock = keys.run ? 0.26 : 0.4; } }
    greetClock -= dt; hail(dt); welcome(dt);
    if (keys.jump && player.jump === 0) player.vy = 4.6; player.vy -= 13 * dt; player.jump = Math.max(0, player.jump + player.vy * dt); if (player.jump === 0) player.vy = 0;
    var atBench = player.x > 7.8 && player.x < 15 && player.z > 2.1; player.eye += ((atBench ? 1.75 : MOBILE ? 1.42 : 1.15) - player.eye) * Math.min(1, dt * 4);
    var wantR = inHand && reading !== null ? 1 : 0; raise += (wantR - raise) * Math.min(1, dt * 8); if (Math.abs(wantR - raise) < 0.003) raise = wantR;
    if (wantR) readRect = readerEl.getBoundingClientRect();
    if (raise > 0 && readRect && readRect.width) { var e = raise * raise * (3 - 2 * raise), sr = stage.getBoundingClientRect(), dist = 0.5, kk = 2 * dist * Math.tan(camera.fov * Math.PI / 360) / sr.height,
        tx = (readRect.left + readRect.width / 2 - sr.left - sr.width / 2) * kk, ty = -(readRect.top + readRect.height / 2 - sr.top - sr.height / 2) * kk;
      heldMesh.material.map = readTex; heldMesh.position.set(0.36 + (tx - 0.36) * e, -0.27 + (ty + 0.27) * e, -0.68 + (0.68 - dist) * e); heldMesh.rotation.set(-0.5 * (1 - e), -0.25 * (1 - e), 0.08 * (1 - e));
      heldMesh.scale.set(1 + (readRect.width * kk / 0.24 - 1) * e, 1 + (readRect.height * kk / 0.31 - 1) * e, 1); }
    else { heldMesh.material.map = heldTex; heldMesh.position.set(0.36, -0.27, -0.68); heldMesh.rotation.set(-0.5, -0.25, 0.08); heldMesh.scale.set(1, 1, 1); }
    readerEl.classList.toggle('arrived', wantR === 1 && raise > 0.98);
    var bobY = player.jump === 0 ? Math.sin((player.stride || 0) * 2) * 0.022 * Math.min(1, (pace || 0) / 3.6) : 0;
    camera.position.set(player.x, player.eye + player.jump + bobY, player.z); camera.rotation.set(player.pitch, player.yaw, player.lean || 0, 'YXZ');
    caps.forEach(function (c) { c.classList.toggle('on', c.dataset.px !== undefined && Math.hypot(player.x - c.dataset.px, player.z - c.dataset.pz) < +c.dataset.r); });
    if (MOBILE) { var cr = canvas.getBoundingClientRect(); pointerAt.x = cr.left + cr.width / 2; pointerAt.y = cr.top + cr.height / 2; }
    var hov = reading !== null ? null : targetAt(pointerAt.x, pointerAt.y);
    padRead.hidden = !held; padAct.classList.toggle('live', !!(hov && (hov.clawd || (hov.click && hov.dist <= hov.click.reach))) || !!currentAction());
    if (sayT > 0) sayT -= dt; else { var txt = hov && hov.clawd ? (hov.clawd.role === 'guard' ? hov.clawd.name : 'clic · ' + hov.clawd.name) : hov && hov.click && hov.dist <= hov.click.reach ? 'clic · ' + (typeof hov.click.label === 'function' ? hov.click.label() : hov.click.label) : '';
      if (!txt) { var near = currentAction(); if (near) txt = near.label; }
      if (MOBILE) txt = txt.replace(/^(clic|E) · /, ''); promptEl.textContent = txt; promptEl.classList.toggle('on', !!txt); }
    if (selected && Math.hypot(player.x - selected.g.position.x, player.z - selected.g.position.z) > 16) selected = null;
    cardEl.classList.toggle('on', !!selected); document.getElementById('w3s').classList.toggle('talking', !!selected);
    // phone: the drawer covers the lower part of the screen, so turn to the Clawd and lift the picture into the space above it
    if (MOBILE) { var sw = stage.clientWidth, sh = stage.clientHeight, lift = selected ? Math.min(cardEl.offsetHeight, sh * 0.66) / 2 : 0;
      viewLift += (lift - viewLift) * Math.min(1, dt * 7);
      if (viewLift > 0.5) camera.setViewOffset(sw, sh, 0, viewLift, sw, sh); else if (camera.view) camera.clearViewOffset();
      if (selected && !glide) { var cdx = selected.g.position.x - player.x, cdz = selected.g.position.z - player.z, cd = Math.max(0.6, Math.hypot(cdx, cdz)), wantYaw = Math.atan2(-cdx, -cdz), wantPitch = Math.atan2(0.78 - player.eye, cd), kk = Math.min(1, dt * 5);
        player.yaw += Math.atan2(Math.sin(wantYaw - player.yaw), Math.cos(wantYaw - player.yaw)) * kk; player.pitch += (wantPitch - player.pitch) * kk; } } if (MOBILE) { stick.hidden = !!selected; document.getElementById('pad').hidden = !!selected; }
    if (selected) { document.getElementById('giveBtn').hidden = !held; var ph = held ? 'Ta question sur la feuille que tu lui donnes' : 'Pose-lui une question sur le blog'; if (askInput.placeholder !== ph) askInput.placeholder = ph; document.getElementById('followBtn').textContent = selected.follow ? 'Ne me suis plus' : 'Suis-moi'; document.getElementById('cardName').textContent = selected.name; document.getElementById('cardDoing').textContent = LABELS[selected.role] + (selected.act ? ' · ' + selected.act : ' · en route');
      document.getElementById('gCoffee').style.width = Math.round(Math.max(0, Math.min(1, 1 - selected.coffee)) * 100) + '%'; document.getElementById('gEnergy').style.width = Math.round(Math.max(0, Math.min(1, selected.energy)) * 100) + '%'; }
    var best = selected, bd = 3.4; if (!best) clawds.forEach(function (c) { var d = Math.hypot(player.x - c.g.position.x, player.z - c.g.position.z); if (d < bd) { bd = d; best = c; } });
    bob.visible = !!best; whoEl.classList.toggle('on', !!best);
    if (best) { bob.position.set(best.g.position.x, 0.06, best.g.position.z); bob.rotation.y = time * 0.9; bob.scale.setScalar(selected ? 1.15 + Math.sin(time * 4) * 0.04 : 1);
      tmpV.set(best.g.position.x, 2.05, best.g.position.z).project(camera);
      if (tmpV.z < 1) { whoEl.innerHTML = '<b>' + best.name + '</b> · ' + LABELS[best.role] + (best.act ? ' · ' + best.act : '');
        whoEl.style.transform = 'translate(-50%,-100%) translate(' + ((tmpV.x + 1) / 2 * stage.clientWidth).toFixed(0) + 'px,' + ((1 - tmpV.y) / 2 * stage.clientHeight).toFixed(0) + 'px)'; } else whoEl.classList.remove('on'); }
  }
  function lockPointer() { try { var asked = canvas.requestPointerLock && canvas.requestPointerLock(); if (asked && asked.catch) asked.catch(function () {}); } catch (e) {} }
  function lookBy(dx, dy) { player.yaw -= dx * 0.0024; player.pitch = Math.max(-1.2, Math.min(1.2, player.pitch - dy * 0.0024)); }
  function startPlay() {
    var dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    player.x = camera.position.x; player.z = camera.position.z; player.eye = camera.position.y; player.jump = 0; player.vy = 0; player.yaw = Math.atan2(-dir.x, -dir.z); player.pitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
    if (blocked(player.x, player.z)) { player.x = -19; player.z = 0.4; }
    if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audio = null; } } if (audio && audio.state === 'suspended') audio.resume();
    playing = true; keys = {}; ambience(); document.getElementById('w3s').classList.add('playing'); document.body.classList.add('locked'); fit(); canvas.focus(); lockPointer();
  }
  function stopPlay() { closeReader(); glide = null; playing = false; selected = null; viewLift = 0; if (camera.view) camera.clearViewOffset(); document.getElementById('w3s').classList.remove('talking'); cardEl.classList.remove('on'); promptEl.classList.remove('on'); whoEl.classList.remove('on'); bob.visible = false; document.getElementById('w3s').classList.remove('playing'); document.body.classList.remove('locked'); lookNow = null;
    if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); fit(); ambience(); }
  document.getElementById('play').addEventListener('click', startPlay); document.getElementById('quit').addEventListener('click', function () { window.Shell.to2D(); }); document.getElementById('flat').addEventListener('click', function (e) { e.preventDefault(); window.Shell.to2D(); });
  promptEl.addEventListener('click', function () { useKey(); canvas.focus(); });
  var CODES = { KeyW: 'forward', ArrowUp: 'forward', KeyS: 'back', ArrowDown: 'back', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', ShiftLeft: 'run', ShiftRight: 'run', Space: 'jump' };
  var LETTERS = { z: 'forward', w: 'forward', s: 'back', q: 'left', a: 'left', d: 'right', ' ': 'jump', shift: 'run' };
  function keyName(e) { return CODES[e.code] || LETTERS[(e.key || '').toLowerCase()]; }
  function onKey(e, down) {
    if (!window.__w3on || cine) return;
    if (!playing) { if (down && LETTERS[(e.key || '').toLowerCase()] && e.key !== ' ' && !e.metaKey && !e.ctrlKey && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) && progress() < 0.999) startPlay(); else return; } var isR = e.code === 'KeyR' || (e.key || '').toLowerCase() === 'r';
    if (reading !== null) { if (down && (e.code === 'Escape' || (isR && !e.repeat))) { closeReader(); e.preventDefault(); } return; }
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) { if (down && e.code === 'Escape') { selected = null; canvas.focus(); } return; }
    if (e.target && e.target.tagName === 'BUTTON' && (e.code === 'Space' || e.code === 'Enter')) return;
    if (down && e.code === 'Escape') { window.Shell.to2D(); return; }
    if (down && isR) { if (!e.repeat && held) openReader(heldIdx, true); e.preventDefault(); return; } if (down && (e.code === 'KeyE' || (e.key || '').toLowerCase() === 'e')) { if (!e.repeat) useKey(); e.preventDefault(); return; }
    var k = keyName(e); if (k) { keys[k] = down; e.preventDefault(); }
  }
  document.addEventListener('keydown', function (e) { onKey(e, true); }); document.addEventListener('keyup', function (e) { onKey(e, false); }); window.addEventListener('blur', function () { keys = {}; });
  var dragLook = null;
  var tapStart = null;
  stage.addEventListener('pointerdown', function (e) { tapStart = playing ? null : { x: e.clientX, y: e.clientY, t: performance.now(), y0: window.scrollY }; });
  stage.addEventListener('pointerup', function (e) { var t0 = tapStart; tapStart = null; if (playing || !t0) return;
    if (e.target.closest && e.target.closest('a, button, input, .reader, .card')) return;
    if (Math.hypot(e.clientX - t0.x, e.clientY - t0.y) > 12 || performance.now() - t0.t > 600 || Math.abs(window.scrollY - t0.y0) > 4) return;
    startPlay(); });
  var press = null;
  canvas.addEventListener('pointerdown', function (e) {
    if (!playing) return;
    if (reading !== null) { closeReader(); return; }
    canvas.focus(); press = { x: e.clientX, y: e.clientY, moved: 0, locked: document.pointerLockElement === canvas };
    if (e.pointerType === 'mouse') { if (!press.locked) dragLook = { x: e.clientX, y: e.clientY }; } else dragLook = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });
  canvas.addEventListener('pointerup', function (e) {
    if (!playing || !press) return; var p = press; press = null;
    if (p.moved > 8) return;
    interact(e.clientX, e.clientY);
    if (e.pointerType === 'mouse' && !p.locked && !selected) lockPointer();
  });
  window.addEventListener('pointermove', function (e) { if (!playing) return; pointerAt.x = e.clientX; pointerAt.y = e.clientY; if (press) press.moved += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
    if (document.pointerLockElement === canvas) lookBy(e.movementX, e.movementY);
    else if (dragLook && (dragLook.id === undefined || dragLook.id === e.pointerId)) { var dir = dragLook.id === undefined ? 1.6 : -1.6; lookBy((e.clientX - dragLook.x) * dir, (e.clientY - dragLook.y) * dir); dragLook.x = e.clientX; dragLook.y = e.clientY; } });
  window.addEventListener('pointerup', function () { dragLook = null; }); window.addEventListener('pointercancel', function () { dragLook = null; });
  var padAct = document.getElementById('padAct'), padRead = document.getElementById('padRead');
  padAct.addEventListener('click', function () { if (!playing || reading !== null) return; var cr = canvas.getBoundingClientRect(), t = targetAt(cr.left + cr.width / 2, cr.top + cr.height / 2);
    if (t && (t.clawd || t.dist <= t.click.reach)) interact(cr.left + cr.width / 2, cr.top + cr.height / 2); else useKey(); });
  padRead.addEventListener('click', function () { if (held && reading === null) openReader(heldIdx, true); });
  document.getElementById('menuBtn').addEventListener('click', function () { document.getElementById('w3s').classList.toggle('navopen'); });
  var stick = document.getElementById('stick'), knob = document.getElementById('knob'), stickId = null;
  function stickMove(e) { var r = stick.getBoundingClientRect(), vx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), vy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2), l = Math.hypot(vx, vy); if (l > 1) { vx /= l; vy /= l; }
    stickVec.x = vx; stickVec.y = vy; knob.style.transform = 'translate(' + (vx * 34) + 'px,' + (vy * 34) + 'px)'; }
  stick.addEventListener('pointerdown', function (e) { stickId = e.pointerId; try { stick.setPointerCapture(e.pointerId); } catch (err) {} stickMove(e); e.preventDefault(); e.stopPropagation(); });
  stick.addEventListener('pointermove', function (e) { if (e.pointerId === stickId) { stickMove(e); e.stopPropagation(); } });
  function stickEnd(e) { if (e.pointerId === stickId) { stickId = null; stickVec.x = stickVec.y = 0; knob.style.transform = ''; canvas.focus(); } }
  stick.addEventListener('pointerup', stickEnd); stick.addEventListener('pointercancel', stickEnd);

  // ---- the guided walk: where you stand, how high your eyes are, what you look at
  var KEYS = [
    { x: -20.4, y: 1.3, z: -0.4, look: [2, 1.0, 0.2] }, { x: -12.5, y: 1.15, z: 1.2, look: [-11, 1.2, -7] }, { x: -8.6, y: 1.15, z: 1.0, look: [-9.6, 1.2, -7] },
    { x: -3.4, y: 1.3, z: -0.6, look: [-2.4, 2.2, -8.4] }, { x: 0.6, y: 1.3, z: -0.4, look: [-1.0, 2.2, -8.4] }, { x: 4.8, y: 1.15, z: 1.0, look: [7.6, 1.0, -7] }, { x: 7.2, y: 1.2, z: 0.4, look: [11.5, 1.0, -7] }, { x: 8.8, y: 1.6, z: 2.4, look: [11.4, 1.0, 5.0] }, { x: 9.7, y: 1.9, z: 4.4, look: [11.5, 1.02, 5.05] }
  ];
  function progress() { var r = walk.getBoundingClientRect(), span = r.height - window.innerHeight; return span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0; }
  var look = new THREE.Vector3(), lookNow = null, mouse = { x: 0, y: 0 };
  function placeCamera() {
    var f = progress() * (KEYS.length - 1), i = Math.min(KEYS.length - 2, Math.floor(f)), t = f - i; t = t * t * (3 - 2 * t); var a = KEYS[i], b = KEYS[i + 1];
    camera.position.set(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t + (MOBILE ? 0.27 : 0), a.z + (b.z - a.z) * t + (MOBILE ? 0.9 : 0));
    look.set(a.look[0] + (b.look[0] - a.look[0]) * t + mouse.x * 0.9, a.look[1] + (b.look[1] - a.look[1]) * t - mouse.y * 0.5, a.look[2] + (b.look[2] - a.look[2]) * t);
    if (!lookNow) lookNow = look.clone(); else lookNow.lerp(look, 0.12); camera.lookAt(lookNow);
    var x = camera.position.x; caps.forEach(function (c) { c.classList.toggle('on', x >= +c.dataset.from && x <= +c.dataset.to); });
  }
  var baseFov = 58, composer = null, grade = null, fxaa = null;
  if (POST) { try {
    var rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    composer = new THREE.EffectComposer(renderer, rt); composer.addPass(new THREE.RenderPass(scene, camera));
    if (!MOBILE) composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(4, 4), 0.32, 0.6, 1.9));
    grade = new THREE.ShaderPass({ uniforms: { tDiffuse: { value: null }, time: { value: 0 }, exposure: { value: 1.0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D tDiffuse; uniform float time; uniform float exposure; varying vec2 vUv;' +
        'vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }' +
        'void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb * exposure; c = aces(c); c = pow(c, vec3(1.0/2.2));' +
        ' float l = dot(c, vec3(0.299,0.587,0.114)); c = mix(vec3(l), c, 1.26);' +
        ' float v = smoothstep(0.98, 0.32, distance(vUv, vec2(0.5))); c *= mix(0.8, 1.0, v);' +
        ' float n = fract(sin(dot(vUv * vec2(1733.0, 977.0) + time, vec2(12.9898, 78.233))) * 43758.5453); c += (n - 0.5) * 0.016; gl_FragColor = vec4(c, 1.0); }' });
    composer.addPass(grade); fxaa = new THREE.ShaderPass(THREE.FXAAShader); composer.addPass(fxaa);
  } catch (e) { composer = null; renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; } }
  function fit() { var w = stage.clientWidth, h = stage.clientHeight, pr = renderer.getPixelRatio(); renderer.setSize(w, h, false); camera.aspect = w / h; baseFov = w / h < 0.8 ? 98 : w / h < 1.2 ? 80 : 58; camera.fov = baseFov; camera.updateProjectionMatrix();
    if (composer) { composer.setSize(w, h); fxaa.material.uniforms.resolution.value.set(1 / (w * pr), 1 / (h * pr)); } }
  var cine = null, PLACES = { home: [-16.5, 0.6, -Math.PI / 2], radar: [-11, -1.4, 0], work: [-1.85, -1.2, 0], blog: [8.8, -1.4, 0], library: [17.0, 0.6, -Math.PI / 2], journal: [11.2, 0.9, Math.PI] };
  function shot(p, back, done) { var fx = -Math.sin(p[2]), fz = -Math.cos(p[2]), ax = Math.max(-20.6, Math.min(20.6, p[0] - fx * 10)), az = Math.max(-7.3, Math.min(6.3, p[1] - fz * 10));
    return { t: back ? 0 : -0.35, dur: back ? 1.35 : 1.9, back: !!back, done: done, e: back ? 1 : 0, ax: ax, az: az, bx: p[0], bz: p[1], yaw: p[2], pitch: back ? player.pitch : 0, dist: Math.hypot(p[0] - ax, p[1] - az) }; }
  window.World = {
    enter: function (place, done) { var p = PLACES[place] || PLACES.home; startPlay(); glide = null; cine = shot(p, false, done); player.x = cine.ax; player.z = cine.az; player.yaw = p[2]; player.pitch = -0.1; player.eye = 2.65; },
    leave: function (done) { closeReader(); selected = null; glide = null; if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock();
      var best = 'home', bd = 1e9; Object.keys(PLACES).forEach(function (k) { var d = Math.hypot(player.x - PLACES[k][0], player.z - PLACES[k][1]); if (d < bd) { bd = d; best = k; } });
      cine = shot([player.x, player.z, player.yaw], true, done); return best; },
    stop: function () { cine = null; stopPlay(); }
  };
  window.addEventListener('resize', fit);
  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX / window.innerWidth - 0.5; mouse.y = e.clientY / window.innerHeight - 0.5; });

  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, last = performance.now();
  function tick(dt) { time += dt; if (time > meeting.at + 14) meeting.at = time + rnd(55, 85); clawds.forEach(function (a) { stepClawd(a, dt); }); runaway(dt); stepLoose(dt); }
  function frame(now) {
    if (!window.__w3on && !(window.__w3warm > 0)) { last = now; requestAnimationFrame(frame); return; } if (window.__w3warm > 0) window.__w3warm--;
    var dt = Math.min(0.05, (now - last) / 1000); last = now; if (!still || playing) tick(dt);
    dish.rotation.y = time * 0.5; clockHand.rotation.z = -time * 0.2;
    var pulse = 0; if (stampT > 0) { stampT -= dt; pulse = Math.sin(Math.max(0, 1 - stampT / 0.7) * Math.PI); }
    pressHead.position.y = 1.59 - pulse * 0.98; pressRod.position.y = 1.85 - pulse * 0.49; pressRod.scale.y = 1 + pulse * 1.5;
    stackRadar.scale.y = Math.max(1, stock.radar); stackArticles.scale.y = Math.max(1, stock.articles);
    stackIn.visible = stock.control > 0; stackIn.scale.y = Math.max(1, stock.control); stackOut.visible = stock.done > 0; stackOut.scale.y = Math.max(1, stock.done);
    smallGlow.forEach(function (g, i) { g.material.color.setHSL(0.6, 0.9, 0.5 + 0.08 * Math.sin(time * 3 + i * 2)); });
    paintSweep(time); paintNote(time);
    if (playing) stepPlayer(dt); else placeCamera();
    stepBulles(dt);
    var dp = dust.geometry.attributes.position; for (var di = 0; di < dp.count; di++) { var yy = dp.getY(di) + Math.sin(time * 0.6 + di) * 0.0009 + 0.0006; dp.setY(di, yy > 3.6 ? 0.3 : yy); dp.setX(di, dp.getX(di) + Math.sin(time * 0.3 + di * 1.7) * 0.0012); } dp.needsUpdate = true;
    clouds.forEach(function (c, ci) { c.position.x += dt * (0.12 + ci * 0.03); if (c.position.x > 46) c.position.x = -46; });
    if (composer) { grade.uniforms.time.value = time % 10; composer.render(); } else renderer.render(scene, camera);
    if (!frame.shown) { frame.shown = true; canvas.classList.add('ready'); }
    requestAnimationFrame(frame);
  }
  fit(); for (var warm = 0; warm < 400; warm++) tick(0.05);
  requestAnimationFrame(frame);
})();

};
