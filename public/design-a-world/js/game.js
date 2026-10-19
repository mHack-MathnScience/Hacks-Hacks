/* HUD, tools, science cards, and the teacher notebook. No grades. */
(function () {
  "use strict";
  var SAVE = "daw-planet-v2";
  var S = null;
  var tool = "look";
  var lifeId = "oak";
  var selected = { c: 7, r: 5 };
  var view = "biome";
  var choiceId = null;
  var mismatch = null;
  var toastTimer = 0;
  var prevMeters = null;
  var chartAnim = 0;

  var TOOLS = [
    { id: "look", label: "Look", hint: "Read one place" },
    { id: "raise", label: "Raise", hint: "Colder, wetter climb" },
    { id: "lower", label: "Lower", hint: "Water runs down" },
    { id: "water", label: "Lake", hint: "Add or remove water" },
    { id: "dam", label: "Dam", hint: "Hold water and mud" },
    { id: "road", label: "Road", hint: "Trade, split habitat" },
    { id: "farm", label: "Farm", hint: "Rural food" },
    { id: "pasture", label: "Pasture", hint: "Room for grazers" },
    { id: "forest", label: "Forest", hint: "Wood can regrow" },
    { id: "plant", label: "Plant", hint: "A named producer" },
    { id: "animal", label: "Animal", hint: "Consumer or decomposer" },
    { id: "town", label: "Town", hint: "Urban homes" },
    { id: "suburb", label: "Suburb", hint: "Houses and yards" },
    { id: "mine", label: "Mine", hint: "Only where rock sparkles" },
    { id: "solar", label: "Solar", hint: "Today's sunlight" },
    { id: "capital", label: "Capital", hint: "Move the people" },
    { id: "found", label: "Nation", hint: "Up to three" },
    { id: "clear", label: "Clear", hint: "Remove what people added" }
  ];
  var FLAG_COLORS = ["#1f6a4a", "#1f4d68", "#a1622f", "#e2b340", "#f4efe4", "#8d3b3b"];
  var SUNS = [
    { id: "dawn", label: "Dawn", shadow: 54, stick: 22 },
    { id: "noon", label: "Noon", shadow: 14, stick: 40 },
    { id: "dusk", label: "Dusk", shadow: 54, stick: 22 },
    { id: "night", label: "Night", shadow: 6, stick: 8 }
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
    WorldDraw.start($("world"), function () {
      return { state: S, view: view, selected: selected, tool: tool };
    });
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
    box.innerHTML = "";
    TOOLS.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tool";
      b.dataset.tool = t.id;
      b.title = t.hint;
      b.innerHTML = esc(t.label) + "<small>" + esc(t.hint) + "</small>";
      b.addEventListener("click", function () { setTool(t.id); });
      box.appendChild(b);
    });
    setTool("look");
  }

  function renderSunButtons() {
    var box = $("sun-buttons");
    box.innerHTML = "";
    SUNS.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ghost";
      b.dataset.sun = s.id;
      b.textContent = s.label;
      b.addEventListener("click", function () {
        if (!S) return;
        WorldSim.apply(S, { tool: "sun", id: s.id });
        say(s.id === "night"
          ? "Night. Earth turned. The Sun did not race around us. Day comes back when we spin into the light."
          : s.label + ". Earth is spinning, so the shadow on the stick changes.");
        renderAll();
        save();
      });
      box.appendChild(b);
    });
  }

  function bind() {
    $("continue").addEventListener("click", function () {
      var saved = readSave();
      if (!saved) return;
      S = saved;
      selected = (S.nations[0] && S.nations[0].capital) || { c: 4, r: 6 };
      openApp();
    });
    $("new-world").addEventListener("click", function () {
      S = null;
      $("app").hidden = true;
      $("start").hidden = false;
      $("science").hidden = true;
    });
    $("next-season").addEventListener("click", function () { advance(1); });
    $("run-four").addEventListener("click", function () { advance(4); });
    $("save-note").addEventListener("click", saveNote);
    $("open-story").addEventListener("click", openStory);
    $("open-notebook").addEventListener("click", openNotebook);
    $("story-close").addEventListener("click", function () { $("story").hidden = true; });
    $("notebook-close").addEventListener("click", function () { $("notebook").hidden = true; });
    $("science-save").addEventListener("click", saveScience);
    $("science-skip").addEventListener("click", function () {
      if (!S) return;
      WorldSim.skipCheck(S);
      $("science").hidden = true;
      say("Skipped. The card is in the notebook as skipped. You can keep building.");
      save();
    });
    $("mismatch-move").addEventListener("click", function () { mismatch = null; $("mismatch").hidden = true; });
    $("mismatch-keep").addEventListener("click", keepMismatch);
    $("warn-undo").addEventListener("click", function () {
      if (!S) return;
      var res = WorldSim.undo(S);
      $("warn").hidden = true;
      toast(res.msg || "Undid it.");
      renderAll(); save();
    });
    $("warn-keep").addEventListener("click", function () {
      if (S) WorldSim.justifyAlert(S, "warn", $("warn-reason").value);
      $("warn").hidden = true;
      toast("Saved your reason in the notebook.");
      save();
    });
    $("save-idea").addEventListener("click", function () {
      if (!S) return;
      WorldSim.apply(S, { tool: "worldidea", text: $("world-idea").value });
      openNotebook();
      save();
    });
    $("copy-evidence").addEventListener("click", copyEvidence);
    document.querySelectorAll("[data-view]").forEach(function (b) {
      b.addEventListener("click", function () {
        view = b.dataset.view;
        document.querySelectorAll("[data-view]").forEach(function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        WorldDraw.poke();
      });
    });
    var world = $("world");
    world.addEventListener("click", function (ev) {
      var hit = WorldDraw.cellAt(ev.clientX, ev.clientY);
      if (hit) onCell(hit.c, hit.r);
    });
    world.addEventListener("keydown", function (ev) {
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
      if (!d || !S) return;
      ev.preventDefault();
      selected = {
        c: Math.max(0, Math.min(15, selected.c + d[0])),
        r: Math.max(0, Math.min(11, selected.r + d[1]))
      };
      if (ev.key === "Enter" || ev.key === " ") onCell(selected.c, selected.r);
      else { paintInspector(); WorldDraw.poke(); }
    });
  }

  function begin(id) {
    var opts = { name: $("student-name").value };
    var seedRaw = $("seed").value.trim();
    if (seedRaw) opts.seed = Number(seedRaw);
    S = WorldSim.create(id, opts);
    selected = (S.nations[0] && S.nations[0].capital) || { c: 4, r: 6 };
    openApp();
    say("I'm Nimbus. This is " + scenario().name + ". " + scenario().blurb);
  }

  function openApp() {
    $("start").hidden = true;
    $("app").hidden = false;
    renderAll();
    if (S.pending) openScience();
    save();
    requestAnimationFrame(function () { WorldDraw.poke(); });
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
      WorldSim.ORGANISMS.filter(function (o) { return id === "plant" ? o.kind === "plant" : o.kind === "animal"; })
        .forEach(function (o) {
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute("aria-pressed", o.id === lifeId ? "true" : "false");
          b.textContent = o.name;
          b.title = o.role + ". " + o.structure;
          b.addEventListener("click", function () { lifeId = o.id; setTool(id); });
          tray.appendChild(b);
        });
    } else tray.hidden = true;
    if (id === "mine") say("Gold dots are coal. Copper dots are ore. An empty hill has nothing to mine.");
    WorldDraw.poke();
  }

  function advance(n) {
    if (!S) return;
    var before = WorldSim.totals(S);
    var logAt = S.log.length;
    var herbBefore = S.herb;
    for (var i = 0; i < n; i++) WorldSim.step(S);
    renderAll();
    save();
    var fresh = S.log.slice(logAt);
    if (fresh.length) {
      var last = fresh[fresh.length - 1].text;
      toast(last.slice(0, 160));
      say(guideLine(fresh));
    }
    if (S.herb < herbBefore * 0.75 || fresh.some(function (l) { return /shrank|flew off|lost people|dropped/i.test(l.text); })) {
      WorldDraw.shake();
    }
    if (S.pending) openScience();
    bumpMeters(before, WorldSim.totals(S));
  }

  function onCell(c, r) {
    selected = { c: c, r: r };
    if (!S) return;
    if (tool === "look") { paintInspector(); WorldDraw.poke(); return; }
    var action = { tool: tool, c: c, r: r };
    if (tool === "plant" || tool === "animal") action = { tool: "life", c: c, r: r, id: lifeId };
    if (tool === "capital") action.nationId = S.view.owner[r * 16 + c] || (S.nations[0] && S.nations[0].id);
    if (tool === "found") action.name = "New Nation";
    var before = WorldSim.totals(S);
    var res = WorldSim.apply(S, action);
    if (res.mismatch) {
      mismatch = res.mismatch;
      $("mismatch-text").textContent = res.mismatch.text;
      $("mismatch-reason").value = "";
      $("mismatch").hidden = false;
      say(res.mismatch.text.slice(0, 180));
      renderAll();
      return;
    }
    if (!res.ok) {
      toast(res.msg || "That did not work.");
      say(res.empty ? "Nothing in that rock. Coal and ore are only in some layers. Follow the sparkle." : (res.msg || "").slice(0, 160));
      renderAll();
      return;
    }
    toast(res.msg);
    say((res.msg || "").slice(0, 180));
    WorldDraw.burst(c, r, tool === "mine" ? "#5c5146" : tool === "water" ? "#3ec0d8" : "#f2b705");
    if (res.warn) {
      $("warn-text").textContent = res.warn.text;
      $("warn-reason").value = "";
      $("warn").hidden = false;
    }
    renderAll();
    bumpMeters(before, WorldSim.totals(S));
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
    paintInspector();
    paintGoals();
    paintNations();
    paintAlerts();
    paintSun();
    paintGlobe();
    WorldDraw.poke();
  }

  function scenario() {
    var found = WorldSim.SCENARIOS[0];
    WorldSim.SCENARIOS.forEach(function (sc) { if (sc.id === S.scenario) found = sc; });
    return found;
  }

  function paintInspector() {
    var ex = WorldSim.explainCell(S, selected.c, selected.r);
    $("readout").textContent = ex.paragraphs.slice(0, 2).join(" ");
    WorldSim.markTerms(S, ex.defs);
  }

  function paintGoals() {
    $("goals").innerHTML = scenario().goals.slice(0, 2).map(function (g) {
      return "<p>" + esc(g) + "</p>";
    }).join("");
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
      keep.className = "ghost";
      keep.textContent = "Save this reason";
      keep.addEventListener("click", function () {
        WorldSim.justifyAlert(S, a.id, reason.value);
        toast("Saved. Your teacher can read it in the notebook.");
        renderAll(); save();
      });
      div.appendChild(reason);
      div.appendChild(keep);
      box.appendChild(div);
    });
  }

  function paintNations() {
    var box = $("nations");
    S.nations.forEach(function (n) {
      var div = document.getElementById("nation-" + n.id);
      if (!div) {
        div = document.createElement("div");
        div.id = "nation-" + n.id;
        div.className = "nation";
        div.innerHTML = "<span class='flag-slot'></span><strong></strong><span class='meta'></span>";
        var name = document.createElement("input");
        name.maxLength = 22;
        name.setAttribute("aria-label", "Nation name");
        name.addEventListener("change", function () {
          WorldSim.apply(S, { tool: "rename", nationId: n.id, name: name.value });
          renderAll(); save();
        });
        var gov = document.createElement("select");
        gov.setAttribute("aria-label", "Government");
        [["council", "Town council"], ["republic", "Elected leaders"], ["elders", "Elders"], ["monarch", "One leader"]].forEach(function (pair) {
          var o = document.createElement("option");
          o.value = pair[0]; o.textContent = pair[1];
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
          b.title = "Flag color";
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
      }
      div.querySelector(".flag-slot").innerHTML = flagSvg(n.flag);
      div.querySelector("strong").textContent = n.name;
      div.querySelector(".meta").textContent = r1(n.people) + " people · food " + r1(n.food) + " · " + (n.pattern || "settling");
      var input = div.querySelector("input");
      if (document.activeElement !== input) input.value = n.name;
      div.querySelector("select").value = n.gov;
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
      ? "Night. This side of Earth has turned away from the Sun."
      : sun.label + ". Earth spins. The Sun stays put.";
    document.querySelectorAll("[data-sun]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.sun === S.sun ? "true" : "false");
    });
  }

  function paintGlobe() {
    var night = $("globe") && $("globe").querySelector(".globe-night");
    if (!night) return;
    var width = { dawn: "30%", noon: "0%", dusk: "55%", night: "100%" }[S.sun] || "0%";
    night.style.width = width;
  }

  function openScience() {
    var p = S.pending;
    if (!p) { $("science").hidden = true; return; }
    if ($("science").dataset.id === p.id && !$("science").hidden) return;
    $("science").dataset.id = p.id;
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
    say("A field card is open. Answer it if you want. The seasons will not wait.");
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
    say("Saved in the notebook. Here is the science idea: " + (res.note || "").slice(0, 140));
    setTimeout(function () { $("science").hidden = true; }, 1600);
  }

  function keepMismatch() {
    if (!mismatch) return;
    var res = WorldSim.placeAnyway(S, mismatch.c, mismatch.r, mismatch.id, $("mismatch-reason").value);
    mismatch = null;
    $("mismatch").hidden = true;
    toast(res.msg || "Saved.");
    say("I saved your reason. The animal will still struggle if the climate does not fit.");
    renderAll();
    save();
  }

  function openStory() {
    $("story").hidden = false;
    chartAnim = 0;
    drawChartsAnimated();
    var lines = S.log.slice().reverse().map(function (entry) {
      return "Season " + entry.year + " — " + entry.text;
    });
    $("log-list").textContent = lines.join("\n\n");
  }

  function drawChartsAnimated() {
    chartAnim = Math.min(1, chartAnim + 0.08);
    drawChart($("chart-life"), [
      { key: "plants", color: "#2f8f4e", name: "Plants" },
      { key: "herb", color: "#e07a3d", name: "Grazers" },
      { key: "carn", color: "#c4473a", name: "Hunters" },
      { key: "fish", color: "#1b6f8a", name: "Fish" },
      { key: "people", color: "#1d3140", name: "People" }
    ], chartAnim);
    drawChart($("chart-res"), [
      { key: "timber", color: "#2f8f4e", name: "Wood" },
      { key: "water", color: "#1b6f8a", name: "Water" },
      { key: "coal", color: "#5c5146", name: "Coal" },
      { key: "ore", color: "#a1622f", name: "Ore" },
      { key: "co2", color: "#e07a3d", name: "Heat" }
    ], chartAnim);
    if (chartAnim < 1 && !$("story").hidden) requestAnimationFrame(drawChartsAnimated);
  }

  function drawChart(canvas, series, anim) {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = canvas.clientWidth || 360;
    var h = 200;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.floor(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, w, h);
    var rows = S.history || [];
    var left = 8, right = 8, top = 8, bottom = 36;
    ctx.strokeStyle = "#e4d3b4";
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, h - bottom);
    ctx.lineTo(w - right, h - bottom);
    ctx.stroke();
    var shown = Math.max(1, Math.round(rows.length * (anim || 1)));
    series.forEach(function (s) {
      var smax = 1;
      rows.forEach(function (row) { if (row[s.key] > smax) smax = row[s.key]; });
      ctx.beginPath();
      for (var i = 0; i < shown; i++) {
        var x = left + (rows.length <= 1 ? 0 : (i / (rows.length - 1)) * (w - left - right));
        var y = (h - bottom) - ((rows[i][s.key] || 0) / smax) * (h - top - bottom);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
    ctx.font = "12px sans-serif";
    var lx = left;
    series.forEach(function (s) {
      var last = rows.length ? Math.round(rows[rows.length - 1][s.key] || 0) : 0;
      var label = s.name + " " + last;
      if (lx > w - 70) return;
      ctx.fillStyle = s.color;
      ctx.fillText(label, lx, h - 12);
      lx += ctx.measureText(label).width + 10;
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
    if (!text || !S) { toast("Write a sentence first, if you want it saved."); return; }
    WorldSim.apply(S, { tool: "note", text: text });
    $("season-note").value = "";
    toast("Saved with season " + S.year + ".");
    save();
  }

  function bumpMeters(before, after) {
    var map = { plants: "plants", herb: "herbivores", carn: "carnivores", fish: "fish", people: "people", coal: "coal", ore: "ore", co2: "co2" };
    Object.keys(map).forEach(function (k) {
      var el = $(map[k]);
      if (!el) return;
      var li = el.parentNode;
      li.classList.remove("up", "down");
      if (after[k] > before[k] + 0.2) li.classList.add("up");
      if (after[k] < before[k] - 0.2) li.classList.add("down");
    });
    prevMeters = after;
  }

  function guideLine(entries) {
    var text = entries.map(function (e) { return e.text; }).join(" ");
    if (/Herbivores dropped/i.test(text)) return "The grazers ran short of plants. Sunlight was not enough to feed that many. That is the food web, from the bottom up.";
    if (/delta at/i.test(text) && /shrank/i.test(text)) return "The delta shrank. The dam held the mud upstream. Farms may like the stored water. The river mouth does not.";
    if (/coal/i.test(text)) return "Coal left the ground and the heat index moved. Wood can grow back. Coal cannot.";
    if (/lost people/i.test(text)) return "Some people moved away because food ran low. Nobody is hurt. Farms, fish, and trade can bring them back.";
    if (/valley|canyon|delta|dune|glacier/i.test(text)) return entries[0].text.slice(0, 170);
    return entries[entries.length - 1].text.slice(0, 170);
  }

  function say(text) {
    var el = $("guide-say");
    if (!el) return;
    el.textContent = text;
    var box = $("guide");
    box.classList.remove("react");
    void box.offsetWidth;
    box.classList.add("react");
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
      var raw = localStorage.getItem(SAVE) || localStorage.getItem("daw-planet-v1");
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
