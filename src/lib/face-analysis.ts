import sharp from "sharp";

export type FaceAnalysisInput = {
  facialType?: string;
  problems?: string;
  age?: number;
  gender?: string;
};

export type ImageMetrics = {
  averageBrightness: number;
  rednessIndex: number;
  evennessScore: number;
};

export type AnalysisResult = {
  faceType: string;
  summary: string;
  recommendedSlugs: string[];
  metrics?: ImageMetrics;
};

const ALL_SLUGS = ["cleanser", "toner", "serum", "moisturizer"] as const;

function parseList(value?: string) {
  if (!value) return [] as string[];
  return value
    .toLowerCase()
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function inferFaceType(input: FaceAnalysisInput, metrics?: ImageMetrics): string {
  if (input.facialType?.trim()) {
    return input.facialType.trim();
  }

  const problems = parseList(input.problems);
  if (problems.includes("oiliness") || problems.includes("acne")) return "Oily / Combination";
  if (problems.includes("dryness") || problems.includes("flakiness")) return "Dry";
  if (problems.includes("sensitivity") || problems.includes("redness")) return "Sensitive";

  if (metrics) {
    if (metrics.rednessIndex > 0.18) return "Sensitive";
    if (metrics.averageBrightness < 95) return "Dry";
    if (metrics.evennessScore < 0.55) return "Combination";
    return "Normal";
  }

  return "Combination";
}

function scoreProducts(
  faceType: string,
  problems: string[],
  metrics?: ImageMetrics
): string[] {
  const type = faceType.toLowerCase();
  const scores: Record<string, number> = {
    cleanser: 1,
    toner: 1,
    serum: 1,
    moisturizer: 1,
  };

  if (type.includes("oily") || type.includes("combination")) {
    scores.cleanser += 2;
    scores.toner += 2;
  }
  if (type.includes("dry") || type.includes("sensitive")) {
    scores.moisturizer += 3;
    scores.serum += 1;
  }
  if (type.includes("normal")) {
    scores.toner += 1;
    scores.moisturizer += 1;
  }

  for (const p of problems) {
    if (["acne", "clogged pores", "oiliness", "dullness"].some((k) => p.includes(k))) {
      scores.cleanser += 2;
    }
    if (["large pores", "uneven tone", "dullness", "dehydration"].some((k) => p.includes(k))) {
      scores.toner += 2;
    }
    if (["wrinkles", "hyperpigmentation", "texture", "aging"].some((k) => p.includes(k))) {
      scores.serum += 3;
    }
    if (["dryness", "flakiness", "redness", "sensitivity"].some((k) => p.includes(k))) {
      scores.moisturizer += 3;
    }
  }

  if (metrics) {
    if (metrics.rednessIndex > 0.15) scores.moisturizer += 2;
    if (metrics.averageBrightness < 100) scores.moisturizer += 2;
    if (metrics.evennessScore < 0.5) {
      scores.serum += 2;
      scores.toner += 1;
    }
  }

  const ranked = [...ALL_SLUGS].sort((a, b) => scores[b] - scores[a]);
  const primary = ranked.slice(0, 3);
  if (!primary.includes("cleanser")) primary.unshift("cleanser");
  return [...new Set(primary)].slice(0, 4);
}

function buildSummary(faceType: string, problems: string[], slugs: string[], hasImage: boolean) {
  const concernText =
    problems.length > 0
      ? `We noted concerns around ${problems.join(", ")}.`
      : "No specific concerns were listed; we used general skin-balance guidelines.";

  const imageText = hasImage
    ? " Your uploaded photo was analyzed for tone evenness, brightness, and redness patterns."
    : "";

  const routine =
    slugs.includes("cleanser") && slugs.includes("moisturizer")
      ? "A cleanse → treat → moisturize routine is recommended."
      : "Follow the product order: cleanser, toner, serum, then moisturizer.";

  return `Your skin profile aligns with **${faceType}** type. ${concernText}${imageText} ${routine}`;
}

export async function analyzeImageBuffer(buffer: Buffer): Promise<ImageMetrics> {
  const { data, info } = await sharp(buffer)
    .resize(128, 128, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  let brightnessSum = 0;
  let redSum = 0;
  let greenSum = 0;
  let varianceSum = 0;
  const pixels = info.width * info.height;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    brightnessSum += luma;
    redSum += r;
    greenSum += g;
    varianceSum += Math.abs(r - g);
  }

  const averageBrightness = brightnessSum / pixels;
  const rednessIndex = Math.max(0, redSum / pixels / 255 - greenSum / pixels / 255);
  const evennessScore = 1 - Math.min(1, varianceSum / pixels / 80);

  return {
    averageBrightness: Math.round(averageBrightness * 10) / 10,
    rednessIndex: Math.round(rednessIndex * 1000) / 1000,
    evennessScore: Math.round(evennessScore * 1000) / 1000,
  };
}

export async function runFaceAnalysis(
  input: FaceAnalysisInput,
  imageBuffer?: Buffer
): Promise<AnalysisResult> {
  let metrics: ImageMetrics | undefined;
  if (imageBuffer) {
    metrics = await analyzeImageBuffer(imageBuffer);
  }

  const problems = parseList(input.problems);
  const faceType = inferFaceType(input, metrics);
  const recommendedSlugs = scoreProducts(faceType, problems, metrics);
  const summary = buildSummary(faceType, problems, recommendedSlugs, !!imageBuffer);

  return {
    faceType,
    summary,
    recommendedSlugs,
    metrics,
  };
}

export function scoresFromMetrics(
  metrics: ImageMetrics,
  previous?: ImageMetrics
) {
  const hydration = Math.min(
    100,
    Math.max(40, (metrics.averageBrightness / 180) * 100)
  );
  const clarity = Math.min(100, Math.max(35, metrics.evennessScore * 100));
  const rednessPenalty = metrics.rednessIndex * 120;
  const skin = Math.min(100, Math.max(30, (hydration + clarity) / 2 - rednessPenalty));

  let comparisonNotes: string | undefined;
  if (previous) {
    const dHydration = hydration - Math.min(100, (previous.averageBrightness / 180) * 100);
    const dClarity = clarity - previous.evennessScore * 100;
    const improved = dHydration + dClarity > 2;
    const declined = dHydration + dClarity < -2;
    if (improved) {
      comparisonNotes =
        "Compared to last week, your skin appears more even and hydrated. Keep your current routine consistent.";
    } else if (declined) {
      comparisonNotes =
        "Slight changes vs last week may be due to lighting or hydration. Stay consistent for 2–3 more weeks.";
    } else {
      comparisonNotes =
        "Scores are stable week over week — consistency is key for visible long-term improvement.";
    }
  }

  return {
    skinScore: Math.round(skin * 10) / 10,
    hydrationScore: Math.round(hydration * 10) / 10,
    clarityScore: Math.round(clarity * 10) / 10,
    comparisonNotes,
  };
}
