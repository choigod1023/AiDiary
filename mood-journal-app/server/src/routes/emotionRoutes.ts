import express, { Request, Response } from "express";
import {
  getLatestEmotionAnalyses,
  getOverallEmotionStats,
} from "../../utils/emotionAnalysis";

const router = express.Router();

/**
 * @swagger
 * /api/diary/emotion/analysis:
 *   get:
 *     summary: 감정 분석 결과 조회
 *     description: 최근 감정 분석 결과를 조회합니다.
 *     tags: [Emotion Analysis]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 조회할 분석 결과 수
 *     responses:
 *       200:
 *         description: 감정 분석 결과 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EmotionAnalysis'
 *       500:
 *         description: 서버 오류
 */
// 감정 분석 결과 조회 API
router.get("/analysis", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const analyses = await getLatestEmotionAnalyses(limit);
    res.json(analyses);
  } catch (error) {
    console.error("Error fetching emotion analyses:", error);
    res.status(500).json({ error: "Failed to fetch emotion analyses" });
  }
});

/**
 * @swagger
 * /api/diary/emotion/stats:
 *   get:
 *     summary: 전체 감정 통계 조회
 *     description: 전체 일기의 감정 통계를 조회합니다.
 *     tags: [Emotion Analysis]
 *     responses:
 *       200:
 *         description: 감정 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmotionStats'
 *       500:
 *         description: 서버 오류
 */
// 전체 감정 통계 조회 API
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const stats = await getOverallEmotionStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching emotion stats:", error);
    res.status(500).json({ error: "Failed to fetch emotion stats" });
  }
});

export default router;
