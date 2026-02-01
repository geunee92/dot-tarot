# AdMob 프로덕션 설정 가이드

## 현재 상태 (테스트 ID)

현재 앱은 Google 공식 테스트 ID를 사용 중입니다:

| 항목 | 테스트 ID |
|------|-----------|
| iOS App ID | `ca-app-pub-3940256099942544~1458002511` |
| Rewarded Ad Unit | `ca-app-pub-3940256099942544/1712485313` |

**⚠️ 프로덕션 출시 전 반드시 실제 ID로 교체해야 합니다!**

---

## 1단계: AdMob 계정 생성

### 1.1 계정 가입
1. [admob.google.com](https://admob.google.com) 접속
2. Google 계정으로 로그인
3. 전화번호 인증 완료
4. 결제 정보 입력 (수익 지급용)

### 1.2 계정 승인 대기
- 일반적으로 24시간 이내
- 드문 경우 최대 2주 소요
- 이메일로 승인 알림 수신

---

## 2단계: 앱 등록 및 Ad Unit 생성

### 2.1 앱 등록
1. AdMob 콘솔 → **앱** → **앱 추가**
2. 플랫폼 선택: **iOS**
3. 앱 정보 입력:
   - 앱 이름: `도트 타로`
   - App Store에 게시됨: 예/아니오 선택

### 2.2 App ID 확인
앱 등록 후 App ID 복사 (형식: `ca-app-pub-XXXXXXXX~XXXXXXX`)

### 2.3 Ad Unit 생성
1. **광고 단위** → **광고 단위 추가**
2. **보상형** 선택 (앱에서 사용하는 형식)
3. 설정:
   - 이름: `도트타로_보상형_스프레드` (관리용)
   - 보상 설정: 기본값 유지
4. **만들기** 클릭
5. **Ad Unit ID** 복사 (형식: `ca-app-pub-XXXXXXXX/XXXXXXXXXX`)

---

## 3단계: 코드에서 ID 교체

### 3.1 app.json 수정

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-실제앱ID~XXXXXXX",
          "iosAppId": "ca-app-pub-실제앱ID~XXXXXXX"
        }
      ]
    ]
  }
}
```

**파일 위치**: `/Users/geunee/Desktop/taro/taro-app/app.json`

### 3.2 ads.ts 수정

```typescript
// 현재 (테스트 ID)
const REWARDED_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-3940256099942544/5224354917',
  ios: 'ca-app-pub-3940256099942544/1712485313',
  default: 'ca-app-pub-3940256099942544/5224354917',
});

// 변경 후 (프로덕션 ID)
const REWARDED_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-실제광고ID/XXXXXXXXXX',
  ios: 'ca-app-pub-실제광고ID/XXXXXXXXXX',
  default: 'ca-app-pub-실제광고ID/XXXXXXXXXX',
});
```

**파일 위치**: `/Users/geunee/Desktop/taro/taro-app/src/services/ads.ts`

---

## 4단계: app-ads.txt 설정 (필수!)

### 4.1 app-ads.txt 생성
1. AdMob 콘솔 → 앱 → 앱 선택 → **app-ads.txt** 탭
2. 제공된 코드 복사

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

### 4.2 개발자 웹사이트에 게시
app-ads.txt 파일을 웹사이트 루트에 업로드:

**GitHub Pages 사용 시:**
```bash
# docs 폴더에 app-ads.txt 생성
echo "google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0" > docs/app-ads.txt
```

**접근 가능 URL:**
```
https://geunee92.github.io/dot-tarot/app-ads.txt
```

### 4.3 App Store 개발자 웹사이트 설정
App Store Connect에서 개발자 웹사이트 URL이 GitHub Pages URL과 일치해야 함:
- 개발자 웹사이트: `https://geunee92.github.io/dot-tarot/`

### 4.4 인증 확인
- AdMob에서 24-48시간 내 자동 인증
- 콘솔에서 "인증됨" 상태 확인

---

## 5단계: 개인정보처리방침 업데이트

AdMob 사용 시 필수 공개 내용:

1. **수집 데이터**: 기기 ID, IP 주소, 광고 상호작용
2. **사용 목적**: 맞춤형 광고 제공
3. **제3자 공유**: Google AdMob
4. **사용자 선택**: 맞춤 광고 비활성화 방법

**✅ 이미 완료됨**: `docs/privacy.html`에 AdMob 관련 내용 포함

---

## 6단계: 프로덕션 전 체크리스트

### AdMob 설정
- [ ] AdMob 계정 승인됨
- [ ] iOS 앱 등록됨
- [ ] 보상형 Ad Unit 생성됨
- [ ] App ID 복사함
- [ ] Ad Unit ID 복사함

### 코드 변경
- [ ] app.json에 프로덕션 App ID 입력
- [ ] ads.ts에 프로덕션 Ad Unit ID 입력
- [ ] 테스트 디바이스 설정 제거 확인

### app-ads.txt
- [ ] app-ads.txt 파일 생성
- [ ] GitHub Pages에 업로드
- [ ] URL 접근 가능 확인
- [ ] AdMob에서 인증 상태 확인 (24-48시간 후)

### 앱 설정
- [ ] App Store Connect에 개발자 웹사이트 URL 설정
- [ ] 개인정보처리방침 URL 설정
- [ ] ATT 권한 요청 설정 (app.json에 이미 포함)

---

## 7단계: 테스트

### 개발 빌드에서 테스트
```bash
# 테스트 ID로 빌드하여 광고 흐름 확인
eas build --platform ios --profile development
```

### 프로덕션 ID 교체 후 테스트
1. 실제 ID로 app.json, ads.ts 수정
2. 다시 빌드
3. 광고 로딩 확인
4. "테스트 모드" 라벨 없이 실제 광고 표시 확인

**⚠️ 주의**: 프로덕션 광고를 직접 클릭하지 마세요! 정책 위반입니다.

---

## 흔한 실수 방지

| 실수 | 해결책 |
|------|--------|
| 계정 승인 전 테스트 | 승인 이메일 대기 (최대 2주) |
| 테스트 ID 그대로 출시 | 출시 전 ID 교체 확인 |
| app-ads.txt 누락 | GitHub Pages에 파일 업로드 |
| 개발자 웹사이트 불일치 | App Store URL = GitHub Pages URL |
| 프로덕션 광고 클릭 | 테스트 시 광고 클릭 금지 |

---

## 빠른 참조: 교체할 파일

| 파일 | 위치 | 교체 내용 |
|------|------|-----------|
| `app.json` | 루트 | `iosAppId`, `androidAppId` |
| `ads.ts` | `src/services/` | `REWARDED_AD_UNIT_ID` |
| `app-ads.txt` | `docs/` (새로 생성) | AdMob 코드 |

---

## 프로덕션 출시 순서

1. AdMob 계정 생성 및 승인 대기
2. 앱 등록 + Ad Unit 생성
3. app-ads.txt 생성 및 업로드
4. 24-48시간 대기 (app-ads.txt 인증)
5. app.json + ads.ts ID 교체
6. 프로덕션 빌드
7. 테스트 (광고 로딩 확인)
8. App Store 제출
