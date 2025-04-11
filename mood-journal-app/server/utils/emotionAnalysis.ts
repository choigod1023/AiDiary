import OpenAI from "openai";
import { IDiaryEntry } from "../models/DiaryEntry";
import { EmotionAnalysisModel } from "../models/EmotionAnalysis";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface EmotionAnalysis {
  date: string;
  emotions: {
    [key: string]: number;
  };
}

export interface OverallEmotionStats {
  totalEntries: number;
  averageEmotions: {
    [key: string]: number;
  };
  emotionTrends: {
    date: string;
    emotions: {
      [key: string]: number;
    };
  }[];
}

export async function analyzeEmotion(
  entry: string
): Promise<{ [key: string]: number }> {
  const prompt = `다음 일기 내용에서 감정을 분석해주세요. 각 감정의 비율을 0-100 사이의 숫자로 표현해주세요. 예시: {"행복": 60, "평온": 30, "기대": 10}
  
일기 내용: ${entry}`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "당신은 감정 분석 전문가입니다. 주어진 텍스트에서 감정을 분석하여 각 감정의 비율을 JSON 형식으로 반환해주세요.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 150,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content in response");
  }

  return JSON.parse(content);
}

export async function analyzeDiaryEntries(
  entries: IDiaryEntry[]
): Promise<EmotionAnalysis[]> {
  return Promise.all(
    entries.map(async (entry) => ({
      date: entry.date,
      emotions: await analyzeEmotion(entry.entry),
    }))
  );
}

export async function saveEmotionAnalysis(
  diaryId: number,
  date: string,
  entry: string
): Promise<void> {
  try {
    const emotions = await analyzeEmotion(entry);
    await EmotionAnalysisModel.findOneAndUpdate(
      { diaryId },
      { diaryId, date, emotions },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error saving emotion analysis:", error);
    throw error;
  }
}

export async function getLatestEmotionAnalyses(
  limit: number = 10
): Promise<EmotionAnalysis[]> {
  try {
    const analyses = await EmotionAnalysisModel.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    return analyses.map((analysis) => ({
      date: analysis.date,
      emotions: analysis.emotions,
    }));
  } catch (error) {
    console.error("Error fetching emotion analyses:", error);
    throw error;
  }
}

export async function getOverallEmotionStats(): Promise<OverallEmotionStats> {
  try {
    const analyses = await EmotionAnalysisModel.find().sort({ date: 1 });

    if (analyses.length === 0) {
      return {
        totalEntries: 0,
        averageEmotions: {},
        emotionTrends: [],
      };
    }

    // 모든 감정 키 수집
    const allEmotions = new Set<string>();
    analyses.forEach((analysis) => {
      Object.keys(analysis.emotions).forEach((emotion) =>
        allEmotions.add(emotion)
      );
    });

    // 평균 감정 계산
    const averageEmotions: { [key: string]: number } = {};
    allEmotions.forEach((emotion) => {
      const sum = analyses.reduce(
        (acc, curr) => acc + (curr.emotions[emotion] || 0),
        0
      );
      averageEmotions[emotion] = sum / analyses.length;
    });

    // 감정 추이 데이터 준비
    const emotionTrends = analyses.map((analysis) => ({
      date: analysis.date,
      emotions: analysis.emotions,
    }));

    return {
      totalEntries: analyses.length,
      averageEmotions,
      emotionTrends,
    };
  } catch (error) {
    console.error("Error calculating overall emotion stats:", error);
    throw error;
  }
}
