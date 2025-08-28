import express, { Request, Response } from "express";
import { DiaryEntryModel } from "../../models/DiaryEntry";
import { CommentModel } from "../../models/Comment";

const router = express.Router();

/**
 * @swagger
 * /api/diary/{id}/comments:
 *   get:
 *     summary: 일기 댓글 목록 조회
 *     description: 공유된 일기의 댓글 목록을 조회합니다. 공유 토큰이 필요합니다.
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 일기 ID
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 공유 토큰
 *     responses:
 *       200:
 *         description: 댓글 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         description: 잘못된 요청 (ID 또는 토큰 누락)
 *       403:
 *         description: 접근 권한 없음 (잘못된 토큰 또는 비공개 일기)
 *       404:
 *         description: 일기를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 댓글 목록 조회 (공유 토큰 필요)
router.get("/:id/comments", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const token = String(req.query.token || "");
    const entry = await DiaryEntryModel.findOne({ entryId: Number(id) });
    if (!entry) return res.status(404).json({ error: "Not found" });

    if (
      entry.visibility !== "shared" ||
      !entry.shareToken ||
      token !== entry.shareToken
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const comments = await CommentModel.find({
      entryId: Number(id),
      shareToken: token,
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ comments });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

/**
 * @swagger
 * /api/diary/{id}/comments:
 *   post:
 *     summary: 일기 댓글 작성
 *     description: 공유된 일기에 새로운 댓글을 작성합니다. 공유 토큰이 필요합니다.
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 일기 ID
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 공유 토큰
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 댓글 내용
 *               authorName:
 *                 type: string
 *                 description: 작성자 이름 (선택 사항)
 *     responses:
 *       201:
 *         description: 댓글 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: 잘못된 요청 (ID, 토큰 또는 내용 누락)
 *       403:
 *         description: 접근 권한 없음 (잘못된 토큰 또는 비공개 일기)
 *       404:
 *         description: 일기를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 댓글 작성 (공유 토큰 필요)
router.post("/:id/comments", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const token = String(req.query.token || "");
    const { content, authorName } = req.body || {};

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    const entry = await DiaryEntryModel.findOne({ entryId: Number(id) });
    if (!entry) return res.status(404).json({ error: "Not found" });

    if (
      entry.visibility !== "shared" ||
      !entry.shareToken ||
      token !== entry.shareToken
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const comment = new CommentModel({
      id: Date.now(),
      entryId: Number(id),
      shareToken: token,
      authorName,
      content: content.trim(),
    });
    await comment.save();
    res.status(201).json({ comment });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

export default router;
