# 사주결 (四柱結) — 하이브리드 AI 사주 웹사이트 시안

생년월일시로 **사주팔자·오행 분포·오늘의 운세**를 무료로 보여 주고,
**2026·2027 신년운세 심층 리포트**를 유료로 파는 하이브리드 모델의 동작하는 프로토타입입니다.
빌드 도구 없이 순수 HTML/CSS/JS로 동작하며, 정적 호스팅(Vercel)과 서버리스 API 두 개로 구성됩니다.

```
ai-saju/
├── index.html                  # 랜딩 + 입력 + 무료 결과 + 유료 리포트 + FAQ (단일 페이지)
├── preview-home.png            # 입력 화면 스크린샷
├── preview-result.png          # 결과 화면 스크린샷
├── preview-home-mobile.png     # (보너스) 모바일 입력 화면
├── preview-result-mobile.png   # (보너스) 모바일 결과 화면
├── assets/
│   ├── css/style.css           # 한지 아이보리 + 먹 + 금 톤, 모바일 퍼스트
│   └── js/
│       ├── lunar-data.js       # 음력 월력 테이블 (1920–2049)
│       ├── saju-core.js        # 만세력 엔진: 음양력 변환·절기·사주팔자·십성·오행
│       ├── saju-reading.js     # 해석 엔진: 성향·오행 균형·오늘의 운세·신년운세
│       └── app.js              # 화면 조립, 결제 CTA, 모달, 토스트
├── api/
│   ├── reading.js              # POST /api/reading  — AI 심층 리포트 생성
│   ├── checkout.js             # POST /api/checkout — 결제 세션 생성
│   └── _lib/prompt.js          # 리포트 프롬프트/스키마
├── vercel.json · package.json · .env.example · robots.txt · sitemap.xml
```

## 1. 로컬에서 열기

```bash
cd projects/ai-saju
python3 -m http.server 8000      # 또는  npx serve . -l 8000
# 브라우저에서 http://localhost:8000
```

`index.html`을 파일로 바로 열어도 무료 풀이는 동작합니다(계산이 모두 브라우저 안에서 이루어짐).
단, `/api/*`는 로컬 서버나 Vercel에서만 응답하므로 결제·AI 연동 확인은 `vercel dev`를 권장합니다.

```bash
npm i -g vercel
vercel dev        # http://localhost:3000, api 함수까지 함께 실행
```

## 2. 무료 기능 (구현 완료)

| 기능 | 설명 |
| --- | --- |
| 양력·음력·윤달 변환 | 1920–2049, 한국천문연구원 음양력 기준 테이블 |
| 사주팔자 | 연주·월주·일주·시주, 천간·지지·십성·오행 |
| 절기 계산 | 태양 황경으로 12절(節) 입절 시각을 계산 (±5분 내외), 입춘·절입 기준으로 연주·월주 전환 |
| 오행 분포 | 여덟 글자 기준 막대 그래프 + 과다·부족 해설 |
| 기본 성향 | 일간(10천간)별 성향·강점·주의점·어울리는 자리 |
| 오늘의 운세 | 오늘 일진의 천간·지지와 내 일간·일지의 생극·합충으로 점수와 재물·인연·건강 풀이 생성 |
| 광고 슬롯 | 결과 상단·하단 AdSense 플레이스홀더 (`#ad-top`, `#ad-bottom`) |

**계산 기준(중요)**
- 시각은 한국표준시. 일주는 **자시(23:00)** 에 바뀌는 전통 기준을 사용합니다 (`saju-core.js`의 `CONFIG.dayBoundaryHour`에서 0으로 바꾸면 자정 기준).
- 연주는 입춘, 월주는 절입 시각에 바뀝니다.
- 절기 시각은 천문 계산식(Meeus 저정밀)으로 산출하므로 ±5분 오차가 있습니다. 태어난 시각이 절입과 5분 이내로 겹치는 경우만 영향을 받습니다.
- 진태양시(지방시) 보정은 하지 않았습니다. 필요하면 `compute()`에서 경도 보정을 추가하세요.

## 3. 유료 리포트 영역 (구현 완료 · 연동 지점만 비어 있음)

- 맛보기 문구 + **블러 처리된 심층 섹션** + 잠금 오버레이
- 3개 상품: 신년운세 19,000원 / 심층 리포트 39,000원 / 패키지 49,000원
- CTA → `POST /api/checkout` → 결제창 URL로 이동(키가 없으면 503 → 미리보기 모달)
- 결제 후 `POST /api/reading` → AI가 여섯 장 리포트 생성

### 3-1. AI API 연결 (OpenAI / Gemini)

1. 키 발급: OpenAI <https://platform.openai.com/api-keys> 또는 Google AI Studio <https://aistudio.google.com/apikey>
2. `.env.local`(로컬) / Vercel 프로젝트 환경변수에 등록
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini      # 원가: 장당 약 200~400원 수준
   # 또는
   GEMINI_API_KEY=...
   GEMINI_MODEL=gemini-2.0-flash
   ```
3. `api/reading.js`가 명식 요약(`api/_lib/prompt.js`)을 만들어 호출하고, JSON 스키마로 여섯 장을 받아 그대로 프런트에 반환합니다.
4. 프런트에서 리포트를 렌더링하는 화면은 아직 없습니다. `report.report.sections[]`를 그리면 됩니다(권장: `/report/[orderId]` 페이지).
5. 비용·남용 방지: 이미 IP당 분당 6회 제한이 걸려 있고, `REQUIRE_PAID_ORDER=true`로 두면 `orderId` 없는 요청을 402로 막습니다. 생성 결과는 결제 건 기준으로 DB(Supabase/Firebase/KV)에 저장해 재호출을 막으세요.

### 3-2. 결제 연결 (하나만 설정)

| PG | 필요한 환경변수 | 비고 |
| --- | --- | --- |
| 토스페이먼츠 | `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY` | 결제위젯/결제창. 국내 카드·카카오페이·네이버페이 |
| 포트원 V2 | `PORTONE_STORE_ID`, `PORTONE_CHANNEL_KEY`, `PORTONE_API_SECRET` | 여러 PG를 한 번에 |
| Stripe | `STRIPE_SECRET_KEY` | 해외 결제 |

- 결제 성공 후 `/payment/success?orderId=...` 페이지에서 **서버 검증**(토스 결제조회 API / 포트원 결제조회) 후 리포트 생성 권한을 주는 흐름을 권장합니다.
- 사업자등록·통신판매업 신고·환불 정책 페이지가 있어야 국내 PG 심사를 통과합니다.

## 4. 애드센스 붙이기

1. AdSense 승인 후 `index.html`의 `<head>`에 스크립트 추가
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossorigin="anonymous"></script>
   ```
2. `#ad-top`, `#ad-bottom` 안의 임시 문구를 `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-..." data-ad-slot="..." data-ad-format="auto" data-full-width-responsive="true"></ins>`로 교체
3. `(adsbygoogle = window.adsbygoogle || []).push({});` 호출
4. 승인 전에는 심사용으로 **콘텐츠 페이지(사주 용어 사전, 오늘의 일진 등)** 를 몇 개 더 두는 것이 유리합니다.

## 5. 배포

### 5-1. GitHub Pages (지금 라이브)

- 사이트: <https://y44313246-ux.github.io/ai-saju/>
- 저장소: <https://github.com/y44313246-ux/ai-saju> (public)
- 게시 소스: `gh-pages` 브랜치 루트 (GitHub Pages **Deploy from a branch**)
- 그래서 `main`에 푸시한 뒤에는 `gh-pages`도 같이 맞춰 줍니다.
  ```bash
  git push origin main:gh-pages
  ```
- 정적 호스팅이라 무료 풀이(만세력 계산·오늘의 운세·신년운세 샘플 모달)는 모두 그대로 동작하고,
  `/api/checkout`·`/api/reading`만 응답하지 않아 결제 버튼이 ‘미리보기 모달’로 대체됩니다.
- 수정사항이 사이트에 반영되기까지 보통 30초~2분 걸립니다(빌드 상태: 저장소 → Actions → pages build and deployment).

### 5-2. GitHub → Vercel 배포 (AI·결제까지 켤 때)

```bash
cd projects/ai-saju
git init && git add . && git commit -m "feat: 사주결 시안"
gh repo create ai-saju --private --source=. --push     # gh 로그인 필요
# 또는 GitHub 웹에서 저장소를 만들고
git remote add origin git@github.com:<계정>/ai-saju.git && git push -u origin main
```

Vercel:
1. <https://vercel.com/new> 에서 저장소 Import (Framework Preset: **Other**, Build Command 비움, Output Directory 비움)
2. Settings → Environment Variables 에 3-1·3-2의 키 등록 (Production/Preview)
3. Deploy → `https://<project>.vercel.app` 확인
4. Settings → Domains 에서 보유 도메인 연결 (가비아/후이즈에서 CNAME 또는 A 레코드)
5. `sitemap.xml`·`robots.txt`의 `sajugyeol.example.com`을 실제 도메인으로 교체

> `api/*.js`는 Vercel Node 함수로 자동 인식됩니다(`package.json`의 `"type": "module"` 사용 중).
> 정적 파일만으로도 무료 풀이는 완전히 동작하므로, 배포 후 키를 붙이는 순서로 진행해도 됩니다.

## 6. 오픈 전 체크리스트

- [ ] 도메인·브랜드 확정, `og:image` 제작(1200×630)
- [ ] 이용약관·개인정보 처리방침·환불 정책 페이지 (PG 심사 필수)
- [ ] 결제 검증 + 리포트 DB 저장 + 재열람 링크(이메일/문자)
- [ ] AI 결과 검수 규칙(금칙어·공포 조장·의료/투자 단정 금지) 서버단 필터
- [ ] 신년운세 상품은 12월 초부터 판매 피크 → 11월 중 오픈 권장
- [ ] 문의 채널(카카오톡 채널) 및 사업자 정보 표기

## 7. 알려진 한계

- 음력 변환은 1920–2049년만 지원합니다(테이블 범위).
- 시주는 ‘시간 모름’ 선택 시 3기둥으로 풀이합니다.
- 오늘의 운세는 규칙 기반 문장 생성이며, 같은 날 같은 사주는 항상 같은 결과가 나옵니다(재현 가능).
- 디자인 시안 단계로 실제 광고·결제·AI 호출은 키를 넣기 전까지 비활성입니다.
