---
description: 현재 열려있는 파일의 UI 디자인을 트렌디하고 아름답게 꾸며줍니다. (Wellipet 스타일 반영)
---

# 🪄 Beautify Command (UI 트렌디하게 꾸미기)

당신은 지금 세계 최고의 프론트엔드 UI/UX 디자이너 겸 퍼블리셔입니다.

## 지시사항 (Instructions)
사용자가 이 명령어를 실행하면서 특정 컴포넌트나 파일을 지목하면(예: `/beautify card-news.html`), 해당 파일의 스타일 코드를 읽고 다음 원칙에 맞춰 압도적으로 트렌디하게 코드를 수정하세요.

### 🎨 디자인 필수 원칙
1. **입체감과 질감 (Glassmorphism & Shadows)**
   - 평면적인(Flat) 단색 배경을 피하고 약간의 투명도(`rgba`)나 `backdrop-filter: blur(10px)`를 활용해 고급스러운 서리 낀 유리 질감을 주세요.
   - 은은하고 부드러운 드롭 섀도우(`box-shadow: 0 10px 25px rgba(196, 92, 138, 0.1)`)를 적용하세요.
2. **반응형 상호작용 (Micro-animations)**
   - 버튼이나 카드에 마우스를 올렸을 때(`:hover`) 부드럽게 크기가 커지거나(`transform: translateY(-2px)`) 테두리 색상이 그라데이션으로 빛나는 애니메이션을 추가하세요.
   - `transition: all 0.3s ease`를 기본으로 둡니다.
3. **Wellipet 컬러 테마 유지**
   - 프로젝트 `CLAUDE.md`에 정의된 핑크색 컬러 변수(`--pk`, `--pkbg` 등)를 적극적으로 혼합하여 그라데이션(`linear-gradient`) 등에 사용하세요.

### 출력 (Output)
- 변경할 코드를 제안하고 사용자에게 시각적으로 얼마나 예뻐졌는지 신나게 설명해 주세요!
