# 🔮 도트 오라클 (Dot Tarot)

> 레트로 픽셀 감성의 **다마고치형 타로 운세 앱**.
> 매일 한 장의 부적 카드를 뽑아 점술사 펫을 돌보고, AI가 풀어주는 타로 스프레드로 고민을 들여다보세요.

<p align="center">
  <img src="assets/icon.png" width="120" alt="Dot Tarot 아이콘" />
</p>

<p align="center">
  <img alt="Expo" src="https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white" />
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" />
  <img alt="Platform" src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey" />
</p>

---

## ✨ 소개

**도트 오라클**은 22장의 메이저 아르카나를 기반으로 한 타로 운세 앱입니다. 단순히 카드를 뽑는 데서 그치지 않고, **점술사 펫을 키우는 다마고치 루프**를 결합해 "매일 돌아오는 습관"을 만드는 것이 핵심입니다.

- 🐣 **펫 케어**: 점술사 펫에게 밥을 주고(`Feed`), 쓰다듬고(`Pet`), 미니게임을 함께 합니다. 펫의 컨디션(허기·기분)이 좋아야 타로를 볼 수 있습니다.
- 🃏 **데일리 부적**: 하루 한 번 무료로 "오늘의 카드"를 뽑아 저장하고, 출석 캘린더에 기록합니다.
- 🌌 **AI 타로 스프레드**: 연애·금전·직장·범용 주제로 3장을 뽑으면, 픽셀 세계의 점술사가 GPT 기반으로 해석을 들려줍니다.
- 📈 **성장 시스템**: 행동마다 XP를 얻어 레벨업하고, 펫이 수련생 → 대현자로 진화합니다.
- 🎁 **출석 보상**: 누적 출석일에 따라 특별한 카드 뒷면 스킨을 해금합니다.
- 🌐 **다국어**: 한국어 / 영어 지원.

---

## 🎮 주요 기능

### 1. 오늘의 부적 (Daily Card)
- 하루 1회 무료, 정·역방향 랜덤
- 결과 자동 저장 → 여정 캘린더에 출석 표시
- 카드 의미 + "오늘의 부적 한 줄" 제공

### 2. AI 타로 스프레드 (3-Card Spread)
- 주제: `범용(GENERAL)` · `연애(LOVE)` · `금전(MONEY)` · `직장(WORK)`
- 3장을 뽑으면 Cloudflare Worker를 거쳐 **OpenAI GPT-4o-mini**가 맥락 해석을 생성
- 결과에서 리워드 광고를 보고 **추가 리딩(Follow-up / Clarifier)** 해금 — 같은 고민을 더 깊이 들여다보기
- 광고 실패 시에도 무료 사용권/기록은 손해 보지 않도록 보장

### 3. 점술사 펫 (Tamagotchi)
- **스탯**: 허기(hunger) · 기분(mood), 각 0~100
- **시간 경과 감소**: 시간당 허기 -4 / 기분 -2 (배고프면 기분 1.5배 빠르게 감소, 최대 48시간 누적)
- **상호작용**: 먹이주기(쿨다운 30분) · 쓰다듬기(1분) · 미니게임(4시간, 하루 3회)
- **타로 게이팅**: 허기·기분이 모두 20 이상이어야 타로 가능 → 펫을 돌봐야 운세를 본다

### 4. 성장 & 진화 (XP / Level)
- 행동별 XP: 데일리 30 · 스프레드 50 · 심화 스프레드 80 · 미니게임 15
- **연속 출석 보너스**: 하루당 +10%, 최대 +50%
- **진화 단계**: 수련생(Lv1~4) → 여행자(5~9) → 숙련자(10~14) → 달인(15~24) → 대현자(25~30)

### 5. 여정 캘린더 & 기록 (Journal)
- 월간 캘린더에 뽑은 날 표시, 날짜를 탭하면 그날의 기록 상세 확인
- 리플렉션(메모) 입력으로 하루를 돌아보기

### 6. 출석 보상 스킨
- 누적 출석일 **14 / 28 / 42 / 56일** 마일스톤마다 새 카드 뒷면 스킨 해금
- 해금한 스킨으로 덱 커스터마이징

---

## 🛠 기술 스택

| 영역 | 사용 기술 |
|------|-----------|
| 프레임워크 | Expo SDK 54, React Native 0.81, React 19 |
| 언어 | TypeScript 5.9 |
| 내비게이션 | React Navigation (Native Stack + Bottom Tabs) |
| 상태 관리 | Zustand + AsyncStorage 영속화 |
| 애니메이션 | React Native Reanimated 4, Worklets |
| 광고 | Google Mobile Ads (AdMob Rewarded) |
| 햅틱 / UI | expo-haptics, expo-linear-gradient, expo-blur |
| 폰트 | Press Start 2P, Galmuri11 (픽셀 폰트) |
| 다국어 | i18n-js + expo-localization |
| AI 백엔드 | Cloudflare Workers + OpenAI GPT-4o-mini |
| 빌드 / 배포 | EAS Build & Submit |

---

## 📁 프로젝트 구조

```
taro-app/
├── App.tsx                  # 앱 진입점 (폰트 로드, ATT, 광고 초기화)
├── app.json                 # Expo 설정 (도트 오라클, 번들 ID, AdMob)
├── eas.json                 # EAS 빌드/제출 프로파일
├── src/
│   ├── navigation/          # RootNavigator(스택) + TabNavigator(3탭)
│   ├── screens/             # Home / QuestBoard(스프레드) / TrainingLog(기록) 등
│   ├── components/          # 픽셀 UI 키트 (PixelButton, PixelCard, theme …)
│   │   ├── Calendar/        # 캘린더 그리드
│   │   ├── Character/       # 캐릭터 스프라이트 · 레벨업 · XP 연출
│   │   └── Pet/             # 먹이주기 · 상호작용 · 스탯 바
│   ├── stores/              # Zustand 스토어 (pet, draw, spread, gating, reward …)
│   ├── config/              # 튜닝 가능한 설정 (pet, progression, topics)
│   ├── services/            # ai.ts (해석 API), ads.ts (AdMob)
│   ├── data/                # cards.json (22 메이저 아르카나), 카드 뒷면 스킨
│   ├── types/               # 도메인 타입 (card, draw, spread, pet, character …)
│   ├── utils/               # date, storage, cards 유틸
│   └── i18n/                # ko / en 번역
├── backend/                 # Cloudflare Worker AI API (별도 패키지)
│   └── src/
│       ├── index.ts         # /api/interpret, /api/interpret-followup, rate-limit
│       ├── prompts.ts       # 점술사 페르소나 프롬프트 빌더
│       └── rate-limit.ts    # KV 기반 IP 레이트 리밋
├── assets/                  # 아이콘, 카드 이미지, 캐릭터 스프라이트, 폰트
└── docs/                    # 운영 문서 (앱스토어 가이드, 로드맵, QA 체크리스트)
```

---

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+ 및 npm
- iOS 빌드: Xcode (macOS) / Android 빌드: Android Studio
- [Expo CLI](https://docs.expo.dev/) — `npx expo`로 사용

### 설치 & 실행

```bash
git clone https://github.com/geunee92/dot-tarot.git
cd dot-tarot
npm install

# 환경 변수 설정 (필수)
cp .env.example .env   # 이후 .env에 실제 값 입력 (아래 "환경 변수" 참고)

# 개발 서버 실행
npm start          # Expo 개발 서버 (QR/메뉴)
npm run ios        # iOS 시뮬레이터 (네이티브 빌드)
npm run android    # Android 에뮬레이터
npm run web        # 웹 (미리보기용)
```

### 환경 변수

비밀값은 소스에 하드코딩하지 않고 `.env`(gitignore됨)에서 주입합니다. Expo가 빌드 시 `EXPO_PUBLIC_*` 변수를 번들에 인라인합니다.

| 변수 | 설명 |
|------|------|
| `EXPO_PUBLIC_TARO_API_URL` | AI 해석 Worker URL |
| `EXPO_PUBLIC_TARO_APP_KEY` | Worker 인증용 App Key (Worker의 `APP_KEY` 시크릿과 동일해야 함) |
| `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID` / `_IOS` | 프로덕션 리워드 광고 단위 ID (미설정 시 Google 테스트 ID로 폴백) |

> ⚠️ 클라이언트에 들어가는 값은 앱 바이너리에 포함되므로 **완전한 비밀이 아닙니다**. `APP_KEY`는 무단 호출을 줄이는 1차 방어일 뿐, 실제 비용 보호는 서버 측 레이트리밋·예산 한도로 합니다.

> ⚠️ AdMob, Reanimated 등 네이티브 모듈을 사용하므로 **Expo Go가 아닌 개발 빌드(`expo-dev-client`)** 가 필요합니다. `npm run ios` / `npm run android`로 네이티브를 빌드하거나, EAS development 프로파일로 빌드하세요.

---

## 🤖 백엔드 (AI 해석 API)

타로 해석은 `backend/`의 **Cloudflare Worker**(`taro-ai-api`)가 담당합니다. 앱이 카드 정보를 보내면 Worker가 점술사 페르소나 프롬프트를 구성해 OpenAI를 호출하고 해석문을 돌려줍니다.

**엔드포인트**
- `POST /api/interpret` — 3장 스프레드 해석
- `POST /api/interpret-followup` — 추가 리딩 종합 해석
- `GET /api/rate-limit-status` — IP별 사용량 조회

**보안 / 제한**
- `X-App-Key` 헤더로 앱 인증
- IP당 일일 요청 수 제한 (KV 네임스페이스 `RATE_LIMIT`)
- `OPENAI_BASE_URL`은 허용된 도메인만 통과 (API 키 유출 방지)

**로컬 개발 & 배포**

```bash
cd backend
npm install
cp .dev.vars.example .dev.vars   # OPENAI_API_KEY, APP_KEY 등 입력
npm run dev                      # wrangler 로컬 개발 서버
npm run typecheck                # 타입 체크
npm run deploy                   # Cloudflare에 배포
```

**Worker 시크릿** (소스에 커밋하지 않음)
- `OPENAI_API_KEY` · `APP_KEY` 는 `wrangler secret put <NAME>` 으로 설정합니다.
- 앱(`.env`)의 `EXPO_PUBLIC_TARO_APP_KEY` 와 Worker의 `APP_KEY` 시크릿 값은 **반드시 동일**해야 인증이 통과합니다.
- 키가 노출됐다면 `wrangler secret put APP_KEY` 로 새 값을 넣고 앱 `.env`도 함께 교체(로테이션)하세요.

---

## 📦 빌드 & 배포 (EAS)

`eas.json`에 development / simulator / preview / production 프로파일이 정의되어 있습니다.

```bash
# 개발용 내부 빌드
eas build --profile development --platform ios

# 프로덕션 빌드 (버전 자동 증가)
eas build --profile production --platform ios

# 앱스토어 제출
eas submit --profile production --platform ios
```

- **iOS 번들 ID**: `com.geunee92.dot-oracle`
- **Android 패키지**: `com.geunee92.dotoracleapp`
- 앱스토어 제출 가이드 / 스크린샷 체크리스트 / AdMob 프로덕션 설정은 [`docs/`](./docs) 참고

---

## 🗺 로드맵

푸시 알림, 공유 카드, 스프레드 주제 확장, iOS 위젯, 인앱 결제, 켈틱 크로스 스프레드, Android 정식 출시 등 향후 계획은 [`docs/update-roadmap.md`](./docs/update-roadmap.md)에 정리되어 있습니다.

---

## 📂 관련 문서

| 문서 | 내용 |
|------|------|
| [`docs/update-roadmap.md`](./docs/update-roadmap.md) | 버전별 업데이트 로드맵 |
| [`docs/app-store-connect-guide.md`](./docs/app-store-connect-guide.md) | App Store Connect 제출 가이드 |
| [`docs/admob-production-setup.md`](./docs/admob-production-setup.md) | AdMob 프로덕션 설정 |
| [`docs/screenshot-checklist.md`](./docs/screenshot-checklist.md) | 스토어 스크린샷 체크리스트 |
| [`docs/dev-qa-checklist.md`](./docs/dev-qa-checklist.md) | 출시 전 QA 체크리스트 |
| [`docs/character-sprite-spec.md`](./docs/character-sprite-spec.md) | 캐릭터 스프라이트 스펙 |

---

## 📄 라이선스

개인 프로젝트입니다. 별도 표기가 없는 한 모든 권리는 저작자(© geunee92)에게 있습니다.
