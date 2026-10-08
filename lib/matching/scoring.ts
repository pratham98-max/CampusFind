import { LostItem, FoundItem, Match } from "@/lib/supabase/types";
import {
  generateDenseEmbedding,
  calculateCosineSimilarity,
  calculateTokenJaccard,
} from "./embeddings";
import { dbStore } from "@/lib/data/store";

export interface MatchScoreResult {
  lostItemId: string;
  foundItemId: string;
  categoryMatch: boolean;
  embeddingScore: number;
  keywordScore: number;
  dateScore: number;
  confidenceScore: number;
}

/**
 * Computes multi-factor hybrid match confidence for candidate pair.
 */
export function scoreCandidatePair(
  lostItem: LostItem,
  foundItem: FoundItem
): MatchScoreResult | null {
  // 1. Hard Gate: Category MUST match exactly
  if (lostItem.category.trim().toLowerCase() !== foundItem.category.trim().toLowerCase()) {
    return null;
  }

  // 2. Date Score: 1 - (days_between / 30), clipped to [0, 1]
  const lostDate = new Date(lostItem.date_lost).getTime();
  const foundDate = new Date(foundItem.date_found).getTime();
  const daysDiff = Math.abs(foundDate - lostDate) / (1000 * 60 * 60 * 24);

  // If beyond 30 days window, disqualify
  if (daysDiff > 30) {
    return null;
  }

  const rawDateScore = 1 - daysDiff / 30;
  const dateScore = Math.max(0, Math.min(1, rawDateScore));

  // 3. Embedding Score: Cosine similarity between 384-dimensional dense vectors
  const lostEmbed =
    Array.isArray(lostItem.embedding) && lostItem.embedding.length === 384
      ? (lostItem.embedding as number[])
      : generateDenseEmbedding(`${lostItem.title} ${lostItem.description}`);

  const foundEmbed =
    Array.isArray(foundItem.embedding) && foundItem.embedding.length === 384
      ? (foundItem.embedding as number[])
      : generateDenseEmbedding(`${foundItem.title} ${foundItem.description}`);

  const embeddingScore = calculateCosineSimilarity(lostEmbed, foundEmbed);

  // 4. Keyword Score (Auxiliary token overlap)
  const keywordScore = calculateTokenJaccard(
    `${lostItem.title} ${lostItem.description}`,
    `${foundItem.title} ${foundItem.description}`
  );

  // 5. Total Confidence Score: 0.6 * embedding_score + 0.4 * date_score
  const confidenceScore = Number((0.6 * embeddingScore + 0.4 * dateScore).toFixed(4));

  return {
    lostItemId: lostItem.id,
    foundItemId: foundItem.id,
    categoryMatch: true,
    embeddingScore: Number(embeddingScore.toFixed(4)),
    keywordScore: Number(keywordScore.toFixed(4)),
    dateScore: Number(dateScore.toFixed(4)),
    confidenceScore,
  };
}

/**
 * Runs the matching engine whenever a found item is registered.
 * Scans lost items with status = 'reported' in the same org, scores candidates,
 * filters by confidence >= 0.55, keeps top 3, and saves them to the database.
 */
export async function runMatchingEngine(foundItem: FoundItem): Promise<Match[]> {
  // Retrieve candidate lost items in same org and category
  const allLost = dbStore.getAllItems({
    type: "lost",
    category: foundItem.category,
    status: "reported",
  }) as LostItem[];

  const scoredCandidates: Array<{
    lostItem: LostItem;
    score: MatchScoreResult;
  }> = [];

  for (const lostItem of allLost) {
    // Must be in same organization
    if (lostItem.org_id && foundItem.org_id && lostItem.org_id !== foundItem.org_id) {
      continue;
    }

    const scoreResult = scoreCandidatePair(lostItem, foundItem);
    if (scoreResult && scoreResult.confidenceScore >= 0.55) {
      scoredCandidates.push({
        lostItem,
        score: scoreResult,
      });
    }
  }

  // Sort descending by confidence score and pick top 3
  scoredCandidates.sort((a, b) => b.score.confidenceScore - a.score.confidenceScore);
  const topCandidates = scoredCandidates.slice(0, 3);

  const createdMatches: Match[] = [];

  for (const cand of topCandidates) {
    const newMatch = dbStore.createMatch({
      lost_item_id: cand.lostItem.id,
      found_item_id: foundItem.id,
      confidence_score: cand.score.confidenceScore,
      category_match: cand.score.categoryMatch,
      keyword_score: cand.score.keywordScore,
      date_score: cand.score.dateScore,
      embedding_score: cand.score.embeddingScore,
      status: "pending",
      confirmed_at: null,
      lost_item: cand.lostItem,
      found_item: foundItem,
    });

    createdMatches.push(newMatch);

    // Send email notification trigger
    try {
      const reporter = dbStore.getUserById(cand.lostItem.reporter_id);
      if (reporter) {
        const { sendMatchNotificationEmail } = await import("@/lib/email/send");
        await sendMatchNotificationEmail({
          to: reporter.email,
          recipientName: reporter.full_name,
          lostItemTitle: cand.lostItem.title,
          foundItemTitle: foundItem.title,
          matchId: newMatch.id,
          confidenceScore: cand.score.confidenceScore,
        });
      }
    } catch (emailErr) {
      console.warn("[Matching Engine] Notification email delivery skipped/mocked:", emailErr);
    }
  }

  return createdMatches;
}
