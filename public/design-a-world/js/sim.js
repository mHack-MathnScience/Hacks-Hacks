/* Design a World — turn-based planet model.
   Climate, water, biomes, food web, resources, and nations update together.
   No grades and no point totals live in this file. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.WorldSim = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var COLS = 16;
  var ROWS = 12;
  var N = COLS * ROWS;

  var GLOSSARY = {
    elevation: "Elevation is how high the land is above the ocean.",
    latitude: "Latitude tells how far a place is from the equator, the warm middle of Earth.",
    climate: "Climate is the usual weather in a place over many years.",
    weather: "Weather is what the air is doing in one season, not the long pattern.",
    "rain shadow": "A rain shadow is the dry side of a mountain. The wind arrives there with little water left.",
    biome: "A biome is a kind of place, such as a desert or a forest, with its own climate, soil, and living things.",
    biotic: "Biotic means living, like plants, animals, and decomposers.",
    abiotic: "Abiotic means nonliving, like temperature, rain, rock, soil, and water.",
    producer: "A producer makes food from sunlight. Plants are producers.",
    consumer: "A consumer eats other living things. Animals are consumers.",
    decomposer: "A decomposer breaks dead things into nutrients that go back to the soil.",
    "food web": "A food web shows who eats whom. Energy moves through it, and it starts with the Sun.",
    renewable: "A renewable resource can be replaced in a human lifetime, like sunlight or trees if new ones grow.",
    nonrenewable: "A nonrenewable resource does not come back for a very long time, like coal or metal ore.",
    erosion: "Erosion is when wind, water, or ice picks rock up and carries it away.",
    deposition: "Deposition is when sediment is dropped in a new place.",
    sediment: "Sediment is bits of rock, sand, and mud.",
    "fossil fuel": "A fossil fuel, such as coal, stores energy from ancient living things.",
    sedimentary: "Sedimentary rock forms when sediment is pressed and glued into layers.",
    rural: "Rural means countryside: farms, pastures, and few buildings.",
    urban: "Urban means a city pattern, with many buildings close together.",
    suburban: "Suburban is the in-between pattern: houses, yards, and roads near a city.",
    region: "A region is an area that shares something. A physical region shares land or climate. A human region shares how people live.",
    capital: "A capital is the city where a nation's leaders work.",
    trade: "Trade is when people swap extras, such as food for metal.",
    inherited: "Inherited means passed from parents to offspring, like fur or the shape of a leaf. Nobody teaches it.",
    learned: "Learned behavior is practiced, like a path to water. The animal is not born knowing that exact path.",
    structure: "A structure is a body part. Its function is the job that part does.",
    function: "A function is the job a structure does. A jackrabbit's wide ears, for example, let heat out.",
  };

  var ORGANISMS = [
    { id: "cactus", name: "Saguaro cactus", kind: "plant", role: "producer", biomes: ["desert"],
      structure: "a thick stem that stores water", func: "survive long dry spells",
      inherit: "The thick stem is inherited. A cactus grows it without a lesson.",
      learned: "Nothing about the stem has to be practiced.",
      abiotic: "heat and very little rain" },
    { id: "grass", name: "Prairie grass", kind: "plant", role: "producer", biomes: ["grassland"],
      structure: "deep roots", func: "hold soil and find water underground",
      inherit: "Deep roots are inherited.",
      learned: "A blade of grass does not learn its roots.",
      abiotic: "some rain, but not enough for a thick forest" },
    { id: "oak", name: "Oak tree", kind: "plant", role: "producer", biomes: ["forest"],
      structure: "broad leaves", func: "catch sunlight",
      inherit: "Leaf shape is inherited.",
      learned: "The tree does not practice growing leaves.",
      abiotic: "mild temperatures and steady rain" },
    { id: "lichen", name: "Reindeer lichen", kind: "plant", role: "producer", biomes: ["tundra", "mountain"],
      structure: "a low, tough body", func: "live through freezing wind",
      inherit: "That low shape is inherited.",
      learned: "It is not a trick the lichen learns.",
      abiotic: "cold and little liquid water" },
    { id: "cattail", name: "Cattail", kind: "plant", role: "producer", biomes: ["wetland"],
      structure: "hollow stems", func: "carry air down to roots in soggy soil",
      inherit: "Hollow stems are inherited.",
      learned: "The plant does not learn to be hollow.",
      abiotic: "standing water or soaked soil" },
    { id: "kelp", name: "Kelp", kind: "plant", role: "producer", biomes: ["aquatic"],
      structure: "long blades that float", func: "reach sunlight near the surface",
      inherit: "The floating blades are inherited.",
      learned: "Kelp does not practice floating.",
      abiotic: "water and light from the Sun" },
    { id: "pine", name: "Bristlecone pine", kind: "plant", role: "producer", biomes: ["mountain", "forest"],
      structure: "waxy needles", func: "shed snow and hold water",
      inherit: "Needle shape is inherited.",
      learned: "The pine does not learn its needles.",
      abiotic: "thin, cold, high air" },
    { id: "jackrabbit", name: "Jackrabbit", kind: "animal", role: "herbivore", biomes: ["desert", "grassland"],
      eats: "producers",
      structure: "very wide ears", func: "dump body heat on hot days",
      inherit: "Ear size is inherited.",
      learned: "A jackrabbit can learn which bushes give shade. That path is learned behavior.",
      abiotic: "hot days and a little shade" },
    { id: "bison", name: "Bison", kind: "animal", role: "herbivore", biomes: ["grassland"],
      eats: "producers",
      structure: "a wide muzzle and strong grinding teeth", func: "graze tough grass",
      inherit: "Those teeth are inherited.",
      learned: "A calf learns where the herd migrates. The route is learned.",
      abiotic: "open grass and room to move" },
    { id: "wolf", name: "Gray wolf", kind: "animal", role: "carnivore", biomes: ["forest", "grassland", "tundra", "mountain"],
      eats: "herbivores",
      structure: "sharp teeth and long legs", func: "chase and eat prey",
      inherit: "Tooth shape is inherited.",
      learned: "Pups learn the pack's trails and hunts. That part is learned behavior.",
      abiotic: "enough land and enough prey" },
    { id: "polar", name: "Polar bear", kind: "animal", role: "apex", biomes: ["tundra"],
      eats: "animals",
      structure: "thick fur and a fat layer", func: "keep heat in a freezing biome",
      inherit: "Fur and fat are inherited structures.",
      learned: "A bear can learn where seals surface. The place is learned. The fur is not.",
      abiotic: "cold climate and fatty prey",
      also: function (biome, t) { return biome === "mountain" && t < 1; } },
    { id: "heron", name: "Great blue heron", kind: "animal", role: "carnivore", biomes: ["wetland", "aquatic"],
      eats: "fish and frogs",
      structure: "long legs and a spear-shaped beak", func: "wade and catch fish",
      inherit: "Leg and beak shape are inherited.",
      learned: "A young heron practices striking. The skill improves with learning.",
      abiotic: "shallow water" },
    { id: "bass", name: "River bass", kind: "animal", role: "carnivore", biomes: ["aquatic"],
      eats: "smaller water animals",
      structure: "gills and a streamlined body", func: "take oxygen from water and swim",
      inherit: "Gills are inherited. So is the urge to swim upstream to lay eggs.",
      learned: "A fish can learn a hiding spot. Gills are not learned.",
      abiotic: "clean, connected water" },
    { id: "goat", name: "Mountain goat", kind: "animal", role: "herbivore", biomes: ["mountain"],
      eats: "producers",
      structure: "split hooves with rough pads", func: "grip steep rock",
      inherit: "Hoof shape is inherited.",
      learned: "A kid learns which ledges are safe by following adults.",
      abiotic: "steep, cool slopes" },
    { id: "fungus", name: "Shelf fungus", kind: "animal", role: "decomposer", biomes: ["forest", "wetland", "grassland", "tundra", "mountain"],
      eats: "dead matter",
      structure: "thin threads in wood and soil", func: "break dead things into nutrients",
      inherit: "The fungus inherits those threads.",
      learned: "It does not learn to decompose. That is its way of living.",
      abiotic: "something dead and a little moisture" },
    { id: "dragon", name: "Ember the dragon", kind: "animal", role: "apex", biomes: ["forest", "grassland", "mountain", "desert", "tundra", "wetland", "aquatic"],
      fantasy: true, eats: "lots of consumers",
      structure: "a huge body and a hunter's jaws", func: "eat other consumers",
      inherit: "In the story, Ember is born a hunter. Body size would be inherited.",
      learned: "A story dragon might learn a hunting valley. The energy rule is still real.",
      abiotic: "a food web with many prey animals" },
  ];

  var ORG = {};
  ORGANISMS.forEach(function (o) { ORG[o.id] = o; });

  var SCENARIOS = [
    {
      id: "rainshadow",
      name: "Wet West, Dry East",
      blurb: "Wind from the ocean hits a ridge. One side stays wet. The other sits in a rain shadow. Two nations want to eat.",
      goals: [
        "Both nations still have food.",
        "Carnivores are still in the food web.",
        "You can say what the dry side should do: move, trade, or change the land.",
      ],
      intro: "Wind blows from the west, off the ocean. Elevation will squeeze rain out on the ridge. The far side may be a desert even on a stormy day. Climate is the long pattern, not one cloud.",
    },
    {
      id: "river",
      name: "One River, Two Towns",
      blurb: "Alderreach sits upstream. Brinehaven sits by the mouth. A dam helps one and can starve the other.",
      goals: [
        "Both capitals still have food and fresh water.",
        "Decide what should happen to the delta.",
        "Keep some prey for the carnivores.",
      ],
      intro: "This river runs from high land to the sea. Water can cut a valley, then drop sediment at the mouth and build a delta. A dam changes who gets the water and the mud.",
    },
    {
      id: "marsh",
      name: "The Marsh Road",
      blurb: "Two towns want to trade. The short path is a wetland. A road helps people and can dry the marsh.",
      goals: [
        "The towns can trade, by road or by a longer dry path.",
        "Some wetland life is still here, or you can explain why it changed.",
        "People still have food.",
      ],
      intro: "A wetland is land that stays soaked. Herons and cattails fit here. A highway is a human modification. It can help trade and harm the living things that need the water.",
    },
    {
      id: "coal",
      name: "Sunlight under the Trees",
      blurb: "The forest grows back. The coal does not. Burning it warms the climate and feeds the towns.",
      goals: [
        "The nation has goods and food.",
        "Producers are still making food from sunlight.",
        "You can name one good effect and one harm of using coal.",
      ],
      intro: "Coal is a fossil fuel, ancient plants pressed into sedimentary rock. It is nonrenewable on a human clock. Trees can be renewable if new ones grow. The Sun is still the start of the energy.",
    },
    {
      id: "ice",
      name: "Edge of the Ice",
      blurb: "Tundra, a glacier, and a small grassland. Feed people without stripping the grass. Warming the climate melts ice.",
      goals: [
        "People have food without killing the grassland.",
        "Cold-adapted animals still have a cold place, or you explain the new climate.",
        "Notice what ice does to the land when it stays and when it melts.",
      ],
      intro: "Ice is a landform builder. It can carve a U-shaped valley and, when it melts, leave that shape behind. The animals here inherited structures for cold.",
    },
  ];

  var SCENARIO = {};
  SCENARIOS.forEach(function (s) { SCENARIO[s.id] = s; });

  function idx(c, r) { return r * COLS + c; }
  function rc(i) { return { c: i % COLS, r: (i / COLS) | 0 }; }
  function inside(c, r) { return c >= 0 && r >= 0 && c < COLS && r < ROWS; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function r1(n) { return Math.round(n); }
  function cell(p) {
    return {
      e: 1, sea: false, lake: false, dam: false, road: false, use: "wild",
      coal: 0, ore: 0, soil: 74, moist: 48, pol: 0,
      cut: 0, sed: 0, lf: "", rock: false,
      dry: 0, cold: 0, warm: 0, starve: 0, life: [],
      volcano: 0, flood: false,
      e0: p && p.e != null ? p.e : 1,
    };
  }
  function makeCell(p) {
    var c = cell(p);
    Object.keys(p || {}).forEach(function (k) { c[k] = p[k]; });
    c.e0 = c.e;
    c.life = (p && p.life) ? p.life.slice() : [];
    return c;
  }
  function rand(state) {
    state.seed = (Math.imul(1664525, state.seed) + 1013904223) >>> 0;
    return state.seed / 4294967296;
  }
  function copy(o) { return JSON.parse(JSON.stringify(o)); }
  function teach(state, id) {
    if (!GLOSSARY[id] || state.terms[id]) return "";
    state.terms[id] = GLOSSARY[id];
    return " " + GLOSSARY[id];
  }
  function orgFits(org, biome, t) {
    if (!org) return false;
    if (org.biomes.indexOf(biome) >= 0) return true;
    if (typeof org.also === "function" && org.also(biome, t)) return true;
    return false;
  }
  function neighbors(c, r, diag) {
    var out = [];
    var dirs = diag
      ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
      : [[1, 0], [-1, 0], [0, 1], [0, -1]];
    dirs.forEach(function (d) {
      var nc = c + d[0], nr = r + d[1];
      if (inside(nc, nr)) out.push(idx(nc, nr));
    });
    return out;
  }

  function buildCells(fill) {
    var cells = new Array(N);
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) cells[idx(c, r)] = makeCell(fill(c, r));
    }
    return cells;
  }

  function terrain(id) {
    if (id === "river") {
      return buildCells(function (c, r) {
        var sea = r === ROWS - 1;
        var dist = Math.abs(c - 7);
        var south = r < 4 ? r * 0.32 : 1.28 + (r - 4) * 0.02;
        var e = 2.45 - south + Math.min(dist, 6) * 0.22;
        if (dist > 5) e += (dist - 5) * 0.38;
        if (sea) e = 0;
        var lake = !sea && c === 7 && r === 7;
        var moist = lake || (dist === 0 && r >= 8) ? 78 : 54;
        var coal = (c === 4 && r === 2) ? 24 : 0;
        var ore = c === 12 && r === 2 ? 20 : 0;
        return { e: e, sea: sea, lake: lake, moist: moist, coal: coal, ore: ore, soil: 74 };
      });
    }
    if (id === "marsh") {
      return buildCells(function (c, r) {
        var sea = c <= 1;
        var e = sea ? 0 : (r <= 1 ? 3 : 1);
        if (!sea && c >= 5 && c <= 11 && r >= 4 && r <= 8) e = 1;
        var lake = !sea && ((c === 7 && r === 6) || (c === 9 && r === 5) || (c === 6 && r === 7));
        var moist = lake || (!sea && c >= 5 && c <= 11 && r >= 4 && r <= 8) ? 84 : 46;
        var ore = c === 14 && r === 2 ? 18 : 0;
        return { e: e, sea: sea, lake: lake, moist: moist, ore: ore, soil: moist > 70 ? 80 : 70 };
      });
    }
    if (id === "coal") {
      return buildCells(function (c, r) {
        var sea = c === 0;
        var e = sea ? 0 : 1;
        if (!sea && c >= 3 && c <= 5 && r >= 3 && r <= 8) e = 2;
        var coal = (!sea && c >= 8 && c <= 10 && r >= 5 && r <= 7) ? 36 : 0;
        var ore = c === 12 && r === 6 ? 18 : 0;
        return { e: e, sea: sea, coal: coal, ore: ore, soil: 80, moist: 62 };
      });
    }
    if (id === "ice") {
      return buildCells(function (c, r) {
        var e = r <= 3 ? 5 : r <= 5 ? 3 : 1;
        if (c >= 6 && c <= 9 && r <= 2) e = 6;
        var sea = r === ROWS - 1 && (c < 3 || c > 12);
        if (sea) e = 0;
        var coal = c === 11 && r === 7 ? 24 : 0;
        return { e: e, sea: sea, coal: coal, soil: r < 4 ? 40 : 70, moist: r < 3 ? 30 : 52, lf: (e >= 6 ? "glacier" : "") };
      });
    }
    return buildCells(function (c, r) {
      var sea = c <= 1;
      var e = 1;
      if (sea) e = 0;
      else if (c >= 6 && c <= 8) e = (r >= 2 && r <= 9) ? 5 : 4;
      else if (c >= 4 && c <= 5) e = 2;
      else if (c >= 9 && c <= 10) e = 2;
      var coal = (c === 7 && r === 4) ? 18 : 0;
      var ore = (c === 8 && r === 6) ? 20 : 0;
      var soil = c > 10 ? 62 : 76;
      return { e: e, sea: sea, coal: coal, ore: ore, soil: soil, moist: sea ? 80 : 50 };
    });
  }

  function starterNations(id) {
    if (id === "river") {
      return [
        nation("n1", "Alderreach", "council", "#1f6a4a", "#e2b340", "stripes", 7, 3, 86),
        nation("n2", "Brinehaven", "republic", "#1f4d68", "#f0e2b6", "bend", 7, 9, 78),
      ];
    }
    if (id === "marsh") {
      return [
        nation("n1", "Reedton", "council", "#2a6a48", "#f2d48a", "stripes", 3, 6, 70),
        nation("n2", "Hillmarket", "elders", "#8d4b2a", "#f4efe4", "circle", 13, 6, 64),
      ];
    }
    if (id === "coal") return [nation("n1", "Hearth", "republic", "#1f4d68", "#e2b340", "cross", 8, 6, 92)];
    if (id === "ice") return [nation("n1", "Lowmeadow", "elders", "#245c78", "#d7e4ea", "circle", 8, 8, 54)];
    return [
      nation("n1", "Westmarsh", "council", "#1f6a4a", "#f0e2b6", "stripes", 3, 6, 88),
      nation("n2", "Dusthaven", "elders", "#a1622f", "#f4efe4", "bend", 12, 6, 60),
    ];
  }

  function nation(id, name, gov, a, b, layout, c, r, people) {
    return {
      id: id, name: name, gov: gov,
      flag: { layout: layout, a: a, b: b },
      capital: { c: c, r: r },
      people: people, food: 28, goods: 12, unrest: 4,
    };
  }

  function starterLife(id) {
    var put = [];
    function add(c, r, org) { put.push({ c: c, r: r, id: org }); }
    if (id === "rainshadow") {
      add(3, 5, "oak"); add(3, 7, "grass"); add(4, 6, "wolf");
      add(12, 5, "cactus"); add(13, 7, "jackrabbit");
    } else if (id === "river") {
      add(6, 4, "oak"); add(7, 5, "wolf"); add(8, 8, "cattail"); add(7, 8, "bass"); add(9, 9, "heron");
    } else if (id === "marsh") {
      add(7, 6, "cattail"); add(8, 5, "heron"); add(6, 7, "bass"); add(9, 6, "fungus");
      add(3, 5, "oak"); add(13, 5, "grass");
    } else if (id === "coal") {
      add(4, 5, "oak"); add(5, 7, "oak"); add(7, 5, "wolf"); add(8, 8, "fungus"); add(6, 6, "grass");
    } else if (id === "ice") {
      add(7, 1, "lichen"); add(8, 2, "polar"); add(6, 3, "goat"); add(8, 8, "grass"); add(9, 9, "bison");
    }
    return put;
  }

  function starterUse(id, cells) {
    function set(c, r, use) { if (inside(c, r) && !cells[idx(c, r)].sea) cells[idx(c, r)].use = use; }
    if (id === "rainshadow") {
      set(3, 6, "town"); set(4, 6, "farm"); set(4, 7, "farm"); set(12, 6, "town"); set(13, 6, "pasture");
    } else if (id === "river") {
      set(7, 3, "town"); set(6, 3, "farm"); set(8, 3, "farm"); set(7, 9, "town"); set(8, 9, "farm");
    } else if (id === "marsh") {
      set(3, 6, "town"); set(4, 6, "farm"); set(13, 6, "town"); set(12, 6, "farm");
    } else if (id === "coal") {
      set(8, 6, "town"); set(7, 7, "farm"); set(9, 7, "farm"); set(5, 5, "forest");
    } else if (id === "ice") {
      set(8, 8, "town"); set(7, 9, "farm"); set(9, 8, "pasture");
    }
  }

  function create(scenarioId, opts) {
    opts = opts || {};
    var id = SCENARIO[scenarioId] ? scenarioId : "rainshadow";
    var seed = opts.seed != null ? (Number(opts.seed) >>> 0) : ((Math.floor(Math.random() * 900000) + 1000) >>> 0);
    if (!seed) seed = 1;
    var cells = terrain(id);
    starterUse(id, cells);
    starterLife(id).forEach(function (p) {
      var cell = cells[idx(p.c, p.r)];
      cell.life.push({ id: p.id, justified: false, reason: "", stress: 0, since: 0 });
    });
    var state = {
      v: 1,
      scenario: id,
      seed: seed,
      seed0: seed,
      year: 0,
      name: String(opts.name || "").slice(0, 40),
      idea: "",
      co2: id === "coal" ? 6 : 3,
      tempShift: id === "ice" ? -6 : 0,
      plants: 0, herb: 0, carn: 0, fish: 0, decomp: 0, apex: 0,
      timber: 36, water: 40,
      sun: "noon",
      weather: { name: "Waiting for the first season", rainMul: 1, tempAdd: 0 },
      cells: cells,
      nations: starterNations(id),
      choices: [],
      log: [],
      ideas: [],
      checks: {},
      pending: null,
      alerts: [],
      just: [],
      terms: {},
      history: [],
      undo: null,
      startT: null,
      heard: {},
      lastLf: null,
      lastCheckYear: 0,
      warmed: 0,
      planet: defaultPlanet(),
      feel: null,
      sunPinned: false,
    };
    markVolcanoes(cells);
    refresh(state);
    equilibrate(state);
    state.startT = meanTemp(state);
    state.feel = state.startT;
    snapshot(state);
    var sc = SCENARIO[id];
    state.log.push({ year: 0, text: sc.intro + teach(state, "climate") });
    return state;
  }

  function equilibrate(state) {
    var npp = productivity(state);
    state.plants = Math.max(80, npp.land * 3.1);
    state.herb = Math.max(8, state.plants * 0.075);
    state.carn = Math.max(2, state.herb * 0.07);
    state.fish = Math.max(4, npp.water * 0.55);
    state.decomp = 6;
  }

  function latOf(r) { return Math.abs(r - (ROWS - 1) / 2) / ((ROWS - 1) / 2); }

  function waterFrac(state, c, r) {
    var ids = neighbors(c, r, true);
    ids.push(idx(c, r));
    var w = 0;
    ids.forEach(function (i) { if (state.cells[i].sea || state.cells[i].lake) w++; });
    return w / ids.length;
  }

  function nearLake(state, c, r) {
    return neighbors(c, r, true).some(function (i) { return state.cells[i].lake || state.cells[i].sea; });
  }

  function distToWater(state, c, r) {
    var best = 10;
    for (var i = 0; i < N; i++) {
      if (!state.cells[i].sea && !state.cells[i].lake) continue;
      var p = rc(i);
      var d = Math.abs(p.c - c) + Math.abs(p.r - r);
      if (d < best) best = d;
      if (best === 0) break;
    }
    return best;
  }

  function defaultPlanet() {
    return {
      core: 0, coreNow: 0,
      co2Queue: 0,
      o2: 21, o2Now: 21,
      albedo: 30, albedoNow: 30,
      rainBias: 1, rainNow: 1,
      uplift: 0,
      sea: 0, seaNow: 0,
    };
  }

  function ensurePlanet(state) {
    if (!state.planet) state.planet = defaultPlanet();
    var p = state.planet;
    if (p.coreNow == null) p.coreNow = p.core || 0;
    if (p.co2Queue == null) p.co2Queue = 0;
    if (p.o2 == null) p.o2 = 21;
    if (p.o2Now == null) p.o2Now = p.o2;
    if (p.albedo == null) p.albedo = 30;
    if (p.albedoNow == null) p.albedoNow = p.albedo;
    if (p.rainBias == null) p.rainBias = 1;
    if (p.rainNow == null) p.rainNow = p.rainBias;
    if (p.uplift == null) p.uplift = 0;
    if (p.sea == null) p.sea = 0;
    if (p.seaNow == null) p.seaNow = p.sea;
    return p;
  }

  function markVolcanoes(cells) {
    var best = -1;
    var bi = -1;
    cells.forEach(function (c, i) {
      if (!c.sea && c.e > best) { best = c.e; bi = i; }
    });
    if (bi >= 0) cells[bi].volcano = Math.max(cells[bi].volcano || 0, 0.85);
  }

  function climateTemp(state, cell, r, wf) {
    var p = ensurePlanet(state);
    var latT = 29 - latOf(r) * 22;
    var t = latT - cell.e * 3.6;
    t = t * (1 - 0.42 * wf) + 17 * 0.42 * wf;
    t += state.tempShift || 0;
    t += Math.min(4.2, (state.co2 || 0) * 0.1);
    t += p.coreNow || 0;
    t -= ((p.albedoNow || 30) - 30) * 0.18;
    if (cell.volcano > 0.4) t += 0.6;
    return t;
  }

  function feelBand(state) {
    var t = state.feel == null ? meanTemp(state) : state.feel;
    var name = "Cozy";
    if (t < 4) name = "Ice Age";
    else if (t < 8) name = "Cool";
    else if (t < 16) name = "Cozy";
    else if (t < 21) name = "Hot";
    else name = "Scorching";
    return { temp: t, name: name };
  }

  function computeClimate(state) {
    var climT = new Array(N);
    var climR = new Array(N);
    var evap = 0;
    for (var r = 0; r < ROWS; r++) {
      var air = 28 + (1 - latOf(r)) * 8;
      var dryWind = 1;
      for (var c = 0; c < COLS; c++) {
        var i = idx(c, r);
        var cell = state.cells[i];
        var wf = waterFrac(state, c, r);
        var t = climateTemp(state, cell, r, wf);
        climT[i] = t;
        if (cell.sea || cell.lake) {
          air = Math.min(100, air + 14 + Math.max(0, t) * 0.22);
          dryWind = 1;
          evap += Math.max(0, (t + 6) * 0.55);
        } else evap += cell.moist * 0.02;
        var prevE = c > 0 ? state.cells[i - 1].e : cell.e;
        var rise = Math.max(0, cell.e - prevE);
        var drop = Math.max(0, prevE - cell.e);
        var dist = distToWater(state, c, r);
        var rain = 20 + Math.max(0, 14 - dist * 1.15);
        rain *= 0.82 + Math.max(0, Math.min(12, t)) / 70;
        if (rise > 0) rain += 9 * rise + air * 0.04;
        if (drop > 1 && !cell.sea) dryWind = Math.min(dryWind, Math.max(0.2, 0.55 - 0.1 * drop));
        else if (!cell.sea && !cell.lake) dryWind = Math.min(1, dryWind + 0.035);
        rain *= dryWind;
        if (t < 1) rain *= 0.7;
        if (cell.sea) rain *= 0.55;
        rain *= ensurePlanet(state).rainNow || 1;
        rain = Math.max(0, rain);
        climR[i] = rain;
        air = Math.max(6, air - rain * 0.18);
      }
    }
    return { climT: climT, climR: climR, evap: evap };
  }

  function nearWet(cell) { return !!(cell.lake); }

  function biomeOf(cell, t, rain) {
    if (cell.sea || cell.lake || cell.flood) return "aquatic";
    if (cell.e >= 4) return "mountain";
    if (t <= 0.5) return "tundra";
    var soaked = cell.moist >= 68 || (nearWet(cell) && cell.moist >= 48);
    if (!cell.road && cell.e <= 2 && soaked && rain >= 12) return "wetland";
    if (rain < 16) return "desert";
    if (rain >= 28 && cell.soil >= 24 && t >= 6 && t <= 32) return "forest";
    return "grassland";
  }

  function slopeKind(biome, t, rain) {
    if (biome !== "mountain") return "";
    if (t < 0) return "ice";
    if (rain >= 28) return "woods";
    if (rain < 14) return "rock";
    return "grass";
  }

  function computeFlow(state, rainArr) {
    var down = new Array(N).fill(-1);
    var pass = new Array(N).fill(0);
    var inflow = new Array(N).fill(0);
    var dammedIn = new Array(N).fill(0);
    var order = [];
    for (var i = 0; i < N; i++) order.push(i);
    order.sort(function (a, b) { return state.cells[b].e - state.cells[a].e || a - b; });
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    var seaDist = new Array(N);
    for (var s = 0; s < N; s++) {
      var sp = rc(s);
      var bestD = 99;
      for (var t = 0; t < N; t++) {
        if (!state.cells[t].sea) continue;
        var tp = rc(t);
        var dsea = Math.abs(tp.c - sp.c) + Math.abs(tp.r - sp.r);
        if (dsea < bestD) bestD = dsea;
      }
      seaDist[s] = bestD;
    }
    order.forEach(function (i) {
      var p = rc(i);
      var cell = state.cells[i];
      var best = -1;
      var bestScore = Infinity;
      dirs.forEach(function (d) {
        var nc = p.c + d[0], nr = p.r + d[1];
        if (!inside(nc, nr)) return;
        var j = idx(nc, nr);
        var ne = state.cells[j].e;
        if (ne > cell.e + 1e-9) return;
        var sd = seaDist[j];
        if (!(ne < cell.e - 1e-9 || sd < seaDist[i])) return;
        var score = ne * 1000 + sd;
        if (score < bestScore) { bestScore = score; best = j; }
      });
      down[i] = best;
    });
    var toOcean = 0;
    var stored = 0;
    var sedIn = new Array(N).fill(0);
    order.forEach(function (i) {
      var cell = state.cells[i];
      var local = rainArr[i] * 0.9 + Math.max(0, cell.moist - 48) * 0.1;
      var water = local + inflow[i];
      if (cell.sea) { toOcean += water; pass[i] = water; return; }
      var leak = water;
      if (cell.dam) { leak = water * 0.22; stored += water - leak; }
      pass[i] = leak;
      var p = rc(i);
      var leftE = p.c > 0 ? state.cells[i - 1].e : cell.e + 1;
      var rightE = p.c < COLS - 1 ? state.cells[i + 1].e : cell.e + 1;
      var valleyBottom = cell.e <= leftE && cell.e <= rightE;
      var slopeHere = down[i] >= 0 ? cell.e - state.cells[down[i]].e : 0;
      var made = valleyBottom && slopeHere > 0.2 ? slopeHere * 36 : 0;
      var sed = sedIn[i] + made;
      var sedLeak = cell.dam ? sed * 0.15 : sed;
      if (down[i] >= 0) {
        var frac = cell.dam ? 1 : (water > 0.05 ? Math.min(1, dammedIn[i] / water) : 0);
        inflow[down[i]] += leak;
        dammedIn[down[i]] += leak * frac;
        sedIn[down[i]] += sedLeak;
      }
    });
    return { down: down, pass: pass, inflow: inflow, dammedIn: dammedIn, sedIn: sedIn, toOcean: toOcean, stored: stored };
  }

  function refresh(state) {
    var clim = computeClimate(state);
    var w = state.weather || { rainMul: 1, tempAdd: 0 };
    var rain = clim.climR.map(function (v) { return v * (w.rainMul || 1); });
    var temp = clim.climT.map(function (v, i) { return v + (w.tempAdd || 0); });
    var flow = computeFlow(state, rain);
    var biome = new Array(N);
    var slope = new Array(N);
    var river = new Array(N);
    var owner = owners(state);
    for (var i = 0; i < N; i++) {
      biome[i] = biomeOf(state.cells[i], clim.climT[i], clim.climR[i]);
      slope[i] = slopeKind(biome[i], clim.climT[i], clim.climR[i]);
      river[i] = !state.cells[i].sea && !state.cells[i].lake && flow.inflow[i] > 200 && flow.pass[i] > clim.climR[i] * 2.4;
    }
    var rainSum = 0;
    rain.forEach(function (v, i) { if (!state.cells[i].sea) rainSum += v; });
    state.view = {
      climT: clim.climT, climR: clim.climR, temp: temp, rain: rain,
      biome: biome, slope: slope, river: river,
      down: flow.down, pass: flow.pass, inflow: flow.inflow, dammedIn: flow.dammedIn, sedIn: flow.sedIn,
      evap: clim.evap, rainSum: rainSum, toOcean: flow.toOcean, stored: flow.stored,
      owner: owner,
    };
    state.alerts = dryAlerts(state);
    return state.view;
  }

  function owners(state) {
    var owner = new Array(N).fill("");
    state.nations.forEach(function (n) {
      if (!n.capital) return;
      var i = idx(n.capital.c, n.capital.r);
      if (state.cells[i] && !state.cells[i].sea) owner[i] = n.id;
    });
    for (var i = 0; i < N; i++) {
      if (state.cells[i].sea) continue;
      var p = rc(i);
      var best = null;
      var bestD = 99;
      state.nations.forEach(function (n) {
        var d = Math.abs(n.capital.c - p.c) + Math.abs(n.capital.r - p.r);
        if (d < bestD) { bestD = d; best = n; }
      });
      if (best && bestD <= 7) owner[i] = best.id;
    }
    return owner;
  }

  function dryAlerts(state) {
    var alerts = [];
    state.nations.forEach(function (n) {
      if (!nationHasWater(state, n)) {
        alerts.push({
          id: "dry-" + n.id,
          nation: n.id,
          text: n.name + " has little fresh water near its capital. People need water every day. Move the capital, add a lake, or lead a river closer. You may also write why they could still live here.",
        });
      }
    });
    return alerts;
  }

  function nationHasWater(state, n) {
    var v = state.view;
    for (var i = 0; i < N; i++) {
      if (v.owner[i] !== n.id) continue;
      var cell = state.cells[i];
      var p = rc(i);
      if (Math.abs(p.c - n.capital.c) + Math.abs(p.r - n.capital.r) > 3) continue;
      if (cell.lake || v.river[i] || v.climR[i] >= 18 || cell.moist >= 60) return true;
      if (neighbors(rc(i).c, rc(i).r, false).some(function (j) { return state.cells[j].sea || state.cells[j].lake; })) return true;
    }
    return false;
  }

  function productivity(state) {
    var v = state.view;
    var land = 0;
    var water = 0;
    for (var i = 0; i < N; i++) {
      var cell = state.cells[i];
      var b = v.biome[i];
      var base = { aquatic: 0.42, mountain: 0.2, tundra: 0.15, wetland: 0.78, desert: 0.1, forest: 0.86, grassland: 0.5 }[b] || 0.3;
      if (b === "mountain") {
        if (v.climT[i] < 0) base = 0.08;
        else if (v.climR[i] > 28) base = 0.4;
      }
      if (cell.use === "town") base *= 0.22;
      if (cell.use === "suburb") base *= 0.35;
      if (cell.use === "mine") base *= 0.28;
      if (cell.use === "solar") base *= 0.6;
      if (cell.use === "farm") {
        var ok = v.climR[i] > 15 && v.climT[i] > 3 && v.climT[i] < 34 && cell.soil > 28;
        base = ok ? 0.98 * (cell.soil / 78) : 0.14;
      }
      if (cell.use === "pasture") base = Math.max(base, 0.38) * (cell.soil / 78);
      if (cell.use === "forest") base = Math.max(base, 0.72) * (cell.soil / 80);
      if (cell.road && b === "wetland") base *= 0.42;
      base *= 1 - Math.min(0.8, cell.pol / 130);
      if (!cell.sea) base *= 0.4 + 0.6 * Math.min(1, cell.moist / 72);
      cell.life.forEach(function (life) {
        var org = ORG[life.id];
        if (!org || org.role !== "producer") return;
        base += orgFits(org, b, v.climT[i]) ? 0.18 : 0.02;
      });
      if (cell.sea || cell.lake || cell.flood) water += Math.max(0, base);
      else land += Math.max(0, base);
    }
    var o2 = ensurePlanet(state).o2Now || 21;
    land *= 1 + (o2 - 21) * 0.015;
    return { land: land * 7.2, water: water * 6 };
  }

  function meanTemp(state) {
    var s = 0, k = 0;
    for (var i = 0; i < N; i++) if (!state.cells[i].sea) { s += state.view.climT[i]; k++; }
    return k ? s / k : 0;
  }
  function meanRain(state) {
    var s = 0, k = 0;
    for (var i = 0; i < N; i++) if (!state.cells[i].sea) { s += state.view.climR[i]; k++; }
    return k ? s / k : 0;
  }

  function snapshot(state) {
    var coal = 0, ore = 0, soil = 0, land = 0, people = 0;
    state.cells.forEach(function (c) {
      coal += c.coal; ore += c.ore;
      if (!c.sea) { soil += c.soil; land++; }
    });
    state.nations.forEach(function (n) { people += n.people; });
    state.history.push({
      year: state.year,
      plants: r1(state.plants), herb: r1(state.herb), carn: r1(state.carn), fish: r1(state.fish),
      people: r1(people), timber: r1(state.timber), water: r1(state.water),
      coal: r1(coal), ore: r1(ore), soil: land ? r1(soil / land) : 0,
      co2: Math.round(state.co2 * 10) / 10,
      temp: Math.round(meanTemp(state) * 10) / 10,
      rain: Math.round(meanRain(state) * 10) / 10,
    });
    if (state.history.length > 48) state.history.shift();
  }

  function totals(state) {
    var coal = 0, ore = 0;
    state.cells.forEach(function (c) { coal += c.coal; ore += c.ore; });
    var people = 0;
    state.nations.forEach(function (n) { people += n.people; });
    return {
      coal: coal, ore: ore, people: people,
      plants: state.plants, herb: state.herb, carn: state.carn, fish: state.fish,
      timber: state.timber, water: state.water, co2: state.co2,
    };
  }

  function remember(state, tool, c, r, detail) {
    state.choices.push({ year: state.year, tool: tool, c: c, r: r, detail: detail || "" });
    if (state.choices.length > 200) state.choices.shift();
  }

  function apply(state, action) {
    action = action || {};
    var tool = action.tool;
    var c = action.c, r = action.r;
    if (tool === "note") {
      var idea = String(action.text || "").slice(0, 400);
      if (idea) state.ideas.push({ year: state.year, text: idea });
      return { ok: true, msg: idea ? "Saved your idea with this season." : "Nothing new to save." };
    }
    if (tool === "worldidea") {
      state.idea = String(action.text || "").slice(0, 600);
      return { ok: true, msg: "Saved your idea for this world." };
    }
    if (tool === "rename") return renameNation(state, action);
    if (tool === "gov") return setGov(state, action);
    if (tool === "flag") return setFlag(state, action);
    if (tool === "sun") {
      state.sun = action.id || "noon";
      if (action.pinned) state.sunPinned = true;
      return { ok: true };
    }
    if (tool === "planet") return applyPlanet(state, action);
    if (!inside(c, r)) return { ok: false, msg: "That spot is off the map." };
    var i = idx(c, r);
    var cell = state.cells[i];
    refresh(state);
    var before = copy(state.cells);
    var nationsBefore = copy(state.nations);

    function done(msg, warn) {
      state.undo = { cells: before, nations: nationsBefore };
      remember(state, tool, c, r, msg);
      refresh(state);
      return { ok: true, msg: msg, warn: warn || null };
    }

    if (tool === "raise") {
      if (cell.e >= 6) return { ok: false, msg: "This land is already as high as the model goes." };
      cell.e += 1;
      if (cell.sea && cell.e >= 1) { cell.sea = false; cell.soil = 48; cell.moist = 40; }
      return done("You raised the land at (" + c + ", " + r + "). Higher elevation is colder. Moist wind that climbs here will drop more rain, and the far side may dry out." + teach(state, "elevation"));
    }
    if (tool === "lower") {
      if (cell.e <= 0 && cell.sea) return { ok: false, msg: "This is already ocean." };
      cell.e = Math.max(0, cell.e - 1);
      if (cell.e === 0 && neighbors(c, r, false).some(function (j) { return state.cells[j].sea; })) {
        cell.sea = true; cell.lake = false; cell.dam = false; cell.use = "wild"; cell.life = [];
      }
      return done("You lowered (" + c + ", " + r + "). Water and sediment move downhill. A lower path can become a river, a wetland, or even ocean if it meets the sea.");
    }
    if (tool === "water") {
      if (cell.sea) return { ok: false, msg: "This is already ocean. Raise the sea floor if you want an island." };
      cell.lake = !cell.lake;
      if (cell.lake) cell.moist = 90;
      return done(cell.lake
        ? "You added a lake at (" + c + ", " + r + "). The Sun can evaporate this water, and nearby soil will stay wetter."
        : "You removed the lake at (" + c + ", " + r + ").");
    }
    if (tool === "dam") {
      if (cell.sea) return { ok: false, msg: "A dam needs land. The ocean is already a great store of water." };
      cell.dam = !cell.dam;
      return done(cell.dam
        ? "You built a dam at (" + c + ", " + r + "). It will hold most of the water that arrives. Downstream places may get less water and less sediment. The change grows over later seasons."
        : "You removed the dam at (" + c + ", " + r + ").");
    }
    if (tool === "road") {
      if (cell.sea) return { ok: false, msg: "This road tool is for land. Boats already travel the ocean." };
      cell.road = !cell.road;
      var wet = state.view.biome[i] === "wetland" || cell.moist >= 72;
      return done(cell.road
        ? "You built road at (" + c + ", " + r + ")." + (wet ? " This crosses wet ground. Trade may get easier. The wetland can dry and split animal paths." : " Roads help people and goods move.")
        : "You removed the road at (" + c + ", " + r + ").");
    }
    if (tool === "clear") {
      cell.use = "wild"; cell.dam = false; cell.road = false; cell.life = [];
      return done("You cleared what people added at (" + c + ", " + r + "). The rock landforms stay. A canyon is carved stone, not a building.");
    }
    if (tool === "mine") {
      if (cell.sea) return { ok: false, msg: "You cannot mine the open ocean in this model." };
      if (cell.coal <= 0 && cell.ore <= 0) {
        return {
          ok: false,
          empty: true,
          msg: "Nothing to mine at (" + c + ", " + r + "). This rock has no coal and no ore. Fossil fuels and metal ores formed only in some places, long ago. Look for the sparkle." + teach(state, "nonrenewable"),
        };
      }
      cell.use = "mine";
      var scooped = scoopCell(state, cell);
      var leftCoal = 0, leftOre = 0;
      state.cells.forEach(function (c0) { leftCoal += c0.coal; leftOre += c0.ore; });
      return done("You opened a mine at (" + c + ", " + r + "). " + scooped +
        " Coal left in the ground: " + r1(leftCoal) + ". Ore left: " + r1(leftOre) +
        ". Heat index: " + state.co2.toFixed(1) + ". " +
        (cell.coal > 0 || scooped.indexOf("Coal") === 0
          ? "Coal is ancient buried plants. It will not grow back." + teach(state, "fossil fuel")
          : "Ore is a nonrenewable metal. Digging it adds goods and some pollution."));
    }
    var uses = { forest: "forest", farm: "farm", pasture: "pasture", town: "town", suburb: "suburb", solar: "solar" };
    if (uses[tool]) {
      if (cell.sea) return { ok: false, msg: "Build that on land. Aquatic life belongs in the water itself." };
      cell.use = uses[tool];
      var b = state.view.biome[i];
      var msg = useMessage(tool, c, r, b);
      var warn = null;
      if (tool === "farm" && (b === "desert" || b === "tundra" || b === "mountain")) {
        warn = { kind: "farm", text: "This farm is in a " + b + " biome. Crops may fail because the climate does not fit them. You can undo it, add water, or write why you want to try." };
      }
      if (tool === "pasture" && (b === "desert" || b === "tundra")) {
        warn = { kind: "pasture", text: "Grazers here will find little grass. Too many grazers can strip the soil. Undo, or write your plan." };
      }
      return done(msg + teach(state, tool === "solar" || tool === "forest" ? "renewable" : "biome"), warn);
    }
    if (tool === "life") return placeLife(state, c, r, action.id, before, nationsBefore);
    if (tool === "capital") return moveCapital(state, action, before, nationsBefore);
    if (tool === "found") return foundNation(state, c, r, action, before, nationsBefore);
    return { ok: false, msg: "That tool is not ready." };
  }

  function useMessage(tool, c, r, biome) {
    var at = " at (" + c + ", " + r + "), a " + biome + " biome.";
    if (tool === "forest") return "You planted a forest" + at + " Trees are producers. If the climate fits, they can grow back, so wood can be renewable.";
    if (tool === "farm") return "You started a farm" + at + " Farms are a rural pattern. They modify the land to grow food.";
    if (tool === "pasture") return "You opened pasture" + at + " Herds eat producers. A few grazers can feed people. Too many can strip the grass.";
    if (tool === "town") return "You built a town" + at + " A town is an urban pattern: many homes close together.";
    if (tool === "suburb") return "You built a suburb" + at + " Suburban land has houses and yards, between city and countryside.";
    if (tool === "solar") return "You set solar collectors" + at + " They use sunlight, which is renewable, and they do not burn coal.";
    return "Updated (" + c + ", " + r + ").";
  }

  function placeLife(state, c, r, id, before, nationsBefore) {
    var org = ORG[id];
    if (!org) return { ok: false, msg: "Pick a living thing first." };
    var i = idx(c, r);
    var cell = state.cells[i];
    if (cell.sea && org.biomes.indexOf("aquatic") < 0 && org.id !== "dragon") {
      return { ok: false, msg: org.name + " is not an ocean dweller. Kelp, fish, and herons can use water." };
    }
    if (cell.life.length >= 3) return { ok: false, msg: "Three living things already share this cell. Clear one first." };
    if (cell.life.some(function (l) { return l.id === id; })) return { ok: false, msg: org.name + " is already here." };
    var b = state.view.biome[i];
    var t = state.view.climT[i];
    var fit = orgFits(org, b, t);
    if (!fit) {
      return {
        ok: false,
        mismatch: {
          c: c, r: r, id: id, biome: b,
          text: mismatchText(org, b),
        },
      };
    }
    cell.life.push({ id: id, justified: false, reason: "", stress: 0, since: state.year });
    state.undo = { cells: before, nations: nationsBefore };
    var msg = fitText(org, b);
    remember(state, "life", c, r, org.name);
    refresh(state);
    return { ok: true, msg: msg };
  }

  function mismatchText(org, biome) {
    var fantasy = org.fantasy ? " Ember is a story animal, but the body still has to match the place. " : " ";
    return org.name + " is a poor fit for this " + biome + " biome." + fantasy +
      "Its " + org.structure + " has a function: to " + org.func + ". " + org.inherit + " " +
      "Abiotic conditions here do not match what it needs (" + org.abiotic + "). " +
      "You can leave it off the map, or keep it and write your reasoning." +
      (org.id === "polar" ? " A polar bear in a hot desert would overheat. The fur that saves it on tundra becomes a problem." : "");
  }

  function fitText(org, biome) {
    var bit = org.name + " fits this " + biome + " biome. Its " + org.structure + " helps it " + org.func + ". " + org.inherit;
    if (org.fantasy) {
      bit += " Ember is fantasy, an apex predator at the top of the food web. Only a little energy is passed up from the Sun through producers and prey, so a dragon needs many animals.";
    }
    bit += " Biotic neighbors are the other living things here. Abiotic factors are the nonliving ones: temperature, water, soil, and rock.";
    return bit;
  }

  function placeAnyway(state, c, r, id, reason) {
    if (!inside(c, r) || !ORG[id]) return { ok: false };
    var cell = state.cells[idx(c, r)];
    if (cell.life.length >= 3) return { ok: false, msg: "This cell is full." };
    var before = copy(state.cells);
    cell.life.push({ id: id, justified: true, reason: String(reason || "").slice(0, 400), stress: 0, since: state.year });
    state.undo = { cells: before, nations: copy(state.nations) };
    state.just.push({
      year: state.year, kind: "organism", name: ORG[id].name, c: c, r: r,
      biome: state.view ? state.view.biome[idx(c, r)] : "",
      reason: String(reason || "").slice(0, 400),
    });
    remember(state, "life-keep", c, r, ORG[id].name);
    var line = "You kept " + ORG[id].name + " in a biome that does not fit. Your reason is saved for your teacher. The animal will struggle. Watch the food and the heat.";
    state.log.push({ year: state.year, text: line });
    refresh(state);
    return { ok: true, msg: line };
  }

  function justifyAlert(state, alertId, reason) {
    state.just.push({ year: state.year, kind: "nation", name: alertId, reason: String(reason || "").slice(0, 400) });
    state.heard[alertId] = true;
    state.log.push({ year: state.year, text: "You wrote a reason about water and settlement: " + String(reason || "").slice(0, 180) });
    return { ok: true };
  }

  function moveCapital(state, action, before, nationsBefore) {
    var n = state.nations.filter(function (x) { return x.id === action.nationId; })[0];
    if (!n) return { ok: false, msg: "Found a nation first." };
    var cell = state.cells[idx(action.c, action.r)];
    if (cell.sea) return { ok: false, msg: "A capital needs land." };
    n.capital = { c: action.c, r: action.r };
    if (cell.use === "wild" || cell.use === "farm") cell.use = "town";
    state.undo = { cells: before, nations: nationsBefore };
    remember(state, "capital", action.c, action.r, n.name);
    var msg = n.name + " moved its capital to (" + action.c + ", " + action.r + "). Moving people toward water or food is adapting. Building a dam or a road is modifying the land. Both have consequences." + teach(state, "capital");
    state.log.push({ year: state.year, text: msg });
    refresh(state);
    return { ok: true, msg: msg };
  }

  function foundNation(state, c, r, action, before, nationsBefore) {
    if (state.nations.length >= 3) return { ok: false, msg: "This model holds three nations. Edit one you already have." };
    if (state.cells[idx(c, r)].sea) return { ok: false, msg: "Found the capital on land." };
    var name = String(action.name || "New Nation").slice(0, 22);
    var colors = ["#1f6a4a", "#1f4d68", "#a1622f"];
    var n = nation("n" + (state.nations.length + 1) + "_" + state.year, name, action.gov || "council", colors[state.nations.length % 3], "#f4efe4", "stripes", c, r, 40);
    state.nations.push(n);
    state.cells[idx(c, r)].use = "town";
    state.undo = { cells: before, nations: nationsBefore };
    remember(state, "found", c, r, name);
    refresh(state);
    return { ok: true, msg: name + " is founded. Its capital is (" + c + ", " + r + "). Choose a government and a flag. The land around the capital becomes its region." };
  }

  function renameNation(state, action) {
    var n = state.nations.filter(function (x) { return x.id === action.nationId; })[0];
    if (!n) return { ok: false };
    n.name = String(action.name || n.name).slice(0, 22);
    return { ok: true, msg: "Name saved." };
  }
  function setGov(state, action) {
    var n = state.nations.filter(function (x) { return x.id === action.nationId; })[0];
    if (!n) return { ok: false };
    var ok = { council: 1, monarch: 1, republic: 1, elders: 1 };
    if (!ok[action.gov]) return { ok: false };
    n.gov = action.gov;
    state.log.push({ year: state.year, text: govLine(n) });
    remember(state, "gov", n.capital.c, n.capital.r, n.name + " " + n.gov);
    return { ok: true, msg: govLine(n) };
  }
  function govLine(n) {
    if (n.gov === "council") return n.name + " uses a town council. Many people talk before big projects. They share food in trade a little more easily.";
    if (n.gov === "monarch") return n.name + " has one main leader. Projects move fast. If food runs short, unrest rises faster because fewer people chose the plan.";
    if (n.gov === "republic") return n.name + " elects representatives. Unrest stays calmer. Trade still depends on roads, rivers, and trust.";
    return n.name + " listens to elders. They protect forests and wetlands, so wood is cut more slowly and soil can recover.";
  }
  function setFlag(state, action) {
    var n = state.nations.filter(function (x) { return x.id === action.nationId; })[0];
    if (!n || !action.flag) return { ok: false };
    n.flag = { layout: action.flag.layout || n.flag.layout, a: action.flag.a || n.flag.a, b: action.flag.b || n.flag.b };
    return { ok: true };
  }

  function applyPlanet(state, action) {
    var p = ensurePlanet(state);
    var kind = action.kind;
    var dir = action.dir > 0 ? 1 : -1;
    var msg = "";
    if (kind === "core") {
      p.core = clamp(p.core + dir * 2.4, -5, 6);
      p.coreTold = 0;
      msg = dir > 0
        ? "Core heat is rising. In two or three seasons the air warms and volcanoes glow brighter. Not this instant."
        : "Core heat is falling. In two or three seasons the air cools and the ice can grow.";
    } else if (kind === "co2") {
      p.co2Queue += dir * 12;
      p.co2Told = 0;
      msg = dir > 0
        ? "Carbon dioxide is mixing in. The climate meter moves over the next two or three seasons."
        : "Carbon dioxide is coming down. Cooling shows up over the next two or three seasons.";
    } else if (kind === "o2") {
      p.o2 = clamp(p.o2 + dir * 2, 14, 28);
      msg = dir > 0
        ? "Oxygen is rising. Plants can support a little more life once the air mixes. Animals still need plants first."
        : "Oxygen is falling. Producers make a little less food after the air has time to change.";
    } else if (kind === "albedo") {
      p.albedo = clamp(p.albedo + dir * 10, 8, 70);
      p.albedoTold = 0;
      msg = dir > 0
        ? "The planet is brighter. Albedo means it bounces more sunlight. Look for cooling and more ice in two or three seasons."
        : "The planet is darker, so it keeps more sunlight. Look for a warmer tint in two or three seasons.";
    } else if (kind === "rain") {
      p.rainBias = clamp(p.rainBias + dir * 0.4, 0.4, 2);
      p.rainTold = 0;
      msg = dir > 0
        ? "Thicker clouds are on the way. In two or three seasons you should see more cloud and more rain."
        : "Clouds are thinning. Drier land can spread over the next two or three seasons.";
    } else if (kind === "uplift") {
      p.uplift = clamp(p.uplift + 1, 0, 4);
      msg = "Tectonic uplift is queued. Next season a ridge rises and a volcano glows.";
    } else if (kind === "sea") {
      p.sea = clamp((p.sea || 0) + dir * 1.35, 0, 2.4);
      msg = dir > 0
        ? "Sea level is rising. Low coasts flood in about two or three seasons, not the moment you press the button."
        : "Sea level is falling. Flooded coasts can dry once the ocean pulls back.";
    } else return { ok: false, msg: "That planet control is not ready." };
    remember(state, "planet", -1, -1, kind + " " + dir);
    return { ok: true, msg: msg };
  }

  function planetAdvance(state, logs) {
    var p = ensurePlanet(state);
    var beforeCore = p.coreNow;
    var beforeAlbedo = p.albedoNow;
    var beforeRain = p.rainNow;
    var beforeCo2 = state.co2;
    var k = 0.62;
    p.coreNow = p.coreNow + (p.core - p.coreNow) * k;
    p.albedoNow = p.albedoNow + (p.albedo - p.albedoNow) * k;
    p.rainNow = p.rainNow + (p.rainBias - p.rainNow) * k;
    p.o2Now = p.o2Now + (p.o2 - p.o2Now) * k;
    p.seaNow = p.seaNow + (p.sea - p.seaNow) * k;
    if (p.co2Queue) {
      var add = p.co2Queue * k;
      state.co2 = Math.max(0, state.co2 + add);
      p.co2Queue -= add;
      if (Math.abs(p.co2Queue) < 0.05) p.co2Queue = 0;
    }
    if (Math.abs(p.coreNow - beforeCore) > 0.35 && !p.coreTold) {
      p.coreTold = 1;
      var hotter = p.coreNow > beforeCore;
      logs.push(hotter
        ? "Core heat reached the crust. The climate is warming from inside the planet, and volcanoes glow hotter. It took more than one season because rock and air change slowly."
        : "The core is cooling. The climate eases down and ice can spread. The meter moves with the air, not the moment you touched the control.");
      state.cells.forEach(function (cell) {
        if (cell.volcano > 0.2) cell.volcano = hotter ? 1 : Math.max(0.35, cell.volcano - 0.2);
      });
    }
    if (Math.abs(p.albedoNow - beforeAlbedo) > 1.2 && !p.albedoTold) {
      p.albedoTold = 1;
      logs.push(p.albedoNow > beforeAlbedo
        ? "Albedo went up. The planet bounces more sunlight, so it cools and the ice can grow. Albedo is that bounce."
        : "Albedo went down. The planet keeps more sunlight, so the land takes on a warmer tint.");
    }
    if (Math.abs(state.co2 - beforeCo2) > 1.5 && !p.co2Told) {
      p.co2Told = 1;
      logs.push(state.co2 > beforeCo2
        ? "Carbon dioxide has mixed through the air. It holds heat, so the climate meter climbs. One mine scoop is much smaller than this planet-wide change."
        : "Carbon dioxide dropped. Less of the Sun's heat stays in the air, so the climate meter eases down.");
    }
    if (Math.abs(p.rainNow - beforeRain) > 0.08 && !p.rainTold) {
      p.rainTold = 1;
      logs.push(p.rainNow > beforeRain
        ? "The cloud deck thickened. More rain reaches the land. Rivers and wetlands answer after the wet air has had a season or two to settle."
        : "The cloud deck thinned. Less rain reaches the land, so dry biomes can spread.");
    }
    applySea(state, logs);
    if (p.uplift > 0.4) {
      applyUplift(state, logs);
      p.uplift = Math.max(0, p.uplift - 0.7);
    }
  }

  function applySea(state, logs) {
    var level = state.planet.seaNow || 0;
    var flooded = 0;
    if (level <= 0.2) {
      state.cells.forEach(function (c) { if (!c.sea) c.flood = false; });
      return;
    }
    var open = [];
    var seen = new Array(N);
    for (var i = 0; i < N; i++) seen[i] = false;
    for (var s = 0; s < N; s++) {
      if (!state.cells[s].sea) continue;
      var sp = rc(s);
      neighbors(sp.c, sp.r, false).forEach(function (j) {
        var cell = state.cells[j];
        if (seen[j] || cell.sea || cell.lake) return;
        if (cell.e < level) { seen[j] = true; open.push(j); }
      });
    }
    while (open.length) {
      var j = open.pop();
      if (!state.cells[j].flood) flooded++;
      state.cells[j].flood = true;
      var p = rc(j);
      neighbors(p.c, p.r, false).forEach(function (k) {
        var cell = state.cells[k];
        if (seen[k] || cell.sea || cell.lake) return;
        if (cell.e < level) { seen[k] = true; open.push(k); }
      });
    }
    for (var u = 0; u < N; u++) {
      if (!state.cells[u].sea && !seen[u]) state.cells[u].flood = false;
    }
    if (flooded) {
      logs.push("Sea level crept inland and flooded " + flooded + " low place" + (flooded === 1 ? "" : "s") + ". Coasts change slowly. One rainy afternoon does not do this. The ocean did.");
    }
  }

  function applyUplift(state, logs) {
    var picks = 0;
    for (var i = 0; i < N && picks < 3; i++) {
      var cell = state.cells[i];
      if (cell.sea || cell.lake || cell.flood) continue;
      var p = rc(i);
      if (p.c < 2 || p.c > COLS - 3) continue;
      if ((i + state.year * 5) % 19 !== 0) continue;
      cell.e = Math.min(6, cell.e + 0.55);
      cell.volcano = 1;
      picks++;
    }
    if (!picks) {
      var best = -1;
      var bi = -1;
      state.cells.forEach(function (c, idx) {
        if (c.sea || c.lake) return;
        if (c.e > best) { best = c.e; bi = idx; }
      });
      if (bi >= 0) {
        state.cells[bi].e = Math.min(6, state.cells[bi].e + 0.55);
        state.cells[bi].volcano = 1;
        picks = 1;
      }
    }
    if (picks) {
      logs.push("The planet's core pushed rock upward. " + picks + " ridge" + (picks === 1 ? "" : "s") + " grew, and a volcano glowed. Mountains take many seasons to change the rain around them.");
    }
  }

  function undo(state) {
    if (!state.undo) return { ok: false, msg: "Nothing to undo." };
    state.cells = state.undo.cells;
    state.nations = state.undo.nations;
    state.undo = null;
    if (state.choices.length) state.choices.pop();
    refresh(state);
    return { ok: true, msg: "Undid the last change." };
  }

  function rollWeather(state) {
    var roll = rand(state);
    var rainMul = 1;
    var name = "An ordinary season";
    if (roll < 0.18) { rainMul = 0.62; name = "A dry season"; }
    else if (roll > 0.82) { rainMul = 1.38; name = "A wet, stormy season"; }
    var tempAdd = Math.round((rand(state) - 0.48) * 7);
    if (Math.abs(tempAdd) >= 3) name += tempAdd > 0 ? ", warmer than usual" : ", colder than usual";
    state.weather = { name: name, rainMul: rainMul, tempAdd: tempAdd };
  }

  function step(state) {
    state.year += 1;
    var logs = [];
    planetAdvance(state, logs);
    rollWeather(state);
    refresh(state);
    var mean = meanTemp(state);
    state.feel = state.feel == null ? mean : state.feel * 0.5 + mean * 0.5;
    var weatherLine = state.weather.name + ".";
    if (state.year === 1) weatherLine += teach(state, "weather") + " The biome map follows climate, the long pattern, so one storm does not repaint a desert into a forest.";
    logs.push(weatherLine);
    waterSentence(state, logs);
    updateMoisture(state, logs);
    landforms(state, logs);
    ecology(state, logs);
    resourceStep(state, logs);
    nationStep(state, logs);
    referBack(state, logs);
    var check = pickCheck(state);
    commitLogs(state, logs);
    if (check && !state.pending) state.pending = check;
    snapshot(state);
    state.undo = null;
    return { blocked: false, check: check };
  }

  function commitLogs(state, logs) {
    var seen = {};
    state.log.slice(-8).forEach(function (e) { seen[e.text.slice(0, 48)] = 1; });
    logs.forEach(function (t) {
      if (!t) return;
      var key = t.slice(0, 48);
      if (seen[key]) return;
      seen[key] = 1;
      state.log.push({ year: state.year, text: t });
    });
    if (state.log.length > 60) state.log = state.log.slice(-60);
  }

  function waterSentence(state, logs) {
    if (state.year % 4 !== 1 && state.view.stored < 30) return;
    var v = state.view;
    logs.push(
      "Water cycle: the Sun evaporated about " + r1(v.evap) + " units from oceans and lakes. Wind from the west carried moisture. Land rain was about " +
      r1(v.rainSum) + ". About " + r1(v.toOcean) + " ran back toward the ocean. Dams held about " + r1(v.stored) + "." +
      teach(state, "climate")
    );
  }

  function updateMoisture(state, logs) {
    var v = state.view;
    for (var i = 0; i < N; i++) {
      var cell = state.cells[i];
      if (cell.sea || cell.lake) { cell.moist = 92; continue; }
      var beside = nearLake(state, rc(i).c, rc(i).r);
      var target = clamp(v.rain[i] * 1.5 + (beside ? 46 : 0), 6, 100);
      cell.moist = clamp(cell.moist * 0.45 + target * 0.55, 0, 100);
      if (cell.dam) cell.moist = clamp(cell.moist + 12, 0, 100);
      if (cell.road) cell.moist = clamp(cell.moist - (beside || v.biome[i] === "wetland" ? 22 : 4), 0, 100);
      cell.pol = Math.max(0, cell.pol - 1.2);
    }
  }

  function landforms(state, logs) {
    var v = state.view;
    for (var i = 0; i < N; i++) {
      var cell = state.cells[i];
      var p = rc(i);
      if (cell.sea) continue;
      var down = v.down[i];
      var slope = down >= 0 ? cell.e - state.cells[down].e : 0;
      var dropsToSea = down >= 0 && state.cells[down].sea;
      if (!dropsToSea && v.river[i] && slope >= 0.2 && cell.lf !== "glacier" && cell.lf !== "uvalley" && countLf(state, "valley") + countLf(state, "canyon") < 6) {
        cell.cut += Math.min(7, v.pass[i] * 0.08);
        if (!cell.lf && cell.cut > 14) {
          cell.lf = "valley";
          noteLf(state, logs, "valley", p, "Running water cut a V-shaped valley at (" + p.c + ", " + p.r + "). That is erosion. The river picked up sediment and carried it downhill.");
        } else if (cell.lf === "valley" && cell.cut > 46) {
          cell.lf = "canyon";
          cell.e = Math.max(0, cell.e - 1);
          cell.cut = 16;
          noteLf(state, logs, "canyon", p, "Over many years the river deepened the valley into a canyon at (" + p.c + ", " + p.r + "). One season here stands for a long time, so you can see it. Real canyons take far longer than a class period.");
        }
      }
      var intoSea = down >= 0 && state.cells[down].sea;
      var touchesSea = neighbors(p.c, p.r, false).some(function (j) { return state.cells[j].sea; });
      var mouth = v.river[i] && ((intoSea && v.pass[i] > 36) || (touchesSea && v.inflow[i] > 36));
      if (cell.lf === "delta" || (mouth && countLf(state, "delta") < 4)) {
        var deposit = v.sedIn[i] || 0;
        cell.sed += deposit * 0.45;
        var trapped = v.dammedIn[i] > 40 && deposit < 28;
        if (trapped) cell.starve += 1; else cell.starve = Math.max(0, cell.starve - 1);
        if (cell.lf !== "delta" && cell.sed > 20 && cell.starve < 2) {
          cell.lf = "delta";
          noteLf(state, logs, "delta", p, "The river slowed at the sea and dropped sediment at (" + p.c + ", " + p.r + "). That deposition is building a delta, new land at the mouth.");
        }
        if (cell.lf === "delta" && cell.starve >= 3) {
          cell.lf = "";
          cell.sed = 4;
          logs.push("The delta at (" + p.c + ", " + p.r + ") shrank. A dam upstream trapped the sediment, so deposition almost stopped. This showed up late, not the same season you built the dam.");
          state.lastLf = { type: "delta-lost", c: p.c, r: p.r, year: state.year };
        }
        if (cell.lf === "delta" && cell.sed > 48 && state.year >= 5 && !cell.rock) {
          cell.rock = true;
          logs.push("At (" + p.c + ", " + p.r + ") layers of sediment were pressed and cemented into sedimentary rock. Fossil fuels such as coal can form when ancient wetland plants are buried in layers like these. That takes a very long time." + teach(state, "sedimentary"));
          state.lastLf = { type: "rock", c: p.c, r: p.r, year: state.year };
        }
      }
      if (v.biome[i] === "desert" && v.climR[i] < 14 && cell.use !== "forest" && cell.e < 4) cell.dry += 1;
      else cell.dry = Math.max(0, cell.dry - 1);
      if (cell.lf === "dune" && state.year % 3 === 0) {
        var nc = p.c + 1;
        if (inside(nc, p.r) && !state.cells[idx(nc, p.r)].sea && state.view.biome[idx(nc, p.r)] === "desert") {
          cell.lf = "";
          state.cells[idx(nc, p.r)].lf = "dune";
          logs.push("The dune migrated east to (" + nc + ", " + p.r + "). Wind kept pushing the sand.");
        }
      }
      if (v.climT[i] < -6 && cell.e >= 5) cell.cold += 1; else cell.cold = Math.max(0, cell.cold - 1);
      if (cell.cold >= 2 && cell.lf !== "glacier" && cell.lf !== "uvalley" && countLf(state, "glacier") < 6) {
        cell.lf = "glacier";
        noteLf(state, logs, "glacier", p, "Snow lasted and became a glacier at (" + p.c + ", " + p.r + "). Ice can carve rock. The U-shape often shows up after the ice melts.");
      }
      if (cell.lf === "glacier" && v.climT[i] > 1) cell.warm += 1; else if (cell.lf === "glacier") cell.warm = 0;
      if (cell.lf === "glacier" && cell.warm >= 2) {
        cell.lf = "uvalley";
        cell.e = Math.max(0, cell.e - 1);
        cell.moist = 100;
        if (down >= 0) state.cells[down].moist = Math.min(100, state.cells[down].moist + 35);
        noteLf(state, logs, "uvalley", p, "The glacier melted and left a U-shaped valley at (" + p.c + ", " + p.r + "). Positive: meltwater filled streams. Negative: cold-adapted animals lose their ice, and a rush of water can wash soil away.");
      }
    }
    sproutDune(state, logs);
  }

  function countLf(state, type) {
    var n = 0;
    state.cells.forEach(function (c) { if (c.lf === type) n++; });
    return n;
  }

  function sproutDune(state, logs) {
    if (countLf(state, "dune") >= 4) return;
    var best = -1;
    var bestDry = 3;
    for (var i = 0; i < N; i++) {
      var cell = state.cells[i];
      if (cell.lf || cell.sea || cell.e >= 4) continue;
      if (state.view.biome[i] !== "desert") continue;
      if (cell.dry > bestDry) { bestDry = cell.dry; best = i; }
    }
    if (best < 0) return;
    state.cells[best].lf = "dune";
    noteLf(state, logs, "dune", rc(best), "Wind piled sand into a dune at (" + rc(best).c + ", " + rc(best).r + "). Wind is the agent. A dry climate gave it loose sand. One dune can migrate later. The whole desert does not become dunes at once.");
  }

  function noteLf(state, logs, type, p, text) {
    logs.push(text + teach(state, type === "delta" ? "deposition" : "erosion") + teach(state, "sediment"));
    state.lastLf = { type: type, c: p.c, r: p.r, year: state.year };
  }

  function countLife(state) {
    var roles = { producer: 0, herbivore: 0, carnivore: 0, apex: 0, decomposer: 0, dragon: 0, mismatch: 0 };
    state.cells.forEach(function (cell, i) {
      cell.life.forEach(function (life) {
        var org = ORG[life.id];
        if (!org) return;
        var fit = orgFits(org, state.view.biome[i], state.view.climT[i]) || life.justified;
        if (!orgFits(org, state.view.biome[i], state.view.climT[i])) roles.mismatch++;
        if (!fit) return;
        roles[org.role] = (roles[org.role] || 0) + 1;
        if (org.id === "dragon") roles.dragon++;
      });
    });
    return roles;
  }

  function ecology(state, logs) {
    var npp = productivity(state);
    var roles = countLife(state);
    var pasturesNow = countUse(state, "pasture");
    var plantK = Math.max(180, npp.land * 3.35);
    if (pasturesNow >= 4) plantK *= Math.max(0.35, 1 - (pasturesNow - 3) * 0.12);
    state.plants = Math.max(40, state.plants + state.plants * 0.28 * (1 - state.plants / plantK));
    var herbK = Math.max(12, state.plants * 0.078);
    if (pasturesNow >= 5) herbK *= 0.42;
    var beforeH = state.herb;
    state.herb = Math.max(0, state.herb + state.herb * 0.2 * (1 - state.herb / herbK));
    if (pasturesNow >= 5 && state.year > 1) {
      state.plants = Math.max(30, state.plants * 0.9);
      if (state.herb > herbK * 1.05) state.herb *= 0.62;
    }
    var gained = Math.min(state.plants * 0.08, state.herb * 0.4) * 0.1;
    if (beforeH - state.herb > Math.max(6, beforeH * 0.25)) {
      logs.push("Herbivores dropped from about " + r1(beforeH) + " to " + r1(state.herb) + ". They ate producers faster than the plants grew, so energy ran short. About one tenth of eaten plant energy can become herbivore energy. The rest leaves as heat and waste." + teach(state, "food web"));
    }
    var carnK = Math.max(2, state.herb * 0.075 + roles.carnivore);
    var beforeC = state.carn;
    state.carn = Math.max(0, state.carn + state.carn * 0.18 * (1 - state.carn / carnK));
    if (beforeC - state.carn > Math.max(2, beforeC * 0.3) && beforeH - state.herb > 4) {
      logs.push("Carnivores fell from about " + r1(beforeC) + " to " + r1(state.carn) + " a season after their prey thinned. Energy reaches them only through the animals they eat.");
    }
    var dams = countDams(state);
    var fishK = Math.max(4, npp.water * 0.5);
    if (dams) fishK *= Math.max(0.35, 1 - dams * 0.2);
    var beforeF = state.fish;
    state.fish = Math.max(0, state.fish + state.fish * 0.16 * (1 - state.fish / fishK));
    if (dams && beforeF - state.fish > 2) {
      logs.push("Fish fell from about " + r1(beforeF) + " to " + r1(state.fish) + ". Dams block paths fish inherit: many swim upstream to lay eggs. Fewer young means fewer fish later, not always the same season.");
    }
    if (roles.dragon) {
      var need = roles.dragon * 28;
      if (state.herb + state.carn < need) {
        removeOne(state, "dragon");
        logs.push("Ember flew off to hunt somewhere else. No one was hurt. A dragon is a story apex predator. Apex means the top of the food web. So little energy reaches the top that Ember needed more prey than this land could give. The chain still starts at the Sun.");
      } else {
        state.herb *= 0.78;
        state.carn *= 0.75;
        logs.push("Ember hunted. Positive: the story has a great predator. Negative: herbivores and carnivores both dropped, because an apex predator needs a huge food web under it.");
      }
    }
    struggleLife(state, logs);
    var dead = state.herb * 0.04 + state.carn * 0.04 + Math.max(0, npp.land * 0.05);
    state.decomp = dead * 0.45 + roles.decomposer * 1.5;
    var soilAdd = state.decomp * 0.015;
    var pastures = countUse(state, "pasture");
    var pressure = state.herb / Math.max(1, state.plants);
    state.cells.forEach(function (cell, i) {
      if (cell.sea) return;
      if (cell.use === "forest" || state.view.biome[i] === "forest" || cell.use === "wild") cell.soil = clamp(cell.soil + soilAdd, 5, 100);
      if (cell.use === "pasture" && pastures >= 4) {
        cell.soil = clamp(cell.soil - 4, 8, 100);
      }
      if (cell.road && state.view.biome[i] === "wetland") cell.soil = clamp(cell.soil - 2, 5, 100);
      if (cell.use === "mine") cell.soil = clamp(cell.soil - 1.5, 5, 100);
    });
    if (pastures >= 5 || (pressure > 0.16 && pastures >= 4)) {
      state.heard.overgraze = (state.heard.overgraze || 0) + 1;
      if (state.heard.overgraze === 1) {
        logs.push("Too many grazers. Positive: people can eat meat and pasture animals for a while. Negative: grass and soil drop. Carnivores may crash a season later, when their prey is gone. That delay is easy to miss.");
      }
    }
    if (state.year % 4 === 1 || beforeH - state.herb > 6) {
      logs.push("Energy: sunlight built about " + r1(npp.land) + " producer units on land and " + r1(npp.water) + " in water. Herbivores took in about " + r1(gained) + " of that (close to a tenth of what they ate). Decomposers returned about " + r1(state.decomp) + " nutrient units toward the soil." + teach(state, "producer") + teach(state, "decomposer"));
    }
  }

  function scoopCell(state, cell) {
    if (cell.coal > 0) {
      var take = Math.min(6, cell.coal);
      cell.coal -= take;
      state.co2 += take * 0.18;
      cell.pol = Math.min(100, cell.pol + 8);
      state.heard.mined = (state.heard.mined || 0) + 1;
      return "First scoop: " + r1(take) + " coal. It does not regrow. The air warms a little, over many seasons, not all at once.";
    }
    if (cell.ore > 0) {
      var ore = Math.min(2.4, cell.ore);
      cell.ore -= ore;
      cell.pol = Math.min(100, cell.pol + 5);
      return "First scoop: " + r1(ore) + " ore. Metal ore does not regrow.";
    }
    return "The seam is already empty.";
  }

  function struggleLife(state, logs) {
    state.cells.forEach(function (cell, i) {
      var keep = [];
      cell.life.forEach(function (life) {
        var org = ORG[life.id];
        if (!org) return;
        var fit = orgFits(org, state.view.biome[i], state.view.climT[i]);
        if (fit || life.justified) {
          life.stress = 0;
          keep.push(life);
          return;
        }
        life.stress += 1;
        if (life.stress >= 2) {
          var p = rc(i);
          logs.push(org.name + " left (" + p.c + ", " + p.r + "). The " + state.view.biome[i] + " biome did not match its structures. You can place it again where the climate fits, or keep it and write why.");
        } else keep.push(life);
      });
      cell.life = keep;
    });
  }

  function removeOne(state, id) {
    for (var i = 0; i < N; i++) {
      var k = state.cells[i].life.findIndex(function (l) { return l.id === id; });
      if (k >= 0) { state.cells[i].life.splice(k, 1); return; }
    }
  }

  function countUse(state, use) {
    var n = 0;
    state.cells.forEach(function (c) { if (c.use === use) n++; });
    return n;
  }
  function countDams(state) {
    var n = 0;
    state.cells.forEach(function (c) { if (c.dam) n++; });
    return n;
  }

  function resourceStep(state, logs) {
    var timberGrow = 0;
    var coalTake = 0;
    var oreTake = 0;
    var polAdd = 0;
    state.cells.forEach(function (cell, i) {
      var b = state.view.biome[i];
      if ((cell.use === "forest" || b === "forest") && cell.soil > 35 && !cell.sea) timberGrow += cell.use === "forest" ? 2.2 : 1;
      if (cell.use === "mine") {
        if (cell.coal > 0) {
          var take = Math.min(6, cell.coal);
          cell.coal -= take;
          coalTake += take;
          state.co2 += take * 0.18;
          cell.pol = Math.min(100, cell.pol + 8);
          polAdd += 8;
          neighbors(rc(i).c, rc(i).r, false).forEach(function (j) {
            state.cells[j].pol = Math.min(100, state.cells[j].pol + 2);
          });
        } else if (cell.ore > 0) {
          var ore = Math.min(2.4, cell.ore);
          cell.ore -= ore;
          oreTake += ore;
          cell.pol = Math.min(100, cell.pol + 5);
        } else if (!cell.spent) {
          cell.spent = 1;
          var p = rc(i);
          logs.push("The mine at (" + p.c + ", " + p.r + ") is empty. Coal and ore do not grow back. The heat already added stays in the climate for a while.");
        }
      }
      if (cell.use === "solar") cell.pol = Math.max(0, cell.pol - 1);
    });
    var elders = state.nations.some(function (n) { return n.gov === "elders"; });
    if (elders) timberGrow *= 0.65;
    state.timber = Math.max(0, state.timber * 0.82 + timberGrow);
    var coalLeft = 0, oreLeft = 0;
    state.cells.forEach(function (c) { coalLeft += c.coal; oreLeft += c.ore; });
    if (coalTake > 0) {
      logs.push("Mines burned or dug about " + r1(coalTake) + " coal. Coal left in the ground: " + r1(coalLeft) + ". It did not regrow. Wood this season: about " + r1(timberGrow) + ", and forests can grow again if soil and rain hold. Coal is nonrenewable. Managed forest can be renewable." + teach(state, "renewable"));
      state.heard.mined = (state.heard.mined || 0) + 1;
    } else if (timberGrow > 0 && state.year === 1) {
      logs.push("Trees added about " + r1(timberGrow) + " wood. No coal was used, so the climate did not get an extra push from fossil fuel.");
    }
    if (oreTake > 0) logs.push("Ore dug: about " + r1(oreTake) + ". Ore left: " + r1(oreLeft) + ". Metal ore is nonrenewable.");
    var t = meanTemp(state);
    if (state.startT != null && t - state.startT >= 1.15 && !state.heard.warm) {
      state.heard.warm = 1;
      state.warmed = t - state.startT;
      logs.push("The climate is about " + (t - state.startT).toFixed(1) + "° warmer than when you began. Positive: a cold northern edge may grow more grass, so some farms can gain a longer season. Negative: wetlands can dry, deserts can spread, and animals inherited for the old climate will struggle. One hot afternoon did not do this. The usual pattern did." + teach(state, "climate"));
    }
    state.water = Math.max(0, state.view.stored * 0.35 + state.view.rainSum * 0.25 + (countUse(state, "water") || 0));
    state.goodsBuff = coalTake * 1.4 + oreTake + countUse(state, "solar") * 1.3 + Math.min(8, timberGrow * 0.3);
    if (polAdd > 20) logs.push("Pollution spread near the mines. Producers nearby make less food. People may gain goods and lose clean water and healthy soil. Both effects count.");
  }

  function nationStep(state, logs) {
    var v = state.view;
    var linked = roadLinks(state);
    state.nations.forEach(function (n) {
      var grown = 0;
      var rural = 0, urban = 0, suburban = 0;
      for (var i = 0; i < N; i++) {
        if (v.owner[i] !== n.id) continue;
        var cell = state.cells[i];
        if (cell.use === "farm") {
          rural++;
          var ok = v.climR[i] > 15 && v.climT[i] > 3 && v.climT[i] < 34 && cell.soil > 28 && cell.moist > 22;
          var crop = ok ? 7.2 * (cell.soil / 75) * (state.weather.rainMul < 0.7 ? 0.55 : 1) : 1.1;
          if (cell.lake || v.river[i]) crop += 1.4;
          grown += crop;
        }
        if (cell.use === "pasture") { rural++; grown += Math.max(0.4, state.herb * 0.01); }
        if (cell.use === "forest") rural++;
        if (cell.use === "town") urban++;
        if (cell.use === "suburb") suburban++;
      }
      if (urban > 0) { /* capital counts */ }
      n.rural = rural; n.urban = urban; n.suburban = suburban;
      var fishShare = 0;
      if (nationHasWater(state, n)) fishShare = state.fish * 0.035;
      var hunt = Math.min(3.5, state.herb * 0.012);
      var eat = n.people * 0.085;
      n.food = clamp(n.food * 0.55 + grown + fishShare + hunt - eat, 0, 400);
      var goods = 0;
      for (var g = 0; g < N; g++) {
        if (v.owner[g] !== n.id) continue;
        var u = state.cells[g];
        if (u.use === "mine") goods += u.coal > 0 || u.ore > 0 ? 3.2 : 0.4;
        if (u.use === "solar") goods += 1.6;
        if (u.use === "town") goods += 0.4;
      }
      if (n.gov === "monarch") goods += 1.1;
      if (n.gov === "elders") goods *= 0.85;
      n.goods = clamp(n.goods * 0.7 + goods, 0, 300);
      var hadWater = nationHasWater(state, n);
      if (!hadWater) {
        n.unrest = clamp(n.unrest + 7, 0, 100);
        n.people = Math.max(12, n.people * 0.96);
        if (!state.heard["drylog" + n.id]) {
          state.heard["drylog" + n.id] = 1;
          logs.push(n.name + " is short of fresh water. Settlement often follows water. Positive: the dry land may still hold ore or open space. Negative: people and crops struggle, and some families move away. No one is hurt. They leave to look for water.");
        }
      }
      if (n.food < n.people * 0.15) {
        n.unrest = clamp(n.unrest + (n.gov === "monarch" ? 8 : 5), 0, 100);
        var beforeP = n.people;
        n.people = Math.max(12, n.people * 0.95);
        if (beforeP - n.people > 2) logs.push(n.name + " lost people, from about " + r1(beforeP) + " to " + r1(n.people) + ", because food ran low. They moved away. Farms, fish, and trade can bring them back.");
      } else if (n.food > 20) {
        n.people = Math.min(420, n.people * (n.gov === "republic" ? 1.035 : 1.028) + 0.6);
        n.unrest = clamp(n.unrest - (n.gov === "republic" ? 4 : 2), 0, 100);
      }
      n.pattern = patternName(n);
    });
    if (linked.length && state.nations.length >= 2) {
      linked.forEach(function (pair) {
        var a = nationById(state, pair[0]);
        var b = nationById(state, pair[1]);
        if (!a || !b) return;
        var foodMove = Math.min(8, a.food * 0.08, Math.max(0, 30 - b.food));
        if (a.food > b.food) { a.food -= foodMove; b.food += foodMove * (a.gov === "council" || b.gov === "council" ? 0.95 : 0.8); }
        var goodMove = Math.min(4, Math.abs(a.goods - b.goods) * 0.15);
        if (a.goods > b.goods) { a.goods -= goodMove; b.goods += goodMove; }
        var wetRoad = false;
        state.cells.forEach(function (cell, i) {
          if (cell.road && state.view.biome[i] === "wetland") wetRoad = true;
        });
        if (!state.heard["trade" + pair[0] + pair[1] + state.year]) {
          state.heard.traded = (state.heard.traded || 0) + 1;
          logs.push("Trade moved between " + a.name + " and " + b.name + " along the road. Positive: food and goods even out, so a dry town can eat. Negative: " + (wetRoad ? "the road crosses wetland, so moisture and heron habitat drop." : "a road also brings pollution and splits some animal paths.") + teach(state, "trade"));
        }
      });
    } else if (countDams(state) && state.nations.length >= 2 && state.scenario === "river") {
      if (!state.heard.damtrade) {
        state.heard.damtrade = 1;
        logs.push("Trade boats between the towns are fewer. The dam interrupts the river path. Upstream may keep more water for farms. Downstream may lose fish, sediment, and easy trade. Both effects are real.");
      }
    }
    if (countDams(state) && state.year >= 4 && !state.heard.nodelta) {
      var hasDelta = state.cells.some(function (c) { return c.lf === "delta"; });
      if (!hasDelta && state.cells.some(function (c) { return c.sea; })) {
        state.heard.nodelta = 1;
        logs.push("No delta is growing at the coast. Deltas need sediment, and the dam is holding that mud upstream. Positive: stored water can help nearby farms. Negative: the river mouth is not building new land.");
      }
    }
    var people = 0;
    state.nations.forEach(function (n) { people += n.people; });
    var prevPeople = state.history.length ? state.history[state.history.length - 1].people : people;
    if (state.year % 4 === 0 || Math.abs(people - prevPeople) > 8) {
      logs.push("Nations now hold about " + r1(people) + " people. " + state.nations.map(function (n) {
        return n.name + ": " + r1(n.people) + " people, food " + r1(n.food) + ", goods " + r1(n.goods) + ", " + (n.pattern || "a new settlement");
      }).join(". ") + ".");
    }
  }

  function patternName(n) {
    var r = n.rural || 0, u = n.urban || 0, s = n.suburban || 0;
    if (u >= r && u >= s && u > 0) return "mostly urban";
    if (s >= r && s > 0) return "mostly suburban";
    if (r > 0) return "mostly rural";
    return "a small settlement";
  }

  function nationById(state, id) {
    return state.nations.filter(function (n) { return n.id === id; })[0] || null;
  }

  function roadLinks(state) {
    var towns = [];
    state.nations.forEach(function (n) { towns.push({ id: n.id, i: idx(n.capital.c, n.capital.r) }); });
    for (var i = 0; i < N; i++) if (state.cells[i].use === "town") {
      var own = state.view.owner[i];
      if (own) towns.push({ id: own, i: i });
    }
    var pairs = [];
    var seen = {};
    for (var a = 0; a < towns.length; a++) {
      for (var b = a + 1; b < towns.length; b++) {
        if (towns[a].id === towns[b].id) continue;
        var key = [towns[a].id, towns[b].id].sort().join("-");
        if (seen[key]) continue;
        if (connected(state, towns[a].i, towns[b].i)) { seen[key] = 1; pairs.push([towns[a].id, towns[b].id]); }
      }
    }
    return pairs;
  }

  function connected(state, a, b) {
    var q = [a];
    var seen = {};
    seen[a] = 1;
    var guard = 0;
    while (q.length && guard < 400) {
      guard++;
      var i = q.shift();
      if (i === b) return true;
      var p = rc(i);
      neighbors(p.c, p.r, false).forEach(function (j) {
        if (seen[j]) return;
        var cell = state.cells[j];
        if (cell.road || cell.use === "town" || cell.use === "suburb" || j === b) {
          seen[j] = 1;
          q.push(j);
        }
      });
    }
    return false;
  }

  function referBack(state, logs) {
    var dams = [];
    state.cells.forEach(function (cell, i) { if (cell.dam) dams.push(rc(i)); });
    if (dams.length && state.year >= 3 && state.lastLf && state.lastLf.type === "delta-lost" && state.year === state.lastLf.year) {
      logs.push("Look back: you placed a dam at (" + dams[0].c + ", " + dams[0].r + ") in an earlier season. The delta changed later because sediment was trapped. The river did not forget.");
    }
    var mines = state.choices.filter(function (ch) { return ch.tool === "mine"; });
    if (mines.length && state.heard.warm && !state.heard.warmRef) {
      state.heard.warmRef = 1;
      logs.push("Look back: mining started around season " + mines[0].year + " at (" + mines[0].c + ", " + mines[0].r + "). The warmer climate now is tied to burning that fossil fuel, not to a single hot day.");
    }
  }

  function pickCheck(state) {
    if (state.pending) return null;
    if (state.year < 3) return null;
    if (state.lastCheckYear && state.year - state.lastCheckYear < 4) return null;
    var check = triggeredCheck(state) || curriculumCheck(state);
    if (check) state.lastCheckYear = state.year;
    return check;
  }

  function triggeredCheck(state) {
    if (state.heard.mined && !state.checks.fossil) return checkFossil(state);
    if ((state.heard.overgraze || 0) >= 1 && !state.checks.grazers) return checkGrazers(state);
    if (state.heard.warm && !state.checks.warm) return checkWarm(state);
    if (state.heard.traded && !state.checks.road) return checkRoad(state);
    if (state.lastLf && !state.checks["lf-" + state.lastLf.type]) return checkLandform(state);
    if ((countDams(state) || state.choices.some(function (c) { return c.tool === "capital" || c.tool === "dam" || c.tool === "road" || c.tool === "mine"; })) && !state.checks.adapt) return checkAdapt(state);
    return null;
  }

  function curriculumCheck(state) {
    var y = state.year;
    if (!state.checks.water) return checkWater(state);
    if (!state.checks.weather) return checkWeather(state);
    if (!state.checks.day) return checkDay();
    if (y >= 4 && state.nations.length && !state.checks.regions) return checkRegions(state);
    if (hasSettlementMix(state) && !state.checks.settle) return checkSettle(state);
    if (placedAnimal(state) && !state.checks.structure) return checkStructure(state);
    if (placedAnimal(state) && !state.checks.learn) return checkLearn(state);
    return null;
  }

  function baseCheck(id, standard, title, prompt, choices) {
    return { id: id, standard: standard, title: title, prompt: prompt, choices: choices, ask: "Write one sentence about why you think so. Your teacher reads it. This moment is not a grade." };
  }

  function checkWater(state) {
    var v = state.view;
    return baseCheck("water", "Science · water cycle", "Where the water went",
      "Nimbus, a cloud who likes careful maps, speaks up. This season the Sun evaporated about " + r1(v.evap) + " units. Land rain was about " + r1(v.rainSum) + ". About " + r1(v.toOcean) + " ran toward the ocean. Dams held about " + r1(v.stored) + ". What is the water cycle here?",
      [
        { id: "loop", text: "The Sun lifts water, wind moves it, rain falls, and rivers carry much of it back.", note: "Yes. That loop is the water cycle. The Sun and the ocean do most of the heavy lifting. Soil and dams hold some water for a while, so the numbers are not a perfect circle." },
        { id: "new", text: "Rain is brand-new water made inside clouds. It is not the ocean's water.", note: "Here is another way to see it. The water in rain was already on Earth. Evaporation lifted it from oceans, lakes, and wet soil. Clouds are not a factory for new water." },
        { id: "stuck", text: "Rivers start in hills and the water stays there forever.", note: "Rivers do start higher up, where rain and snow collect. They usually keep moving. Deposition happens when they slow down, often at a lake or the sea." },
      ]);
  }

  function checkWeather(state) {
    var dry = driest(state);
    return baseCheck("weather", "Science · weather and climate", "A storm is not a climate",
      "This season's weather: " + state.weather.name + " (rain factor " + state.weather.rainMul + ", temperature shift " + state.weather.tempAdd + "°). At (" + dry.c + ", " + dry.r + ") the climate is still about " + r1(dry.t) + "° and " + r1(dry.rain) + " rain, biome " + dry.biome + ". How can today's sky and the climate disagree?",
      [
        { id: "both", text: "Weather is one season. Climate is the pattern over many years. A dry biome can still have a wet season.", note: "That is the distinction. Biomes follow climate. One storm does not rewrite them. Watch the climate numbers, not only this season's weather." },
        { id: "same", text: "If it rained, the climate turned rainy. The words mean the same thing.", note: "People mix these up. Weather can surprise you for a season. Climate is the usual pattern. A desert climate can have a rainy week and still be a desert." },
        { id: "temp", text: "Climate is only temperature. Rain is always weather.", note: "Climate includes the usual rain, the usual temperature, and the usual seasons. Rain is part of both a single storm and the long pattern." },
      ]);
  }

  function checkDay() {
    return baseCheck("day", "Science · day and night", "Who is moving?",
      "Pebble rolls over to the sun dial. Shadows grow long, short, then long again as you spin the day. Earth rotates once about every 24 hours. What is really going on?",
      [
        { id: "spin", text: "Earth spins. The Sun lights one half. We turn into the light, then out of it, so we get day and night.", note: "Yes. The Sun is not racing around Earth each day. Our spot on Earth turns. Shadow length changes because the light hits a stick at a new angle." },
        { id: "sun", text: "The Sun travels around Earth once each day.", note: "It can look that way from the ground. The simpler fact is that Earth rotates. The lit half has day. The dark half has night." },
        { id: "stick", text: "Shadows change because the stick grows and shrinks.", note: "The stick stays the same size. The angle of the sunlight changes as Earth rotates, so the shadow stretches and shortens." },
      ]);
  }

  function checkLandform(state) {
    var lf = state.lastLf;
    var info = {
      valley: ["a V-shaped valley", "Running water cut down into the rock. That is erosion by water."],
      canyon: ["a canyon", "The river kept eroding until the valley was deep and steep. Water did this, over a long time."],
      delta: ["a delta", "The river slowed and deposition dropped sediment. Deltas build land at the mouth."],
      "delta-lost": ["a shrinking delta", "The dam trapped sediment, so deposition downstream failed. The landform changed because people modified the river."],
      dune: ["a sand dune", "Wind eroded loose sand and deposited it in a pile. The agent is wind, not a river."],
      glacier: ["a glacier", "Snow packed into ice. Ice can erode rock underneath it."],
      uvalley: ["a U-shaped valley", "Ice carved a wide valley. When the glacier melted, the U shape stayed. The ice can be gone and the landform remains."],
      rock: ["sedimentary layers", "Sediment was pressed and cemented into sedimentary rock. Coal is related: ancient plants buried in such layers."],
    }[lf.type] || ["a landform", "Wind, water, or ice changed the surface."];
    return baseCheck("lf-" + lf.type, "Science · landforms", "How " + info[0] + " formed",
      "At (" + lf.c + ", " + lf.r + ") the map now shows " + info[0] + ". " + info[1] + " What is the best science story?",
      [
        { id: "agent", text: info[1], note: "That matches what the map did. Name the agent (water, wind, or ice) and the process (erosion or deposition) when you talk to your teacher." },
        { id: "fast", text: "People dug this shape in one season with shovels, so it is not a natural landform.", note: "People do modify land. This shape, though, came from the water, wind, or ice rules on your map. Check the log for the season it appeared." },
        { id: "magic", text: "Landforms appear at random and have no cause.", note: "They can surprise you because they are slow. They still have a cause. Look uphill for a river, or upwind for a dune." },
      ]);
  }

  function checkFossil(state) {
    var coal = 0;
    state.cells.forEach(function (c) { coal += c.coal; });
    return baseCheck("fossil", "Science · fossil fuels and resources", "Old sunlight in the rock",
      "You mined coal. About " + r1(coal) + " is left in the ground. Wood can grow back this game. Coal does not. How should we talk about it?",
      [
        { id: "non", text: "Coal is nonrenewable. Ancient plants stored sunlight, then layers of sediment buried them. We cannot wait for new coal.", note: "Yes. That is a fossil fuel inside sedimentary rock. Trees you replant can be renewable. The Sun itself is renewable. Coal is not, on a human clock." },
        { id: "ren", text: "Coal is renewable because rocks grow back as fast as trees.", note: "Rocks do form, but the coal in this world will not return before the nations need energy. Call it nonrenewable. Wood, sun, wind, and cared-for soil can be renewable." },
        { id: "sunmine", text: "The mine makes new coal each season from sunlight.", note: "Solar collectors use today's sunlight. A coal mine digs up ancient stored energy. Once that seam is gone, the mine cannot invent more." },
      ]);
  }

  function checkGrazers(state) {
    return baseCheck("grazers", "Science · human impact and food webs", "Too many grazers",
      "Herbivores are about " + r1(state.herb) + " and producer energy is about " + r1(state.plants) + ". Pastures and herds changed the grassland. What should you expect next?",
      [
        { id: "lag", text: "Food may rise for people at first, then soil and plants fall, then carnivores drop a season later.", note: "That lag is the tricky part. Positive now, negative later. Decomposers can rebuild soil only if something is still growing." },
        { id: "fine", text: "More grazers always mean a healthier food web, with no limit.", note: "Grazers need producers. If they eat plants faster than sunlight can rebuild them, the web thins from the bottom up." },
        { id: "carn", text: "Carnivores eat sunlight directly, so the grass does not matter.", note: "Carnivores get energy from prey. Prey got it from plants. Plants got it from the Sun. Remove the plants and the whole web feels it." },
      ]);
  }

  function checkRoad(state) {
    return baseCheck("road", "Social studies · modifying the environment", "The road's two effects",
      "A road linked nations, so trade started. Some of that road may cross living habitat. What is the fair way to describe it?",
      [
        { id: "both", text: "Positive: people and food can move. Negative: a wetland or habitat can dry, split, or get polluted.", note: "Hold both ideas. Human-environment geography is full of tradeoffs. There is not one right road." },
        { id: "onlygood", text: "Roads only help. Wetlands do not matter if people can shop.", note: "Trade is a real good. Wetlands also clean water, slow floods, and feed herons and fish. Losing them has a cost." },
        { id: "onlybad", text: "Any road is only harm. Nations should never connect.", note: "Connection can keep a dry town fed. The science question is where the road goes and what it modifies." },
      ]);
  }

  function checkWarm(state) {
    return baseCheck("warm", "Science · climate change and human impact", "The pattern shifted",
      "Mean climate is about " + state.warmed.toFixed(1) + "° warmer than season 0, after coal was burned. What can change?",
      [
        { id: "both", text: "A cold edge might grow more food. Deserts and dry wetlands can spread, and cold-adapted animals can lose their biome.", note: "Name both. Climate change is a shift in the long pattern. It hits the food web and the nations that farm the old pattern." },
        { id: "weather", text: "It was just a hot season of weather, so biomes cannot change.", note: "A hot season is weather. Your climate average moved after several seasons of fossil fuel use. Biomes follow that average." },
        { id: "none", text: "Coal only makes goods. It cannot touch temperature.", note: "Burning fossil fuel added greenhouse heat in this model. Goods went up. Temperature did too. Watch the chart." },
      ]);
  }

  function checkRegions(state) {
    var phys = physicalRegions(state);
    var human = humanRegions(state);
    return baseCheck("regions", "Social studies · regions", "Two kinds of regions",
      "Physical regions on your map include " + phys + ". Human regions include " + human + ". What is the difference?",
      [
        { id: "both", text: "A physical region shares land or climate, like a desert or a mountain chain. A human region shares how people live, like a farm belt or a capital city.", note: "Yes. Your map has both at once. Dust and rain do not stop at a nation's capital, and a capital is not a biome." },
        { id: "lines", text: "Regions are only the outlines of nations.", note: "Nations are human regions. The mountain ridge is still a physical region even if two nations share it." },
        { id: "same", text: "A city and a glacier are the same kind of region.", note: "Both are regions, but not the same kind. One is built by people. One is land and climate." },
      ]);
  }

  function checkSettle(state) {
    return baseCheck("settle", "Social studies · settlement patterns", "Rural, urban, suburban",
      settlementSentence(state) + " Which pattern is which?",
      [
        { id: "defs", text: "Rural is farms and open land. Urban is the close-built town and capital. Suburban is houses and yards in between.", note: "That is the pattern language. People settle where water, food, and trade let them. They also change those places." + teach(state, "rural") },
        { id: "allcity", text: "Every building is urban, even a lone farm.", note: "A lone farm is rural. Urban means the dense city pattern. Suburban sits between them." },
        { id: "random", text: "People settle at random and ignore water.", note: "Look at your capitals. Settlement usually follows water, flat farmland, coasts, or trade routes. A dry capital has to adapt or struggle." },
      ]);
  }

  function checkAdapt(state) {
    return baseCheck("adapt", "Social studies · adapt and modify", "Change the plan, or change the land",
      "You have been changing this world. Some choices move people toward what the land offers. Some choices rebuild the land. Which sentence is the clearest?",
      [
        { id: "both", text: "Adapting means fitting the plan to the place, like moving a capital toward water. Modifying means changing the place, like a dam, mine, or road. Both have good and bad effects.", note: "Keep that pair of words. Your log is the evidence of what those choices did later." },
        { id: "only", text: "People only adapt. They never really change the land.", note: "Dams, mines, roads, and raised ridges are modifications. The delta and the pollution are consequences." },
        { id: "noresult", text: "Changing land has no consequence if the nation wants it.", note: "Wants are real. Rivers, soil, and climate still respond. Look at the seasons after the choice, not only the season you clicked." },
      ]);
  }

  function checkStructure(state) {
    var found = placedAnimal(state);
    var org = ORG[found.id];
    return baseCheck("structure", "Science · structures and functions", "Built for a job",
      org.name + " lives at (" + found.c + ", " + found.r + "). It has " + org.structure + ". The function is to " + org.func + ". What is the science idea?",
      [
        { id: "sf", text: "A structure is a body part. Its function is the job that helps the organism survive in this kind of place.", note: "Yes. " + org.inherit + " If the biome changes, that same structure can become a problem." },
        { id: "wish", text: "Animals survive anywhere by wanting to. Body parts do not matter.", note: "Wanting does not cool a polar bear in a desert. Structures and the abiotic climate have to fit, or the animal struggles." },
        { id: "learnall", text: "Every structure is learned by practice after birth.", note: "A beak, a hoof, or a hollow stem is inherited. Some behaviors are learned on top of those structures." },
      ]);
  }

  function checkLearn(state) {
    var found = placedAnimal(state);
    var org = ORG[found.id];
    return baseCheck("learn", "Science · inherited and learned", "Born with it, or practiced?",
      "Think about " + org.name + ". " + org.inherit + " " + org.learned + " Which sorting is right?",
      [
        { id: "sort", text: "Inherited traits come from parents and are not taught. Learned behavior is practiced, like a trail or a hunting trick.", note: "Good sorting. Say one inherited example and one learned example when you explain your world." },
        { id: "allin", text: "Everything, including trails and tricks, is inherited. Animals never learn.", note: "Body plans are inherited. A particular trail, shade bush, or improved strike can be learned." },
        { id: "alllearn", text: "Fur, gills, and hooves are learned by watching.", note: "Those structures grow from inheritance. An animal does not learn to have gills." },
      ]);
  }

  function placedAnimal(state) {
    for (var i = 0; i < N; i++) {
      for (var k = 0; k < state.cells[i].life.length; k++) {
        var org = ORG[state.cells[i].life[k].id];
        if (org && org.kind === "animal" && org.role !== "decomposer") {
          var p = rc(i);
          return { id: org.id, c: p.c, r: p.r };
        }
      }
    }
    return null;
  }

  function hasSettlementMix(state) {
    var r = 0, u = 0, s = 0;
    state.nations.forEach(function (n) { r += n.rural || 0; u += n.urban || 0; s += n.suburban || 0; });
    var kinds = (r > 0 ? 1 : 0) + (u > 0 ? 1 : 0) + (s > 0 ? 1 : 0);
    return kinds >= 2;
  }

  function settlementSentence(state) {
    return state.nations.map(function (n) {
      return n.name + " looks " + (n.pattern || "unset") + " (rural " + (n.rural || 0) + ", urban " + (n.urban || 0) + ", suburban " + (n.suburban || 0) + ")";
    }).join("; ") + ".";
  }

  function driest(state) {
    var best = { rain: 1e9, c: 0, r: 0, t: 0, biome: "desert" };
    for (var i = 0; i < N; i++) {
      if (state.cells[i].sea) continue;
      if (state.view.climR[i] < best.rain) {
        var p = rc(i);
        best = { rain: state.view.climR[i], c: p.c, r: p.r, t: state.view.climT[i], biome: state.view.biome[i] };
      }
    }
    return best;
  }

  function physicalRegions(state) {
    var seen = {};
    state.view.biome.forEach(function (b) { seen[b] = 1; });
    return Object.keys(seen).slice(0, 4).join(", ");
  }
  function humanRegions(state) {
    if (!state.nations.length) return "no nations yet";
    return state.nations.map(function (n) { return n.name + " (" + (n.pattern || "settlement") + ")"; }).join(", ");
  }

  function answer(state, choiceId, text) {
    var p = state.pending;
    if (!p) return { ok: false };
    var choice = null;
    p.choices.forEach(function (c) { if (c.id === choiceId) choice = c; });
    if (!choice) choice = p.choices[0];
    state.checks[p.id] = {
      id: p.id, standard: p.standard, title: p.title, prompt: p.prompt,
      choice: choice.text, note: choice.note, reason: String(text || "").slice(0, 500), year: state.year,
    };
    state.log.push({ year: state.year, text: "Notebook — " + p.title + ": " + choice.note });
    state.pending = null;
    return { ok: true, note: choice.note };
  }

  function skipCheck(state) {
    var p = state.pending;
    if (!p) return { ok: false };
    state.checks[p.id] = {
      id: p.id, standard: p.standard, title: p.title, prompt: p.prompt,
      choice: "(skipped)", note: "", reason: "", year: state.year, skipped: true,
    };
    state.pending = null;
    return { ok: true };
  }

  function explainCell(state, c, r) {
    refresh(state);
    if (!inside(c, r)) return { paragraphs: ["Off the map."], defs: [] };
    var i = idx(c, r);
    var cell = state.cells[i];
    var v = state.view;
    var defs = [];
    function d(id) {
      if (state.terms[id] || defs.some(function (x) { return x.id === id; })) return "";
      defs.push({ id: id, text: GLOSSARY[id] });
      return " " + GLOSSARY[id];
    }
    var lines = [];
    var latName = latOf(r) < 0.25 ? "near the equator" : latOf(r) > 0.7 ? "far from the equator" : "between the equator and the pole";
    lines.push("("+ c + ", " + r + ") is " + latName + ". Elevation is " + cell.e + " (0 is sea level, 6 is a high peak)." + d("latitude") + d("elevation"));
    lines.push("Climate here is about " + r1(v.climT[i]) + "° and " + r1(v.climR[i]) + " rain. This season's weather is about " + r1(v.temp[i]) + "° and " + r1(v.rain[i]) + " rain (" + state.weather.name + ")." + d("climate") + d("weather"));
    var west = c > 0 ? state.cells[i - 1].e : cell.e;
    if (cell.e > west + 0) lines.push("Land rises toward the east here, so moist west wind climbs, cools, and drops rain.");
    if (c > 0 && west > cell.e) lines.push("Land falls toward the east. This side can be a rain shadow: drier, because the ridge already took the water." + d("rain shadow"));
    lines.push("Biome: " + v.biome[i] + (v.slope[i] ? " (" + v.slope[i] + " slope)" : "") + ". Soil " + r1(cell.soil) + ", moisture " + r1(cell.moist) + ", pollution " + r1(cell.pol) + "." + d("biome"));
    var lifeNames = cell.life.map(function (l) { return ORG[l.id] ? ORG[l.id].name : l.id; });
    lines.push("Abiotic factors: temperature, rain, elevation, soil, and water. Biotic factors here: " + (lifeNames.length ? lifeNames.join(", ") : "wild producers you have not named yet") + "." + d("abiotic") + d("biotic"));
    if (v.river[i]) lines.push("A river is moving through. Flow this season is about " + r1(v.pass[i]) + ". Rivers erode high ground and deposit sediment when they slow down." + d("erosion"));
    if (cell.dam) lines.push("A dam modifies this channel. Most water stops here. Downstream flow and deltas feel it in later seasons.");
    if (cell.lf) lines.push("Landform: " + lfName(cell.lf) + (cell.rock ? ", with sedimentary layers" : "") + ".");
    if (cell.coal > 0 || cell.ore > 0) lines.push("Resources in the rock: " + (cell.coal > 0 ? r1(cell.coal) + " coal (fossil fuel, nonrenewable)" : "") + (cell.ore > 0 ? " " + r1(cell.ore) + " ore (nonrenewable)" : "") + "." + d("nonrenewable"));
    var own = v.owner[i];
    if (own) {
      var n = nationById(state, own);
      if (n) lines.push("Human region: " + n.name + ", capital at (" + n.capital.c + ", " + n.capital.r + "), government " + govLabel(n.gov) + ". Settlement here is " + (n.pattern || "forming") + "." + d("region"));
    }
    cell.life.forEach(function (life) {
      var org = ORG[life.id];
      if (!org) return;
      var fit = orgFits(org, v.biome[i], v.climT[i]);
      lines.push(org.name + (fit ? " fits. " : " is a mismatch. ") + "Structure: " + org.structure + ". Function: " + org.func + ". " + org.inherit + " " + (org.learned || "") + d("structure") + d("inherited"));
    });
    return { paragraphs: lines, defs: defs };
  }

  function lfName(id) {
    return { valley: "V-shaped valley", canyon: "canyon", delta: "delta", dune: "sand dune", glacier: "glacier", uvalley: "U-shaped valley" }[id] || id;
  }
  function govLabel(g) {
    return { council: "town council", monarch: "single leader", republic: "elected representatives", elders: "council of elders" }[g] || g;
  }

  function goalFacts(state) {
    refresh(state);
    var foods = state.nations.map(function (n) { return n.name + " food " + r1(n.food); }).join("; ");
    var deltas = 0, wetlands = 0;
    state.cells.forEach(function (c, i) {
      if (c.lf === "delta") deltas++;
      if (state.view.biome[i] === "wetland") wetlands++;
    });
    return [
      { text: "Food in each nation", fact: foods || "No nations yet." },
      { text: "Carnivores still in the web", fact: "About " + r1(state.carn) + " carnivores and " + r1(state.herb) + " herbivores." },
      { text: "Landforms and wet places", fact: deltas + " delta cells, " + wetlands + " wetland cells." },
      { text: "Climate shift since the start", fact: state.startT == null ? "Not measured yet." : (meanTemp(state) - state.startT).toFixed(1) + "° on the land average." },
    ];
  }

  function report(state) {
    refresh(state);
    var sc = SCENARIO[state.scenario];
    var people = 0;
    state.nations.forEach(function (n) { people += n.people; });
    var lines = [];
    lines.push("DESIGN A WORLD — notes for the teacher");
    lines.push("Student: " + (state.name || "(no name)"));
    lines.push("World: " + sc.name);
    lines.push("Seed: " + state.seed0);
    lines.push("Seasons played: " + state.year);
    lines.push("This page is evidence of choices and reasoning. It does not assign a grade or add up a total. The teacher decides what it shows.");
    lines.push("");
    lines.push("Summary");
    lines.push(summary(state));
    lines.push("");
    lines.push("Competing goals (there is no single best world)");
    sc.goals.forEach(function (g) { lines.push("- " + g); });
    goalFacts(state).forEach(function (g) { lines.push("  Now: " + g.text + " — " + g.fact); });
    lines.push("");
    lines.push("The student's idea for this world");
    lines.push(state.idea || "(none yet)");
    lines.push("");
    lines.push("Season ideas");
    if (!state.ideas.length) lines.push("(none yet)");
    state.ideas.forEach(function (n) { lines.push("- Season " + n.year + ": " + n.text); });
    lines.push("");
    lines.push("Choices");
    if (!state.choices.length) lines.push("(none yet)");
    state.choices.forEach(function (ch) {
      lines.push("- Season " + ch.year + ": " + ch.tool + " at (" + ch.c + ", " + ch.r + ")" + (ch.detail ? " — " + ch.detail : ""));
    });
    lines.push("");
    lines.push("Science and social studies moments");
    var ids = Object.keys(state.checks);
    if (!ids.length) lines.push("(none yet)");
    ids.forEach(function (id) {
      var c = state.checks[id];
      lines.push("- " + c.title + " [" + c.standard + "] season " + c.year);
      lines.push("  Prompt: " + c.prompt);
      if (c.skipped) {
        lines.push("  Student skipped this card and kept playing.");
      } else {
        lines.push("  Student chose: " + c.choice);
        lines.push("  Student wrote: " + (c.reason || "(blank)"));
        lines.push("  Science idea offered in the story: " + c.note);
      }
    });
    lines.push("");
    lines.push("Mismatches and justifications");
    if (!state.just.length) lines.push("(none)");
    state.just.forEach(function (j) {
      lines.push("- Season " + j.year + ": " + j.kind + " " + j.name + (j.c != null ? " at (" + j.c + ", " + j.r + ") biome " + (j.biome || "") : ""));
      lines.push("  Reason: " + (j.reason || "(blank)"));
    });
    lines.push("");
    lines.push("Nations");
    state.nations.forEach(function (n) {
      lines.push("- " + n.name + " (" + govLabel(n.gov) + "), capital (" + n.capital.c + ", " + n.capital.r + "), " + (n.pattern || ""));
      lines.push("  People " + r1(n.people) + ", food " + r1(n.food) + ", goods " + r1(n.goods) + ", unrest " + r1(n.unrest));
      lines.push("  Rural " + (n.rural || 0) + ", urban " + (n.urban || 0) + ", suburban " + (n.suburban || 0));
    });
    lines.push("");
    lines.push("World facts at this season");
    var t = totals(state);
    lines.push("People " + r1(people) + ". Producers " + r1(t.plants) + ". Herbivores " + r1(t.herb) + ". Carnivores " + r1(t.carn) + ". Fish " + r1(t.fish) + ".");
    lines.push("Timber " + r1(t.timber) + ". Fresh water index " + r1(t.water) + ". Coal left " + r1(t.coal) + ". Ore left " + r1(t.ore) + ". Heat-trapping gas index " + t.co2.toFixed(1) + ".");
    lines.push("Mean climate temperature " + meanTemp(state).toFixed(1) + "°. Mean rain " + meanRain(state).toFixed(1) + ".");
    var biomes = {};
    state.view.biome.forEach(function (b) { biomes[b] = (biomes[b] || 0) + 1; });
    lines.push("Biome cells: " + Object.keys(biomes).map(function (b) { return b + " " + biomes[b]; }).join(", ") + ".");
    var lfs = [];
    state.cells.forEach(function (c, i) { if (c.lf) lfs.push(lfName(c.lf) + " (" + rc(i).c + "," + rc(i).r + ")"); });
    lines.push("Landforms: " + (lfs.length ? lfs.join("; ") : "none yet") + ".");
    lines.push("");
    lines.push("Living things placed");
    var any = false;
    state.cells.forEach(function (c, i) {
      c.life.forEach(function (life) {
        any = true;
        var p = rc(i);
        var org = ORG[life.id];
        lines.push("- " + (org ? org.name : life.id) + " at (" + p.c + ", " + p.r + "), biome " + state.view.biome[i] + (life.justified ? ", kept with a written reason" : ""));
      });
    });
    if (!any) lines.push("(none)");
    lines.push("");
    lines.push("Words the story has defined");
    var termIds = Object.keys(state.terms);
    lines.push(termIds.length ? termIds.join(", ") : "(none yet)");
    return lines.join("\n");
  }

  function summary(state) {
    var sc = SCENARIO[state.scenario];
    var who = state.name || "This student";
    var bits = [who + " has played " + state.year + " season" + (state.year === 1 ? "" : "s") + " on " + sc.name + "."];
    if (state.choices.length) {
      var last = state.choices.slice(-4).map(function (c) { return c.tool + " (" + c.c + "," + c.r + ")"; });
      bits.push("Recent choices: " + last.join(", ") + ".");
    }
    if (state.nations.length) {
      bits.push(state.nations.map(function (n) {
        return n.name + " has about " + r1(n.people) + " people and food " + r1(n.food);
      }).join("; ") + ".");
    }
    var checks = Object.keys(state.checks);
    if (checks.length) bits.push("Notebook moments so far: " + checks.map(function (id) { return state.checks[id].title; }).join(", ") + ".");
    if (state.ideas.length) bits.push("They left " + state.ideas.length + " season idea" + (state.ideas.length === 1 ? "" : "s") + ".");
    if (state.idea) bits.push("World idea: " + state.idea);
    if (state.just.length) bits.push("They wrote " + state.just.length + " justification" + (state.just.length === 1 ? "" : "s") + " for a mismatch or a dry capital.");
    bits.push("Carnivores are about " + r1(state.carn) + " and producer energy is about " + r1(state.plants) + ".");
    return bits.join(" ");
  }

  function markTerms(state, defs) {
    (defs || []).forEach(function (d) { state.terms[d.id] = d.text; });
  }

  return {
    COLS: COLS,
    ROWS: ROWS,
    GLOSSARY: GLOSSARY,
    ORGANISMS: ORGANISMS,
    SCENARIOS: SCENARIOS,
    create: create,
    refresh: refresh,
    apply: apply,
    undo: undo,
    step: step,
    answer: answer,
    skipCheck: skipCheck,
    placeAnyway: placeAnyway,
    justifyAlert: justifyAlert,
    explainCell: explainCell,
    goalFacts: goalFacts,
    report: report,
    summary: summary,
    markTerms: markTerms,
    totals: totals,
    orgFits: function (id, biome, t) { return orgFits(ORG[id], biome, t); },
    govLabel: govLabel,
    lfName: lfName,
    feelBand: feelBand,
    ensurePlanet: ensurePlanet,
  };
});
