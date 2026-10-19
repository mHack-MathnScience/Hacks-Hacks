/* Painter for the planet map. Reads sim state. Does not change it. */
(function () {
  "use strict";
  var canvas = null;
  var getter = null;
  var off = null;
  var offKey = "";
  var particles = [];
  var shake = 0;
  var metrics = null;
  var reduce = false;

  function start(el, getState) {
    canvas = el;
    getter = getState;
    off = document.createElement("canvas");
    reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(frame);
  }

  function poke() { offKey = ""; }
  function shakeScreen() { if (!reduce) shake = 10; }
  function burst(c, r, color) {
    if (!metrics) return;
    var p = center(c, r);
    for (var i = 0; i < 14; i++) {
      var a = Math.random() * Math.PI * 2;
      var s = 0.6 + Math.random() * 2.2;
      particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.4, life: 1, color: color || "#f2b705" });
    }
  }

  function frame(ts) {
    requestAnimationFrame(frame);
    if (!canvas || !getter) return;
    var pack = getter();
    if (!pack || !pack.state) return;
    var m = measure();
    if (!m) return;
    var ctx = canvas.getContext("2d");
    ctx.setTransform(m.dpr, 0, 0, m.dpr, 0, 0);
    var jx = 0, jy = 0;
    if (shake > 0) {
      jx = (Math.random() - 0.5) * shake;
      jy = (Math.random() - 0.5) * shake;
      shake *= 0.82;
      if (shake < 0.4) shake = 0;
    }
    ctx.clearRect(0, 0, m.w, m.h);
    ctx.save();
    ctx.translate(jx, jy);
    ensureTerrain(pack, m);
    ctx.drawImage(off, 0, 0, m.w, m.h);
    var time = reduce ? 0 : ts / 1000;
    drawWater(ctx, pack, m, time);
    drawRivers(ctx, pack, m, time);
    drawFeatures(ctx, pack, m, time);
    drawHerds(ctx, pack, m, time);
    drawSky(ctx, pack, m, time);
    drawLight(ctx, pack, m);
    drawParticles(ctx);
    if (pack.selected) drawSelect(ctx, pack.selected.c, pack.selected.r, m);
    ctx.restore();
  }

  function measure() {
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(280, rect.width);
    var h = Math.max(240, rect.height);
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      offKey = "";
    }
    var cols = 16, rows = 12;
    var padL = 26, padT = 18, padR = 10, padB = 10;
    var cell = Math.min((w - padL - padR) / cols, (h - padT - padB) / rows);
    var ox = padL + ((w - padL - padR) - cell * cols) / 2;
    var oy = padT + ((h - padT - padB) - cell * rows) / 2;
    metrics = { w: w, h: h, dpr: dpr, cell: cell, ox: ox, oy: oy, cols: cols, rows: rows };
    return metrics;
  }

  function center(c, r) {
    var m = metrics;
    return { x: m.ox + (c + 0.5) * m.cell, y: m.oy + (r + 0.5) * m.cell };
  }
  function cellAt(clientX, clientY) {
    if (!metrics || !canvas) return null;
    var rect = canvas.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top;
    var c = Math.floor((x - metrics.ox) / metrics.cell);
    var r = Math.floor((y - metrics.oy) / metrics.cell);
    if (c < 0 || r < 0 || c >= 16 || r >= 12) return null;
    return { c: c, r: r };
  }

  function keyOf(pack) {
    var s = pack.state;
    var bits = [s.year, s.sun, pack.view, s.co2.toFixed(1)];
    for (var i = 0; i < s.cells.length; i += 3) {
      var c = s.cells[i];
      bits.push(s.view.biome[i][0], Math.round(c.e * 2), c.use[0], c.dam ? 1 : 0, c.road ? 1 : 0, c.lf ? c.lf[0] : "", c.life.length, c.coal > 0 ? 1 : 0);
    }
    return bits.join(",");
  }

  function ensureTerrain(pack, m) {
    var key = keyOf(pack) + ":" + Math.round(m.w) + "x" + Math.round(m.h);
    if (key === offKey) return;
    offKey = key;
    off.width = canvas.width;
    off.height = canvas.height;
    var ctx = off.getContext("2d");
    ctx.setTransform(m.dpr, 0, 0, m.dpr, 0, 0);
    var sky = ctx.createLinearGradient(0, 0, 0, m.h);
    sky.addColorStop(0, "#8fd4ef");
    sky.addColorStop(1, "#d7f0c8");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, m.w, m.h);
    drawGround(ctx, pack, m);
    drawBorders(ctx, pack, m);
  }

  var BIOME = {
    aquatic: ["#1a7fa3", "#3ec0d8"],
    wetland: ["#3f8f55", "#7fb56a"],
    forest: ["#1d6a34", "#3e9a48"],
    grassland: ["#c6b23a", "#e4d36a"],
    desert: ["#e4c07a", "#f0d7a4"],
    tundra: ["#c5ddd8", "#e7f3f1"],
    mountain: ["#8d8478", "#c5bfb4"]
  };

  function drawGround(ctx, pack, m) {
    var s = pack.state;
    var w = Math.max(16, Math.ceil(m.cell * 16));
    var h = Math.max(12, Math.ceil(m.cell * 12));
    var plate = document.createElement("canvas");
    plate.width = w;
    plate.height = h;
    var g = plate.getContext("2d");
    var img = g.createImageData(w, h);
    var data = img.data;
    var cols = new Array(192);
    var elev = new Array(192);
    for (var i = 0; i < 192; i++) {
      var biome = s.view.biome[i];
      var pair = BIOME[biome] || BIOME.grassland;
      cols[i] = hex(s.cells[i].sea ? "#14698a" : pair[0]);
      if (s.cells[i].lake) cols[i] = hex("#1f8fb8");
      elev[i] = s.cells[i].e;
    }
    for (var y = 0; y < h; y++) {
      var fy = y / m.cell;
      var r0 = Math.max(0, Math.min(11, fy | 0));
      var fyf = fy - r0;
      for (var x = 0; x < w; x++) {
        var fx = x / m.cell;
        var c0 = Math.max(0, Math.min(15, fx | 0));
        var fxf = fx - c0;
        var i0 = r0 * 16 + c0;
        var col = cols[i0];
        var iL = r0 * 16 + Math.max(0, c0 - 1);
        var iU = Math.max(0, r0 - 1) * 16 + c0;
        var shade = (elev[i0] - elev[iL]) * 26 + (elev[i0] - elev[iU]) * 16;
        if (fxf > 0.55 && c0 < 15) {
          var t = (fxf - 0.55) / 0.9;
          var o = cols[i0 + 1];
          col = [col[0] * (1 - t) + o[0] * t, col[1] * (1 - t) + o[1] * t, col[2] * (1 - t) + o[2] * t];
        }
        if (fyf > 0.55 && r0 < 11) {
          var u = (fyf - 0.55) / 0.9;
          var q = cols[i0 + 16];
          col = [col[0] * (1 - u) + q[0] * u, col[1] * (1 - u) + q[1] * u, col[2] * (1 - u) + q[2] * u];
        }
        var n = (hash(x, y, 2) - 0.5) * 26;
        var p = (y * w + x) * 4;
        data[p] = clampByte(col[0] + shade + n);
        data[p + 1] = clampByte(col[1] + shade + n * 0.9);
        data[p + 2] = clampByte(col[2] + shade + n * 0.7);
        data[p + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    ctx.drawImage(plate, m.ox, m.oy, m.cell * 16, m.cell * 12);
    var showRes = pack.tool === "mine";
    for (var r = 0; r < 12; r++) {
      for (var c = 0; c < 16; c++) {
        var idx = r * 16 + c;
        var cell = s.cells[idx];
        var x = m.ox + c * m.cell;
        var y0 = m.oy + r * m.cell;
        var biome = s.view.biome[idx];
        if (biome === "forest") drawTree(ctx, x + m.cell * 0.35, y0 + m.cell * 0.72, m.cell * 0.28);
        if (biome === "forest" && hash(c, r, 4) > 0.4) drawTree(ctx, x + m.cell * 0.68, y0 + m.cell * 0.6, m.cell * 0.22);
        if (biome === "mountain" && (cell.e >= 3.6 || s.view.climT[idx] < 1)) {
          ctx.fillStyle = "rgba(255,255,255,0.72)";
          ctx.beginPath();
          ctx.moveTo(x + m.cell * 0.22, y0 + m.cell * 0.7);
          ctx.lineTo(x + m.cell * 0.5, y0 + m.cell * 0.16);
          ctx.lineTo(x + m.cell * 0.8, y0 + m.cell * 0.7);
          ctx.fill();
        }
        if (biome === "desert") {
          ctx.fillStyle = "rgba(214,176,96,0.45)";
          ctx.beginPath();
          ctx.ellipse(x + m.cell * 0.5, y0 + m.cell * 0.62, m.cell * 0.28, m.cell * 0.1, 0, Math.PI, 0);
          ctx.fill();
        }
        if (pack.view === "climate" || pack.view === "weather") {
          var rain = pack.view === "weather" ? s.view.rain[idx] : s.view.climR[idx];
          ctx.fillStyle = rainTint(rain);
          ctx.fillRect(x, y0, m.cell + 0.5, m.cell + 0.5);
        }
        if (showRes && (cell.coal > 0 || cell.ore > 0)) {
          ctx.fillStyle = cell.coal > 0 ? "#f2b705" : "#e07a3d";
          ctx.beginPath();
          ctx.arc(x + m.cell * 0.75, y0 + m.cell * 0.25, m.cell * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  function drawBorders(ctx, pack, m) {
    var s = pack.state;
    ctx.lineWidth = 3;
    for (var i = 0; i < s.cells.length; i++) {
      var owner = s.view.owner[i];
      if (!owner) continue;
      var p = { c: i % 16, r: (i / 16) | 0 };
      var nation = null;
      for (var n = 0; n < s.nations.length; n++) if (s.nations[n].id === owner) nation = s.nations[n];
      if (!nation) continue;
      var x = m.ox + p.c * m.cell;
      var y = m.oy + p.r * m.cell;
      ctx.strokeStyle = nation.flag.a;
      var dirs = [[1, 0, m.cell, 0, m.cell, m.cell], [-1, 0, 0, 0, 0, m.cell], [0, 1, 0, m.cell, m.cell, m.cell], [0, -1, 0, 0, m.cell, 0]];
      for (var d = 0; d < dirs.length; d++) {
        var nc = p.c + dirs[d][0], nr = p.r + dirs[d][1];
        var ni = nr * 16 + nc;
        var other = (nc < 0 || nr < 0 || nc > 15 || nr > 11) ? "" : s.view.owner[ni];
        if (other !== owner) {
          ctx.beginPath();
          ctx.moveTo(x + dirs[d][2], y + dirs[d][3]);
          ctx.lineTo(x + dirs[d][4], y + dirs[d][5]);
          ctx.stroke();
        }
      }
    }
  }

  function drawWater(ctx, pack, m, time) {
    var s = pack.state;
    for (var i = 0; i < s.cells.length; i++) {
      var cell = s.cells[i];
      if (!cell.sea && !cell.lake) continue;
      var c = i % 16, r = (i / 16) | 0;
      var x = m.ox + c * m.cell, y = m.oy + r * m.cell;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, m.cell, m.cell);
      ctx.clip();
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1.5;
      for (var w = 0; w < 3; w++) {
        ctx.beginPath();
        var base = y + m.cell * (0.28 + w * 0.22);
        for (var k = 0; k <= 6; k++) {
          var px = x + (k / 6) * m.cell;
          var py = base + Math.sin(time * 2.2 + c * 0.7 + k + w) * (m.cell * 0.06);
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawRivers(ctx, pack, m, time) {
    var s = pack.state;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1d6f9a";
    ctx.lineWidth = Math.max(3, m.cell * 0.18);
    for (var i = 0; i < s.cells.length; i++) {
      if (!s.view.river[i]) continue;
      var c = i % 16, r = (i / 16) | 0;
      var down = s.view.down[i];
      var x = m.ox + (c + 0.5) * m.cell;
      var y = m.oy + (r + 0.5) * m.cell;
      var tx = x, ty = y + m.cell * 0.46;
      if (down >= 0) {
        var dc = down % 16, dr = (down / 16) | 0;
        tx = m.ox + (dc + 0.5) * m.cell;
        ty = m.oy + (dr + 0.5) * m.cell;
      }
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.sin(time + r) * 2, (y + ty) / 2, tx, ty);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      var tpos = (time * 0.35 + i * 0.07) % 1;
      ctx.beginPath();
      ctx.arc(x + (tx - x) * tpos, y + (ty - y) * tpos, Math.max(1.5, m.cell * 0.06), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFeatures(ctx, pack, m, time) {
    var s = pack.state;
    for (var i = 0; i < s.cells.length; i++) {
      var cell = s.cells[i];
      var c = i % 16, r = (i / 16) | 0;
      var x = m.ox + c * m.cell, y = m.oy + r * m.cell;
      if (cell.road) {
        ctx.strokeStyle = "#c4a36a";
        ctx.lineWidth = Math.max(2, m.cell * 0.12);
        ctx.beginPath();
        ctx.moveTo(x, y + m.cell * 0.62);
        ctx.lineTo(x + m.cell, y + m.cell * 0.62);
        ctx.stroke();
      }
      if (cell.dam) drawDam(ctx, x, y, m.cell);
      if (cell.use === "farm") drawFarm(ctx, x, y, m.cell);
      if (cell.use === "pasture") drawPasture(ctx, x, y, m.cell);
      if (cell.use === "forest") drawTree(ctx, x + m.cell * 0.5, y + m.cell * 0.72, m.cell * 0.42);
      if (cell.use === "mine") drawMine(ctx, x, y, m.cell, time);
      if (cell.use === "solar") drawSolar(ctx, x, y, m.cell);
      if (cell.use === "suburb") drawHouses(ctx, x, y, m.cell, 2, "#f4efe4");
      if (cell.lf === "delta") drawDelta(ctx, x, y, m.cell);
      if (cell.lf === "dune") drawDune(ctx, x, y, m.cell);
      if (cell.lf === "glacier") {
        ctx.fillStyle = "rgba(230,246,255,0.7)";
        ctx.fillRect(x + 2, y + 2, m.cell - 4, m.cell - 4);
      }
      cell.life.forEach(function (life, k) {
        drawLife(ctx, life.id, x + m.cell * (0.28 + k * 0.22), y + m.cell * 0.62, m.cell * 0.34, time + k);
      });
    }
    s.nations.forEach(function (n) {
      var cap = n.capital;
      if (!cap) return;
      var x = m.ox + cap.c * m.cell;
      var y = m.oy + cap.r * m.cell;
      var houses = 2 + Math.max(0, Math.min(4, Math.round(n.people / 45)));
      drawHouses(ctx, x, y, m.cell, houses, "#fff6e4");
      drawFlag(ctx, x + m.cell * 0.62, y + m.cell * 0.18, m.cell * 0.34, n.flag, time);
    });
  }

  function drawHerds(ctx, pack, m, time) {
    var s = pack.state;
    var count = Math.max(0, Math.min(16, Math.round(s.herb / 22)));
    var placed = 0;
    for (var i = 0; i < s.cells.length && placed < count; i++) {
      var b = s.view.biome[i];
      if (b !== "grassland" && b !== "forest") continue;
      if (hash(i % 16, (i / 16) | 0, 9) > 0.72) continue;
      var c = i % 16, r = (i / 16) | 0;
      var bob = Math.sin(time * 3 + i) * (m.cell * 0.04);
      drawLife(ctx, placed % 2 ? "jackrabbit" : "bison", m.ox + (c + 0.55) * m.cell, m.oy + (r + 0.7) * m.cell + bob, m.cell * 0.28, time);
      placed++;
    }
  }

  function drawSky(ctx, pack, m, time) {
    var s = pack.state;
    var wet = (s.weather && s.weather.rainMul) || 1;
    var cold = (s.weather && s.weather.tempAdd) || 0;
    var season = s.year % 4;
    var ridge = 0, ridgeE = -1;
    for (var c = 0; c < 16; c++) {
      var e = 0;
      for (var r = 0; r < 12; r++) e += s.cells[r * 16 + c].e;
      if (e > ridgeE) { ridgeE = e; ridge = c; }
    }
    for (var i = 0; i < 5; i++) {
      var speed = 18 + wet * 10;
      var cx = ((time * speed + i * 90) % (m.w + 140)) - 70;
      var cy = 18 + (i % 3) * 16;
      var rainHere = cx > m.ox + ridge * m.cell ? wet * 0.35 : wet;
      ctx.fillStyle = wet > 1.15 ? "rgba(80,100,120,0.35)" : "rgba(255,255,255,0.72)";
      roundCloud(ctx, cx, cy, 36 + (i % 3) * 8, 16);
      if (rainHere > 1.15 && !reduce) {
        ctx.strokeStyle = "rgba(80,140,180,0.45)";
        ctx.lineWidth = 1;
        for (var d = 0; d < 5; d++) {
          var rx = cx - 16 + d * 8;
          var fall = (time * 80 + d * 12) % 28;
          ctx.beginPath();
          ctx.moveTo(rx, cy + 12 + fall);
          ctx.lineTo(rx - 2, cy + 20 + fall);
          ctx.stroke();
        }
      }
      if ((cold < -1 || season === 3) && !reduce) {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        for (var sn = 0; sn < 4; sn++) {
          var sy = (time * 24 + sn * 18 + i * 7) % (m.h * 0.5);
          ctx.fillRect(cx - 20 + sn * 12, cy + sy, 2, 2);
        }
      }
    }
    if (season === 2) {
      ctx.fillStyle = "rgba(224,122,61,0.08)";
      ctx.fillRect(m.ox, m.oy, m.cell * 16, m.cell * 12);
    }
    if (season === 3) {
      ctx.fillStyle = "rgba(180,210,230,0.12)";
      ctx.fillRect(m.ox, m.oy, m.cell * 16, m.cell * 12);
    }
  }

  function drawLight(ctx, pack, m) {
    var sun = (pack.state.sun) || "noon";
    var night = sun === "night" ? 0.48 : sun === "dusk" ? 0.2 : sun === "dawn" ? 0.1 : 0;
    if (night) {
      ctx.fillStyle = "rgba(18,28,58," + night + ")";
      ctx.fillRect(0, 0, m.w, m.h);
    }
    if (sun === "dawn" || sun === "dusk") {
      ctx.fillStyle = sun === "dawn" ? "rgba(255,176,92,0.16)" : "rgba(232,120,70,0.18)";
      ctx.fillRect(0, 0, m.w, m.h);
    }
    var sx = m.w - 54, sy = 36;
    var g = ctx.createRadialGradient(sx, sy, 4, sx, sy, 28);
    g.addColorStop(0, "#fff4c2");
    g.addColorStop(1, "rgba(242,183,5,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2b705";
    ctx.beginPath();
    ctx.arc(sx, sy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(242,183,5,0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx - 8, sy + 10);
    var tx = m.ox + m.cell * 8;
    var ty = m.oy + m.cell * 11;
    ctx.quadraticCurveTo(sx - 40, m.h * 0.4, tx, ty);
    ctx.stroke();
  }

  function drawSelect(ctx, c, r, m) {
    var x = m.ox + c * m.cell, y = m.oy + r * m.cell;
    ctx.strokeStyle = "#e07a3d";
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1.5, y + 1.5, m.cell - 3, m.cell - 3);
  }

  function drawParticles(ctx) {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.02;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
      ctx.globalAlpha = 1;
    }
  }

  function drawDam(ctx, x, y, s) {
    ctx.fillStyle = "#5c5146";
    ctx.fillRect(x + s * 0.18, y + s * 0.42, s * 0.64, s * 0.18);
    ctx.fillStyle = "#8fd4ef";
    ctx.fillRect(x + s * 0.18, y + s * 0.28, s * 0.2, s * 0.16);
  }
  function drawFarm(ctx, x, y, s) {
    ctx.fillStyle = "#7d9a32";
    for (var i = 0; i < 4; i++) ctx.fillRect(x + s * 0.18, y + s * (0.28 + i * 0.14), s * 0.64, s * 0.06);
  }
  function drawPasture(ctx, x, y, s) {
    ctx.strokeStyle = "#8d5a2b";
    ctx.strokeRect(x + s * 0.2, y + s * 0.35, s * 0.6, s * 0.4);
  }
  function drawMine(ctx, x, y, s, time) {
    ctx.fillStyle = "#3a332c";
    ctx.beginPath();
    ctx.moveTo(x + s * 0.25, y + s * 0.7);
    ctx.lineTo(x + s * 0.5, y + s * 0.4);
    ctx.lineTo(x + s * 0.75, y + s * 0.7);
    ctx.fill();
    ctx.strokeStyle = "rgba(80,80,80,0.5)";
    ctx.beginPath();
    ctx.moveTo(x + s * 0.55, y + s * 0.42);
    ctx.quadraticCurveTo(x + s * 0.7, y + s * (0.2 + Math.sin(time * 2) * 0.04), x + s * 0.8, y + s * 0.15);
    ctx.stroke();
  }
  function drawSolar(ctx, x, y, s) {
    ctx.fillStyle = "#1f4d68";
    ctx.fillRect(x + s * 0.22, y + s * 0.4, s * 0.56, s * 0.28);
    ctx.fillStyle = "#7ec8e3";
    ctx.fillRect(x + s * 0.28, y + s * 0.46, s * 0.18, s * 0.16);
  }
  function drawHouses(ctx, x, y, s, n, wall) {
    for (var i = 0; i < n; i++) {
      var hx = x + s * (0.12 + (i % 3) * 0.22);
      var hy = y + s * (0.42 + (i > 2 ? 0.22 : 0));
      ctx.fillStyle = wall;
      ctx.fillRect(hx, hy, s * 0.18, s * 0.16);
      ctx.fillStyle = "#c4473a";
      ctx.beginPath();
      ctx.moveTo(hx - 1, hy);
      ctx.lineTo(hx + s * 0.09, hy - s * 0.1);
      ctx.lineTo(hx + s * 0.19, hy);
      ctx.fill();
    }
  }
  function drawTree(ctx, x, y, s) {
    ctx.fillStyle = "#6b3e22";
    ctx.fillRect(x - s * 0.08, y - s * 0.2, s * 0.16, s * 0.28);
    ctx.fillStyle = "#1f7a3a";
    ctx.beginPath();
    ctx.arc(x, y - s * 0.35, s * 0.32, 0, Math.PI * 2);
    ctx.fill();
  }
  function drawDelta(ctx, x, y, s) {
    ctx.fillStyle = "#d9b36a";
    ctx.beginPath();
    ctx.moveTo(x + s * 0.2, y + s * 0.3);
    ctx.lineTo(x + s * 0.8, y + s * 0.45);
    ctx.lineTo(x + s * 0.3, y + s * 0.8);
    ctx.fill();
  }
  function drawDune(ctx, x, y, s) {
    ctx.fillStyle = "rgba(214,176,96,0.9)";
    ctx.beginPath();
    ctx.ellipse(x + s * 0.5, y + s * 0.62, s * 0.32, s * 0.14, 0, Math.PI, 0);
    ctx.fill();
  }
  function drawFlag(ctx, x, y, s, flag, time) {
    var wave = Math.sin(time * 3) * 1.5;
    ctx.strokeStyle = "#1d3140";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + s);
    ctx.stroke();
    ctx.fillStyle = flag.a || "#1f6a4a";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + s * 0.9, y + s * 0.12 + wave);
    ctx.lineTo(x + s * 0.9, y + s * 0.48 + wave);
    ctx.lineTo(x, y + s * 0.4);
    ctx.fill();
    ctx.fillStyle = flag.b || "#f2b705";
    if (flag.layout === "circle") {
      ctx.beginPath();
      ctx.arc(x + s * 0.42, y + s * 0.26, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(x, y + s * 0.16, s * 0.7, s * 0.08);
    }
  }

  function drawLife(ctx, id, x, y, s, time) {
    ctx.save();
    ctx.translate(x, y);
    if (id === "oak" || id === "pine") drawTree(ctx, 0, 0, s);
    else if (id === "cactus") {
      ctx.fillStyle = "#2f8f4e";
      ctx.fillRect(-s * 0.12, -s * 0.7, s * 0.24, s * 0.7);
      ctx.fillRect(-s * 0.4, -s * 0.5, s * 0.28, s * 0.12);
    } else if (id === "grass" || id === "cattail") {
      ctx.strokeStyle = id === "cattail" ? "#6b4a1e" : "#3e7a28";
      ctx.lineWidth = 2;
      for (var i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 4, 0);
        ctx.quadraticCurveTo(i * 6, -s * 0.4, i * 3, -s * 0.7);
        ctx.stroke();
      }
    } else if (id === "kelp") {
      ctx.strokeStyle = "#1d6a34";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(Math.sin(time) * 6, -s * 0.4, 0, -s * 0.8);
      ctx.stroke();
    } else if (id === "jackrabbit" || id === "bison" || id === "goat") {
      ctx.fillStyle = id === "bison" ? "#6b4a32" : id === "goat" ? "#f4efe4" : "#c4a574";
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.2, s * 0.28, s * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.22, -s * 0.36, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === "wolf" || id === "polar") {
      ctx.fillStyle = id === "polar" ? "#f7f7f7" : "#6d7278";
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.22, s * 0.32, s * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.18, -s * 0.4);
      ctx.lineTo(s * 0.28, -s * 0.62);
      ctx.lineTo(s * 0.36, -s * 0.4);
      ctx.fill();
    } else if (id === "heron") {
      ctx.strokeStyle = "#4a6d8c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -s * 0.45);
      ctx.stroke();
      ctx.fillStyle = "#6e8eae";
      ctx.beginPath();
      ctx.ellipse(s * 0.08, -s * 0.55, s * 0.16, s * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === "bass") {
      ctx.fillStyle = "#2a6a48";
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.2, s * 0.28, s * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * 0.26, -s * 0.2);
      ctx.lineTo(-s * 0.42, -s * 0.32);
      ctx.lineTo(-s * 0.42, -s * 0.08);
      ctx.fill();
    } else if (id === "fungus") {
      ctx.fillStyle = "#c47a3a";
      ctx.beginPath();
      ctx.arc(0, -s * 0.2, s * 0.16, Math.PI, 0);
      ctx.fill();
    } else if (id === "dragon") {
      ctx.fillStyle = "#c4473a";
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.25, s * 0.3, s * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.32);
      ctx.lineTo(0, -s * 0.7 + Math.sin(time * 6) * 2);
      ctx.lineTo(s * 0.15, -s * 0.32);
      ctx.fill();
    } else if (id === "lichen") {
      ctx.fillStyle = "#d7e4c8";
      ctx.beginPath();
      ctx.arc(0, -s * 0.15, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function roundCloud(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.45, h, 0, 0, Math.PI * 2);
    ctx.ellipse(x - w * 0.28, y + 2, w * 0.28, h * 0.75, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.28, y + 2, w * 0.3, h * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function hex(h) {
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  }
  function clampByte(n) { return n < 0 ? 0 : n > 255 ? 255 : n | 0; }
  function hash(c, r, n) {
    var x = Math.sin(c * 127.1 + r * 311.7 + n * 74.7) * 43758.5453;
    return x - Math.floor(x);
  }
  function mix(a, b, t) {
    function hex(h) {
      return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    }
    var A = hex(a), B = hex(b);
    t = Math.max(0, Math.min(1, t));
    var c = A.map(function (v, i) { return Math.round(v + (B[i] - v) * t); });
    return "rgb(" + c.join(",") + ")";
  }
  function rainTint(rain) {
    var t = Math.max(0, Math.min(1, rain / 48));
    return "rgba(" + Math.round(230 - t * 190) + "," + Math.round(201 - t * 70) + "," + Math.round(138 + t * 40) + ",0.45)";
  }

  window.WorldDraw = {
    start: start,
    poke: poke,
    burst: burst,
    shake: shakeScreen,
    cellAt: cellAt,
    cellCenter: function (c, r) { return metrics ? center(c, r) : { x: 0, y: 0 }; }
  };
})();
