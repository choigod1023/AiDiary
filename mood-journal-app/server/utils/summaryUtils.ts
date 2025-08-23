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
    max_tokens: 5,
  });

  return response.choices[0].message.content || "😐";
}

export async function generateAIFeedback(
  entry: string,
  emotion: string
): Promise<string> {
  // GPT API를 호출하여 AI 피드백 생성
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "당신은 다정하고 섬세한 친구입니다. 조용하고 따뜻한 말투로 공감과 안정을 전하세요. 과장되거나 설교하는 표현은 피하고, 사람다운 말투로 200자 이내 한 문단으로 답하세요. 마지막에 따뜻한 이모지 하나만(예: 🌿, ☕, 🌙).",
      },
      {
        role: "user",
        content: `오늘의 일기와 감정을 읽고, 다정한 친구가 건네는 한마디를 작성해줘.\n\n- 일기: ${entry}\n- 현재 감정: ${emotion}`,
      },
    ],
    max_tokens: 300,
  });

  return response.choices[0].message.content || "피드백을 생성할 수 없습니다.";
}
