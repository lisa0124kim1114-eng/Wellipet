# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

웰리펫(Wellipet)은 친환경 반려용품 쇼핑몰 + AI 강아지 분석 서비스입니다. 순수 HTML/CSS/JS로 구성된 정적 사이트이며, 별도의 빌드 시스템 없이 브라우저에서 직접 열거나 정적 호스팅으로 배포합니다.

## 실행 방법

빌드 과정 없음. 파일을 직접 브라우저에서 열거나 로컬 서버로 실행:

```bash
# Python 간이 서버
python -m http.server 8080

# 또는 Node.js
npx serve .
```

## 기술 스택 및 외부 의존성

모든 의존성은 CDN으로 로드됨 (package.json 없음):

- **Supabase** (`@supabase/supabase-js@2`) — 인증(이메일/카카오), DB, 세션 관리
- **PortOne V2** — 결제 처리 (카드, 카카오페이, 네이버페이, 토스페이)
- **Kakao Maps SDK** — 주소 검색 (다음 우편번호 서비스)
- **Google Fonts** — Nunito, Noto Sans KR
- **Service Worker** (`sw.js`) — PWA 오프라인 캐싱

## 아키텍처

### 페이지 구성

| 파일 | 역할 |
|------|------|
| `index.html` | 메인 홈 |
| `shop.html` | 상품 목록 (카테고리/정렬 필터) |
| `product.html` | 상품 상세 |
| `cart.html` | 장바구니 |
| `checkout.html` | 주문/결제 (PortOne V2) |
| `success.html` / `fail.html` | 결제 완료/실패 |
| `mypage.html` | 주문내역, 찜목록, 프로필 |
| `ai.html` / `ai-hub.html` | AI 강아지 분석 허브 |
| `diary.html` | AI 강아지 일기 |
| `pet-voice.html` | 반려동물 소리 분석 |
| `mbti.html` | 강아지 MBTI |
| `walk.html` | 산책 기록 |
| `shelter.html` / `adoption.html` | 보호소/입양 |
| `donation.html` | 기부 |
| `admin.html` | 관리자 페이지 |

### 상태 관리 패턴

- **인증 상태**: Supabase 세션 (`_supabase.auth.getSession()`) → 각 페이지 `<script>` 안에서 직접 처리
- **장바구니**: `localStorage`의 `'cart'` 키 (JSON 배열)
- **결제 임시 데이터**: `localStorage`의 `'pendingOrder'` 키 → `success.html`에서 읽어 Supabase에 저장

### Supabase 연결

모든 페이지에서 동일한 패턴으로 초기화:

```js
const SUPABASE_URL = 'https://pzzunxgbzkhdqemmgavd.supabase.co';
const SUPABASE_KEY = '...anon key...';
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
```

### 디자인 시스템

CSS 변수 (`:root`)로 전체 컬러 통일:

```css
--pk: #c45c8a   /* 메인 핑크 */
--pkm: #e07aaa  /* 미디엄 핑크 */
--pkl: #f2aecb  /* 라이트 핑크 */
--pkp: #fce8f2  /* 페일 핑크 */
--pkbg: #fff5f9 /* 배경 */
--tx: #2a1a22   /* 텍스트 */
--muted: #a08090
--bd: #f0d8e6   /* 보더 */
```

폰트: 영문 제목 `Nunito` (800), 본문 `Noto Sans KR`

### 모바일 반응형

`@media(max-width:768px)` 기준. 모바일에서는 상단 nav를 숨기고 햄버거 메뉴(`.hamburger`, `.mobile-nav`) 사용.

## n8n 자동화

n8n MCP로 직접 접근 가능. 워크플로우 문제 발생 시 사용자에게 직접 하라고 하지 말고 아래 권한 범위 내에서 직접 처리:

- **할 수 있는 것**: 워크플로우 활성화/비활성화(publish/unpublish), 워크플로우 실행, 실행 결과 조회, 워크플로우 상세 확인
- **할 수 없는 것**: 실행 중인 execution 강제 종료, 노드 파라미터 직접 편집

주요 워크플로우:
| ID | 이름 | 설명 |
|----|------|------|
| `uKGbxyVx2Wv39G9s` | 🐥lofi - 풀세팅🐥 | 유튜브 lofi 영상 자동 생성·업로드 (매일 UTC 09:00) |

n8n 워크플로우 문제 시 체크 순서:
1. 워크플로우 상세 조회로 버전 불일치 여부 확인
2. 버전 불일치 시 unpublish → publish로 직접 해결
3. 실행 강제 종료가 필요한 경우에만 사용자에게 안내

## 주의사항

- 각 HTML 파일이 독립적으로 CSS와 JS를 포함 (공유 파일 없음). 공통 헤더/푸터 변경 시 **모든 파일을 개별 수정**해야 함.
- PortOne V2 채널키(`CHANNEL_KEY`)와 스토어ID(`STORE_ID`)는 `checkout.html` 내 JS에 하드코딩됨.
- PWA 캐시 버전은 `sw.js`의 `CACHE = 'wellipet-v1'` 상수로 관리.
