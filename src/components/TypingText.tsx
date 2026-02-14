import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  useDerivedValue, 
  runOnJS, 
  withRepeat, 
  withSequence,
  withDelay,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';
import { COLORS, FONT_FAMILY, FONTS } from './theme';

interface TypingTextProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  style?: TextStyle;
  cursorColor?: string;
  showCursor?: boolean;
}

const KOREAN_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;
const hasKorean = (text: string): boolean => KOREAN_REGEX.test(text);

export function TypingText({
  text,
  speed = 30,
  delay = 0,
  onComplete,
  style,
  cursorColor = COLORS.accent,
  showCursor = true,
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isCursorVisible, setIsCursorVisible] = useState(true);
  
  const progress = useSharedValue(0);
  const previousLength = useSharedValue(0);
  const cursorOpacity = useSharedValue(1);

  const isKorean = hasKorean(text);
  const fontFamily = isKorean ? FONT_FAMILY.korean : FONT_FAMILY.pixel;
  
  const fontSize = FONTS.md;
  const lineHeight = fontSize * 2;

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    setTimeout(() => {
      setIsCursorVisible(false);
    }, 2000);
  };

  useEffect(() => {
    progress.value = 0;
    previousLength.value = 0;
    setDisplayedText('');
    setIsCursorVisible(true);
    cursorOpacity.value = 1;

    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(530, withTiming(1, { duration: 0 })),
        withDelay(530, withTiming(0, { duration: 0 }))
      ),
      -1
    );

    const duration = text.length * speed;

    progress.value = withDelay(
      delay,
      withTiming(text.length, {
        duration: duration,
        easing: Easing.linear,
      }, (finished) => {
        if (finished) {
          runOnJS(handleComplete)();
        }
      })
    );

    return () => {
      cancelAnimation(progress);
      cancelAnimation(cursorOpacity);
    };
  }, [text, speed, delay]);

  useDerivedValue(() => {
    const currentLength = Math.floor(progress.value);
    if (currentLength !== previousLength.value) {
      previousLength.value = currentLength;
      runOnJS(setDisplayedText)(text.substring(0, currentLength));
    }
  });

  const cursorAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cursorOpacity.value,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={[
        styles.text, 
        { 
          fontFamily,
          fontSize,
          lineHeight,
          color: COLORS.text 
        }
      ]}>
        {displayedText}
        {showCursor && isCursorVisible && (
          <Animated.Text style={[
            styles.cursor, 
            { 
              color: cursorColor,
              fontSize,
              lineHeight,
              fontFamily
            }, 
            cursorAnimatedStyle
          ]}>
            ▌
          </Animated.Text>
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  text: {
    color: COLORS.text,
  },
  cursor: {
  }
});
