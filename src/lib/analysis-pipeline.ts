import { analyzeFaceWithAI, isAiVisionEnabled, type AiVisionResult } from "@/lib/ai-vision";
import {
  runFaceAnalysis,
  type AnalysisResult,
  type FaceAnalysisInput,
} from "@/lib/face-analysis";

export type FullAnalysisResult = AnalysisResult & {
  analysisSource: "local" | "ai" | "ai+local";
  aiInsight?: AiVisionResult;
};

function mergeSlugs(local: string[], ai?: string[]) {
  const combined = [...(ai ?? []), ...local];
  return [...new Set(combined)].slice(0, 4);
}

export async function runFullAnalysis(
  input: FaceAnalysisInput,
  imageBuffer?: Buffer
): Promise<FullAnalysisResult> {
  let aiResult: AiVisionResult | null = null;

  if (imageBuffer && isAiVisionEnabled()) {
    const notes = [input.facialType, input.problems].filter(Boolean).join("; ");
    aiResult = await analyzeFaceWithAI(imageBuffer, {
      age: input.age,
      gender: input.gender,
      userNotes: notes || undefined,
    });
  }

  const mergedInput: FaceAnalysisInput = {
    ...input,
    facialType: input.facialType || aiResult?.faceType,
    problems:
      input.problems ||
      (aiResult?.concerns.length ? aiResult.concerns.join(", ") : undefined),
  };

  const local = await runFaceAnalysis(mergedInput, imageBuffer);

  if (!aiResult) {
    return { ...local, analysisSource: "local" };
  }

  const summary = `${aiResult.summary}\n\n${local.summary.replace(/\*\*/g, "")}`;
  const faceType = aiResult.faceType || local.faceType;

  return {
    faceType,
    summary,
    recommendedSlugs: mergeSlugs(local.recommendedSlugs, aiResult.recommendedProductSlugs),
    metrics: local.metrics,
    analysisSource: "ai+local",
    aiInsight: aiResult,
  };
}
