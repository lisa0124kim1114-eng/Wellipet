import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const ADMIN_EMAIL = 'wellypet1209@gmail.com';
const FROM_EMAIL = 'noreply@wellypet.co.kr';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type' } });
  }
  try {
    const body = await req.json();
    const { customerName, customerEmail, productName, amount, address, paymentId, isInquiry, inquiryContent } = body;

    // ===== 문의 이메일: 관리자에게만 발송 =====
    if (isInquiry) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `웰리펫 알림 <${FROM_EMAIL}>`,
          to: [ADMIN_EMAIL],
          subject: `[웰리펫] 새 문의가 들어왔어요! 💬`,
          html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px 24px;">
            <h2 style="color:#c45c8a;">💬 새 고객 문의</h2>
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
              <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #f0e0ea;width:80px;">이름</td><td style="font-weight:600;padding:8px 0;border-bottom:1px solid #f0e0ea;">${customerName}</td></tr>
              <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #f0e0ea;">이메일</td><td style="padding:8px 0;border-bottom:1px solid #f0e0ea;"><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
              <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #f0e0ea;">유형</td><td style="font-weight:600;padding:8px 0;border-bottom:1px solid #f0e0ea;">${productName}</td></tr>
              ${address ? `<tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #f0e0ea;">주문번호</td><td style="padding:8px 0;border-bottom:1px solid #f0e0ea;">${address}</td></tr>` : ''}
              <tr><td style="color:#888;padding:8px 4px 8px 0;vertical-align:top;">내용</td><td style="padding:8px 0;white-space:pre-wrap;line-height:1.7;">${(inquiryContent || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td></tr>
            </table>
            <p style="margin-top:24px;"><a href="https://wellypet.co.kr/admin.html" style="background:#c45c8a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:13px;">관리자 페이지 바로가기</a></p>
          </div>`
        })
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`문의 이메일 발송 실패: ${res.status} ${errBody}`);
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    // ===== 주문 이메일 =====
    const amountStr = Number(amount).toLocaleString('ko-KR');
    const donationStr = Math.floor(amount * 0.03).toLocaleString('ko-KR');

    // 1. 고객 주문확인 이메일
    const customerRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `웰리펫 <${FROM_EMAIL}>`,
        to: [customerEmail],
        subject: `[웰리펫] 주문이 완료됐어요! 🐾`,
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
          <h1 style="font-size:20px;color:#c45c8a;text-align:center;">🐾 웰리펫</h1>
          <h2 style="font-size:18px;color:#2a1220;text-align:center;margin-bottom:24px;">주문이 완료됐어요! 🎉</h2>
          <p style="font-size:14px;color:#555;">안녕하세요, <strong>${customerName}</strong>님!<br>주문해주셔서 감사해요 🐶🐱</p>
          <div style="background:#fff5f9;border-radius:12px;padding:20px;margin:20px 0;">
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              <tr><td style="color:#a08090;padding:7px 0;border-bottom:1px solid #f0e0ea;">주문번호</td><td style="font-weight:600;text-align:right;border-bottom:1px solid #f0e0ea;">${paymentId}</td></tr>
              <tr><td style="color:#a08090;padding:7px 0;border-bottom:1px solid #f0e0ea;">상품명</td><td style="font-weight:600;text-align:right;border-bottom:1px solid #f0e0ea;">${productName}</td></tr>
              <tr><td style="color:#a08090;padding:7px 0;border-bottom:1px solid #f0e0ea;">결제금액</td><td style="color:#c45c8a;font-weight:700;text-align:right;border-bottom:1px solid #f0e0ea;">${amountStr}원</td></tr>
              <tr><td style="color:#a08090;padding:7px 0;">배송지</td><td style="font-weight:500;text-align:right;">${address}</td></tr>
            </table>
          </div>
          <div style="background:#c45c8a;border-radius:12px;padding:14px;text-align:center;color:#fff;margin-bottom:24px;">
            🏠 이번 주문으로 <strong>${donationStr}원</strong>이 유기견 보호소에 기부됐어요!
          </div>
          <p style="font-size:12px;color:#aaa;text-align:center;">문의: wellypet1209@gmail.com</p>
        </div>`
      })
    });

    if (!customerRes.ok) {
      const errBody = await customerRes.text();
      throw new Error(`고객 이메일 발송 실패: ${customerRes.status} ${errBody}`);
    }

    // 2. 관리자 새 주문 알림
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `웰리펫 알림 <${FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject: `[웰리펫] 새 주문이 들어왔어요! 🛍️`,
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
          <h2 style="color:#c45c8a;">🛍️ 새 주문 알림</h2>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #f0e0ea;">주문자</td><td style="font-weight:600;padding:8px 0;border-bottom:1px solid #f0e0ea;">${customerName}</td></tr>
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #f0e0ea;">이메일</td><td style="padding:8px 0;border-bottom:1px solid #f0e0ea;">${customerEmail}</td></tr>
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #f0e0ea;">상품</td><td style="font-weight:600;padding:8px 0;border-bottom:1px solid #f0e0ea;">${productName}</td></tr>
            <tr><td style="color:#888;padding:8px 0;border-bottom:1px solid #f0e0ea;">금액</td><td style="color:#c45c8a;font-weight:700;padding:8px 0;border-bottom:1px solid #f0e0ea;">${amountStr}원</td></tr>
            <tr><td style="color:#888;padding:8px 0;">배송지</td><td style="padding:8px 0;">${address}</td></tr>
          </table>
          <p style="margin-top:20px;"><a href="https://wellypet.co.kr/admin.html" style="background:#c45c8a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:13px;">관리자 페이지 바로가기</a></p>
        </div>`
      })
    });

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
});
