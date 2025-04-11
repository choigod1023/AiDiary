// import { OpenAI } from "openai";

// const openai = new OpenAI({
//   apiKey: import.meta.env.VITE_OPENAI_API_KEY, // 환경 변수에 API 키를 저장하세요
// });

// export const detectEmotion = async (text: string): Promise<string> => {
//   try {
//     const response = await openai.completions.create({
//       model: "text-davinci-003",
//       prompt: `다음 텍스트의 주요 감정을 분석하세요: "${text}"`,
//       max_tokens: 10,
//     });

//     const emotion = response.choices[0].text?.trim();
//     return emotion || "Unknown";
//   } catch (error) {
//     console.error("감정 감지 오류:", error);
//     return "Error";
//   }
// };
