# React Native 학습 노트: DOT TAROT 프로젝트

> 이 문서는 DOT TAROT 앱 개발 과정에서 사용된 React Native 기술들을 정리한 학습 자료입니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [핵심 기술 스택](#2-핵심-기술-스택)
3. [상태 관리: Zustand](#3-상태-관리-zustand)
4. [네비게이션: React Navigation](#4-네비게이션-react-navigation)
5. [애니메이션: react-native-reanimated](#5-애니메이션-react-native-reanimated)
6. [공유 기능: react-native-share](#6-공유-기능-react-native-share)
7. [광고: react-native-google-mobile-ads](#7-광고-react-native-google-mobile-ads)
8. [다국어 지원: i18n](#8-다국어-지원-i18n)
9. [컴포넌트 패턴](#9-컴포넌트-패턴)
10. [프로젝트 구조](#10-프로젝트-구조)

---

## 1. 프로젝트 개요

### 앱 정보
- **이름**: 도트 타로 (DOT TAROT)
- **유형**: 타로 카드 리딩 앱
- **스타일**: 레트로 픽셀 아트
- **플랫폼**: iOS, Android

### 개발 환경
| 항목 | 버전/도구 |
|------|-----------|
| Framework | Expo SDK 54 |
| React | 19.1.0 |
| React Native | 0.81.5 |
| TypeScript | 5.9.2 |
| 빌드 | EAS Build |

### Expo Managed vs Bare Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  Expo Managed Workflow (이 프로젝트)                         │
│  ✅ expo-dev-client 사용                                    │
│  ✅ 네이티브 모듈 사용 가능 (react-native-share 등)          │
│  ✅ EAS Build로 빌드                                        │
│  ✅ Expo Go에서는 Expo 모듈만 테스트 가능                    │
└─────────────────────────────────────────────────────────────┘
```

**중요**: `expo-dev-client`를 사용하면 Expo의 편리함을 유지하면서 네이티브 모듈도 사용할 수 있습니다.

---

## 2. 핵심 기술 스택

### 의존성 목록 및 용도

| 패키지 | 용도 | 언제 사용? |
|--------|------|-----------|
| `zustand` | 상태 관리 | 전역 상태, 데이터 persist |
| `@react-navigation/*` | 화면 전환 | 탭, 스택 네비게이션 |
| `react-native-reanimated` | 애니메이션 | 부드러운 UI 애니메이션 |
| `react-native-gesture-handler` | 제스처 | 스와이프, 터치 이벤트 |
| `react-native-share` | 공유 | 이미지+텍스트 공유 |
| `react-native-view-shot` | 스크린샷 | 컴포넌트를 이미지로 캡처 |
| `react-native-google-mobile-ads` | 광고 | 보상형 광고 |
| `expo-haptics` | 진동 피드백 | 터치 반응 |
| `@react-native-async-storage/async-storage` | 로컬 저장 | 데이터 persist |
| `i18n-js` | 다국어 | 한국어/영어 지원 |
| `expo-localization` | 로케일 감지 | 시스템 언어 감지 |

---

## 3. 상태 관리: Zustand

### 왜 Zustand인가?

| 특징 | Redux | Context API | Zustand ✅ |
|------|-------|-------------|-----------|
| 보일러플레이트 | 많음 | 적음 | 최소 |
| 러닝 커브 | 높음 | 낮음 | 낮음 |
| 미들웨어 | 별도 설치 | 없음 | 내장 (persist) |
| 성능 | 좋음 | selector 없음 | 좋음 |
| TypeScript | 복잡 | 보통 | 간단 |

### 기본 패턴

```typescript
// stores/drawStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1️⃣ 인터페이스 정의
interface DrawState {
  // State
  draws: Record<string, DailyDraw>;
  isLoading: boolean;
  
  // Actions
  loadDraw: (dateKey: string) => Promise<DailyDraw | null>;
  createDraw: () => Promise<DailyDraw>;
}

// 2️⃣ Store 생성
export const useDrawStore = create<DrawState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      draws: {},
      isLoading: false,
      
      // 액션
      loadDraw: async (dateKey) => {
        // get()으로 현재 상태 읽기
        const existing = get().draws[dateKey];
        if (existing) return existing;
        
        // set()으로 상태 업데이트 (불변성 자동 유지)
        set((state) => ({
          draws: { ...state.draws, [dateKey]: newDraw },
        }));
        
        return newDraw;
      },
    }),
    {
      name: 'taro-draws',  // AsyncStorage 키
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 컴포넌트에서 사용

```typescript
// 방법 1: 전체 store 구독 (리렌더링 많음)
const { draws, loadDraw } = useDrawStore();

// 방법 2: selector로 필요한 것만 구독 (권장 ✅)
const draws = useDrawStore((state) => state.draws);
const loadDraw = useDrawStore((state) => state.loadDraw);

// 방법 3: 커스텀 훅으로 추출 (재사용)
export const useTodaysDraw = () => 
  useDrawStore((state) => state.getTodaysDraw());
```

### Persist + Hydration 패턴

```typescript
// 앱 시작 시 AsyncStorage에서 데이터 복원
{
  onRehydrateStorage: () => async (state) => {
    if (state) {
      state.setHydrated(true);  // hydration 완료 표시
    }
  },
  // 저장할 상태만 선택
  partialize: (state) => ({
    draws: state.draws,  // 이것만 persist
    // isLoading은 persist 안 함
  }),
}
```

---

## 4. 네비게이션: React Navigation

### 구조

```
RootNavigator (Native Stack)
├── TabNavigator (Bottom Tabs)
│   ├── DailyScreen
│   ├── SpreadsScreen
│   ├── JourneyScreen
│   └── SettingsScreen
├── DailyResultScreen
├── SpreadResultScreen
└── HistoryDetailScreen
```

### Tab Navigator 설정

```typescript
// navigation/TabNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen
        name="Daily"
        component={DailyScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ color }}>🌟</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

### Stack Navigator 설정

```typescript
// navigation/RootNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen 
        name="DailyResult" 
        component={DailyResultScreen}
        options={{
          animation: 'slide_from_right',  // 전환 애니메이션
        }}
      />
    </Stack.Navigator>
  );
}
```

### 타입 안전한 네비게이션

```typescript
// navigation/types.ts
export type RootStackParamList = {
  Tabs: undefined;
  DailyResult: { dateKey: string; isNewDraw: boolean };
  SpreadResult: { dateKey: string; spreadId: string; topic: string };
};

// 스크린에서 사용
type Props = NativeStackScreenProps<RootStackParamList, 'DailyResult'>;

export function DailyResultScreen({ route, navigation }: Props) {
  const { dateKey, isNewDraw } = route.params;  // 타입 안전!
  
  navigation.navigate('SpreadResult', {  // 자동완성 지원
    dateKey: '2024-01-01',
    spreadId: 'abc123',
    topic: 'LOVE',
  });
}
```

---

## 5. 애니메이션: react-native-reanimated

### 왜 Reanimated인가?

| 특징 | Animated (내장) | Reanimated ✅ |
|------|-----------------|---------------|
| 성능 | JS 스레드 | UI 스레드 (60fps) |
| 복잡한 애니메이션 | 어려움 | 쉬움 |
| 제스처 연동 | 별도 구현 | 자연스러운 통합 |
| 보간 | 제한적 | 자유로움 |

### 핵심 개념

```typescript
import Animated, {
  useSharedValue,      // 애니메이션 값
  useAnimatedStyle,    // 애니메이션 스타일
  withTiming,          // 타이밍 애니메이션
  interpolate,         // 값 보간
  runOnJS,             // UI → JS 스레드 전환
} from 'react-native-reanimated';
```

### 카드 뒤집기 애니메이션 구현

```typescript
// components/FlipCard.tsx
export const FlipCard = forwardRef<FlipCardRef, FlipCardProps>(
  ({ frontContent, backContent, duration = 600 }, ref) => {
    
    // 1️⃣ 공유 값 (0 = 뒷면, 1 = 앞면)
    const flipProgress = useSharedValue(0);

    // 2️⃣ 뒷면 스타일 (0→180도 회전)
    const backAnimatedStyle = useAnimatedStyle(() => {
      const rotateY = interpolate(
        flipProgress.value, 
        [0, 1],      // 입력 범위
        [0, 180]     // 출력 범위 (도)
      );
      return {
        transform: [
          { perspective: 1200 },  // 3D 효과
          { rotateY: `${rotateY}deg` },
        ],
        backfaceVisibility: 'hidden',  // 뒷면 숨기기
        zIndex: flipProgress.value < 0.5 ? 1 : 0,
      };
    });

    // 3️⃣ 앞면 스타일 (180→360도 회전)
    const frontAnimatedStyle = useAnimatedStyle(() => {
      const rotateY = interpolate(
        flipProgress.value, 
        [0, 1], 
        [180, 360]
      );
      return {
        transform: [
          { perspective: 1200 },
          { rotateY: `${rotateY}deg` },
        ],
        backfaceVisibility: 'hidden',
        zIndex: flipProgress.value >= 0.5 ? 1 : 0,
      };
    });

    // 4️⃣ 뒤집기 함수
    const triggerFlip = (toFlipped: boolean) => {
      flipProgress.value = withTiming(
        toFlipped ? 1 : 0,
        { 
          duration, 
          easing: Easing.inOut(Easing.ease) 
        },
        (finished) => {
          'worklet';  // UI 스레드에서 실행
          if (finished && onFlipEnd) {
            runOnJS(onFlipEnd)(toFlipped);  // JS 스레드로 콜백
          }
        }
      );
    };

    return (
      <View>
        <Animated.View style={[styles.card, backAnimatedStyle]}>
          {backContent}
        </Animated.View>
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
          {frontContent}
        </Animated.View>
      </View>
    );
  }
);
```

### Worklet이란?

```typescript
// UI 스레드에서 실행되는 함수
const callback = (finished: boolean) => {
  'worklet';  // 이 directive가 있으면 UI 스레드에서 실행
  
  // UI 스레드 → JS 스레드로 전환하려면:
  runOnJS(jsFunction)(param);
};
```

---

## 6. 공유 기능: react-native-share

### expo-sharing vs react-native-share

| 기능 | expo-sharing | react-native-share ✅ |
|------|--------------|----------------------|
| 파일 공유 | ✅ | ✅ |
| 텍스트 공유 | ❌ | ✅ |
| 이미지+텍스트 | ❌ | ✅ |
| Expo Go | ✅ | ❌ (dev-client 필요) |

### 컴포넌트를 이미지로 캡처

```typescript
// components/ShareableCard.tsx
import ViewShot from 'react-native-view-shot';

const SCALE = 3;  // 1080px = 360 * 3

export const ShareableCard = forwardRef<ShareableCardRef, Props>(
  ({ card, orientation }, ref) => {
    const viewShotRef = useRef<ViewShot>(null);

    // ref로 캡처 기능 노출
    useImperativeHandle(ref, () => ({
      capture: async () => {
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture?.();
          return uri || '';
        }
        return '';
      },
    }));

    return (
      <ViewShot
        ref={viewShotRef}
        options={{ 
          format: 'png', 
          quality: 1, 
          result: 'tmpfile'  // 임시 파일로 저장
        }}
        style={styles.container}  // 화면 밖에 위치
      >
        {/* 캡처할 컴포넌트 */}
        <View style={styles.card}>
          {/* ... */}
        </View>
      </ViewShot>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: -9999,  // 화면 밖에 숨기기
    top: -9999,
  },
  card: {
    width: 360 * SCALE,  // 1080px
    // ...
  },
});
```

### 이미지 + 텍스트 함께 공유

```typescript
// screens/DailyResultScreen.tsx
import Share from 'react-native-share';

const handleShare = async () => {
  try {
    // 1. 컴포넌트를 이미지로 캡처
    const uri = await shareableCardRef.current.capture();
    
    // 2. 이미지 + 메시지 함께 공유
    await Share.open({
      message: t('share.message'),  // 텍스트 메시지
      url: `file://${uri}`,         // 이미지 파일 경로
      type: 'image/png',
    });
  } catch (error) {
    // 사용자가 취소한 경우
    if (error.message?.includes('User did not share')) {
      return;  // 에러 아님
    }
    console.error('Share error:', error);
  }
};
```

---

## 7. 광고: react-native-google-mobile-ads

### 보상형 광고 패턴

```typescript
// services/ads.ts
import { RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ 
  ? 'ca-app-pub-3940256099942544/1712485313'  // 테스트 ID
  : 'ca-app-pub-XXXXX/YYYYY';                   // 프로덕션 ID

let rewardedAd: RewardedAd | null = null;

// 광고 미리 로드 (앱 시작 시)
export function loadAd() {
  rewardedAd = RewardedAd.createForAdRequest(adUnitId);
  rewardedAd.load();
}

// 광고 표시
export async function showRewardedAd(callbacks: {
  onRewarded: () => void;
  onError: (error: Error) => void;
  onClosed: () => void;
}) {
  if (!rewardedAd) return false;

  // 이벤트 리스너 등록
  const unsubscribeLoaded = rewardedAd.addAdEventListener(
    RewardedAdEventType.LOADED,
    () => rewardedAd?.show()
  );
  
  const unsubscribeEarned = rewardedAd.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    () => callbacks.onRewarded()
  );

  // 광고 로드
  rewardedAd.load();
  
  return true;
}
```

### RewardedAdButton 컴포넌트

```typescript
// components/RewardedAdButton.tsx
export function RewardedAdButton({
  title,
  onRewardEarned,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  
  // Gating store에서 쿨다운 체크
  const canShowAd = useGatingStore((state) => state.canShowAd);
  const markAdShown = useGatingStore((state) => state.markAdShown);

  const handlePress = async () => {
    if (!canShowAd()) return;  // 쿨다운 체크
    
    setIsLoading(true);
    
    const success = await showRewardedAd({
      onRewarded: () => {
        markAdShown();       // 쿨다운 시작
        onRewardEarned();    // 보상 지급
      },
      onClosed: () => setIsLoading(false),
    });
  };

  return (
    <Pressable onPress={handlePress} disabled={isLoading}>
      <Text>{cooldownRemaining > 0 
        ? `Wait ${cooldownRemaining}s...` 
        : title}</Text>
    </Pressable>
  );
}
```

---

## 8. 다국어 지원: i18n

### 설정

```typescript
// i18n/index.ts
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import ko from './translations/ko.json';
import en from './translations/en.json';

const i18n = new I18n({ ko, en });

// 시스템 언어 감지
i18n.locale = Localization.locale.startsWith('ko') ? 'ko' : 'en';
i18n.enableFallback = true;  // 번역 없으면 기본 언어 사용

export function useTranslation() {
  return { t: i18n.t.bind(i18n) };
}
```

### 번역 파일 구조

```json
// i18n/translations/ko.json
{
  "common": {
    "share": "공유하기",
    "backHome": "홈으로 돌아가기"
  },
  "share": {
    "message": "오늘의 타로 결과야! 🔮\n\nApp Store에서 DOT TAROT 검색",
    "error": "공유에 실패했어요"
  },
  "spreadResult": {
    "positions": {
      "flow": "흐름",
      "flowDesc": "현재 에너지와 흐름"
    }
  }
}
```

### 컴포넌트에서 사용

```typescript
function MyScreen() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('common.share')}</Text>
      <Text>{t('spreadResult.positions.flow')}</Text>
      
      {/* 변수 치환 */}
      <Text>{t('deck.nextRewardAt', { days: 7, remaining: 3 })}</Text>
      {/* "7일 출석 시 보상 (3일 남음)" */}
    </View>
  );
}
```

---

## 9. 컴포넌트 패턴

### forwardRef + useImperativeHandle

부모에서 자식 컴포넌트의 메서드를 호출해야 할 때:

```typescript
// 자식 컴포넌트
export interface TarotCardFlipRef {
  flip: () => void;
  flipTo: (flipped: boolean) => void;
}

export const TarotCardFlip = forwardRef<TarotCardFlipRef, Props>(
  (props, ref) => {
    const flipCardRef = useRef<FlipCardRef>(null);
    
    // 부모에게 노출할 메서드 정의
    useImperativeHandle(ref, () => ({
      flip: () => flipCardRef.current?.flip(),
      flipTo: (flipped) => flipCardRef.current?.flipTo(flipped),
    }));
    
    return <FlipCard ref={flipCardRef} />;
  }
);

// 부모 컴포넌트
function ParentScreen() {
  const cardRef = useRef<TarotCardFlipRef>(null);
  
  const handleReveal = () => {
    cardRef.current?.flip();  // 자식 메서드 호출
  };
  
  return (
    <TarotCardFlip ref={cardRef} />
    <Button onPress={handleReveal} title="Reveal" />
  );
}
```

### 테마 시스템

```typescript
// components/theme.ts
export const COLORS = {
  background: '#0f0f23',
  surface: '#1a1a2e',
  accent: '#f8b500',
  text: '#f5f5f5',
  textMuted: '#a0a0a0',
  upright: '#4ade80',   // 정방향 (초록)
  reversed: '#f97316',  // 역방향 (주황)
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const FONTS = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
} as const;

// 사용
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderColor: COLORS.accent,
  },
  title: {
    fontSize: FONTS.lg,
    color: COLORS.text,
  },
});
```

### Haptic Feedback

```typescript
import * as Haptics from 'expo-haptics';

// 버튼 탭
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// 카드 뒤집기
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// 성공
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// 에러
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

## 10. 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── index.ts        # 배럴 export
│   ├── theme.ts        # 색상, 간격, 폰트 상수
│   ├── PixelButton.tsx
│   ├── PixelText.tsx
│   ├── FlipCard.tsx
│   ├── TarotCardFlip.tsx
│   ├── ShareableCard.tsx
│   └── RewardedAdButton.tsx
│
├── screens/             # 화면 컴포넌트
│   ├── DailyScreen.tsx
│   ├── DailyResultScreen.tsx
│   ├── SpreadsScreen.tsx
│   ├── SpreadResultScreen.tsx
│   └── SettingsScreen.tsx
│
├── navigation/          # 네비게이션 설정
│   ├── RootNavigator.tsx
│   ├── TabNavigator.tsx
│   └── types.ts
│
├── stores/              # Zustand 스토어
│   ├── drawStore.ts    # 일일 카드 뽑기
│   ├── spreadStore.ts  # 3장 스프레드
│   ├── gatingStore.ts  # 광고 쿨다운
│   └── rewardStore.ts  # 출석 보상
│
├── services/            # 외부 서비스
│   └── ads.ts          # AdMob 광고
│
├── i18n/                # 다국어
│   ├── index.ts
│   └── translations/
│       ├── ko.json
│       └── en.json
│
├── types/               # TypeScript 타입
│   ├── index.ts
│   ├── card.ts
│   └── spread.ts
│
└── utils/               # 유틸리티 함수
    ├── cards.ts        # 카드 관련 함수
    ├── date.ts         # 날짜 함수
    └── storage.ts      # AsyncStorage 래퍼
```

---

## 핵심 교훈

### 1. 네이티브 모듈이 필요할 때
- `expo-sharing` → `react-native-share`: 이미지+텍스트 공유 필요 시
- `expo-dev-client` 사용하면 네이티브 모듈 자유롭게 추가 가능
- 빌드 후 새 dev-client 설치 필요

### 2. 애니메이션은 UI 스레드에서
- `react-native-reanimated`로 60fps 애니메이션
- `useSharedValue` + `useAnimatedStyle` 조합
- `'worklet'` directive로 UI 스레드 실행

### 3. 상태 관리는 단순하게
- Zustand는 Redux 대비 보일러플레이트 90% 감소
- `persist` 미들웨어로 AsyncStorage 자동 연동
- selector로 필요한 상태만 구독

### 4. 타입 안전성
- 네비게이션 파라미터, 스토어, API 모두 타입 정의
- `as const` 사용으로 리터럴 타입 추론
- `forwardRef` + `useImperativeHandle` 제네릭 활용

---

## 다음 단계

- [ ] Apple Developer 승인 후 dev-client 빌드
- [ ] react-native-share 테스트 (이미지+텍스트 공유)
- [ ] AdMob 프로덕션 ID 적용
- [ ] App Store 제출

---

*이 문서는 2026년 1월 DOT TAROT 개발 과정에서 작성되었습니다.*
