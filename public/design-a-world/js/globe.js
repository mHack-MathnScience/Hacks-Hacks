/* Spinning planet view. WebGL1, no network. A painted sphere if WebGL is missing. */
(function () {
  "use strict";

  var canvas = null;
  var getPack = function () { return { state: null, low: false }; };
  var gl = null;
  var mode = "globe";
  var low = false;
  var yaw = 0.4;
  var pitch = 0.18;
  var dragging = false;
  var moved = 0;
  var lastX = 0;
  var lastY = 0;
  var hold = 0;
  var raf = 0;
  var reduce = false;
  var dirty = true;
  var use2d = false;
  var dayCanvas = null;
  var nightCanvas = null;
  var cloudCanvas = null;
  var prog = null;
  var cloudProg = null;
  var atmoProg = null;
  var starProg = null;
  var mesh = null;
  var cloudMesh = null;
  var atmoMesh = null;
  var starBuf = null;
  var dayTex = null;
  var nightTex = null;
  var cloudTex = null;
  var builtLow = null;
  var t0 = 0;

  var BIOME = {
    aquatic: [18, 92, 158],
    desert: [214, 168, 86],
    grassland: [78, 168, 72],
    forest: [28, 112, 58],
    wetland: [48, 138, 112],
    tundra: [176, 198, 190],
    mountain: [128, 116, 104]
  };

  function start(el, getter) {
    canvas = el;
    getPack = getter || getPack;
    reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    dayCanvas = document.createElement("canvas");
    nightCanvas = document.createElement("canvas");
    cloudCanvas = document.createElement("canvas");
    bind();
    bootGl();
    poke();
    kick();
  }

  function bootGl() {
    use2d = false;
    gl = null;
    try {
      gl = canvas.getContext("webgl", { antialias: !low, alpha: false, depth: true, stencil: false, powerPreference: "low-power" })
        || canvas.getContext("experimental-webgl");
    } catch (err) { gl = null; }
    if (!gl) { use2d = true; return; }
    prog = program(VS, PLANET_FS);
    cloudProg = program(VS, CLOUD_FS);
    atmoProg = program(VS, ATMO_FS);
    starProg = program(STAR_VS, STAR_FS);
    if (!prog || !cloudProg || !atmoProg || !starProg) { use2d = true; gl = null; return; }
    dayTex = gl.createTexture();
    nightTex = gl.createTexture();
    cloudTex = gl.createTexture();
    buildMeshes();
  }

  function setLow(on) {
    low = !!on;
    if (gl && builtLow !== low) buildMeshes();
    dirty = true;
  }

  function setMode(next) {
    mode = next === "region" ? "region" : "globe";
    if (mode === "globe") kick();
  }

  function poke() { dirty = true; }

  function faceNight() {
    var pack = getPack();
    var state = pack && pack.state;
    if (state && state.scenario === "earth" && window.WorldEarth) {
      var spec = WorldEarth.regionById(state.focus || "plains");
      faceLonLat((spec.lon + spec.lon2) / 2, (spec.lat + spec.lat2) / 2, true);
      return;
    }
    var c = 8;
    var r = 5;
    if (state && state.nations && state.nations[0] && state.nations[0].capital) {
      c = state.nations[0].capital.c;
      r = state.nations[0].capital.r;
    }
    aimSphere(((c + 0.5) / 16) * Math.PI * 2, ((r + 0.5) / 12) * Math.PI, true);
  }

  function faceLonLat(lon, lat, wantNight) {
    var u = (lon + 180) / 360;
    var v = (90 - lat) / 180;
    aimSphere(u * Math.PI * 2, v * Math.PI, !!wantNight);
    pitch = clamp((lat / 90) * 0.55, -0.42, 0.42);
  }

  function aimSphere(phi, theta, wantNight) {
    var mx = Math.sin(theta) * Math.cos(phi);
    var my = Math.cos(theta);
    var mz = Math.sin(theta) * Math.sin(phi);
    var sun = norm3(0.92, 0.18, 0.28);
    var best = yaw;
    var bestScore = -99;
    for (var i = 0; i < 120; i++) {
      var a = (i / 120) * Math.PI * 2;
      var x = mx * Math.cos(a) + mz * Math.sin(a);
      var z = -mx * Math.sin(a) + mz * Math.cos(a);
      var ndl = x * sun[0] + my * sun[1] + z * sun[2];
      var lit = wantNight ? (ndl < -0.22 ? 2.2 : -1.2) : (ndl > 0.28 ? 2.2 : -1.2);
      var score = z * 1.6 + lit;
      if (score > bestScore) { bestScore = score; best = a; }
    }
    yaw = best;
    hold = 360;
  }

  function cellAt(clientX, clientY) {
    if (!canvas) return null;
    var hit = project(clientX, clientY);
    return hit;
  }

  function bind() {
    canvas.addEventListener("pointerdown", function (ev) {
      dragging = true;
      moved = 0;
      lastX = ev.clientX;
      lastY = ev.clientY;
      hold = 90;
      try { canvas.setPointerCapture(ev.pointerId); } catch (err) { /* ignore */ }
    });
    canvas.addEventListener("pointermove", function (ev) {
      if (!dragging) return;
      var dx = ev.clientX - lastX;
      var dy = ev.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      lastX = ev.clientX;
      lastY = ev.clientY;
      yaw += dx * 0.008;
      pitch = clamp(pitch + dy * 0.006, -0.7, 0.7);
    });
    function end() { dragging = false; }
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("click", function (ev) {
      if (moved > 8) { ev.stopPropagation(); return; }
    });
  }

  function kick() {
    if (raf) return;
    t0 = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function loop(now) {
    raf = 0;
    if (mode !== "globe" || !canvas || canvas.offsetParent === null && canvas.clientWidth === 0) return;
    var dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    if (!dragging && !reduce && hold <= 0) yaw += dt * 0.18;
    if (hold > 0) hold--;
    drawFrame(now / 1000);
    raf = requestAnimationFrame(loop);
  }

  function sizeOf() {
    var rect = canvas.getBoundingClientRect();
    var dpr = low ? 1 : Math.min(1.5, window.devicePixelRatio || 1);
    var w = Math.max(2, Math.floor(rect.width * dpr));
    var h = Math.max(2, Math.floor(rect.height * dpr));
    var cap = low ? 800 : 1400;
    if (w > cap) {
      h = Math.max(2, Math.floor(h * cap / w));
      w = cap;
    }
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return { w: w, h: h, aspect: w / h };
  }

  function drawFrame(time) {
    if (dirty) {
      paintTextures(getPack().state);
      dirty = false;
      if (gl) uploadTex();
    }
    var box = sizeOf();
    if (use2d || !gl) draw2d(time, box);
    else drawGl(time, box);
  }

  function paintTextures(state) {
    var tw = low ? 512 : 1024;
    var th = low ? 256 : 512;
    if (state && state.scenario === "earth" && window.WorldEarth) paintEarth(state, tw, th);
    else paintCells(state, tw, th);
    paintClouds(state, tw, th);
  }

  function paintEarth(state, tw, th) {
    var planet = state.planet || {};
    var heat = window.WorldSim && WorldSim.visualHeat ? WorldSim.visualHeat(state) : 0;
    var thresh = 36 + Math.max(0, planet.seaNow || 0) * 28;
    var focus = state.focus ? WorldEarth.regionById(state.focus) : null;
    var maps = WorldEarth.paintMaps(tw, th, {
      thresh: thresh,
      heat: heat,
      core: planet.coreNow || 0,
      focus: focus
    });
    blit(dayCanvas, maps.day, tw, th);
    blit(nightCanvas, maps.night, tw, th);
  }

  function blit(target, data, tw, th) {
    target.width = tw;
    target.height = th;
    var g = target.getContext("2d");
    var img = g.createImageData(tw, th);
    img.data.set(data);
    g.putImageData(img, 0, 0);
  }

  function paintCells(state, tw, th) {
    dayCanvas.width = tw;
    dayCanvas.height = th;
    nightCanvas.width = tw;
    nightCanvas.height = th;
    var day = dayCanvas.getContext("2d").createImageData(tw, th);
    var night = nightCanvas.getContext("2d").createImageData(tw, th);
    var dd = day.data;
    var nd = night.data;
    var feel = state && state.feel != null ? state.feel : 12;
    var iceReach = clamp(0.08 + (12 - feel) * 0.012, 0.04, 0.42);
    for (var y = 0; y < th; y++) {
      var v = (y + 0.5) / th;
      for (var x = 0; x < tw; x++) {
        var u = (x + 0.5) / tw;
        var sample = sampleLand(state, u, v);
        var n = fbm(u * 9, v * 5);
        var lat = Math.abs(v - 0.5) * 2;
        var col = sample.rgb.slice();
        col[0] += (n - 0.5) * 28 + sample.shade;
        col[1] += (n - 0.5) * 22 + sample.shade * 0.9;
        col[2] += (n - 0.5) * 14 + sample.shade * 0.6;
        if (!sample.water && (lat > 1 - iceReach || sample.temp < 0.2)) {
          col = [230, 238, 244];
        }
        if (sample.water) {
          var depth = 0.78 + n * 0.22;
          col = [14 * depth, 70 * depth, 150 * depth];
        }
        var p = (y * tw + x) * 4;
        dd[p] = clampByte(col[0]);
        dd[p + 1] = clampByte(col[1]);
        dd[p + 2] = clampByte(col[2]);
        dd[p + 3] = 255;
        nd[p] = sample.water ? 4 : 8;
        nd[p + 1] = sample.water ? 12 : 14;
        nd[p + 2] = sample.water ? 24 : 28;
        nd[p + 3] = 255;
      }
    }
    stampCellLights(nd, tw, th, state);
    stampCellVolcanoes(dd, nd, tw, th, state);
    dayCanvas.getContext("2d").putImageData(day, 0, 0);
    nightCanvas.getContext("2d").putImageData(night, 0, 0);
  }

  function stampCellLights(nd, tw, th, state) {
    if (!state || !state.nations) return;
    state.nations.forEach(function (n) {
      if (!n.capital) return;
      glow(nd, tw, th, ((n.capital.c + 0.5) / 16) * tw, ((n.capital.r + 0.5) / 12) * th, tw / 70, [255, 226, 140]);
    });
    if (!state.cells) return;
    state.cells.forEach(function (cell, i) {
      if (cell.sea || (cell.use !== "town" && cell.use !== "suburb")) return;
      var c = i % 16;
      var r = (i / 16) | 0;
      glow(nd, tw, th, ((c + 0.5) / 16) * tw, ((r + 0.5) / 12) * th, tw / 90, [255, 210, 120]);
    });
  }

  function stampCellVolcanoes(dd, nd, tw, th, state) {
    if (!state || !state.cells) return;
    var heat = state.planet && state.planet.coreNow ? state.planet.coreNow : 0;
    var rad = tw / 80 + Math.max(0, heat) * (tw / 70);
    state.cells.forEach(function (cell, i) {
      if (!cell.volcano || cell.volcano < 0.2) return;
      var c = i % 16;
      var r = (i / 16) | 0;
      glow(dd, tw, th, ((c + 0.5) / 16) * tw, ((r + 0.5) / 12) * th, rad, [255, 78, 24]);
      glow(nd, tw, th, ((c + 0.5) / 16) * tw, ((r + 0.5) / 12) * th, rad * 0.7, [255, 64, 20]);
    });
  }

  function glow(data, tw, th, x, y, rad, col) {
    var x0 = Math.floor(x - rad);
    var x1 = Math.ceil(x + rad);
    var y0 = Math.max(0, Math.floor(y - rad));
    var y1 = Math.min(th - 1, Math.ceil(y + rad));
    for (var yy = y0; yy <= y1; yy++) {
      for (var xx = x0; xx <= x1; xx++) {
        var d = Math.sqrt((xx - x) * (xx - x) + (yy - y) * (yy - y)) / rad;
        if (d >= 1) continue;
        var k = Math.pow(1 - d, 1.7);
        var px = ((xx % tw) + tw) % tw;
        var p = (yy * tw + px) * 4;
        data[p] = clampByte(data[p] * (1 - k) + col[0] * k);
        data[p + 1] = clampByte(data[p + 1] * (1 - k) + col[1] * k);
        data[p + 2] = clampByte(data[p + 2] * (1 - k) + col[2] * k);
      }
    }
  }

  function paintClouds(state, tw, th) {
    cloudCanvas.width = tw;
    cloudCanvas.height = th;
    var storm = 0;
    var cold = 0;
    if (state && state.weather) {
      storm = clamp(((state.weather.rainMul || 1) - 1) / 0.38, 0, 1);
      cold = state.weather.tempAdd < 0 ? 1 : 0;
    }
    var rainNow = state && state.planet && state.planet.rainNow ? state.planet.rainNow : 1;
    if (rainNow > 1.15) storm = Math.max(storm, clamp((rainNow - 1) / 0.6, 0, 1));
    var g = cloudCanvas.getContext("2d");
    var img = g.createImageData(tw, th);
    var d = img.data;
    var period = 3.2;
    for (var y = 0; y < th; y++) {
      var v = y / th;
      var lat = Math.abs(v - 0.5) * 2;
      for (var x = 0; x < tw; x++) {
        var u = x / tw;
        var band = Math.exp(-Math.pow((lat - 0.15) / 0.28, 2)) * 0.55 + Math.exp(-Math.pow((lat - 0.62) / 0.22, 2)) * 0.35;
        var n = fbm(u * period * 4, v * period * 2);
        var n2 = fbm(u * period * 9 + 5, v * period * 6);
        var swirl = 0;
        if (storm > 0.2) {
          var dx = (u - 0.62 + 1) % 1 - 0.5;
          var dy = v - 0.42;
          var ang = Math.atan2(dy, dx);
          var rad = Math.sqrt(dx * dx + dy * dy);
          swirl = fbm(Math.cos(ang) * 2 + rad * 14, Math.sin(ang) * 2 + 3) * storm;
        }
        var blob = n * 0.62 + n2 * 0.28 + swirl * 0.45 + band * 0.35;
        var gate = storm > 0.35 ? 0.42 : 0.58;
        var a = blob > gate ? (blob - gate) / (1 - gate) : 0;
        a = a * a * (0.55 + band);
        if (lat > 0.92) a *= 0.3;
        a = clamp(a, 0, storm > 0.35 ? 0.48 : 0.34);
        var shade = cold ? 236 : 248;
        var p = (y * tw + x) * 4;
        d[p] = shade;
        d[p + 1] = shade;
        d[p + 2] = cold ? 255 : shade;
        d[p + 3] = clampByte(a * 255);
      }
    }
    g.putImageData(img, 0, 0);
    cloudCanvas._storm = storm;
    cloudCanvas._cold = cold;
  }

  function fbm(x, y) {
    var n = noise2(x, y) * 0.62;
    n += noise2(x * 2.05 + 4, y * 2.05) * 0.28;
    n += noise2(x * 4.1 + 8, y * 4.1) * 0.1;
    return n;
  }

  function sampleLand(state, u, v) {
    if (!state || !state.cells) {
      return { rgb: [40, 90, 140], shade: 0, water: true, temp: 16, volcano: 0 };
    }
    var wobble = (noise2(u * 18, v * 10) - 0.5) * 0.55;
    var x = u * 16 - 0.5 + wobble;
    var y = v * 12 - 0.5 + wobble * 0.4;
    var c0 = Math.floor(x);
    var r0 = Math.floor(y);
    var fx = x - c0;
    var fy = y - r0;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    function at(c, r) {
      c = ((c % 16) + 16) % 16;
      r = Math.max(0, Math.min(11, r));
      var i = r * 16 + c;
      var cell = state.cells[i];
      var biome = state.view && state.view.biome ? state.view.biome[i] : "grassland";
      var rgb = (BIOME[biome] || BIOME.grassland).slice();
      var water = !!(cell.sea || cell.lake || cell.flood);
      if (cell.sea) rgb = [16, 74, 150];
      else if (cell.lake || cell.flood) rgb = [28, 120, 176];
      return {
        rgb: rgb,
        water: water,
        e: cell.e,
        temp: state.view && state.view.climT ? state.view.climT[i] : 12,
        volcano: cell.volcano || 0
      };
    }
    var a = at(c0, r0);
    var b = at(c0 + 1, r0);
    var c = at(c0, r0 + 1);
    var d = at(c0 + 1, r0 + 1);
    var rgb = [0, 0, 0];
    for (var k = 0; k < 3; k++) {
      rgb[k] = (a.rgb[k] * (1 - fx) + b.rgb[k] * fx) * (1 - fy) + (c.rgb[k] * (1 - fx) + d.rgb[k] * fx) * fy;
    }
    var e = (a.e * (1 - fx) + b.e * fx) * (1 - fy) + (c.e * (1 - fx) + d.e * fx) * fy;
    var eL = at(c0 - 1, r0).e;
    var eU = at(c0, r0 - 1).e;
    return {
      rgb: rgb,
      shade: (e - eL) * 18 + (e - eU) * 10,
      water: a.water && b.water && c.water && d.water ? true : (a.water && fx < 0.35 && fy < 0.35),
      temp: a.temp,
      volcano: Math.max(a.volcano, b.volcano * (fx < 0.4 ? 1 : 0))
    };
  }

  function uploadTex() {
    texImage(dayTex, dayCanvas);
    texImage(nightTex, nightCanvas);
    texImage(cloudTex, cloudCanvas);
  }

  function texImage(tex, src) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  function drawGl(time, box) {
    var sun = norm3(0.92, 0.18, 0.28);
    gl.viewport(0, 0, box.w, box.h);
    gl.clearColor(0.03, 0.045, 0.09, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    var proj = perspective(0.62, box.aspect, 0.1, 50);
    var view = translate(0, 0.02, -4.15);
    var model = mul(rotX(pitch), rotY(yaw));
    var vp = mul(proj, view);
    var mvp = mul(vp, model);
    var nmat = mat3of(model);

    gl.useProgram(starProg);
    gl.uniformMatrix4fv(gl.getUniformLocation(starProg, "uMvp"), false, vp);
    gl.bindBuffer(gl.ARRAY_BUFFER, starBuf);
    var loc = gl.getAttribLocation(starProg, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, low ? 80 : 180);

    gl.useProgram(prog);
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, "uMvp"), false, mvp);
    gl.uniformMatrix3fv(gl.getUniformLocation(prog, "uN"), false, nmat);
    gl.uniform3fv(gl.getUniformLocation(prog, "uSun"), sun);
    gl.uniform1f(gl.getUniformLocation(prog, "uTime"), time);
    gl.uniform1f(gl.getUniformLocation(prog, "uWarm"), warmthOf());
    bindAttribs(prog, mesh);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dayTex);
    gl.uniform1i(gl.getUniformLocation(prog, "uDay"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, nightTex);
    gl.uniform1i(gl.getUniformLocation(prog, "uNight"), 1);
    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.useProgram(cloudProg);
      var cmvp = mul(vp, mul(model, scale(1.028)));
      gl.uniformMatrix4fv(gl.getUniformLocation(cloudProg, "uMvp"), false, cmvp);
      gl.uniformMatrix3fv(gl.getUniformLocation(cloudProg, "uN"), false, nmat);
      gl.uniform3fv(gl.getUniformLocation(cloudProg, "uSun"), sun);
      gl.uniform1f(gl.getUniformLocation(cloudProg, "uTime"), time);
      gl.uniform1f(gl.getUniformLocation(cloudProg, "uStorm"), cloudCanvas._storm || 0);
      gl.uniform1f(gl.getUniformLocation(cloudProg, "uCold"), cloudCanvas._cold || 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, cloudTex);
      gl.uniform1i(gl.getUniformLocation(cloudProg, "uCloud"), 0);
      bindAttribs(cloudProg, cloudMesh);
    gl.drawElements(gl.TRIANGLES, cloudMesh.count, gl.UNSIGNED_SHORT, 0);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(atmoProg);
    var amvp = mul(vp, mul(model, scale(1.09)));
    gl.uniformMatrix4fv(gl.getUniformLocation(atmoProg, "uMvp"), false, amvp);
    gl.uniformMatrix3fv(gl.getUniformLocation(atmoProg, "uN"), false, nmat);
    gl.uniform3fv(gl.getUniformLocation(atmoProg, "uSun"), sun);
    gl.uniform1f(gl.getUniformLocation(atmoProg, "uWarm"), warmthOf());
    bindAttribs(atmoProg, atmoMesh);
    gl.drawElements(gl.TRIANGLES, atmoMesh.count, gl.UNSIGNED_SHORT, 0);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }

  function draw2d(time, box) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var w = box.w;
    var h = box.h;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, w, h);
    var cx = w * 0.5;
    var cy = h * 0.48;
    var rad = Math.min(w, h) * 0.36;
    ctx.fillStyle = "#f4f7ff";
    for (var i = 0; i < (low ? 40 : 90); i++) {
      var sx = hash(i, 3) * w;
      var sy = hash(i, 9) * h;
      ctx.globalAlpha = 0.4 + hash(i, 2) * 0.6;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
    var step = low ? 3 : 2;
    var sun = norm3(0.92, 0.18, 0.28);
    for (var y = -rad; y <= rad; y += step) {
      for (var x = -rad; x <= rad; x += step) {
        var rr = x * x + y * y;
        if (rr > rad * rad) continue;
        var z = Math.sqrt(rad * rad - rr);
        var nx = x / rad;
        var ny = -y / rad;
        var nz = z / rad;
        var m = invModel(yaw, pitch, [nx, ny, nz]);
        var len = Math.sqrt(m[0] * m[0] + m[1] * m[1] + m[2] * m[2]) || 1;
        m[0] /= len; m[1] /= len; m[2] /= len;
        var theta = Math.acos(clamp(m[1], -1, 1));
        var phi = Math.atan2(m[2], m[0]);
        if (phi < 0) phi += Math.PI * 2;
        var u = phi / (Math.PI * 2);
        var v = theta / Math.PI;
        var px = Math.max(0, Math.min(dayCanvas.width - 1, (u * dayCanvas.width) | 0));
        var py = Math.max(0, Math.min(dayCanvas.height - 1, (v * dayCanvas.height) | 0));
        var day = dayCanvas.getContext("2d").getImageData(px, py, 1, 1).data;
        var night = nightCanvas.getContext("2d").getImageData(px, py, 1, 1).data;
        var ndl = nx * sun[0] + ny * sun[1] + nz * sun[2];
        var lit = clamp((ndl + 0.15) / 0.5, 0, 1);
        var r = night[0] * (1 - lit) + day[0] * lit;
        var g = night[1] * (1 - lit) + day[1] * lit;
        var b = night[2] * (1 - lit) + day[2] * lit;
        ctx.fillStyle = "rgb(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + ")";
        ctx.fillRect(cx + x, cy + y, step, step);
      }
    }
    var grd = ctx.createRadialGradient(cx, cy, rad * 0.8, cx, cy, rad * 1.12);
    grd.addColorStop(0, "rgba(80,170,255,0)");
    grd.addColorStop(1, "rgba(90,180,255,0.45)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, rad * 1.12, 0, Math.PI * 2);
    ctx.fill();
  }

  function project(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    var x = ((clientX - rect.left) / rect.width) * 2 - 1;
    var y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    var aspect = rect.width / rect.height;
    var tan = Math.tan(0.36);
    var rd = norm3(x * tan * aspect, y * tan, -1);
    var ro = [0, 0, 2.65];
    var b = ro[0] * rd[0] + ro[1] * rd[1] + ro[2] * rd[2];
    var c = ro[0] * ro[0] + ro[1] * ro[1] + ro[2] * ro[2] - 1;
    var h = b * b - c;
    if (h < 0) return null;
    var t = -b - Math.sqrt(h);
    if (t < 0) return null;
    var p = [ro[0] + rd[0] * t, ro[1] + rd[1] * t, ro[2] + rd[2] * t];
    var m = invModel(yaw, pitch, p);
    var theta = Math.acos(clamp(m[1], -1, 1));
    var phi = Math.atan2(m[2], m[0]);
    if (phi < 0) phi += Math.PI * 2;
    var col = Math.floor((phi / (Math.PI * 2)) * 16) % 16;
    var row = Math.max(0, Math.min(11, Math.floor((theta / Math.PI) * 12)));
    return { c: col, r: row };
  }

  function buildMeshes() {
    builtLow = low;
    var seg = low ? [40, 20] : [72, 36];
    mesh = sphereMesh(seg[0], seg[1], 1);
    cloudMesh = sphereMesh(seg[0], seg[1], 1);
    atmoMesh = sphereMesh(Math.max(16, seg[0] / 2), Math.max(10, seg[1] / 2), 1);
    var stars = new Float32Array((low ? 120 : 280) * 3);
    for (var i = 0; i < stars.length; i += 3) {
      var v = norm3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      stars[i] = v[0] * 8;
      stars[i + 1] = v[1] * 8;
      stars[i + 2] = v[2] * 8;
    }
    starBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, starBuf);
    gl.bufferData(gl.ARRAY_BUFFER, stars, gl.STATIC_DRAW);
  }

  function sphereMesh(lon, lat, radius) {
    var pos = [];
    var uv = [];
    var idx = [];
    for (var y = 0; y <= lat; y++) {
      for (var x = 0; x <= lon; x++) {
        var u = x / lon;
        var v = y / lat;
        var theta = v * Math.PI;
        var phi = u * Math.PI * 2;
        pos.push(radius * Math.sin(theta) * Math.cos(phi), radius * Math.cos(theta), radius * Math.sin(theta) * Math.sin(phi));
        uv.push(u, 1 - v);
      }
    }
    for (var yy = 0; yy < lat; yy++) {
      for (var xx = 0; xx < lon; xx++) {
        var a = yy * (lon + 1) + xx;
        var b = a + lon + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    var buffers = {
      pos: gl.createBuffer(),
      uv: gl.createBuffer(),
      idx: gl.createBuffer(),
      count: idx.length
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.pos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uv);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.idx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    return buffers;
  }

  function bindAttribs(p, m) {
    var aPos = gl.getAttribLocation(p, "aPos");
    var aUv = gl.getAttribLocation(p, "aUv");
    gl.bindBuffer(gl.ARRAY_BUFFER, m.pos);
    if (aPos >= 0) { gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0); }
    gl.bindBuffer(gl.ARRAY_BUFFER, m.uv);
    if (aUv >= 0) { gl.enableVertexAttribArray(aUv); gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0); }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.idx);
  }

  function program(vs, fs) {
    var p = gl.createProgram();
    var a = shader(gl.VERTEX_SHADER, vs);
    var b = shader(gl.FRAGMENT_SHADER, fs);
    if (!a || !b) return null;
    gl.attachShader(p, a);
    gl.attachShader(p, b);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    return p;
  }

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var VS = [
    "attribute vec3 aPos;",
    "attribute vec2 aUv;",
    "uniform mat4 uMvp;",
    "uniform mat3 uN;",
    "varying vec3 vN;",
    "varying vec2 vUv;",
    "void main() {",
    "  vUv = aUv;",
    "  vN = uN * aPos;",
    "  gl_Position = uMvp * vec4(aPos, 1.0);",
    "}"
  ].join("\n");

  var PLANET_FS = [
    "precision mediump float;",
    "varying vec3 vN;",
    "varying vec2 vUv;",
    "uniform sampler2D uDay;",
    "uniform sampler2D uNight;",
    "uniform vec3 uSun;",
    "uniform float uTime;",
    "uniform float uWarm;",
    "vec2 wrapUv(vec2 uv) {",
    "  return vec2(fract(uv.x), clamp(uv.y, 0.001, 0.999));",
    "}",
    "void main() {",
    "  vec3 n = normalize(vN);",
    "  vec3 sun = normalize(uSun);",
    "  float ndl = dot(n, sun);",
    "  float day = smoothstep(-0.08, 0.25, ndl);",
    "  vec2 uv = wrapUv(vUv);",
    "  vec4 alb = texture2D(uDay, uv);",
    "  vec3 night = texture2D(uNight, uv).rgb;",
    "  float ocean = smoothstep(0.08, 0.2, alb.b - max(alb.r, alb.g * 0.72));",
    "  float light = clamp(ndl, 0.0, 1.0);",
    "  vec3 lit = alb.rgb * (0.32 + 0.78 * light);",
    "  vec3 col = mix(night, lit, day);",
    "  vec3 h = normalize(sun + vec3(0.0, 0.0, 1.0));",
    "  float spec = pow(max(dot(n, h), 0.0), 36.0) * ocean * day;",
    "  float spark = sin(vUv.x * 80.0 + uTime * 2.2) * sin(vUv.y * 64.0 - uTime * 1.6);",
    "  spec += max(spark, 0.0) * ocean * day * 0.22;",
    "  col += vec3(0.75, 0.9, 1.0) * spec;",
    "  float lamps = smoothstep(0.22, 0.82, night.r);",
    "  col += vec3(1.2, 0.95, 0.48) * lamps * (1.0 - day) * 1.25;",
    "  float warm = clamp(uWarm, 0.0, 1.0);",
    "  float cool = clamp(-uWarm, 0.0, 1.0);",
    "  col = mix(col, col * vec3(0.75, 0.88, 1.15), cool * 0.45);",
    "  col = mix(col, col * vec3(1.18, 0.9, 0.72) + vec3(0.04, 0.015, 0.0), warm * (0.42 + (1.0 - ocean) * 0.15));",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  var CLOUD_FS = [
    "precision mediump float;",
    "varying vec3 vN;",
    "varying vec2 vUv;",
    "uniform sampler2D uCloud;",
    "uniform vec3 uSun;",
    "uniform float uTime;",
    "uniform float uStorm;",
    "uniform float uCold;",
    "void main() {",
    "  vec2 uv = vec2(fract(vUv.x + uTime * 0.012), clamp(vUv.y, 0.001, 0.999));",
    "  vec4 c = texture2D(uCloud, uv);",
    "  float ndl = dot(normalize(vN), normalize(uSun));",
    "  float day = smoothstep(-0.2, 0.45, ndl);",
    "  vec3 rgb = c.rgb * (0.72 + 0.28 * day);",
    "  float streaks = fract(vUv.y * 52.0 - vUv.x * 10.0 - uTime * (0.7 - uCold * 0.35));",
    "  float line = smoothstep(0.0, 0.03, streaks) * smoothstep(0.2, 0.05, streaks);",
    "  float over = smoothstep(0.02, 0.2, c.a);",
    "  float rain = line * uStorm * (0.45 + over);",
    "  vec3 rainCol = mix(vec3(0.62, 0.78, 1.0), vec3(0.95, 0.97, 1.0), uCold);",
    "  rgb = mix(rgb, rainCol, clamp(rain, 0.0, 1.0));",
    "  float a = c.a * 0.85;",
    "  a = max(a, rain * 0.62);",
    "  if (a < 0.035) discard;",
    "  gl_FragColor = vec4(rgb, a);",
    "}"
  ].join("\n");

  var ATMO_FS = [
    "precision mediump float;",
    "varying vec3 vN;",
    "uniform vec3 uSun;",
    "uniform float uWarm;",
    "void main() {",
    "  vec3 n = normalize(vN);",
    "  float fres = pow(1.0 - abs(n.z), 1.6);",
    "  float day = 0.35 + 0.65 * smoothstep(-0.25, 0.55, dot(n, normalize(uSun)));",
    "  vec3 col = mix(vec3(0.35, 0.72, 1.0), vec3(1.0, 0.55, 0.28), clamp(uWarm, 0.0, 1.0));",
    "  col = mix(col, vec3(0.45, 0.75, 1.0), clamp(-uWarm, 0.0, 1.0));",
    "  gl_FragColor = vec4(col * fres * day, fres * 0.85);",
    "}"
  ].join("\n");

  var STAR_VS = [
    "attribute vec3 aPos;",
    "uniform mat4 uMvp;",
    "void main() {",
    "  gl_Position = uMvp * vec4(aPos, 1.0);",
    "  gl_PointSize = 2.2;",
    "}"
  ].join("\n");

  var STAR_FS = [
    "precision mediump float;",
    "void main() { gl_FragColor = vec4(0.9, 0.94, 1.0, 1.0); }"
  ].join("\n");

  function warmthOf() {
    var pack = getPack();
    var state = pack && pack.state;
    if (state && window.WorldSim && WorldSim.visualHeat) return WorldSim.visualHeat(state);
    if (!state || state.feel == null || state.startT == null) return 0;
    return clamp((state.feel - state.startT) / 4, -1, 1);
  }

  function invModel(yawA, pitchA, p) {
    var cx = Math.cos(pitchA);
    var sx = Math.sin(pitchA);
    var x1 = p[0];
    var y1 = cx * p[1] - sx * p[2];
    var z1 = sx * p[1] + cx * p[2];
    var cy = Math.cos(yawA);
    var sy = Math.sin(yawA);
    return [cy * x1 - sy * z1, y1, sy * x1 + cy * z1];
  }

  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2);
    var nf = 1 / (near - far);
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0
    ];
  }
  function translate(x, y, z) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  }
  function scale(s) {
    return [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1];
  }
  function rotY(a) {
    var c = Math.cos(a), s = Math.sin(a);
    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  }
  function rotX(a) {
    var c = Math.cos(a), s = Math.sin(a);
    return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
  }
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) {
      for (var r = 0; r < 4; r++) {
        o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      }
    }
    return o;
  }
  function mat3of(m) {
    return [m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]];
  }
  function norm3(x, y, z) {
    var l = Math.sqrt(x * x + y * y + z * z) || 1;
    return [x / l, y / l, z / l];
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function clampByte(n) { return Math.max(0, Math.min(255, n | 0)); }
  function noise2(x, y) {
    var x0 = Math.floor(x);
    var y0 = Math.floor(y);
    var fx = x - x0;
    var fy = y - y0;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    function h(ix, iy) {
      return hash(((ix % 128) + 128) % 128, ((iy % 128) + 128) % 128);
    }
    var a = h(x0, y0);
    var b = h(x0 + 1, y0);
    var c = h(x0, y0 + 1);
    var d = h(x0 + 1, y0 + 1);
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
  }

  function hash(x, y) {
    var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  window.WorldGlobe = {
    start: start,
    poke: poke,
    setLow: setLow,
    setMode: setMode,
    faceNight: faceNight,
    faceLonLat: faceLonLat,
    cellAt: cellAt,
    dragged: function () { return moved > 8; }
  };
})();
