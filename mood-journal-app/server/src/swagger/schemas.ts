export const schemas = {
  DiaryEntry: {
    type: "object",
    required: ["id", "title", "date", "emotion", "entry"],
    properties: {
      id: {
        type: "number",
        description: "일기 고유 ID",
      },
      title: {
        type: "string",
        description: "AI가 요약한 일기 제목",
      },
      date: {
        type: "string",
        description: "일기 작성 날짜 (한국 시간 형식)",
      },
      emotion: {
        type: "string",
        description: "감정 이모지",
      },
      entry: {
        type: "string",
        description: "일기 내용",
      },
      aiFeedback: {
        type: "string",
        description: "AI 피드백 (생성된 경우)",
      },
      aiFeedbackAt: {
        type: "string",
        format: "date-time",
        description: "AI 피드백 생성 시간",
      },
      visibility: {
        type: "string",
        enum: ["private", "shared"],
        description: "공개 여부",
      },
      shareToken: {
        type: "string",
        description: "공유 토큰 (공개된 경우)",
      },
      userId: {
        type: "string",
        description: "작성자 ID",
      },
    },
  },

  CreateDiaryRequest: {
    type: "object",
    required: ["entry"],
    properties: {
      entry: {
        type: "string",
        description: "일기 내용",
      },
      visibility: {
        type: "string",
        enum: ["private", "shared"],
        description: "공개 여부 (기본값: private)",
      },
      title: {
        type: "string",
        description: "사용자 입력 제목 (useAITitle이 false일 때 필요)",
      },
      useAITitle: {
        type: "boolean",
        description: "AI 제목 생성 사용 여부 (기본값: true)",
      },
    },
  },

  CreateDiaryResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "응답 메시지",
      },
      entry: {
        $ref: "#/components/schemas/DiaryEntry",
      },
    },
  },

  AIFeedbackRequest: {
    type: "object",
    properties: {
      entry: {
        type: "string",
        description: "일기 내용 (선택사항, 없으면 기존 내용 사용)",
      },
      emotion: {
        type: "string",
        description: "감정 (선택사항, 없으면 기존 감정 사용)",
      },
    },
  },

  AIFeedbackResponse: {
    type: "object",
    properties: {
      feedback: {
        type: "string",
        description: "AI 피드백 내용",
      },
      locked: {
        type: "boolean",
        description: "피드백 잠금 상태 (true면 재생성 불가)",
      },
      at: {
        type: "string",
        format: "date-time",
        description: "피드백 생성 시간",
      },
    },
  },

  EmotionAnalysis: {
    type: "object",
    properties: {
      diaryId: {
        type: "number",
        description: "일기 ID",
      },
      date: {
        type: "string",
        description: "분석 날짜",
      },
      emotions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            emotion: {
              type: "string",
              description: "감정 이름",
            },
            confidence: {
              type: "number",
              description: "감정 신뢰도",
            },
          },
        },
      },
      dominantEmotion: {
        type: "string",
        description: "주요 감정",
      },
    },
  },

  EmotionStats: {
    type: "object",
    properties: {
      totalEntries: {
        type: "number",
        description: "총 일기 수",
      },
      emotionDistribution: {
        type: "object",
        description: "감정별 분포",
      },
      averageConfidence: {
        type: "number",
        description: "평균 감정 신뢰도",
      },
    },
  },

  Comment: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "댓글 ID",
      },
      entryId: {
        type: "number",
        description: "일기 ID",
      },
      shareToken: {
        type: "string",
        description: "공유 토큰",
      },
      authorName: {
        type: "string",
        description: "작성자 이름",
      },
      content: {
        type: "string",
        description: "댓글 내용",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "작성 시간",
      },
    },
  },
};
