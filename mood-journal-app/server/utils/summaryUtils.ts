import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 환경 변수에서 API 키 가져오기
});

export async function summarizeTitle(entry: string): Promise<string> {
  // GPT API를 호출하여 제목을 요약
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "당신은 일기 내용을 한 줄로 요약하는 전문가입니다. 오늘의 일기 내용을 한 줄, 10자로 유머러스하고 위트있게 요약해줘.",
      },
      {
        role: "user",
        content: `다음 내용을 한 줄로 요약해줘: ${entry}`,
      },
    ],
    max_tokens: 60,
  });

  return response.choices[0].message.content || "요약 실패";
}

export async function convertEmotionToEmoji(entry: string): Promise<string> {
  // GPT API를 호출하여 감정을 분석하고 이모지로 변환
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "당신은 텍스트의 감정을 분석하고 적절한 이모지를 반환하는 전문가입니다. 감정에 대한 이모지만 반환하세요.",
      },
      {
        role: "user",
        content: `다음 글의 감정을 분석하고 적절한 이모지를 반환해줘: ${entry}`,
      },
    ],
    max_tokens: 10,
  });

  return response.choices[0].message.content || "😐";
}
