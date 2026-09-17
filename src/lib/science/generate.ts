import { pick, randInt } from "@/lib/math/rng";
import { mc } from "@/lib/teks/build";
import type { Question } from "@/lib/teks/types";
import { sciPoolForKey } from "./catalog";

function bank(
  teks: string,
  items: Array<{ stem: string; correct: string; wrong: string[]; explanation: string; table?: { caption?: string; headers: string[]; rows: string[][] } }>,
): Question {
  const item = pick(items);
  return mc(teks, item.stem, item.correct, item.wrong, item.explanation, {
    visual: item.table ? { kind: "table", caption: item.table.caption, headers: item.table.headers, rows: item.table.rows } : undefined,
  });
}

function gen56A(): Question {
  return bank("sci-5.6A", [
    {
      stem: "A student places an iron nail, a wooden block, and a copper wire near a magnet. Which property is being tested?",
      correct: "magnetism",
      wrong: ["solubility in water", "relative density", "volume"],
      explanation: "A magnet tests magnetism — whether a material is attracted to the magnet. Iron is magnetic; wood and copper are not.",
    },
    {
      stem: "A cube of wood floats in a pan of water and a steel bolt sinks. Which property is being compared?",
      correct: "relative density (sinking or floating in water)",
      wrong: ["magnetism", "electrical conductivity", "solubility"],
      explanation: "Sinking and floating in water is a test of relative density compared with water.",
    },
    {
      stem: "Which material is the best thermal conductor?",
      correct: "a metal spoon",
      wrong: ["a foam cup", "a wooden stick", "a plastic spatula"],
      explanation: "Metals conduct thermal energy well. Foam, wood, and plastic are insulators.",
    },
    {
      stem: "Salt disappears when stirred into water. That observation is evidence of —",
      correct: "solubility in water",
      wrong: ["magnetism", "the salt becoming a gas", "a change in the salt’s mass to zero"],
      explanation: "Solubility means a substance can dissolve in water. The salt is still there as particles in the solution.",
    },
    {
      stem: "Ice, liquid water, and steam are the same substance in different —",
      correct: "physical states (solid, liquid, gas)",
      wrong: ["chemical formulas", "relative densities only", "magnetic groups"],
      explanation: "Water can be solid, liquid, or gas. State is a physical property.",
    },
  ]);
}

function gen56B(): Question {
  return bank("sci-5.6B", [
    {
      stem: "Iron filings are mixed with sand. A magnet pulls out the iron. What does this show?",
      correct: "Each substance in the mixture kept its own physical properties.",
      wrong: [
        "The sand became magnetic.",
        "A new substance formed.",
        "Matter was destroyed when the magnet was used.",
      ],
      explanation: "In this mixture the iron is still magnetic and the sand is not. Their properties did not change.",
    },
    {
      stem: "Sand is stirred into water. After a few minutes the sand settles on the bottom. Why can the sand be separated?",
      correct: "Sand does not dissolve, so it keeps its properties and can settle out.",
      wrong: ["Sand turns into water", "Water becomes sand", "The mixture is a solution of sand"],
      explanation: "Sand and water keep their properties. Sand is not soluble here, so it can be filtered or allowed to settle.",
    },
    {
      stem: "Which mixture can be separated with a magnet?",
      correct: "iron filings and salt",
      wrong: ["sugar and water", "salt and water", "food coloring and water"],
      explanation: "Iron stays magnetic in the mixture, so a magnet can pull it out. The others are solutions or nonmagnetic mixtures.",
    },
  ]);
}

function gen56C(): Question {
  const salt = randInt(5, 12);
  const water = randInt(40, 80);
  const total = salt + water;
  return bank("sci-5.6C", [
    {
      stem: `A student dissolves ${salt} g of salt in ${water} g of water. What is the mass of the solution?`,
      correct: `${total} g`,
      wrong: [`${water} g`, `${salt} g`, `${water - salt} g`],
      explanation: `Matter is conserved. ${salt} g + ${water} g = ${total} g. The salt is still there; it is just dissolved.`,
    },
    {
      stem: "Sugar dissolves in tea. Which statement is true?",
      correct: "The sugar is still there; the total mass stays the same.",
      wrong: [
        "The sugar is destroyed.",
        "The tea loses mass equal to the sugar.",
        "A new gas forms, so mass increases a lot.",
      ],
      explanation: "In a solution, substances combine but matter is conserved. Mass before equals mass after.",
    },
    {
      stem: "Before mixing, salt is a white solid and water is a clear liquid. After they form a solution, the salt cannot be seen. What happened to the salt’s properties?",
      correct: "The salt dissolved, so its appearance changed, but its mass is still part of the solution.",
      wrong: ["The salt turned into water", "The salt evaporated", "The water’s mass became zero"],
      explanation: "Dissolving changes appearance (you may not see grains), but conservation of matter means the salt’s mass remains.",
    },
  ]);
}

function gen56D(): Question {
  return bank("sci-5.6D", [
    {
      stem: "A balloon gets bigger when you blow into it, even though you cannot see the air. What does this show?",
      correct: "Air is matter made of particles too small to see.",
      wrong: ["Air has no mass", "Only liquids are made of particles", "The balloon creates matter"],
      explanation: "Air particles take up space (the balloon expands) and have mass, even though they are too small to see.",
    },
    {
      stem: "Why can you smell perfume across a room even though you cannot see perfume particles?",
      correct: "The perfume is made of tiny particles that spread through the air.",
      wrong: ["Smell is not made of matter", "Perfume particles are larger than the room", "Only solids have particles"],
      explanation: "Gases and vapors are matter. Their particles are too small to see but can move through air.",
    },
  ]);
}

function gen57A(): Question {
  return bank("sci-5.7A", [
    {
      stem: "Two students push a box from opposite sides with equal force. What happens?",
      correct: "The forces are balanced, so the box’s motion does not change (it stays still if it was still).",
      wrong: [
        "The box always speeds up.",
        "One force disappears.",
        "The box must move toward the stronger student — but the forces are equal.",
      ],
      explanation: "Equal forces in opposite directions are balanced. Balanced forces do not change an object’s motion.",
    },
    {
      stem: "A soccer ball sits still, then a player kicks it. The kick is an example of —",
      correct: "an unbalanced force that changes the ball’s motion",
      wrong: ["balanced forces that cancel", "a force with no energy transfer", "magnetism only"],
      explanation: "Unequal (unbalanced) forces change speed or direction and transfer energy to the ball.",
    },
    {
      stem: "A book rests on a table. Gravity pulls down and the table pushes up with an equal force. The book does not move because —",
      correct: "the forces on it are equal and opposite (balanced)",
      wrong: ["there are no forces", "gravity turned off", "unbalanced forces always cause rest"],
      explanation: "Balanced forces can keep an object at rest. Gravity and the table’s push cancel.",
    },
  ]);
}

function gen57B(): Question {
  return bank("sci-5.7B", [
    {
      stem: "A class tests how ramp height affects how far a toy car rolls. Which investigation is fair?",
      correct: "Change only the ramp height; keep the same car and starting point.",
      wrong: [
        "Change the car, the ramp, and the floor each trial.",
        "Push some cars and not others.",
        "Measure mass instead of distance and never record it.",
      ],
      explanation: "A fair test of force/ramp effect changes one variable (height) and measures the result.",
    },
    {
      stem: "Students want to know if more air in a balloon rocket makes it go farther on a string. What should they measure?",
      correct: "How far the rocket travels when they change the amount of air",
      wrong: ["The color of the balloon only", "The day of the week", "Whether the string is cotton or they forget to record"],
      explanation: "The investigation tests force from escaping air. Distance along the string is a sensible dependent variable.",
    },
    {
      stem: "Which question can be tested with a car-on-a-ramp investigation?",
      correct: "How does the steepness of the ramp affect the car’s speed at the bottom?",
      wrong: ["What color is the fastest car in a catalog?", "Do students like ramps?", "What is the name of gravity?"],
      explanation: "A simple experiment changes one factor (steepness) and measures an effect on motion.",
    },
  ]);
}

function gen58A(): Question {
  return bank("sci-5.8A", [
    {
      stem: "In a battery flashlight, energy changes from chemical → electrical → light. That is an example of —",
      correct: "energy transformation",
      wrong: ["energy being destroyed", "a new kind of matter forming", "unbalanced magnets only"],
      explanation: "Energy changes form. The battery’s chemical energy becomes electrical energy, then light (and some heat).",
    },
    {
      stem: "A hair dryer changes electrical energy into thermal energy and sound. Which statement is true?",
      correct: "Energy changes form; it is not created or destroyed.",
      wrong: ["Electrical energy disappears", "Sound is not a form of energy", "Heat cannot come from electricity"],
      explanation: "Devices transform energy from one form to another. Some energy also becomes heat.",
    },
    {
      stem: "A plant uses light energy to make stored chemical energy in sugar. This is —",
      correct: "a transformation of light energy into chemical energy",
      wrong: ["electrical energy becoming sound", "destroying sunlight", "a complete circuit"],
      explanation: "Photosynthesis stores light energy as chemical energy in food.",
    },
  ]);
}

function gen58B(): Question {
  return bank("sci-5.8B", [
    {
      stem: "What is required for a functioning electrical circuit that lights a bulb?",
      correct: "A complete (closed) path from the energy source through the bulb and back",
      wrong: ["An open gap in the wire", "A magnet instead of a battery", "Only a bulb with no source of energy"],
      explanation: "Electric current needs a closed loop. An open switch or broken wire stops the flow.",
    },
    {
      stem: "A complete circuit can transform electrical energy into all of the following except —",
      correct: "a new chemical element",
      wrong: ["light", "sound", "thermal energy (heat)"],
      explanation: "Circuits can make light, heat, sound, or motion. They do not create new elements.",
    },
    {
      stem: "A fan is plugged in and the switch is on, but the blades do not spin. Which is a likely reason?",
      correct: "The circuit is open (broken wire or the fan is not in a complete path).",
      wrong: ["Electrical energy cannot become motion", "Fans do not use circuits", "Open circuits always spin faster"],
      explanation: "If the path is not complete, electrical energy cannot flow to the motor.",
    },
  ]);
}

function gen58C(): Question {
  return bank("sci-5.8C", [
    {
      stem: "You see your face in a still lake. The light is —",
      correct: "reflected",
      wrong: ["absorbed and gone forever with no bounce", "refracted into a rainbow only", "unable to travel in straight lines"],
      explanation: "Smooth surfaces reflect light. Light still travels in straight lines to your eyes.",
    },
    {
      stem: "A straw in a glass of water looks bent at the water line. This is mostly —",
      correct: "refraction (light changing direction as it goes from air to water)",
      wrong: ["the straw actually bending", "magnetism", "a complete circuit"],
      explanation: "Light refracts when it travels from one medium into another, such as air into water.",
    },
    {
      stem: "Black pavement on a sunny day feels hot because much of the light is —",
      correct: "absorbed and transformed into thermal energy",
      wrong: ["reflected perfectly like a mirror", "turned into a magnet", "unable to travel in a straight line"],
      explanation: "Dark surfaces absorb more light. Absorbed light energy becomes heat.",
    },
    {
      stem: "How does light travel from a lamp to your book?",
      correct: "in a straight line until it hits something",
      wrong: ["only in circles", "only through metal wires", "it does not travel; the book makes light"],
      explanation: "Light travels in straight lines. It may then reflect, refract, or be absorbed.",
    },
  ]);
}

function gen59A(): Question {
  return bank("sci-5.9A", [
    {
      stem: "Day and night happen because —",
      correct: "Earth rotates on its axis about once every 24 hours",
      wrong: ["the Sun orbits Earth each day", "Earth stops moving at night", "the Moon blocks the Sun every night"],
      explanation: "Earth spins. The side facing the Sun has day; the other side has night.",
    },
    {
      stem: "A flagpole’s shadow is long in the morning, short near noon, and long again in the evening. Why?",
      correct: "Earth’s rotation makes the Sun appear to move, so the shadow’s direction and length change.",
      wrong: ["The flagpole shrinks at noon", "Shadows are unrelated to the Sun", "Earth revolves once per hour"],
      explanation: "As Earth rotates, the Sun’s apparent position changes, so shadows swing and change length.",
    },
    {
      stem: "The Sun appears to move across the sky from morning to evening. The best explanation is —",
      correct: "Earth is rotating, so the Sun only looks like it is moving",
      wrong: ["the Sun races around Earth in 12 hours", "clouds push the Sun", "the Moon’s gravity lifts the Sun"],
      explanation: "The apparent path of the Sun is caused by Earth’s rotation, not the Sun orbiting us each day.",
    },
  ]);
}

function gen510A(): Question {
  return bank("sci-5.10A", [
    {
      stem: "What is the Sun’s main role in the water cycle?",
      correct: "It provides energy that evaporates water, especially from the ocean.",
      wrong: ["It turns the ocean into rock", "It stops condensation", "It creates gravity that pulls rain sideways"],
      explanation: "Solar energy heats water. Evaporation from the ocean is a major source of water vapor.",
    },
    {
      stem: "Warm, moist air from the ocean rises and cools. Water droplets form clouds. This process is —",
      correct: "condensation",
      wrong: ["erosion", "melting of the crust", "a complete circuit"],
      explanation: "Cooling water vapor condenses into tiny droplets — clouds — which can later fall as precipitation.",
    },
    {
      stem: "How do the Sun and ocean together affect weather?",
      correct: "The Sun evaporates ocean water; that moisture later falls as rain or other precipitation and helps drive weather.",
      wrong: ["The ocean blocks all sunlight, so there is no weather", "Weather happens only underground", "The Sun dries the ocean so rain can never form"],
      explanation: "Ocean water + solar energy → evaporation → condensation → precipitation, a driver of weather.",
    },
  ]);
}

function gen510B(): Question {
  return bank("sci-5.10B", [
    {
      stem: "Sedimentary rock forms when —",
      correct: "sediments are deposited, then compacted and cemented over time",
      wrong: ["lava cools at Earth’s surface only", "magma never reaches the crust", "wind blows the rock into space"],
      explanation: "Layers of sediment pile up. Pressure and cementing minerals turn them into sedimentary rock.",
    },
    {
      stem: "Coal, oil, and natural gas formed from —",
      correct: "ancient plants and animals buried and changed over a very long time",
      wrong: ["rain from last week", "melted magnets", "the Moon’s shadow"],
      explanation: "Fossil fuels come from buried organic matter transformed by heat and pressure over millions of years.",
    },
    {
      stem: "Why are fossils often found in sedimentary rock?",
      correct: "Organisms can be buried in sediment that later becomes rock, preserving remains or traces.",
      wrong: ["Sedimentary rock is always liquid", "Fossils form in the atmosphere", "Magma freezes animals instantly in every case"],
      explanation: "Sediment can cover remains gently enough to preserve them as the rock forms.",
    },
  ]);
}

function gen510C(): Question {
  return bank("sci-5.10C", [
    {
      stem: "A canyon is carved mainly by —",
      correct: "flowing water cutting down through rock over a long time",
      wrong: ["the Sun’s rotation", "a single gust of wind in one minute", "animals stacking rocks"],
      explanation: "Rivers erode rock. Over time that cutting can form a canyon.",
    },
    {
      stem: "Sand dunes form when —",
      correct: "wind deposits sand in piles",
      wrong: ["ice sheets melt into canyons only", "deltas form underwater hills of ice", "magma cements sand into coal"],
      explanation: "Wind is the agent. It picks up sand and drops it, building dunes.",
    },
    {
      stem: "A delta forms at the mouth of a river because —",
      correct: "water slows and deposits sediment",
      wrong: ["wind carves a canyon there", "ice pushes the river uphill", "the Sun evaporates the sediment into gas"],
      explanation: "When a river meets a lake or ocean it slows, drops its load, and builds a delta.",
    },
    {
      stem: "Glaciers can carve U-shaped valleys. The agent of change is —",
      correct: "ice",
      wrong: ["only sunlight", "a complete circuit", "dissolving sugar"],
      explanation: "Moving ice erodes and deposits material, reshaping the land.",
    },
  ]);
}

function gen511A(): Question {
  return bank("sci-5.11A", [
    {
      stem: "Which action best reduces the environmental impact of using paper from trees?",
      correct: "recycle paper and use both sides before recycling",
      wrong: ["throw extra paper in a creek", "cut more trees than needed", "burn leftover paper next to a stream"],
      explanation: "Recycling and using less (conservation) reduce the need for new resources.",
    },
    {
      stem: "Fossil fuels are nonrenewable. A helpful student solution is —",
      correct: "turn off lights and unplug chargers that are not in use",
      wrong: ["leave every light on to use them up faster", "pour motor oil down a storm drain", "waste water so more fuel is burned to pump it"],
      explanation: "Conservation uses less of a limited resource and lowers impact.",
    },
    {
      stem: "Proper disposal of batteries and paint is important because —",
      correct: "it keeps harmful materials out of soil and water",
      wrong: ["batteries must be thrown in lakes", "paint is a food for fish", "landfills cannot exist if we recycle"],
      explanation: "Some products need special disposal so chemicals do not pollute ecosystems.",
    },
  ]);
}

function gen512A(): Question {
  return bank("sci-5.12A", [
    {
      stem: "Which is an abiotic factor in a pond ecosystem?",
      correct: "sunlight",
      wrong: ["a frog", "algae", "a fish"],
      explanation: "Abiotic means nonliving: sunlight, water, temperature, soil. Frogs, algae, and fish are biotic.",
    },
    {
      stem: "Cactuses survive in a desert by storing water. They are interacting with which abiotic factor?",
      correct: "limited water",
      wrong: ["pack hunters", "a food web of only animals with no environment", "electrical circuits"],
      explanation: "Water is abiotic. Desert plants have structures that help them live with little water.",
    },
    {
      stem: "Bees visit flowers for nectar and spread pollen. This is an interaction with —",
      correct: "a biotic factor (another living organism)",
      wrong: ["only rocks", "the Moon’s rotation", "an open circuit"],
      explanation: "Living things interacting — bees and plants — are biotic interactions in a healthy ecosystem.",
    },
  ]);
}

function gen512B(): Question {
  return bank("sci-5.12B", [
    {
      stem: "If a disease kills most of the plants in a meadow, what is most likely in the food web?",
      correct: "Animals that eat those plants will have less food, and energy flow will drop.",
      wrong: ["Predators will have more plants to eat", "Energy flow will increase with fewer plants", "Matter will stop existing"],
      explanation: "Plants capture energy. Fewer producers means less food and energy moving up the web.",
    },
    {
      stem: "Hawks eat snakes; snakes eat mice; mice eat grass. If hawks are removed, a likely short-term change is —",
      correct: "snake numbers may rise, which can then lower mouse numbers",
      wrong: ["grass will immediately turn into hawks", "mice will start photosynthesizing", "the Sun will stop providing energy"],
      explanation: "Removing a predator can increase its prey, which then affects the next level down.",
    },
    {
      stem: "Energy in a food web originally comes from —",
      correct: "the Sun (captured by producers)",
      wrong: ["soil minerals only, with no sunlight", "decomposers creating energy from nothing", "the Moon’s rotation"],
      explanation: "Producers transform light energy. That energy then flows to consumers.",
    },
  ]);
}

function gen512C(): Question {
  return bank("sci-5.12C", [
    {
      stem: "Which human activity is beneficial to an ecosystem?",
      correct: "planting native trees along a stream to reduce erosion",
      wrong: ["dumping trash in the wetland", "draining a marsh to dump oil", "introducing a pest with no predators on purpose"],
      explanation: "Restoring plants can stabilize soil and help a healthy habitat.",
    },
    {
      stem: "A healthy ecosystem usually has —",
      correct: "a variety of organisms and cycling of matter",
      wrong: ["only one kind of living thing and no sunlight", "no abiotic factors", "energy that never flows"],
      explanation: "Diversity, food webs, and cycling of matter (and flow of energy) mark a healthy system.",
    },
    {
      stem: "Clearing all the plants from a hillside is harmful mainly because —",
      correct: "it can increase erosion and destroy habitat",
      wrong: ["plants are abiotic", "sunlight will stop", "gravity turns off"],
      explanation: "Plants hold soil and provide food and shelter. Removing them damages the ecosystem.",
    },
  ]);
}

function gen513A(): Question {
  return bank("sci-5.13A", [
    {
      stem: "A duck’s webbed feet and a fish’s fins both help in water. This is an example of —",
      correct: "different structures that serve a similar function for survival in the same type of environment",
      wrong: ["learned math facts", "unbalanced electrical circuits", "the water cycle forming coal"],
      explanation: "Different species can have different body parts that do a similar job — moving in water.",
    },
    {
      stem: "A desert fox has large ears that give off heat. A snow fox has small ears that hold heat. The structures help them —",
      correct: "survive in different temperatures in their environments",
      wrong: ["photosynthesize", "rotate the Earth", "form sedimentary rock"],
      explanation: "Ear size is a structure tied to heat. It matches the environment each fox lives in.",
    },
    {
      stem: "A hummingbird’s long beak matches tubular flowers. The function of that structure is —",
      correct: "reaching nectar (food) in the flower",
      wrong: ["digging canyons", "conducting electricity", "causing day and night"],
      explanation: "Structure (beak shape) fits function (getting food) in that environment.",
    },
  ]);
}

function gen513B(): Question {
  return bank("sci-5.13B", [
    {
      stem: "Sea turtle hatchlings crawl toward the ocean with no teaching. That behavior is —",
      correct: "instinct (inherited, not taught)",
      wrong: ["learned from a class", "a complete circuit", "condensation"],
      explanation: "Instinctual traits are built in. Hatchlings heading to the sea is a classic example.",
    },
    {
      stem: "Orcas in a pod learn a hunting method from other orcas. That is —",
      correct: "learned behavior",
      wrong: ["instinct only, never taught", "an abiotic factor", "Earth’s rotation"],
      explanation: "Learned behaviors are acquired from experience or from others in the group.",
    },
    {
      stem: "How do instinct and learned behaviors both help survival?",
      correct: "They increase the chance of finding food, avoiding danger, or reproducing.",
      wrong: ["They replace the need for any structures", "They stop energy from flowing", "They cause the Sun to orbit Earth"],
      explanation: "Both kinds of behavior can help an animal live long enough to thrive in its environment.",
    },
  ]);
}

const generators: Record<string, () => Question> = {
  "sci-5.6A": gen56A,
  "sci-5.6B": gen56B,
  "sci-5.6C": gen56C,
  "sci-5.6D": gen56D,
  "sci-5.7A": gen57A,
  "sci-5.7B": gen57B,
  "sci-5.8A": gen58A,
  "sci-5.8B": gen58B,
  "sci-5.8C": gen58C,
  "sci-5.9A": gen59A,
  "sci-5.10A": gen510A,
  "sci-5.10B": gen510B,
  "sci-5.10C": gen510C,
  "sci-5.11A": gen511A,
  "sci-5.12A": gen512A,
  "sci-5.12B": gen512B,
  "sci-5.12C": gen512C,
  "sci-5.13A": gen513A,
  "sci-5.13B": gen513B,
};

export function generateScienceQuestion(poolKey: string): Question {
  const pool = sciPoolForKey(poolKey);
  const teks = pool.length ? pick(pool) : poolKey;
  const gen = generators[teks];
  if (!gen) {
    return mc(teks, "This station is warming up a fresh question.", "Continue", ["Stop", "Skip", "Leave"], "Try another item.");
  }
  for (let i = 0; i < 8; i++) {
    try {
      const q = gen();
      if (q.kind === "mc") {
        const choices = q.choices ?? [];
        const texts = new Set(choices.map((c) => c.text));
        if (choices.length < 2 || texts.size !== choices.length) continue;
        if (!choices.some((c) => c.id === q.correct)) continue;
      }
      return q;
    } catch {
      /* retry */
    }
  }
  return mc(teks, "Try another science item.", "OK", ["Later", "Skip"], "New questions generate each time.");
}

export function generateScienceSet(poolKey: string, n: number): Question[] {
  const out: Question[] = [];
  const stems = new Set<string>();
  let guard = 0;
  while (out.length < n && guard++ < n * 12) {
    const q = generateScienceQuestion(poolKey);
    if (stems.has(q.stem)) continue;
    stems.add(q.stem);
    out.push(q);
  }
  while (out.length < n) out.push(generateScienceQuestion(poolKey));
  return out;
}
