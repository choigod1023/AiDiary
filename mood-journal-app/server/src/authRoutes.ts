import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import {
  verifyGoogleToken,
  verifyNaverToken,
  normalizeOAuthUser,
} from "../utils/oauthUtils";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - provider
 *         - providerId
 *       properties:
 *         _id:
 *           type: string
 *           description: 사용자 고유 ID
 *         email:
 *           type: string
 *           description: 사용자 이메일
 *         name:
 *           type: string
 *           description: 사용자 이름
 *         avatar:
 *           type: string
 *           description: 사용자 프로필 이미지 URL
 *         provider:
 *           type: string
 *           enum: [google, naver]
 *           description: 소셜 로그인 제공자
 *         providerId:
 *           type: string
 *           description: 소셜 로그인 제공자의 사용자 ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 계정 생성 시간
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           description: 마지막 로그인 시간
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - accessToken
 *       properties:
 *         accessToken:
 *           type: string
 *           description: 소셜 로그인 제공자로부터 받은 액세스 토큰
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 로그인 성공 여부
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           description: JWT 토큰
 *         message:
 *           type: string
 *           description: 응답 메시지
 */

const router = express.Router();

// JWT 시크릿 키
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Google OAuth 로그인
 *     description: Google OAuth 액세스 토큰을 사용하여 로그인하거나 계정을 생성합니다.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 잘못된 요청 (액세스 토큰 누락)
 *       500:
 *         description: 서버 오류
 */
// Google OAuth 토큰 검증 및 사용자 생성/로그인
router.post("/google", async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        error: "Access token required",
        message: "Google 액세스 토큰이 필요합니다.",
      });
    }

    // Google OAuth API로 토큰 검증 및 사용자 정보 가져오기
    const googleUser = await verifyGoogleToken(accessToken);
    const normalizedUser = normalizeOAuthUser("google", googleUser);

    // 기존 사용자 확인 또는 새 사용자 생성
    let user = await User.findOne({
      provider: "google",
      providerId: normalizedUser.providerId,
    });

    if (!user) {
      // 새 사용자 생성
      user = new User({
        email: normalizedUser.email,
        name: normalizedUser.name,
        avatar: normalizedUser.avatar,
        provider: "google",
        providerId: normalizedUser.providerId,
      });
      await user.save();
    } else {
      // 마지막 로그인 시간 업데이트
      user.lastLoginAt = new Date();
      await user.save();
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProd = process.env.NODE_ENV === "production";
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("display_name", encodeURIComponent(user.name || ""), {
        httpOnly: false,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          provider: user.provider,
        },
        message: "Google 로그인 성공",
      });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      error: "Login failed",
      message: "Google 로그인에 실패했습니다.",
    });
  }
});

/**
 * @swagger
 * /api/auth/naver:
 *   post:
 *     summary: 네이버 OAuth 로그인
 *     description: 네이버 OAuth 액세스 토큰을 사용하여 로그인하거나 계정을 생성합니다.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 잘못된 요청 (액세스 토큰 누락)
 *       500:
 *         description: 서버 오류
 */
// 네이버 OAuth 토큰 검증 및 사용자 생성/로그인
router.post("/naver", async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        error: "Access token required",
        message: "네이버 액세스 토큰이 필요합니다.",
      });
    }

    // 네이버 OAuth API로 토큰 검증 및 사용자 정보 가져오기
    const naverUser = await verifyNaverToken(accessToken);
    const normalizedUser = normalizeOAuthUser("naver", naverUser);

    // 기존 사용자 확인 또는 새 사용자 생성
    let user = await User.findOne({
      provider: "naver",
      providerId: normalizedUser.providerId,
    });

    if (!user) {
      // 새 사용자 생성
      user = new User({
        email: normalizedUser.email,
        name: normalizedUser.name,
        avatar: normalizedUser.avatar,
        provider: "naver",
        providerId: normalizedUser.providerId,
      });
      await user.save();
    } else {
      // 마지막 로그인 시간 업데이트
      user.lastLoginAt = new Date();
      await user.save();
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProd = process.env.NODE_ENV === "production";
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("display_name", encodeURIComponent(user.name || ""), {
        httpOnly: false,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          provider: user.provider,
        },
        message: "네이버 로그인 성공",
      });
  } catch (error) {
    console.error("네이버 login error:", error);
    res.status(500).json({
      error: "Login failed",
      message: "네이버 로그인에 실패했습니다.",
    });
  }
});

// 토큰 검증
/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: 토큰 검증
 *     description: JWT 토큰의 유효성을 검증하고 사용자 정보를 반환합니다.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 토큰 검증 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 검증 성공 여부
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   description: 응답 메시지
 *       401:
 *         description: 토큰이 유효하지 않음
 */
router.get("/verify", authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    user: req.user,
    message: "토큰이 유효합니다.",
  });
});

// 사용자 정보 조회
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: 사용자 프로필 조회
 *     description: 인증된 사용자의 상세 프로필 정보를 조회합니다.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 조회 성공 여부
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 토큰이 유효하지 않음
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get(
  "/profile",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = await User.findById(req.user!.id).select("-__v");

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "사용자를 찾을 수 없습니다.",
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          provider: user.provider,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({
        error: "Profile fetch failed",
        message: "사용자 정보 조회에 실패했습니다.",
      });
    }
  }
);

// 로그아웃: 쿠키 삭제
router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      path: "/",
    })
    .clearCookie("display_name", {
      httpOnly: false,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      path: "/",
    })
    .json({ success: true });
});

export default router;
