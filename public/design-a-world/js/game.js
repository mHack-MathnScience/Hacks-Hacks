/* Map, seasons, charts, and the teacher notebook. No grades. */
(function () {
  "use strict";
  var SAVE = "daw-planet-v1";
  var S = null;
  var tool = "look";
  var lifeId = "oak";
  var selected = { c: 3, r: 6 };
  var view = "biome";
  var choiceId = null;
  var mismatch = null;
  var toastTimer = 0;

  var TOOLS = [
    { id: "look", group: "Land", label: "Look", hint: "Read one cell" },
    { id: "raise", group: "Land", label: "Raise land", hint: "Colder, more rain on the climb" },
    { id: "lower", group: "Land", label: "Lower land", hint: "Water moves downhill" },
    { id: "water", group: "Land", label: "Lake", hint: "Add or remove a lake" },
    { id: "dam", group: "Land", label: "Dam", hint: "Hold water and sediment" },
    { id: "clear", group: "Land", label: "Clear", hint: "Remove what people added" },
    { id: "forest", group: "Life", label: "Plant a forest", hint: "Producers that can regrow" },
    { id: "plant", group: "Life", label: "Place a plant", hint: "A named producer" },
    { id: "animal", group: "Life", label: "Place an animal", hint: "A consumer or decomposer" },
    { id: "pasture", group: "Life", label: "Pasture", hint: "Room for grazers" },
    { id: "farm", group: "People", label: "Farm", hint: "Rural food" },
    { id: "road", group: "People", label: "Road", hint: "Trade, and a split habitat" },
    { id: "town", group: "People", label: "Town", hint: "Urban homes" },
    { id: "suburb", group: "People", label: "Suburb", hint: "Houses and yards" },
    { id: "mine", group: "People", label: "Mine", hint: "Coal or ore, if the rock has it" },
    { id: "solar", group: "People", label: "Solar", hint: "Today's sunlight" },
    { id: "capital", group: "People", label: "Move capital", hint: "Adapt by moving people" },
    { id: "found", group: "People", label: "Found a nation", hint: "Up to three nations" }
  ];

  var BIOME_COLOR = {
    aquatic: "#1f7ea3", mountain: "#b7b1a6", tundra: "#d5e2e4", desert: "#e6c98a",
    forest: "#2f7d45", grassland: "#c6b44a", wetland: "#6e9a62"
  };
  var FLAG_COLORS = ["#1f6a4a", "#1f4d68", "#a1622f", "#e2b340", "#f4efe4", "#8d3b3b"];
  var SUNS = [
    { id: "dawn", label: "Dawn", shadow: 70, stick: 28 },
    { id: "noon", label: "Noon", shadow: 18, stick: 46 },
    { id: "dusk", label: "Dusk", shadow: 70, stick: 28 },
    { id: "night", label: "Night", shadow: 8, stick: 10 }
  ];

  function $(id) { return document.getElementById(id); }
  function r1(n) { return Math.round(n); }

  function boot() {
    renderScenarios();
    renderTools();
    renderSunButtons();
    bind();
    var saved = readSave();
    $("continue").hidden = !saved;
  }

  function renderScenarios() {
    var box = $("scenarios");
    box.innerHTML = "";
    WorldSim.SCENARIOS.forEach(function (sc) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "card";
      b.dataset.scenario = sc.id;
      b.innerHTML = "<b>" + esc(sc.name) + "</b><span>" + esc(sc.blurb) + "</span><small>" + esc(sc.goals[0]) + "</small>";
      b.addEventListener("click", function () { begin(sc.id); });
      box.appendChild(b);
    });
  }

  function renderTools() {
    var box = $("tool-list");
    var last = "";
    TOOLS.forEach(function (t) {
      if (t.group !== last) {
        var g = document.createElement("div");
        g.className = "group";
        g.innerHTML = "<p>" + t.group + "</p>";
        g.id = "group-" + t.group;
        box.appendChild(g);
        last = t.group;
      }
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tool";
      b.id = "tool-" + t.id;
      b.dataset.tool = t.id;
      b.setAttribute("aria-pressed", t.id === tool ? "true" : "false");
      b.innerHTML = "<span>" + esc(t.label) + "</span>";
      b.title = t.hint;
      b.addEventListener("click", function () { setTool(t.id); });
      $("group-" + t.group).appendChild(b);
    });
  }

  function renderSunButtons() {
    var box = $("sun-buttons");
    SUNS.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "mini";
      b.dataset.sun = s.id;
      b.textContent = s.label;
      b.addEventListener("click", function () {
        if (!S) return;
        WorldSim.apply(S, { tool: "sun", id: s.id });
        paintSun();
        save();
      });
      box.appendChild(b);
    });
  }

  function bind() {
    $("continue").addEventListener("click", function () {
      var raw = readSave();
      if (!raw) return;
      S = raw;
      WorldSim.refresh(S);
      openApp();
    });
    $("new-world").addEventListener("click", function () {
      $("app").hidden = true;
      $("start").hidden = false;
    });
    $("next-season").addEventListener("click", function () { advance(1); });
    $("run-four").addEventListener("click", function () { advance(4); });
    $("save-note").addEventListener("click", saveNote);
    $("open-story").addEventListener("click", function () { openStory(); });
    $("open-notebook").addEventListener("click", function () { openNotebook(); });
    $("story-close").addEventListener("click", function () { $("story").hidden = true; });
    $("notebook-close").addEventListener("click", function () { $("notebook").hidden = true; });
    $("science-save").addEventListener("click", saveScience);
    $("mismatch-move").addEventListener("click", function () { mismatch = null; $("mismatch").hidden = true; });
    $("mismatch-keep").addEventListener("click", keepMismatch);
    $("warn-undo").addEventListener("click", function () {
      var res = WorldSim.undo(S);
      $("warn").hidden = true;
      toast(res.msg || "Undid that.");
      renderAll();
      save();
    });
    $("warn-keep").addEventListener("click", function () {
      WorldSim.justifyAlert(S, "plan-" + S.year + "-" + S.choices.length, $("warn-reason").value);
      $("warn-reason").value = "";
      $("warn").hidden = true;
      toast("Your reason is in the notebook.");
      renderAll();
      save();
    });
    $("save-idea").addEventListener("click", function () {
      WorldSim.apply(S, { tool: "worldidea", text: $("world-idea").value });
      save();
      openNotebook();
    });
    $("copy-evidence").addEventListener("click", copyEvidence);
    document.querySelectorAll("[data-view]").forEach(function (b) {
      b.addEventListener("click", function () {
        view = b.dataset.view;
        document.querySelectorAll("[data-view]").forEach(function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        paintMap();
      });
    });
  }

  function begin(id) {
    var name = $("student-name").value;
    var seedRaw = $("seed").value.trim();
    var opts = { name: name };
    if (seedRaw) opts.seed = Number(seedRaw);
    S = WorldSim.create(id, opts);
    selected = capitalOf(S) || { c: 4, r: 6 };
    openApp();
  }

  function openApp() {
    $("start").hidden = true;
    $("app").hidden = false;
    renderAll();
    save();
  }

  function capitalOf(state) {
    if (!state.nations.length) return null;
    return { c: state.nations[0].capital.c, r: state.nations[0].capital.r };
  }

  function setTool(id) {
    tool = id;
    document.querySelectorAll(".tool").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.tool === id ? "true" : "false");
    });
    var tray = $("tray");
    if (id === "plant" || id === "animal") {
      tray.hidden = false;
      tray.innerHTML = "";
      WorldSim.ORGANISMS.filter(function (o) {
        return id === "plant" ? o.kind === "plant" : o.kind === "animal";
      }).forEach(function (o) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-pressed", o.id === lifeId ? "true" : "false");
        b.textContent = o.name + " · " + o.role;
        b.addEventListener("click", function () {
          lifeId = o.id;
          setTool(id);
        });
        tray.appendChild(b);
      });
    } else tray.hidden = true;
  }

  function advance(n) {
    if (!S) return;
    if (S.pending) { openScience(); return; }
    var last = null;
    for (var i = 0; i < n; i++) {
      last = WorldSim.step(S);
      if (last.blocked || S.pending) break;
    }
    renderAll();
    save();
    if (S.pending) openScience();
    else if (S.log.length) toast(S.log[S.log.length - 1].text.slice(0, 180));
  }

  function onCell(c, r) {
    selected = { c: c, r: r };
    if (tool === "look") {
      renderAll();
      return;
    }
    var action = { tool: tool, c: c, r: r };
    if (tool === "plant" || tool === "animal") action = { tool: "life", c: c, r: r, id: lifeId };
    if (tool === "capital") {
      var nation = S.view.owner[r * WorldSim.COLS + c] || (S.nations[0] && S.nations[0].id);
      action.nationId = nation;
    }
    if (tool === "found") action.name = "New Nation";
    var res = WorldSim.apply(S, action);
    if (res.mismatch) {
      mismatch = res.mismatch;
      $("mismatch-text").textContent = res.mismatch.text;
      $("mismatch-reason").value = "";
      $("mismatch").hidden = false;
      renderAll();
      return;
    }
    if (!res.ok) { toast(res.msg || "That did not work."); renderAll(); return; }
    toast(res.msg);
    if (res.warn) {
      $("warn-text").textContent = res.warn.text;
      $("warn-reason").value = "";
      $("warn").hidden = false;
    }
    renderAll();
    save();
  }

  function renderAll() {
    if (!S) return;
    WorldSim.refresh(S);
    var sc = scenario();
    $("who").textContent = (S.name || "Explorer") + " · " + sc.name;
    $("season-label").textContent = "Season " + S.year + " · seed " + S.seed0;
    $("scenario-name").textContent = sc.name;
    var t = WorldSim.totals(S);
    $("plants").textContent = r1(t.plants);
    $("herbivores").textContent = r1(t.herb);
    $("carnivores").textContent = r1(t.carn);
    $("fish").textContent = r1(t.fish);
    $("people").textContent = r1(t.people);
    $("timber").textContent = r1(t.timber);
    $("water").textContent = r1(t.water);
    $("coal").textContent = r1(t.coal);
    $("ore").textContent = r1(t.ore);
    $("co2").textContent = t.co2.toFixed(1);
    paintMap();
    paintLegend();
    paintInspector();
    paintCycle();
    paintGoals();
    paintNations();
    paintAlerts();
    paintSun();
    $("next-season").disabled = !!S.pending;
  }

  function scenario() {
    var found = WorldSim.SCENARIOS[0];
    WorldSim.SCENARIOS.forEach(function (sc) { if (sc.id === S.scenario) found = sc; });
    return found;
  }

  function paintMap() {
    var map = $("map");
    map.innerHTML = "";
    var corner = document.createElement("div");
    map.appendChild(corner);
    for (var c = 0; c < WorldSim.COLS; c++) {
      var h = document.createElement("div");
      h.className = "colh";
      h.textContent = String(c);
      map.appendChild(h);
    }
    for (var r = 0; r < WorldSim.ROWS; r++) {
      var lat = document.createElement("div");
      lat.className = "lat";
      lat.textContent = r === 0 ? "N" : r === WorldSim.ROWS - 1 ? "S" : "";
      map.appendChild(lat);
      for (var x = 0; x < WorldSim.COLS; x++) {
        map.appendChild(cellButton(x, r));
      }
    }
  }

  function cellButton(c, r) {
    var i = r * WorldSim.COLS + c;
    var cell = S.cells[i];
    var biome = S.view.biome[i];
    var b = document.createElement("button");
    b.type = "button";
    b.className = "cell biome-" + biome + " elev-" + Math.round(cell.e);
    b.dataset.c = String(c);
    b.dataset.r = String(r);
    b.style.filter = "brightness(" + (1.12 - cell.e * 0.07) + ")";
    if (view !== "biome") {
      var rain = view === "weather" ? S.view.rain[i] : S.view.climR[i];
      b.style.background = rainColor(rain);
      b.style.backgroundImage = "none";
    }
    if (S.view.river[i]) b.classList.add("river");
    if (cell.dam) b.classList.add("dam");
    if (cell.road) b.classList.add("road");
    if (cell.lf) b.classList.add("lf-" + cell.lf);
    if (selected && selected.c === c && selected.r === r) b.classList.add("selected");
    var mark = useMark(cell);
    var lf = cell.lf ? WorldSim.lfName(cell.lf).slice(0, 1).toUpperCase() : "";
    b.innerHTML = "<span class='el'>" + Math.round(cell.e) + (lf ? " " + lf : "") + "</span>" + (mark ? "<span class='use'>" + mark + "</span>" : "");
    var temp = r1(view === "weather" ? S.view.temp[i] : S.view.climT[i]);
    b.setAttribute("aria-label", "Column " + c + " row " + r + ", " + biome + ", " + temp + " degrees");
    b.addEventListener("click", function () { onCell(c, r); });
    return b;
  }

  function useMark(cell) {
    var map = { farm: "Fa", pasture: "Pa", forest: "Fo", town: "To", suburb: "Su", mine: "Mi", solar: "So" };
    if (cell.life.length) return cell.life.length > 1 ? "++" : lifeMark(cell.life[0].id);
    return map[cell.use] || "";
  }
  function lifeMark(id) {
    var short = { cactus: "Ca", grass: "Gr", oak: "Oa", lichen: "Li", cattail: "Ct", kelp: "Ke", pine: "Pi", jackrabbit: "Ja", bison: "Bi", wolf: "Wo", polar: "Po", heron: "He", bass: "Ba", goat: "Go", fungus: "Fu", dragon: "Dr" };
    return short[id] || "·";
  }

  function rainColor(rain) {
    var t = Math.max(0, Math.min(1, rain / 48));
    var a = [230, 201, 138];
    var b = [31, 110, 150];
    var c = a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); });
    return "rgb(" + c.join(",") + ")";
  }

  function paintLegend() {
    var box = $("legend");
    var names = ["aquatic", "wetland", "forest", "grassland", "desert", "tundra", "mountain"];
    box.innerHTML = names.map(function (n) {
      return "<span><i class='swatch' style='background:" + BIOME_COLOR[n] + "'></i>" + n + "</span>";
    }).join("") + "<span>Letters: Fa farm, Pa pasture, To town, Mi mine, Dr dragon. Landform initial sits by the elevation.</span>";
  }

  function paintInspector() {
    var ex = WorldSim.explainCell(S, selected.c, selected.r);
    $("readout").textContent = ex.paragraphs.join(" ");
    WorldSim.markTerms(S, ex.defs);
  }

  function paintCycle() {
    var v = S.view;
    $("cycle-text").textContent =
      "The Sun evaporated about " + r1(v.evap) + " units. Land rain this season is about " + r1(v.rainSum) +
      ". About " + r1(v.toOcean) + " ran toward the ocean. Dams hold about " + r1(v.stored) +
      ". Producer energy is " + r1(S.plants) + ". Herbivores " + r1(S.herb) + " eat plants. Carnivores " + r1(S.carn) +
      " eat herbivores. Fish " + r1(S.fish) + " live in the water. Decomposers returned about " + r1(S.decomp) +
      " nutrient units toward the soil. Only about a tenth of the energy at one level reaches the next. Weather now: " +
      S.weather.name + ".";
  }

  function paintGoals() {
    var box = $("goals");
    var facts = WorldSim.goalFacts(S);
    box.innerHTML = scenario().goals.map(function (g) { return "<p>" + esc(g) + "</p>"; }).join("") +
      facts.map(function (f) { return "<p><b>" + esc(f.text) + ".</b> " + esc(f.fact) + "</p>"; }).join("");
  }

  function paintAlerts() {
    var box = $("alerts");
    box.innerHTML = "";
    (S.alerts || []).forEach(function (a) {
      if (S.heard[a.id]) return;
      var div = document.createElement("div");
      div.className = "alert";
      div.innerHTML = "<p>" + esc(a.text) + "</p>";
      var reason = document.createElement("textarea");
      reason.rows = 2;
      reason.placeholder = "Why could they still live here?";
      var keep = document.createElement("button");
      keep.type = "button";
      keep.className = "mini";
      keep.textContent = "Save this reason";
      keep.addEventListener("click", function () {
        WorldSim.justifyAlert(S, a.id, reason.value);
        toast("Saved. Your teacher can read it in the notebook.");
        renderAll();
        save();
      });
      div.appendChild(reason);
      div.appendChild(keep);
      box.appendChild(div);
    });
  }

  function paintNations() {
    var box = $("nations");
    box.innerHTML = "";
    S.nations.forEach(function (n) {
      var div = document.createElement("div");
      div.className = "nation";
      div.innerHTML = flagSvg(n.flag) + "<strong>" + esc(n.name) + "</strong><span>" +
        esc(WorldSim.govLabel(n.gov)) + " · " + esc(n.pattern || "settlement") +
        " · people " + r1(n.people) + ", food " + r1(n.food) + ", goods " + r1(n.goods) +
        "</span><span>Rural " + (n.rural || 0) + " · urban " + (n.urban || 0) + " · suburban " + (n.suburban || 0) +
        ". Capital (" + n.capital.c + ", " + n.capital.r + ").</span>";
      var name = document.createElement("input");
      name.value = n.name;
      name.maxLength = 22;
      name.setAttribute("aria-label", "Nation name");
      name.addEventListener("change", function () {
        WorldSim.apply(S, { tool: "rename", nationId: n.id, name: name.value });
        renderAll(); save();
      });
      var gov = document.createElement("select");
      gov.setAttribute("aria-label", "Government");
      [["council", "Town council"], ["republic", "Elected representatives"], ["elders", "Elders"], ["monarch", "Single leader"]].forEach(function (pair) {
        var o = document.createElement("option");
        o.value = pair[0]; o.textContent = pair[1];
        if (n.gov === pair[0]) o.selected = true;
        gov.appendChild(o);
      });
      gov.addEventListener("change", function () {
        var res = WorldSim.apply(S, { tool: "gov", nationId: n.id, gov: gov.value });
        toast(res.msg || "Government updated.");
        renderAll(); save();
      });
      var colors = document.createElement("div");
      colors.className = "colors";
      FLAG_COLORS.forEach(function (col) {
        var b = document.createElement("button");
        b.type = "button";
        b.style.background = col;
        b.setAttribute("aria-label", "Flag color " + col);
        b.addEventListener("click", function () {
          var flag = { layout: n.flag.layout, a: col, b: n.flag.b };
          if (n.flag.a === col) flag = { layout: n.flag.layout, a: n.flag.a, b: col };
          WorldSim.apply(S, { tool: "flag", nationId: n.id, flag: flag });
          renderAll(); save();
        });
        colors.appendChild(b);
      });
      div.appendChild(name);
      div.appendChild(gov);
      div.appendChild(colors);
      box.appendChild(div);
    });
  }

  function flagSvg(flag) {
    var a = flag.a || "#1f4d68";
    var b = flag.b || "#e2b340";
    var body = "<rect width='44' height='28' fill='" + a + "'/>";
    if (flag.layout === "cross") body += "<rect x='18' width='8' height='28' fill='" + b + "'/><rect y='10' width='44' height='8' fill='" + b + "'/>";
    else if (flag.layout === "circle") body += "<circle cx='22' cy='14' r='8' fill='" + b + "'/>";
    else if (flag.layout === "bend") body += "<polygon points='0,0 44,0 0,28' fill='" + b + "'/>";
    else body += "<rect y='8' width='44' height='6' fill='" + b + "'/><rect y='18' width='44' height='6' fill='" + b + "'/>";
    return "<svg class='flag' viewBox='0 0 44 28' aria-hidden='true'>" + body + "</svg>";
  }

  function paintSun() {
    var sun = SUNS.filter(function (s) { return s.id === S.sun; })[0] || SUNS[1];
    $("stick").style.height = sun.stick + "px";
    $("shadowbar").style.width = sun.shadow + "px";
    $("sun-text").textContent = sun.id === "night"
      ? "Night. This side of Earth has turned away from the Sun. Earth rotates once about every 24 hours, so day comes back."
      : sun.label + ". The Sun stays put. Earth is spinning, so the light hits the stick at a new angle and the shadow changes.";
    document.querySelectorAll("[data-sun]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.sun === S.sun ? "true" : "false");
    });
  }

  function openScience() {
    var p = S.pending;
    if (!p) { $("science").hidden = true; return; }
    choiceId = null;
    $("science-standard").textContent = p.standard;
    $("science-title").textContent = p.title;
    $("science-prompt").textContent = p.prompt;
    $("science-reason").value = "";
    $("science-note").hidden = true;
    var box = $("science-choices");
    box.innerHTML = "";
    p.choices.forEach(function (c, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.id = "science-choice-" + i;
      b.dataset.choice = c.id;
      b.textContent = c.text;
      b.addEventListener("click", function () {
        choiceId = c.id;
        box.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
      box.appendChild(b);
    });
    $("science").hidden = false;
  }

  function saveScience() {
    if (!S || !S.pending) return;
    if (!choiceId) { toast("Pick the sentence that matches your thinking."); return; }
    var res = WorldSim.answer(S, choiceId, $("science-reason").value);
    $("science-note").hidden = false;
    $("science-note").textContent = res.note;
    choiceId = null;
    renderAll();
    save();
    setTimeout(function () { $("science").hidden = true; }, 900);
  }

  function keepMismatch() {
    if (!mismatch) return;
    var res = WorldSim.placeAnyway(S, mismatch.c, mismatch.r, mismatch.id, $("mismatch-reason").value);
    mismatch = null;
    $("mismatch").hidden = true;
    toast(res.msg || "Saved.");
    renderAll();
    save();
  }

  function openStory() {
    $("story").hidden = false;
    drawChart($("chart-life"), [
      { key: "plants", color: "#2d6a4f", name: "Producers" },
      { key: "herb", color: "#c8922a", name: "Herbivores" },
      { key: "carn", color: "#8d3b3b", name: "Carnivores" },
      { key: "fish", color: "#1f7ea3", name: "Fish" },
      { key: "people", color: "#1c2834", name: "People" }
    ]);
    drawChart($("chart-res"), [
      { key: "timber", color: "#2d6a4f", name: "Wood" },
      { key: "water", color: "#1f7ea3", name: "Fresh water" },
      { key: "coal", color: "#5c5146", name: "Coal" },
      { key: "ore", color: "#a1622f", name: "Ore" },
      { key: "soil", color: "#c6b44a", name: "Soil" }
    ]);
    var lines = S.log.slice().reverse().map(function (entry) {
      return "Season " + entry.year + " — " + entry.text;
    });
    $("log-list").textContent = lines.join("\n\n");
  }

  function drawChart(canvas, series) {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 360;
    var h = 200;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.floor(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, w, h);
    var rows = S.history;
    var max = 1;
    rows.forEach(function (row) {
      series.forEach(function (s) { if (row[s.key] > max) max = row[s.key]; });
    });
    var left = 36, right = 8, top = 16, bottom = 28;
    ctx.strokeStyle = "#e4dccb";
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, h - bottom);
    ctx.lineTo(w - right, h - bottom);
    ctx.stroke();
    series.forEach(function (s) {
      ctx.beginPath();
      rows.forEach(function (row, i) {
        var x = left + (rows.length === 1 ? 0 : (i / (rows.length - 1)) * (w - left - right));
        var y = (h - bottom) - (row[s.key] / max) * (h - top - bottom);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.font = "11px sans-serif";
    series.forEach(function (s, i) {
      ctx.fillStyle = s.color;
      ctx.fillText(s.name, left + i * 70, 12);
    });
  }

  function openNotebook() {
    if ($("world-idea") && document.activeElement !== $("world-idea")) $("world-idea").value = S.idea || "";
    $("evidence-text").value = WorldSim.report(S);
    $("notebook").hidden = false;
  }

  function copyEvidence() {
    var text = $("evidence-text").value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Copied the notes."); }, function () { fallbackCopy(); });
    } else fallbackCopy();
  }
  function fallbackCopy() {
    $("evidence-text").focus();
    $("evidence-text").select();
    toast("Select the notes and copy them.");
  }

  function saveNote() {
    var text = $("season-note").value.trim();
    if (!text) { toast("Write a sentence first, if you want it saved."); return; }
    WorldSim.apply(S, { tool: "note", text: text });
    $("season-note").value = "";
    toast("Saved with season " + S.year + ".");
    save();
  }

  function toast(msg) {
    var el = $("toast");
    el.hidden = false;
    el.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 4200);
  }

  function save() {
    try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch (err) { /* private mode */ }
  }
  function readSave() {
    try {
      var raw = localStorage.getItem(SAVE);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.cells) return null;
      return data;
    } catch (err) { return null; }
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch];
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
