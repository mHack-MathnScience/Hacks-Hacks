import { pick, randInt, shuffle } from "@/lib/math/rng";
import { moneyLabel, mc, nearbyInts, pickName } from "./build";
import type { Question, Visual } from "./types";

const SUBJECTS = ["soccer", "art", "band", "chess", "coding", "track"] as const;
const SNACKS = ["apples", "pretzels", "yogurt", "granola", "oranges", "popcorn"] as const;

function uniqueInts(n: number, min: number, max: number): number[] {
  const set = new Set<number>();
  let guard = 0;
  while (set.size < n && guard++ < 80) set.add(randInt(min, max));
  return [...set];
}

function gen59A(): Question {
  const kind = pick(["frequency", "which-display"] as const);
  if (kind === "which-display") {
    return mc(
      "5.9A",
      pick([
        "A class listed each student’s favorite recess game (a category). Which display is most appropriate?",
        "Students named their favorite lunch item. Which graph is a good fit for this categorical data?",
      ]),
      "bar graph or frequency table",
      ["stem-and-leaf plot", "scatterplot only", "coordinate plane"],
      "Categorical data (names of games, foods, colors) belong in a bar graph or frequency table. Numerical measurements belong on a dot plot or stem-and-leaf plot.",
    );
  }
  const labels = shuffle([...SNACKS]).slice(0, 4);
  const values = labels.map(() => randInt(3, 14));
  const rows = labels.map((l, i) => [l, String(values[i]!)]);
  const i = randInt(0, 3);
  return mc(
    "5.9A",
    `Students voted for a class snack. Which frequency table matches the bar graph?`,
    `${labels[i]}: ${values[i]}`,
    labels.filter((_, j) => j !== i).map((l, j) => `${l}: ${values[(j + i + 1) % 4]}`),
    `Read the height of the ${labels[i]} bar: ${values[i]} students.`,
    { visual: { kind: "bar", title: "Favorite snack", unit: "students", bars: labels.map((l, idx) => ({ label: l, value: values[idx]! })) } },
  );
}

function gen59B(): Question {
  const n = randInt(6, 9);
  const slope = pick([1, 1, -1]);
  const points = Array.from({ length: n }, () => {
    const x = randInt(1, 10);
    const noise = randInt(-1, 1);
    const y = Math.max(1, Math.min(10, 5 + slope * (x - 5) + noise));
    return { x, y };
  });
  const trend =
    slope > 0
      ? "As x increases, y tends to increase."
      : "As x increases, y tends to decrease.";
  return mc(
    "5.9B",
    "The scatterplot shows paired data. Which statement best describes the relationship?",
    trend,
    [
      slope > 0 ? "As x increases, y tends to decrease." : "As x increases, y tends to increase.",
      "The points form a perfect rectangle.",
      "There is no x-coordinate.",
    ],
    "Look at the cloud of points: as you move right, the points trend " + (slope > 0 ? "up." : "down."),
    {
      visual: {
        kind: "scatter",
        title: "Paired measurements",
        xLabel: "x",
        yLabel: "y",
        points,
      },
    },
  );
}

function gen59C(): Question {
  const kind = pick(["bar", "dots", "stem", "table"] as const);
  const name = pickName();

  if (kind === "bar") {
    const labels = shuffle([...SUBJECTS]).slice(0, 4);
    const values = labels.map(() => randInt(4, 18));
    const visual: Visual = {
      kind: "bar",
      title: "Club sign-ups",
      unit: "students",
      bars: labels.map((l, i) => ({ label: l, value: values[i]! })),
    };
    const twoStep = pick([true, false]);
    if (twoStep) {
      const i = 0;
      const j = 1;
      const extra = randInt(0, 3);
      const correct = values[i]! + values[j]!;
      return mc(
        "5.9C",
        `How many students signed up for ${labels[i]} or ${labels[j]} in all?`,
        String(correct),
        nearbyInts(correct, [values[i]!, values[j]!, values.reduce((a, b) => a + b, 0)]).map(String),
        `${values[i]} + ${values[j]} = ${correct}.`,
        { visual },
      );
    }
    const hi = values.indexOf(Math.max(...values));
    const lo = values.indexOf(Math.min(...values));
    const diff = values[hi]! - values[lo]!;
    return mc(
      "5.9C",
      `How many more students chose ${labels[hi]} than ${labels[lo]}?`,
      String(diff),
      nearbyInts(diff, [values[hi]!, values[lo]!]).map(String),
      `${values[hi]} − ${values[lo]} = ${diff}.`,
      { visual },
    );
  }

  if (kind === "dots") {
    const values: number[] = [];
    for (let i = 0; i < randInt(10, 14); i++) values.push(randInt(1, 8));
    const target = pick([...new Set(values)]);
    const count = values.filter((v) => v === target).length;
    const two = pick([true, false]);
    const visual: Visual = { kind: "dots", title: `${name}'s class — books read`, unit: "books", values };
    if (!two) {
      return mc(
        "5.9C",
        `How many students read ${target} books?`,
        String(count),
        nearbyInts(count, [target, values.length]).map(String),
        `Count the dots stacked above ${target}: there are ${count}.`,
        { visual },
      );
    }
    const t2 = pick(values.filter((v) => v !== target).length ? values.filter((v) => v !== target) : [target + 1]);
    const count2 = values.filter((v) => v === t2).length;
    const correct = count + count2;
    return mc(
      "5.9C",
      `How many students read ${target} or ${t2} books?`,
      String(correct),
      nearbyInts(correct, [count, count2, values.length]).map(String),
      `${count} + ${count2} = ${correct}.`,
      { visual },
    );
  }

  if (kind === "stem") {
    const data = uniqueInts(10, 21, 68);
    const visual: Visual = { kind: "stemleaf", title: "Minutes spent reading", unit: "min", data };
    const sorted = [...data].sort((a, b) => a - b);
    const max = sorted[sorted.length - 1]!;
    const min = sorted[0]!;
    const mode = pick(["range", "how-many-ge"] as const);
    if (mode === "range") {
      const range = max - min;
      return mc(
        "5.9C",
        "What is the range of the data in the stem-and-leaf plot?",
        String(range),
        nearbyInts(range, [max, min, data.length]).map(String),
        `Range = greatest − least = ${max} − ${min} = ${range}.`,
        { visual },
      );
    }
    const cutoff = 40;
    const count = data.filter((n) => n >= cutoff).length;
    return mc(
      "5.9C",
      `How many values in the plot are ${cutoff} or greater?`,
      String(count),
      nearbyInts(count, [data.length, data.filter((n) => n < cutoff).length]).map(String),
      `Count the leaves in the stems ${Math.floor(cutoff / 10)} and above: ${count} values.`,
      { visual },
    );
  }

  const labels = shuffle([...SNACKS]).slice(0, 4);
  const values = labels.map(() => randInt(2, 12));
  const total = values.reduce((a, b) => a + b, 0);
  const rows = labels.map((l, i) => [l, String(values[i]!)]);
  return mc(
    "5.9C",
    `The frequency table shows votes. How many votes were collected in all?`,
    String(total),
    nearbyInts(total, values).map(String),
    `Add the frequencies: ${values.join(" + ")} = ${total}.`,
    { visual: { kind: "table", caption: "Snack votes", headers: ["Snack", "Votes"], rows } },
  );
}

function gen510A(): Question {
  const items = [
    {
      stem: "Which tax is charged on wages you earn from a job?",
      correct: "income tax",
      wrong: ["sales tax", "property tax", "gift tax"],
      explanation: "Income tax is paid on money you earn. Sales tax is on purchases; property tax is on land or a house.",
    },
    {
      stem: "A city charges a tax when you buy a backpack. That tax is —",
      correct: "sales tax",
      wrong: ["income tax", "payroll tax", "property tax"],
      explanation: "Sales tax is added to the price of goods you buy.",
    },
    {
      stem: "Money taken from a paycheck for Social Security and Medicare is an example of —",
      correct: "payroll tax",
      wrong: ["sales tax", "property tax", "income that is not taxed"],
      explanation: "Payroll taxes are withheld from a paycheck for programs such as Social Security and Medicare.",
    },
    {
      stem: "A family pays a tax based on the value of their house and land. That tax is —",
      correct: "property tax",
      wrong: ["sales tax", "payroll tax", "income tax"],
      explanation: "Property tax is based on land or buildings you own.",
    },
  ];
  const item = pick(items);
  return mc("5.10A", item.stem, item.correct, item.wrong, item.explanation);
}

function gen510B(): Question {
  const hourly = randInt(9, 18);
  const hours = pick([8, 10, 12, 15, 20]);
  const gross = hourly * hours;
  const tax = Math.round(gross * pick([0.1, 0.15, 0.2]));
  const net = gross - tax;
  const name = pickName();
  const mode = pick(["net", "meaning"] as const);
  if (mode === "meaning") {
    return mc(
      "5.10B",
      "Gross income is best described as —",
      "the money earned before taxes and other deductions",
      [
        "the money left after taxes are taken out",
        "only sales-tax collections",
        "the amount of a property-tax bill",
      ],
      "Gross is the total earned. Net is what you take home after deductions.",
    );
  }
  return mc(
    "5.10B",
    `${name} earns ${moneyLabel(gross * 100)} before deductions. Taxes and other deductions total ${moneyLabel(tax * 100)}. What is ${name}'s net income?`,
    moneyLabel(net * 100),
    [moneyLabel(gross * 100), moneyLabel(tax * 100), moneyLabel((gross + tax) * 100)],
    `Net income = gross − deductions = ${moneyLabel(gross * 100)} − ${moneyLabel(tax * 100)} = ${moneyLabel(net * 100)}.`,
  );
}

function gen510C(): Question {
  const items = [
    {
      stem: "Which is an advantage of paying with a debit card?",
      correct: "The money comes straight from your checking account, so you cannot spend more than you have.",
      wrong: [
        "You can spend more than you have and pay it back later with no cost.",
        "The card prints a paper check for you.",
        "Purchases never show up on a bank record.",
      ],
      explanation: "A debit card spends money you already have. That helps you stay in budget, but you must keep enough in the account.",
    },
    {
      stem: "Which is a disadvantage of a credit card?",
      correct: "If you do not pay the balance, you owe extra money as interest.",
      wrong: [
        "You can never shop online with it.",
        "It always takes money from your checking account the same day.",
        "It cannot be used to buy anything.",
      ],
      explanation: "Credit is borrowed money. Interest is charged if the balance is not paid, which can cost more than the original purchase.",
    },
    {
      stem: "Which is an advantage of an electronic payment (such as a bank transfer)?",
      correct: "It can be fast and does not require carrying cash.",
      wrong: [
        "It always hides the transaction from your records.",
        "It never requires an account or device.",
        "It cannot be used to pay a bill.",
      ],
      explanation: "Electronic payments are quick, but you still need an account and should keep a record of the transfer.",
    },
    {
      stem: "Which is a disadvantage of paying by check?",
      correct: "A check can bounce if there is not enough money in the account, and it is slower than a card.",
      wrong: [
        "A check is the only way to earn interest.",
        "Checks cannot show who was paid.",
        "Checks never leave a written record.",
      ],
      explanation: "Checks are a paper record, but they take time to clear and can bounce if funds are short.",
    },
  ];
  const item = pick(items);
  return mc("5.10C", item.stem, item.correct, item.wrong, item.explanation);
}

function gen510D(): Question {
  const items = [
    {
      stem: "Which of these is a financial record a family should keep?",
      correct: "a bank statement showing deposits and withdrawals",
      wrong: ["a doodle of a dollar sign", "a list of favorite songs", "a seating chart"],
      explanation: "Financial records track money in and out: statements, receipts, and budgets. They help you know what you have.",
    },
    {
      stem: "Why keep receipts and bank statements together?",
      correct: "So you can check that spending and income match your records.",
      wrong: ["So you can pay income tax on every receipt twice", "Because receipts replace a budget", "They are not useful after one day"],
      explanation: "Records let you compare planned spending with actual spending and catch mistakes.",
    },
    {
      stem: "Which tool helps you see whether you followed this month’s budget?",
      correct: "a spending log or register",
      wrong: ["a multiplication table", "a coordinate plane", "a stem-and-leaf plot of heights"],
      explanation: "A log or register lists income and expenses so you can compare them with the budget.",
    },
  ];
  const item = pick(items);
  return mc("5.10D", item.stem, item.correct, item.wrong, item.explanation);
}

function gen510E(): Question {
  const items = [
    {
      stem: "A family’s expenses for the month are greater than its income. Which action could help balance the budget?",
      correct: "Reduce spending or find extra income (or both).",
      wrong: [
        "Ignore the difference until next year.",
        "Always use a credit card for every extra expense with no plan to repay.",
        "Stop keeping any financial records.",
      ],
      explanation: "When expenses exceed income, you must spend less, earn more, or both. A credit card without a repayment plan can make the gap larger.",
    },
    {
      stem: "Which change would help if a budget is $40 short this month?",
      correct: "Cut $40 of wants (or earn $40 more).",
      wrong: ["Add $40 of new wants", "Delete the budget", "Pay $40 twice"],
      explanation: "Balancing means making income and expenses meet. Trim wants first, or add income.",
    },
    {
      stem: "Why might a family postpone a non-essential purchase?",
      correct: "To bring expenses back in line with income.",
      wrong: ["Because sales tax is never charged on postponed items", "Because net income would become gross income", "Because checks cannot be used later"],
      explanation: "Waiting on a want is a common way to close a budget gap without borrowing.",
    },
  ];
  const item = pick(items);
  return mc("5.10E", item.stem, item.correct, item.wrong, item.explanation);
}

function gen510F(): Question {
  const income = pick([200, 240, 300, 320, 360, 400]);
  const save = pick([20, 30, 40, 50]);
  const food = pick([40, 50, 60, 70]);
  const fun = pick([20, 25, 30, 35]);
  const other = income - save - food - fun - pick([10, 20, 30, 40]);
  const leftover = income - save - food - fun - Math.max(other, 20);
  const spentCore = save + food + fun;
  const remaining = income - spentCore;
  const name = pickName();
  const mode = pick(["left", "balance"] as const);
  if (mode === "left") {
    return mc(
      "5.10F",
      `${name} has ${moneyLabel(income * 100)} of income. Planned expenses: save ${moneyLabel(save * 100)}, food ${moneyLabel(food * 100)}, fun ${moneyLabel(fun * 100)}. How much is left for everything else?`,
      moneyLabel(remaining * 100),
      [moneyLabel(spentCore * 100), moneyLabel(income * 100), moneyLabel((remaining + save) * 100)],
      `${moneyLabel(income * 100)} − ${moneyLabel(save * 100)} − ${moneyLabel(food * 100)} − ${moneyLabel(fun * 100)} = ${moneyLabel(remaining * 100)}.`,
    );
  }
  const extra = remaining - pick([10, 20]);
  const balanced = extra >= 0;
  return mc(
    "5.10F",
    `Income: ${moneyLabel(income * 100)}. Expenses: savings ${moneyLabel(save * 100)}, food ${moneyLabel(food * 100)}, fun ${moneyLabel(fun * 100)}, other ${moneyLabel((remaining - extra) * 100)}. Does this budget balance (income covers expenses)?`,
    leftover >= 0 && extra >= 0 ? "Yes — income covers the expenses." : "No — expenses are greater than income.",
    [
      leftover >= 0 ? "No — expenses are greater than income." : "Yes — income covers the expenses.",
      "Only if sales tax is ignored forever.",
      "Budgets never use subtraction.",
    ],
    `Add the expenses and compare with income. Remaining after listed items is ${moneyLabel(remaining * 100)} before the last category.`,
  );
}

export const generatorsData: Record<string, () => Question> = {
  "5.9A": gen59A,
  "5.9B": gen59B,
  "5.9C": gen59C,
  "5.10A": gen510A,
  "5.10B": gen510B,
  "5.10C": gen510C,
  "5.10D": gen510D,
  "5.10E": gen510E,
  "5.10F": gen510F,
};
