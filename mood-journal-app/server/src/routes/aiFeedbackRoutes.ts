import express, { Request, Response } from "express";
import { DiaryEntryModel } from "../../models/DiaryEntry";
import { generateAIFeedback } from "../../utils/summaryUtils";

const router = express.Router();

/**
 * @swagger
 * /api/diary/{id}/ai-feedback:
 *   post:
 *     summary: AI 피드백 생성
 *     description: 특정 일기에 대한 AI 피드백을 생성합니다. 한번 생성되면 재생성할 수 없습니다.
 *     tags: [AI Feedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 일기 ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIFeedbackRequest'
 *     responses:
 *       200:
 *         description: AI 피드백 생성 성공 또는 기존 피드백 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIFeedbackResponse'
 *       400:
 *         description: 잘못된 ID 형식
 *       404:
 *         description: 일기를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// AI 피드백 생성 API
router.post("/:id/ai-feedback", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { entry, emotion } = req.body;

    const numericId = Number(id);
    if (isNaN(numericId)) {
      return res
        .status(400)
        .json({ error: "유효하지 않은 ID 형식입니다. 숫자 ID가 필요합니다." });
    }

    const diaryEntry = await DiaryEntryModel.findOne({ id: numericId });
    if (!diaryEntry) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    // 이미 피드백이 존재하면 재생성 금지
    if (diaryEntry.aiFeedback) {
      return res.json({
        feedback: diaryEntry.aiFeedback,
        locked: true,
        at: diaryEntry.aiFeedbackAt,
      });
    }

    // AI 피드백 생성
    const feedback = await generateAIFeedback(
      entry ?? diaryEntry.entry,
      emotion ?? diaryEntry.emotion
    );

    // 저장 및 반환
    diaryEntry.aiFeedback = feedback;
    diaryEntry.aiFeedbackAt = new Date();
    await diaryEntry.save();

    res.json({ feedback, locked: true, at: diaryEntry.aiFeedbackAt });
  } catch (error) {
    console.error("Error generating AI feedback:", error);
    res.status(500).json({ error: "Failed to generate AI feedback" });
  }
});

export default router;
