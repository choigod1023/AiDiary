import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { DiaryEntryModel } from "../../models/DiaryEntry";
import UserModel from "../../models/User";
import {
  summarizeTitle,
  convertEmotionToEmoji,
} from "../../utils/summaryUtils";
import { generateShareToken } from "../../utils/shareUtils";
import { saveEmotionAnalysis } from "../../utils/emotionAnalysis";
import { authenticateToken, AuthenticatedRequest } from "../../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/diary:
 *   post:
 *     summary: 일기 저장
 *     description: 새로운 일기를 저장하고 AI가 제목을 요약하고 감정을 분석합니다.
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDiaryRequest'
 *     responses:
 *       201:
 *         description: 일기 저장 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateDiaryResponse'
 *       401:
 *         description: 인증되지 않은 요청
 *       500:
 *         description: 서버 오류
 */
// 일기 저장 API (인증 필요)
router.post(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        entry,
        visibility = "private",
        title: userTitle,
        useAITitle = true,
      } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      let finalTitle: string;

      if (useAITitle) {
        // AI가 제목 생성
        finalTitle = await summarizeTitle(entry);
      } else {
        // 사용자가 직접 입력한 제목 사용
        if (!userTitle || !userTitle.trim()) {
          return res
            .status(400)
            .json({ error: "Title is required when not using AI" });
        }
        finalTitle = userTitle.trim();
      }

      // 감정 이모지 변환
      const emotionEmoji = await convertEmotionToEmoji(entry);

      // 현재 날짜와 시간을 포맷팅 (월일시분까지)
      const now = new Date();
      const formattedDate = now.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // 공유 설정에 따른 추가 필드 설정
      const diaryData: any = {
        id: Date.now(), // 고유한 숫자 ID 생성
        title: finalTitle, // 최종 제목 (AI 생성 또는 사용자 입력)
        date: formattedDate, // 포맷팅된 날짜와 시간
        emotion: emotionEmoji, // 변환된 이모지
        entry,
        userId, // 사용자 ID 추가
        authorName: req.body.authorName || "익명", // 작성자 이름 추가
        visibility, // 공개 설정
      };

      // 링크 공유인 경우 공유 토큰 생성
      if (visibility === "shared") {
        diaryData.shareToken = generateShareToken();
      }

      const newEntry = new DiaryEntryModel(diaryData);

      await newEntry.save();

      // 감정 분석 수행 및 저장
      await saveEmotionAnalysis(newEntry.id, formattedDate, entry);

      res.status(201).json({
        message: "Diary entry saved successfully!",
        entry: newEntry,
      });
    } catch (error) {
      console.error("Error saving diary entry:", error);
      res.status(500).json({ error: "Failed to save diary entry" });
    }
  }
);

/**
 * @swagger
 * /api/diary:
 *   get:
 *     summary: 일기 목록 조회
 *     description: 사용자의 일기를 페이지네이션과 필터링을 적용하여 조회합니다.
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [private, shared]
 *         description: 공개 여부 필터
 *     responses:
 *       200:
 *         description: 일기 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DiaryEntry'
 *                 total:
 *                   type: integer
 *                   description: 전체 일기 수
 *                 page:
 *                   type: integer
 *                   description: 현재 페이지
 *                 totalPages:
 *                   type: integer
 *                   description: 전체 페이지 수
 *       401:
 *         description: 인증되지 않은 요청
 *       500:
 *         description: 서버 오류
 */
// 사용자별 일기 조회 API (인증 필요)
router.get(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10, visibility } = req.query;

      const filter: any = { userId };

      // 공개 설정별 필터링
      if (visibility && ["private", "shared"].includes(visibility as string)) {
        filter.visibility = visibility;
      }

      const entries = await DiaryEntryModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await DiaryEntryModel.countDocuments(filter);

      // 작성자 정보 조회하여 이름 추가
      try {
        const author = await UserModel.findById(userId);
        const entriesWithAuthor = entries.map((entry) => ({
          ...entry.toObject(),
          authorName: author?.name || "알 수 없음",
        }));

        res.json({
          entries: entriesWithAuthor,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
        });
      } catch (userError) {
        console.error("Error fetching author info:", userError);
        // 사용자 정보 조회 실패 시 기본 정보만 반환
        res.json({
          entries,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
        });
      }
    } catch (error) {
      console.error("Error fetching diary entries:", error);
      res.status(500).json({ error: "Failed to fetch diary entries" });
    }
  }
);

/**
 * @swagger
 * /api/diary/{id}:
 *   get:
 *     summary: 특정 일기 조회
 *     description: ID로 특정 일기를 조회합니다.
 *     tags: [Diary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 일기 ID
 *     responses:
 *       200:
 *         description: 일기 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryEntry'
 *       400:
 *         description: 잘못된 ID 형식
 *       404:
 *         description: 일기를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 특정 ID의 일기 조회 API (권한 검증 포함)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { token } = req.query; // URL 쿼리에서 토큰 확인

    // ID 유효성 검사
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return res
        .status(400)
        .json({ error: "유효하지 않은 ID 형식입니다. 숫자 ID가 필요합니다." });
    }

    const entry = await DiaryEntryModel.findOne({ id: numericId });

    if (!entry) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    // 권한 검증
    let hasAccess = false;
    let currentUserId: string | null = null;

    console.log("=== 권한 검증 시작 ===");
    console.log("Entry ID:", numericId);
    console.log("Entry userId:", entry.userId);
    console.log("Entry visibility:", entry.visibility);
    console.log("Query token:", token);
    console.log("Authorization header:", req.headers.authorization);

    // 1. 토큰이 있는 경우 인증된 사용자 확인
    if (token) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
        const decoded = jwt.verify(token as string, JWT_SECRET) as any;
        currentUserId = decoded.id;

        // 작성자 본인인 경우 접근 허용
        if (currentUserId === entry.userId) {
          hasAccess = true;
        }
      } catch (tokenError) {
        console.log("Token verification failed:", tokenError);
        // 토큰이 유효하지 않아도 계속 진행 (공개 게시글 확인)
      }
    }

    // 2. 공개 게시글이고 공유 토큰이 일치하는 경우 접근 허용
    if (
      !hasAccess &&
      entry.visibility === "shared" &&
      token === entry.shareToken
    ) {
      hasAccess = true;
    }

    // 3. 토큰이 없지만 Authorization 헤더로 인증된 사용자인 경우 확인
    if (!hasAccess && !token) {
      try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const bearerToken = authHeader.substring(7);
          const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
          const decoded = jwt.verify(bearerToken, JWT_SECRET) as any;
          currentUserId = decoded.id;

          // 작성자 본인인 경우 접근 허용
          if (currentUserId === entry.userId) {
            hasAccess = true;
          }
        }
      } catch (authError) {
        console.log("Authorization header verification failed:", authError);
      }
    }

    console.log("=== 권한 검증 결과 ===");
    console.log("hasAccess:", hasAccess);
    console.log("currentUserId:", currentUserId);

    // 4. 접근 권한이 없는 경우
    if (!hasAccess) {
      return res.status(403).json({
        error: "Access denied",
        message: "이 게시글에 접근할 권한이 없습니다.",
      });
    }

    // 작성자 정보 조회하여 이름 추가
    try {
      const author = await UserModel.findById(entry.userId);
      if (author) {
        const entryWithAuthor = {
          ...entry.toObject(),
          authorName: author.name,
        };
        res.json(entryWithAuthor);
      } else {
        // 작성자 정보를 찾을 수 없는 경우 기본 정보만 반환
        res.json(entry);
      }
    } catch (userError) {
      console.error("Error fetching author info:", userError);
      // 사용자 정보 조회 실패 시 기본 정보만 반환
      res.json(entry);
    }
  } catch (error) {
    console.error("Error fetching diary entry:", error);
    res.status(500).json({ error: "Failed to fetch diary entry" });
  }
});

/**
 * @swagger
 * /api/diary/{id}:
 *   put:
 *     summary: 일기 수정
 *     description: 기존 일기를 수정합니다. 작성자만 수정할 수 있습니다.
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 일기의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 일기 제목
 *               entry:
 *                 type: string
 *                 description: 일기 내용
 *               emotion:
 *                 type: string
 *                 description: 감정 상태
 *               visibility:
 *                 type: string
 *                 enum: [private, shared]
 *                 description: 공개 여부 (shared로 변경 시 자동으로 shareToken 생성)
 *     responses:
 *       200:
 *         description: 일기 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryEntry'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증되지 않은 요청
 *       403:
 *         description: 권한 없음 (작성자가 아님)
 *       404:
 *         description: 일기를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 일기 수정 API
router.put("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const {
      title,
      entry,
      useAITitle = false,
      visibility,
    } = req.body as {
      title?: string;
      entry?: string;
      useAITitle?: boolean;
      visibility?: "private" | "shared";
    };

    const diaryEntry = await DiaryEntryModel.findOne({ id: Number(id) });
    if (!diaryEntry) {
      return res.status(404).json({ error: "일기를 찾을 수 없습니다." });
    }

    if (diaryEntry.userId !== userId) {
      return res.status(403).json({ error: "권한이 없습니다." });
    }

    let finalTitle = title ?? diaryEntry.title;
    let finalEmotion = diaryEntry.emotion; // 감정은 기본적으로 기존 값 유지

    if (useAITitle) {
      // AI가 제목과 감정을 모두 재생성
      try {
        const src = entry ?? diaryEntry.entry;
        finalTitle = await summarizeTitle(src);
        finalEmotion = await convertEmotionToEmoji(src);
      } catch (error) {
        console.error("AI 제목/감정 생성 실패:", error);
        // AI 실패 시 기존 값 유지
        finalTitle = title ?? diaryEntry.title;
        finalEmotion = diaryEntry.emotion;
      }
    } else {
      // AI 사용하지 않는 경우: 제목은 사용자 입력, 감정만 AI 재생성
      try {
        if (entry) {
          finalEmotion = await convertEmotionToEmoji(entry);
        }
      } catch (error) {
        console.error("AI 감정 분석 실패:", error);
        // AI 실패 시 기존 감정 유지
        finalEmotion = diaryEntry.emotion;
      }
    }

    const updateDoc: any = {
      title: finalTitle,
      emotion: finalEmotion,
      aiFeedback: diaryEntry.aiFeedback,
      aiFeedbackAt: diaryEntry.aiFeedbackAt,
    };
    if (typeof entry === "string") updateDoc.entry = entry;
    if (visibility === "shared") {
      updateDoc.visibility = "shared";
      if (!diaryEntry.shareToken) {
        updateDoc.shareToken = generateShareToken();
      }
    } else if (visibility === "private") {
      updateDoc.visibility = "private";
      updateDoc.shareToken = undefined;
    }

    const updatedEntry = await DiaryEntryModel.findOneAndUpdate(
      { id: Number(id) },
      updateDoc,
      { new: true }
    );

    res.json(updatedEntry);
  } catch (error) {
    console.error("Error updating diary:", error);
    res.status(500).json({ error: "일기 수정에 실패했습니다." });
  }
});

/**
 * @swagger
 * /api/diary/{id}:
 *   delete:
 *     summary: 일기 삭제
 *     description: 기존 일기를 삭제합니다. 작성자만 삭제할 수 있습니다.
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 일기의 ID
 *     responses:
 *       200:
 *         description: 일기 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "일기가 삭제되었습니다."
 *       401:
 *         description: 인증되지 않은 요청
 *       403:
 *         description: 권한 없음 (작성자가 아님)
 *       404:
 *         description: 일기를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 일기 삭제 API
router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const entry = await DiaryEntryModel.findOne({ id: Number(id) });
      if (!entry) {
        return res.status(404).json({ error: "일기를 찾을 수 없습니다." });
      }

      if (entry.userId !== userId) {
        return res.status(403).json({ error: "권한이 없습니다." });
      }

      await DiaryEntryModel.deleteOne({ id: Number(id) });
      res.json({ message: "일기가 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting diary:", error);
      res.status(500).json({ error: "일기 삭제에 실패했습니다." });
    }
  }
);

export default router;
