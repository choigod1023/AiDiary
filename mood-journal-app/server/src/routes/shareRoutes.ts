import express, { Request, Response } from "express";
import { DiaryEntryModel } from "../../models/DiaryEntry";
import { generateShareLink } from "../../utils/shareUtils";

const router = express.Router();

/**
 * @swagger
 * /api/diary/shared/{token}:
 *   get:
 *     summary: 공유 일기 조회
 *     description: 공유 토큰을 사용하여 공개된 일기를 조회합니다.
 *     tags: [Sharing]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 공유 토큰
 *     responses:
 *       200:
 *         description: 공유 일기 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entry:
 *                   $ref: '#/components/schemas/DiaryEntry'
 *                 shareLink:
 *                   type: string
 *                   description: 공유 링크 URL
 *       404:
 *         description: 공유된 일기를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 공유 링크로 일기 조회 API (토큰으로 접근)
router.get("/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const diary = await DiaryEntryModel.findOne({
      shareToken: token,
      visibility: "shared",
    }).populate("userId", "name");

    if (!diary) {
      return res.status(404).json({
        error: "Shared diary not found",
        message: "공유된 일기를 찾을 수 없습니다.",
      });
    }

    res.json({
      entry: diary,
      shareLink: generateShareLink(
        token,
        req.get("origin") || "http://localhost:5173"
      ),
    });
  } catch (error) {
    console.error("Error fetching shared diary:", error);
    res.status(500).json({ error: "Failed to fetch shared diary" });
  }
});

export default router;
