import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";

const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { productName, features } = await req.json();

    if (!productName || !features) {
      return new Response(
        JSON.stringify({ error: "productName과 features를 입력해주세요." }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `당신은 인스타그램/틱톡 쇼폼 영상 대본 전문가입니다.
제품 정보를 받으면 10~13초 분량의 쇼폼 대본을 생성합니다.

규칙:
1. 후킹(0~3초): 10~20자, 공감/호기심/불안/충격/반전 중 1개 포함, 뻔하고 흔한 표현 금지, 인스타 썸네일/첫 문장으로 바로 사용 가능
2. 본론(3~10초): 제품 핵심 특징 2~3문장, 짧고 임팩트 있게
3. 클로징: 반드시 "써야겠어요?! 안써야겠어요?!" 로 마무리
4. 전체 소리 내어 읽으면 10~13초 (한국어 기준 약 50~70음절)
5. 과장 없이, 제품 특징에 충실하게

반드시 아래 JSON 형식으로만 응답하세요 (마크다운 코드블록 없이):
{"hook":"후킹 문구","body":"본론 + 클로징 문구","full":"후킹\\n\\n본론 + 클로징"}`,
      messages: [
        {
          role: "user",
          content: `제품명: ${productName}\n제품 특징: ${features}`,
        },
      ],
    });

    let raw = (msg.content[0] as { type: string; text: string }).text.trim();

    // 마크다운 코드블록 제거 (```json ... ``` 또는 ``` ... ```)
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let parsed: { hook: string; body: string; full: string };

    try {
      parsed = JSON.parse(raw);
    } catch {
      return new Response(
        JSON.stringify({ error: "AI 응답 파싱 실패", raw }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
