/* Design a World: item registry (mission places + free decor), costs, economy roles, prism sizes. */
(function () {
  'use strict';
  var R = window.DAW_ITEMS = {};
  var NAMES = { butte: 'Butte', floodplain: 'Floodplain', cave: 'Cave', fan: 'Alluvial Fan', barrier: 'Barrier Island', waterfall: 'Waterfall', landslide: 'Landslide', oxbow: 'Oxbow Lake', arch: 'Natural Arch', canyon: 'Canyon', delta: 'River Delta', dune: 'Sand Dunes', glacier: 'Glacial Valley', mountain: 'Mountain', mesa: 'Layered Mesa', river: 'River', ocean: 'Ocean', aquifer: 'Aquifer Well', lake: 'Lake & Dock', cloud: 'Storm Cloud', weatherstation: 'Weather Station', fieldstation: 'Field Station', school: 'School Lab', toollab: 'Tool Lab', modellab: 'Model Lab', museum: 'Science Museum', careercenter: 'Career Center', townhall: 'Town Hall', sciencefair: 'Science Fair', ranger: 'Ranger Station', engineering: 'Engineering Lab', houses: 'Neighborhood', workshop: 'Workshop', quarry: 'Sand Quarry', lemonade: 'Lemonade Stand', balloon: 'Balloon Festival', streetlight: 'Street Lights', powerstation: 'Power Station', campsite: 'Campsite', lighthouse: 'Lighthouse', observatory: 'Observatory', overlook: 'Sunset Overlook', sundial: 'Sundial Park', oilwell: 'Oil Well', recycle: 'Recycling Center', windfarm: 'Wind Farm', farm: 'Farm', sportsfield: 'Sports Field', rockettrack: 'Rocket Track', ramplab: 'Ramp Lab', prairie: 'Prairie', forest: 'Forest', meadow: 'Meadow', pond: 'Pond', preserve: 'Nature Preserve', desert: 'Desert', beach: 'Turtle Beach', orcapod: 'Orca Pod', plain: 'Grassland', road: 'Road', trees: 'Trees' };
  // Free decor: stage = first stage it can be placed; cost in coins (natural features are free).
  var DECOR = [
    ['d-grass', 'plain', 1, 0, 'landforms'], ['d-trees', 'trees', 1, 0, 'ecosystems'], ['d-mountain', 'mountain', 1, 0, 'landforms'], ['d-dune', 'dune', 1, 0, 'landforms'],
    ['d-mesa', 'mesa', 1, 0, 'landforms'], ['d-delta', 'delta', 1, 0, 'landforms'], ['d-canyon', 'canyon', 1, 0, 'landforms'], ['d-road', 'road', 1, 20, 'people'],
    ['d-river', 'river', 2, 0, 'water'], ['d-lake', 'lake', 2, 0, 'water'], ['d-ocean', 'ocean', 2, 0, 'water'], ['d-cloud', 'cloud', 2, 0, 'weather'], ['d-glacier', 'glacier', 2, 0, 'landforms'],
    ['d-prairie', 'prairie', 3, 0, 'ecosystems'], ['d-pond', 'pond', 3, 0, 'ecosystems'], ['d-desert', 'desert', 3, 0, 'ecosystems'], ['d-forest', 'forest', 3, 0, 'ecosystems'], ['d-orcas', 'orcapod', 3, 0, 'ecosystems'],
    ['d-houses', 'houses', 4, 120, 'people'], ['d-farm', 'farm', 4, 150, 'resources'], ['d-windfarm', 'windfarm', 4, 250, 'energy'], ['d-oilwell', 'oilwell', 4, 200, 'resources'],
    ['d-aquifer', 'aquifer', 4, 100, 'water'], ['d-lemonade', 'lemonade', 4, 40, 'people'], ['d-quarry', 'quarry', 4, 120, 'resources'], ['d-school', 'school', 4, 220, 'people'], ['d-campsite', 'campsite', 4, 30, 'people'],
    ['d-butte', 'butte', 1, 0, 'landforms'], ['d-floodplain', 'floodplain', 1, 0, 'landforms'], ['d-cave', 'cave', 1, 0, 'landforms'], ['d-fan', 'fan', 1, 0, 'landforms'], ['d-barrier', 'barrier', 1, 0, 'landforms'],
    ['d-waterfall', 'waterfall', 1, 0, 'landforms'], ['d-landslide', 'landslide', 1, 0, 'landforms'], ['d-oxbow', 'oxbow', 1, 0, 'landforms'], ['d-arch', 'arch', 1, 0, 'landforms'], ['d-beach', 'beach', 2, 0, 'landforms']
  ];
  // Economy role by illustration: producer of a good, provider of a service, or consumer.
  var ECON = {
    farm: ['producer', 'good', 'Food (crops)', 40], oilwell: ['producer', 'good', 'Oil (fuel)', 60], windfarm: ['producer', 'good', 'Electricity', 50], quarry: ['producer', 'good', 'Sand and iron', 30],
    lemonade: ['producer', 'good', 'Lemonade', 15], powerstation: ['producer', 'good', 'Electricity', 40], workshop: ['producer', 'good', 'Tools and pots', 25], aquifer: ['producer', 'good', 'Drinking water', 20],
    school: ['provider', 'service', 'Teaching', 0], museum: ['provider', 'service', 'Museum visits', 10], townhall: ['provider', 'service', 'Local government', 0], recycle: ['provider', 'service', 'Recycling', 5],
    ranger: ['provider', 'service', 'Park rangers', 0], careercenter: ['provider', 'service', 'Job training', 0], engineering: ['provider', 'service', 'Engineering design', 10], streetlight: ['provider', 'service', 'Street lighting', 0],
    lighthouse: ['provider', 'service', 'Ship safety', 0], weatherstation: ['provider', 'service', 'Weather forecasts', 0], fieldstation: ['provider', 'service', 'Research', 0], toollab: ['provider', 'service', 'Lab tools', 0],
    modellab: ['provider', 'service', 'Model testing', 0], observatory: ['provider', 'service', 'Sky watching', 5], campsite: ['provider', 'service', 'Camping', 5], sportsfield: ['provider', 'service', 'Recreation', 5],
    houses: ['consumer', 'household', 'Families (4 people each)', 0]
  };
  // Rectangular-prism sizes (meters) for the volume tool
  var PRISM = { houses: [12, 10, 6], school: [40, 25, 9], workshop: [20, 12, 7], toollab: [18, 12, 6], modellab: [16, 10, 6], museum: [36, 24, 12], careercenter: [20, 20, 40], townhall: [30, 20, 10], ranger: [14, 10, 5], engineering: [24, 16, 8], recycle: [30, 20, 8], aquifer: [6, 6, 3], powerstation: [20, 14, 6], observatory: [12, 12, 8], mesa: [600, 600, 120], farm: [20, 14, 8], lake: [120, 60, 6], weatherstation: [2, 2, 2] };
  var COST_DEFAULT = { landforms: 0, water: 0, weather: 0, ecosystems: 0, space: 0, people: 150, resources: 150, energy: 200, matter: 100, forces: 80 };
  // Footprint on the finer map grid: big landforms, water bodies, biomes, farms and towns cover 2 x 2 cells; everything else 1 cell.
  var BIG = { canyon: 1, mesa: 1, delta: 1, glacier: 1, mountain: 1, dune: 1, river: 1, ocean: 1, lake: 1, oxbow: 1, floodplain: 1, barrier: 1, fan: 1, desert: 1, beach: 1, forest: 1, prairie: 1, meadow: 1, preserve: 1, farm: 1, windfarm: 1, houses: 1, sportsfield: 1, orcapod: 1, quarry: 1 };
  R.BIG = BIG;
  R.footprint = function (id) { return BIG[R.get(id).art] ? 2 : 1; };
  var ix = null, defs = {};
  R.init = function (index) {
    ix = index; defs = {}; if (window.DAW_STATE && DAW_STATE.setFootprint) DAW_STATE.setFootprint(function (id) { return R.footprint(id); }); if (window.DAW_STATE && DAW_STATE.setArtOf) DAW_STATE.setArtOf(function (id) { return R.get(id).art; });
    Object.keys(ix.items).forEach(function (id) {
      var it = ix.items[id], art = it.art && DAW_ART.item[it.art] ? it.art : (DAW_ART.item[id] ? id : 'houses');
      defs[id] = { id: id, name: it.name || NAMES[id] || id, art: art, category: it.category, stage: it.stage, mission: it.mission, cost: 0, decor: false };
    });
    DECOR.forEach(function (d) { defs[d[0]] = { id: d[0], name: NAMES[d[1]], art: d[1], stage: d[2], cost: d[3], category: d[4], decor: true }; });
    // Field Guide entries (landforms, resources, water, weather, energy) can all be placed. Entries without their own
    // drawing yet use the closest existing drawing under their own art key (data: drawAs).
    var FG = window.DAW_DESCRIBE_DATA, have = {};
    Object.keys(defs).forEach(function (k) { have[defs[k].art] = 1; });
    if (FG) (FG.landforms || []).map(function (l) { return { x: l, arts: [l.art], lf: true }; }).concat((FG.features || []).map(function (f) { return { x: f, arts: f.items || [], lf: false }; })).forEach(function (e) {
      e.arts.forEach(function (a) {
        if (!a) return; if (!DAW_ART.item[a] && e.x.drawAs && DAW_ART.item[e.x.drawAs]) DAW_ART.item[a] = DAW_ART.item[e.x.drawAs];
        if (!DAW_ART.item[a] || have[a]) return; have[a] = 1; var g = e.x.group;
        defs['d-' + a] = { id: 'd-' + a, name: e.x.name, art: a, stage: e.lf ? (e.x.stage || 1) : ({ water: 2, weather: 2, resource: 4, energy: 4 }[g] || 2), cost: e.lf ? 0 : ({ resource: 100, energy: 150 }[g] || 0), category: e.lf ? 'landforms' : g === 'resource' ? 'resources' : g, decor: true };
      });
    });
  };
  R.get = function (id) { return defs[id] || { id: id, name: id, art: 'houses', stage: 1, cost: 0, category: 'people', decor: true }; };
  R.all = function () { return Object.keys(defs).map(function (k) { return defs[k]; }); };
  R.missionItems = function () { return R.all().filter(function (d) { return !d.decor; }); };
  R.decor = function () { return R.all().filter(function (d) { return d.decor; }); };
  R.name = function (save, id) { return (save && save.names && save.names[id]) || R.get(id).name; };
  R.econ = function (id) { var a = ECON[R.get(id).art]; return a ? { role: a[0], kind: a[1], what: a[2], income: a[3] } : null; };
  R.prism = function (id) { return PRISM[R.get(id).art] || null; };
  R.budget = function (save) {
    var S = DAW_STATE, start = 1000, grants = S.completedCount(save) * 100, spent = 0, income = 0, lines = [];
    save.world.tiles.forEach(function (t) { var d = R.get(t.t); spent += d.cost || 0; var e = R.econ(t.t); if (e && e.income) income += e.income; });
    return { start: start, grants: grants, spent: spent, income: income, balance: start + grants + income - spent };
  };
})();
