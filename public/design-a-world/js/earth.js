/* Compact Earth. Continents are ellipses on a 1-degree grid, then scaled up.
   No downloads. Recognizable land, not a satellite photo. */
(function (root) {
  "use strict";

  var CW = 360;
  var CH = 180;

  /* cx, cy, rx, ry in degrees. s=1 adds land, s=-1 cuts water. */
  var BLOBS = [
    [-98, 50, 24, 14, 1],
    [-108, 60, 20, 9, 1],
    [-152, 64, 18, 8, 1],
    [-100, 34, 14, 8, 1],
    [-102, 23, 8, 7, 1],
    [-88, 31, 10, 5, 1],
    [-78, 40, 11, 8, 1],
    [-120, 40, 7, 12, 1],
    [-81, 27.5, 3.4, 5, 1],
    [-90, 15.5, 6, 3.2, 1],
    [-84, 11, 4.5, 2.6, 1],
    [-78, 8, 3.5, 2.2, 1],
    [-86, 61, 8, 6.5, -1],
    [-68, 66, 7, 8, -1],
    [-113, 27, 2.2, 6.5, -1],
    [-90, 25, 6.5, 4.2, -1],
    [-84, 44.5, 4.2, 2.2, -1],
    [-62, -16, 13, 26, 1],
    [-48, -12, 10, 14, 1],
    [-68, -40, 7, 14, 1],
    [-70, -12, 4, 18, 1],
    [-42, 73, 10, 13, 1],
    [10, 49, 16, 8, 1],
    [18, 64, 9, 8, 1],
    [-2, 54, 4, 6.2, 1],
    [-5, 40, 5, 3.4, 1],
    [12.5, 42.5, 2.6, 5.4, 1],
    [22, 46, 7, 5, 1],
    [28, 40, 6, 4, 1],
    [21, 5, 16, 28, 1],
    [2, 10, 12, 11, 1],
    [44, 8, 8, 8, 1],
    [25, -28, 9, 9, 1],
    [46, -19, 2.8, 7.5, 1],
    [78, 48, 32, 16, 1],
    [100, 62, 36, 12, 1],
    [112, 36, 20, 14, 1],
    [78, 22, 9, 14, 1],
    [86, 30, 18, 8, 1],
    [30, 26, 12, 8, 1],
    [45, 24, 11, 10, 1],
    [102, 15, 12, 9, 1],
    [136, 36, 5, 10, 1],
    [128, 8, 14, 6, 1],
    [114, -2, 10, 4, 1],
    [134, -25, 18, 13, 1],
    [147, -42, 3.2, 2.4, 1],
    [172, -42, 3.6, 7, 1],
    [16, 35, 18, 4.2, -1],
    [34, 43, 6, 2.4, -1],
    [50, 43, 4.5, 2.6, -1],
    [38, 22, 2.4, 9, -1],
    [52, 27, 4, 2.2, -1],
    [60, 25, 3, 2, -1],
    [2, 1, 9, 3.6, -1]
  ];

  var RIDGES = [
    { name: "rockies", pts: [[-122, 52], [-116, 44], [-108, 38], [-106, 32]], half: 3.2, h: 0.72 },
    { name: "andes", pts: [[-76, 8], [-74, -6], [-70, -16], [-68, -28], [-70, -42]], half: 2.4, h: 0.78 },
    { name: "himalaya", pts: [[74, 34], [82, 30], [88, 28], [96, 29]], half: 2.6, h: 0.9 },
    { name: "alps", pts: [[6, 46], [10, 46.5], [14, 46.8]], half: 1.6, h: 0.48 },
    { name: "appalach", pts: [[-84, 36], [-80, 38], [-76, 40]], half: 1.8, h: 0.28 }
  ];

  var RIVERS = [
    { name: "mississippi", pts: [[-93, 45], [-91, 39], [-90, 32], [-89, 29]], w: 0.7 },
    { name: "amazon", pts: [[-74, -4], [-64, -3], [-54, -2], [-50, 0]], w: 0.9 },
    { name: "nile", pts: [[32, 2], [31, 15], [31, 27], [31, 31]], w: 0.55 },
    { name: "yangtze", pts: [[102, 30], [110, 31], [118, 32], [121, 32]], w: 0.55 }
  ];

  var CITIES = [
    [-74, 40, 3], [-87, 41, 2], [-97, 32, 2], [-118, 34, 3], [-99, 19, 3],
    [-80, 26, 1], [-104, 39, 1], [-123, 49, 1], [-79, 43, 2], [-90, 30, 1],
    [-43, -23, 3], [-46, -23, 2], [-58, -34, 2], [-77, -12, 2], [-70, -33, 1],
    [-0.1, 51.5, 3], [2, 48, 2], [13, 52, 2], [37, 55, 2], [12, 41, 1],
    [18, 59, 1], [-3, 40, 1], [23, 37, 1],
    [3, 6, 2], [31, 30, 2], [28, -26, 2], [36, -1, 1], [3, 36, 1],
    [77, 28, 3], [72, 19, 3], [88, 22, 2], [121, 31, 3], [114, 22, 2],
    [139, 35, 3], [126, 37, 2], [100, 13, 2], [106, -6, 2], [151, -33, 2],
    [145, -37, 1], [55, 25, 2], [67, 24, 1], [44, 33, 1], [30, 59, 1]
  ];

  var VOLCANOES = [
    [-122, 46], [-98, 19], [-78, -1], [-68, -16],
    [-19, 64], [14, 41], [37, 3], [138, 35], [121, 15], [-155, 19]
  ];

  var REGIONS = [
    {
      id: "plains",
      name: "Texas and the Great Plains",
      blurb: "A wide grassland with a river, low hills to the west, and a corner of the Gulf.",
      lon: -104, lat: 37, lon2: -93, lat2: 26,
      latBand: [37, 26], dryMul: 0.92, wetSouth: 0.15,
      lesson: "The Great Plains are a physical region: flat land and a grassland climate. A city pattern on that land is a human region."
    },
    {
      id: "amazon",
      name: "The Amazon",
      blurb: "Hot, wet forest and a huge river. The Andes rise on the west edge.",
      lon: -78, lat: 4, lon2: -50, lat2: -12,
      latBand: [4, -12], dryMul: 1.55, wetSouth: 0,
      lesson: "The Amazon is a physical region of rainforest and a big river. People change it when they clear trees."
    },
    {
      id: "sahel",
      name: "The Sahel",
      blurb: "The dry edge of the Sahara. A little more rain falls toward the south.",
      lon: -8, lat: 18, lon2: 28, lat2: 10,
      latBand: [18, 10], dryMul: 0.46, wetSouth: 1.15,
      lesson: "The Sahel is a physical region between desert and grassland. Latitude and rain decide which side can grow food."
    },
    {
      id: "arctic",
      name: "The Arctic coast",
      blurb: "Tundra and ice, with a short coast. Cold is the climate, not one storm.",
      lon: -152, lat: 72, lon2: -120, lat2: 64,
      latBand: [72, 64], dryMul: 0.75, wetSouth: 0.2,
      lesson: "This Arctic coast is a physical region: tundra, ice, and a cold climate. People adapt with warm clothes and by choosing where to settle."
    }
  ];

  var BIOME = {
    ocean: 0, ice: 1, tundra: 2, forest: 3, rainforest: 4,
    grassland: 5, desert: 6, mountain: 7, snow: 8, wetland: 9, savanna: 10
  };

  var fieldCache = {};

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function hash2(x, y) {
    var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function noise(x, y) {
    var x0 = Math.floor(x);
    var y0 = Math.floor(y);
    var fx = x - x0;
    var fy = y - y0;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    function h(ix, iy) { return hash2(ix, iy); }
    var a = h(x0, y0);
    var b = h(x0 + 1, y0);
    var c = h(x0, y0 + 1);
    var d = h(x0 + 1, y0 + 1);
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
  }

  function fbm(x, y) {
    return noise(x, y) * 0.6 + noise(x * 2.1 + 4, y * 2.1) * 0.3 + noise(x * 4.2 + 9, y * 4.2) * 0.1;
  }

  function blob(lon, lat, b) {
    var dx = lon - b[0];
    if (dx > 180) dx -= 360;
    if (dx < -180) dx += 360;
    var nx = dx / b[2];
    var ny = (lat - b[1]) / b[3];
    return nx * nx + ny * ny;
  }

  function isLand(lon, lat) {
    if (lat < -67) return true;
    var wobble = (noise(lon * 0.11 + 2, lat * 0.13) - 0.5) * 0.28;
    var best = 99;
    var cut = false;
    for (var i = 0; i < BLOBS.length; i++) {
      var s = blob(lon, lat, BLOBS[i]);
      if (BLOBS[i][4] < 0) {
        if (s < 1) cut = true;
      } else if (s < best) best = s;
    }
    if (cut && lat > -60) return false;
    return best <= 1 + wobble;
  }

  function distToPoly(lon, lat, pts) {
    var best = 999;
    for (var i = 0; i < pts.length - 1; i++) {
      var ax = pts[i][0];
      var ay = pts[i][1];
      var bx = pts[i + 1][0];
      var by = pts[i + 1][1];
      var dx = bx - ax;
      var dy = by - ay;
      var t = ((lon - ax) * dx + (lat - ay) * dy) / (dx * dx + dy * dy + 0.0001);
      t = clamp(t, 0, 1);
      var px = ax + dx * t;
      var py = ay + dy * t;
      var d = Math.hypot(lon - px, lat - py);
      if (d < best) best = d;
    }
    return best;
  }

  function ridgeHeight(lon, lat) {
    var h = 0;
    for (var i = 0; i < RIDGES.length; i++) {
      var ridge = RIDGES[i];
      var d = distToPoly(lon, lat, ridge.pts);
      if (d < ridge.half) h = Math.max(h, ridge.h * (1 - d / ridge.half));
    }
    return h;
  }

  function nearRiver(lon, lat) {
    for (var i = 0; i < RIVERS.length; i++) {
      if (distToPoly(lon, lat, RIVERS[i].pts) < RIVERS[i].w) return true;
    }
    return false;
  }

  function lonLatOf(x, y) {
    var lon = (x / CW) * 360 - 180;
    var lat = 90 - (y / CH) * 180;
    return [lon, lat];
  }

  function buildCoarse() {
    var land = new Uint8Array(CW * CH);
    var elev = new Uint8Array(CW * CH);
    var biome = new Uint8Array(CW * CH);
    for (var y = 0; y < CH; y++) {
      for (var x = 0; x < CW; x++) {
        var ll = lonLatOf(x, y);
        var lon = ll[0];
        var lat = ll[1];
        var i = y * CW + x;
        var on = isLand(lon, lat);
        land[i] = on ? 1 : 0;
        var rh = ridgeHeight(lon, lat);
        var e = 0;
        if (on) {
          e = 78 + rh * 160;
          if (nearRiver(lon, lat)) e = Math.min(e, 62);
          var n = (fbm(lon * 0.08, lat * 0.08) - 0.5) * 18;
          e = clamp(e + n, 46, 250);
        }
        elev[i] = e;
      }
    }
    for (var y2 = 0; y2 < CH; y2++) {
      for (var x2 = 0; x2 < CW; x2++) {
        var i2 = y2 * CW + x2;
        if (land[i2]) continue;
        var shore = false;
        for (var dy = -2; dy <= 2 && !shore; dy++) {
          var yy = y2 + dy;
          if (yy < 0 || yy >= CH) continue;
          for (var dx = -2; dx <= 2; dx++) {
            var xx = (x2 + dx + CW) % CW;
            if (land[yy * CW + xx]) { shore = true; break; }
          }
        }
        elev[i2] = shore ? 24 : 0;
      }
    }
    for (var y3 = 0; y3 < CH; y3++) {
      for (var x3 = 0; x3 < CW; x3++) {
        var ll3 = lonLatOf(x3, y3);
        biome[y3 * CW + x3] = classify(ll3[0], ll3[1], elev[y3 * CW + x3], land[y3 * CW + x3]);
      }
    }
    return { land: land, elev: elev, biome: biome };
  }

  function classify(lon, lat, elev, landOn) {
    if (!landOn || elev < 40) return BIOME.ocean;
    var abs = Math.abs(lat);
    if (lat < -62 || abs > 74) return BIOME.ice;
    if (elev > 188) return abs > 48 ? BIOME.snow : BIOME.mountain;
    if (elev > 150) return BIOME.mountain;
    if (nearRiver(lon, lat) && abs < 50) return BIOME.wetland;
    if (abs > 60) return BIOME.tundra;
    var sahara = lat > 14 && lat < 32 && lon > -16 && lon < 38;
    var arabia = lat > 14 && lat < 32 && lon > 36 && lon < 58;
    var aus = lat < -20 && lat > -32 && lon > 124 && lon < 142 && elev < 145;
    var gobi = lat > 38 && lat < 48 && lon > 90 && lon < 112 && elev < 160;
    var atacama = lat < -18 && lat > -30 && lon > -74 && lon < -68;
    var plains = lon < -94 && lon > -105 && lat > 29 && lat < 48;
    if (plains && elev < 155) return BIOME.grassland;
    if ((sahara || arabia || aus || gobi || atacama) && elev < 160) return BIOME.desert;
    var amazon = lat < 6 && lat > -14 && lon > -78 && lon < -48;
    var congo = lat < 6 && lat > -8 && lon > 8 && lon < 30;
    var seasia = lat < 18 && lat > -8 && lon > 95 && lon < 140;
    if ((amazon || congo || seasia) && elev < 150) return BIOME.rainforest;
    if (abs < 14) return BIOME.savanna;
    if (abs < 32 && elev < 120) return BIOME.grassland;
    if (abs >= 32 && abs < 58) {
      var westCoastDry = lon < -115 && lat > 30 && lat < 42;
      if (westCoastDry && elev < 140) return BIOME.grassland;
      return BIOME.forest;
    }
    return BIOME.grassland;
  }

  function getField(w, h) {
    var key = w + "x" + h;
    if (fieldCache[key]) return fieldCache[key];
    var coarse = buildCoarse();
    var elev = new Uint8Array(w * h);
    var biome = new Uint8Array(w * h);
    var shade = new Int8Array(w * h);
    for (var y = 0; y < h; y++) {
      var v = (y + 0.5) / h;
      var cy = v * (CH - 1);
      var y0 = Math.floor(cy);
      var fy = cy - y0;
      var y1 = Math.min(CH - 1, y0 + 1);
      for (var x = 0; x < w; x++) {
        var u = (x + 0.5) / w;
        var cx = u * CW;
        var x0 = Math.floor(cx) % CW;
        var fx = cx - Math.floor(cx);
        var x1 = (x0 + 1) % CW;
        var e00 = coarse.elev[y0 * CW + x0];
        var e10 = coarse.elev[y0 * CW + x1];
        var e01 = coarse.elev[y1 * CW + x0];
        var e11 = coarse.elev[y1 * CW + x1];
        var e = (e00 * (1 - fx) + e10 * fx) * (1 - fy) + (e01 * (1 - fx) + e11 * fx) * fy;
        elev[y * w + x] = clamp(e, 0, 255);
        var src = fy < 0.5 ? (fx < 0.5 ? y0 * CW + x0 : y0 * CW + x1) : (fx < 0.5 ? y1 * CW + x0 : y1 * CW + x1);
        biome[y * w + x] = coarse.biome[src];
      }
    }
    for (var y2 = 0; y2 < h; y2++) {
      for (var x2 = 0; x2 < w; x2++) {
        var i = y2 * w + x2;
        var left = elev[y2 * w + ((x2 + w - 1) % w)];
        var up = elev[(y2 > 0 ? y2 - 1 : 0) * w + x2];
        var s = (elev[i] - left) * 1.15 + (elev[i] - up) * 0.85;
        shade[i] = clamp(s, -48, 48);
      }
    }
    var built = { elev: elev, biome: biome, shade: shade, w: w, h: h };
    fieldCache[key] = built;
    return built;
  }

  var PAL = [
    [10, 52, 122],
    [226, 236, 242],
    [168, 178, 166],
    [26, 104, 52],
    [14, 86, 44],
    [126, 158, 64],
    [214, 176, 102],
    [132, 122, 110],
    [236, 240, 244],
    [36, 118, 108],
    [186, 164, 70]
  ];

  function paintMaps(w, h, opt) {
    opt = opt || {};
    var field = getField(w, h);
    var thresh = opt.thresh != null ? opt.thresh : 36;
    var heat = opt.heat || 0;
    var iceLine = 64 + heat * 18;
    var day = new Uint8ClampedArray(w * h * 4);
    var night = new Uint8ClampedArray(w * h * 4);
    for (var y = 0; y < h; y++) {
      var lat = 90 - ((y + 0.5) / h) * 180;
      var abs = Math.abs(lat);
      for (var x = 0; x < w; x++) {
        var i = y * w + x;
        var e = field.elev[i];
        var water = e < thresh;
        var b = water ? BIOME.ocean : field.biome[i];
        if (abs > iceLine + (water ? 10 : 0) - heat * 4) b = BIOME.ice;
        else if (!water && abs > iceLine - 6) b = BIOME.tundra;
        if (water && b === BIOME.ice) water = false;
        if (!water && e > 200 && abs > 40 && heat < 0.65) b = BIOME.snow;
        if (!water && lat < -60 && heat < 0.8) b = BIOME.ice;
        var col = PAL[b] || PAL[5];
        var lon = ((x + 0.5) / w) * 360 - 180;
        var n = (fbm(lon * 0.12 + 3, lat * 0.12) - 0.5);
        var r = col[0] + n * 22 + (water ? 0 : field.shade[i]);
        var g = col[1] + n * 18 + (water ? 0 : field.shade[i] * 0.9);
        var bl = col[2] + n * 12 + (water ? 0 : field.shade[i] * 0.55);
        if (water) {
          var depth = e < 8 ? 0.72 : 1;
          r = 12 * depth + (e / 40) * 18;
          g = 48 * depth + (e / 40) * 50;
          bl = 118 * depth + 30;
          r += n * 8;
          g += n * 8;
          bl += n * 6;
        }
        var p = i * 4;
        day[p] = clamp(r, 0, 255);
        day[p + 1] = clamp(g, 0, 255);
        day[p + 2] = clamp(bl, 0, 255);
        day[p + 3] = 255;
        var nr = water ? 4 : 8;
        var ng = water ? 10 : 12;
        var nb = water ? 22 : 26;
        night[p] = nr;
        night[p + 1] = ng;
        night[p + 2] = nb;
        night[p + 3] = 255;
      }
    }
    stampLights(night, w, h, opt.cities || CITIES);
    stampVolcanoes(day, night, w, h, opt.core || 0);
    if (opt.focus) stampFocus(day, w, h, opt.focus);
    return { day: day, night: night, w: w, h: h };
  }

  function stampLights(night, w, h, cities) {
    for (var i = 0; i < cities.length; i++) {
      var c = cities[i];
      var x = ((c[0] + 180) / 360) * w;
      var y = ((90 - c[1]) / 180) * h;
      var rad = (c[2] || 1) * (w / 1024) * 11 + 7;
      blot(night, w, h, x, y, rad, [255, 228, 150], true);
    }
  }

  function stampVolcanoes(day, night, w, h, core) {
    var rad = (4 + Math.max(0, core) * 11) * (w / 1024);
    for (var i = 0; i < VOLCANOES.length; i++) {
      var v = VOLCANOES[i];
      var x = ((v[0] + 180) / 360) * w;
      var y = ((90 - v[1]) / 180) * h;
      blot(day, w, h, x, y, rad, [255, 86, 28], false);
      blot(night, w, h, x, y, rad * 0.7, [255, 70, 24], false);
    }
  }

  function stampFocus(day, w, h, box) {
    var x0 = ((box.lon + 180) / 360) * w;
    var x1 = ((box.lon2 + 180) / 360) * w;
    var y0 = ((90 - box.lat) / 180) * h;
    var y1 = ((90 - box.lat2) / 180) * h;
    var left = Math.min(x0, x1);
    var right = Math.max(x0, x1);
    var top = Math.min(y0, y1);
    var bot = Math.max(y0, y1);
    outline(day, w, h, left, top, right, bot);
  }

  function outline(data, w, h, x0, y0, x1, y1) {
    function pix(x, y) {
      x = ((x % w) + w) % w;
      y = clamp(y, 0, h - 1) | 0;
      var p = (y * w + (x | 0)) * 4;
      data[p] = 255;
      data[p + 1] = 214;
      data[p + 2] = 120;
    }
    var xA = x0 | 0;
    var xB = x1 | 0;
    var yA = y0 | 0;
    var yB = y1 | 0;
    for (var x = xA; x <= xB; x++) { pix(x, yA); pix(x, yB); }
    for (var y = yA; y <= yB; y++) { pix(xA, y); pix(xB, y); }
  }

  function blot(data, w, h, x, y, rad, col, add) {
    var x0 = Math.floor(x - rad);
    var x1 = Math.ceil(x + rad);
    var y0 = Math.max(0, Math.floor(y - rad));
    var y1 = Math.min(h - 1, Math.ceil(y + rad));
    for (var yy = y0; yy <= y1; yy++) {
      for (var xx = x0; xx <= x1; xx++) {
        var dx = xx - x;
        var dy = yy - y;
        var d = Math.sqrt(dx * dx + dy * dy) / rad;
        if (d >= 1) continue;
        var k = Math.pow(1 - d, 1.6);
        var px = ((xx % w) + w) % w;
        var p = (yy * w + px) * 4;
        if (add) {
          data[p] = clamp(data[p] + col[0] * k, 0, 255);
          data[p + 1] = clamp(data[p + 1] + col[1] * k, 0, 255);
          data[p + 2] = clamp(data[p + 2] + col[2] * k * 0.7, 0, 255);
        } else {
          data[p] = clamp(data[p] * (1 - k) + col[0] * k, 0, 255);
          data[p + 1] = clamp(data[p + 1] * (1 - k) + col[1] * k, 0, 255);
          data[p + 2] = clamp(data[p + 2] * (1 - k) + col[2] * k, 0, 255);
        }
      }
    }
  }

  function regionById(id) {
    for (var i = 0; i < REGIONS.length; i++) if (REGIONS[i].id === id) return REGIONS[i];
    return REGIONS[0];
  }

  function cellProps(e, sea, lake, moist, coal, ore) {
    return {
      e: sea ? 0 : e, sea: !!sea, lake: !!lake, moist: moist,
      coal: coal || 0, ore: ore || 0, soil: sea ? 40 : 78
    };
  }

  function board(id) {
    var spec = regionById(id);
    var cells = [];
    var r;
    var c;
    if (spec.id === "amazon") {
      for (r = 0; r < 12; r++) {
        for (c = 0; c < 16; c++) {
          var andes = c < 2 ? 1.7 : 0;
          var onRiver = Math.abs(r - 6) === 0;
          var e = (onRiver ? 1.4 : 2.25) + andes;
          var lake = r === 6 && (c === 4 || c === 8 || c === 12);
          cells.push(cellProps(e, false, lake, lake || r === 6 ? 88 : 74, 0, c === 1 && r === 3 ? 16 : 0));
        }
      }
    } else if (spec.id === "sahel") {
      for (r = 0; r < 12; r++) {
        for (c = 0; c < 16; c++) {
          var lakeS = r >= 8 && c === 7;
          var e = 1.7 - r * 0.03;
          cells.push(cellProps(e, false, lakeS, 28 + r * 4, 0, c === 12 && r === 4 ? 14 : 0));
        }
      }
    } else if (spec.id === "arctic") {
      for (r = 0; r < 12; r++) {
        for (c = 0; c < 16; c++) {
          var sea = r >= 10 && c >= 12;
          var e = sea ? 0 : (r < 3 ? 2.6 : 1.55);
          cells.push(cellProps(e, sea, false, r < 3 ? 36 : 48, c === 4 && r === 6 ? 18 : 0, 0));
          if (!sea && r === 0) cells[cells.length - 1].lf = "glacier";
        }
      }
    } else {
      for (r = 0; r < 12; r++) {
        for (c = 0; c < 16; c++) {
          var seaP = r === 11 && c >= 14;
          var hills = Math.max(0, 5 - c) * 0.32;
          var channel = Math.abs(c - 7) === 0 ? -0.25 : 0;
          var eP = 1.7 + hills + channel;
          if (!seaP && r >= 10 && c >= 12) eP = 0.95;
          var lakeP = c === 7 && (r === 3 || r === 7);
          cells.push(cellProps(eP, seaP, lakeP, lakeP ? 80 : 58, (c === 10 && r === 8) || (c === 11 && r === 8) ? 28 : 0, c === 2 && r === 4 ? 16 : 0));
        }
      }
    }
    return {
      id: spec.id,
      spec: spec,
      cells: cells,
      nations: nationsFor(spec.id),
      life: lifeFor(spec.id),
      uses: usesFor(spec.id)
    };
  }

  function nationsFor(id) {
    if (id === "amazon") {
      return [
        nation("n1", "Riverfolk", "elders", "#1f6a4a", "#e2b340", "circle", 8, 6, 70, "a village region along the river"),
        nation("n2", "Canopy", "council", "#245c38", "#f0e2b6", "stripes", 12, 3, 48, "a forest region under the tall trees")
      ];
    }
    if (id === "sahel") {
      return [
        nation("n1", "Northwell", "elders", "#a1622f", "#f4efe4", "bend", 6, 2, 46, "a dry-edge region"),
        nation("n2", "Greenedge", "council", "#1f6a4a", "#e2b340", "stripes", 8, 9, 64, "a wetter southern region")
      ];
    }
    if (id === "arctic") {
      return [
        nation("n1", "Icehome", "elders", "#245c78", "#d7e4ea", "circle", 6, 4, 36, "a tundra region"),
        nation("n2", "Coastcamp", "council", "#1f4d68", "#f0e2b6", "bend", 8, 8, 42, "a coastal region")
      ];
    }
    return [
      nation("n1", "Prairie League", "council", "#1f6a4a", "#e2b340", "stripes", 6, 4, 84, "a rural plains region"),
      nation("n2", "Baytown", "republic", "#1f4d68", "#f4efe4", "bend", 12, 9, 76, "a settlement nearer the Gulf coast")
    ];
  }

  function nation(id, name, gov, a, b, layout, c, r, people, pattern) {
    return {
      id: id, name: name, gov: gov,
      flag: { layout: layout, a: a, b: b },
      capital: { c: c, r: r },
      people: people, food: 30, goods: 12, unrest: 4,
      pattern: pattern
    };
  }

  function lifeFor(id) {
    if (id === "amazon") return [{ c: 8, r: 4, id: "oak" }, { c: 10, r: 7, id: "cattail" }, { c: 5, r: 6, id: "bass" }, { c: 11, r: 3, id: "wolf" }, { c: 9, r: 5, id: "fungus" }];
    if (id === "sahel") return [{ c: 6, r: 2, id: "cactus" }, { c: 8, r: 9, id: "grass" }, { c: 10, r: 8, id: "jackrabbit" }, { c: 7, r: 10, id: "bison" }];
    if (id === "arctic") return [{ c: 5, r: 2, id: "lichen" }, { c: 7, r: 1, id: "polar" }, { c: 4, r: 3, id: "goat" }, { c: 8, r: 7, id: "wolf" }];
    return [{ c: 5, r: 5, id: "grass" }, { c: 8, r: 6, id: "bison" }, { c: 4, r: 4, id: "wolf" }, { c: 11, r: 8, id: "oak" }, { c: 7, r: 7, id: "bass" }];
  }

  function usesFor(id) {
    if (id === "amazon") return [{ c: 8, r: 6, use: "town" }, { c: 12, r: 3, use: "town" }, { c: 9, r: 8, use: "farm" }];
    if (id === "sahel") return [{ c: 6, r: 2, use: "town" }, { c: 8, r: 9, use: "town" }, { c: 9, r: 9, use: "farm" }];
    if (id === "arctic") return [{ c: 6, r: 4, use: "town" }, { c: 8, r: 8, use: "town" }, { c: 9, r: 8, use: "farm" }];
    return [{ c: 6, r: 4, use: "town" }, { c: 12, r: 9, use: "town" }, { c: 5, r: 6, use: "farm" }, { c: 8, r: 5, use: "farm" }, { c: 13, r: 6, use: "forest" }];
  }

  root.WorldEarth = {
    REGIONS: REGIONS,
    CITIES: CITIES,
    BIOME: BIOME,
    regionById: regionById,
    board: board,
    paintMaps: paintMaps,
    isLand: isLand
  };
})(typeof window !== "undefined" ? window : globalThis);
