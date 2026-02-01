import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_FAMILY } from './theme';

interface PixelTextProps {
  children: React.ReactNode;
  variant?: 'title' | 'heading' | 'body' | 'caption' | 'talisman';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
  useSystemFont?: boolean;
}

const KOREAN_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;

const hasKorean = (text: string): boolean => KOREAN_REGEX.test(text);

const PIXEL_FONT_SIZE_RATIO_VS_KOREAN = 0.85;

export function PixelText({
  children,
  variant = 'body',
  color,
  align = 'left',
  style,
  numberOfLines,
  useSystemFont = false,
}: PixelTextProps) {
  const textContent = React.Children.toArray(children)
    .map(child => (typeof child === 'string' || typeof child === 'number' ? String(child) : ''))
    .join('');
  const isKorean = hasKorean(textContent);
  
  let fontFamily: string | undefined;
  if (useSystemFont) {
    fontFamily = FONT_FAMILY.system;
  } else if (isKorean) {
    fontFamily = FONT_FAMILY.korean;
  } else {
    fontFamily = FONT_FAMILY.pixel;
  }

  const fontSizeScale = (!useSystemFont && !isKorean) ? PIXEL_FONT_SIZE_RATIO_VS_KOREAN : 1;
  const baseStyle = styles[variant];
  const baseFontSize = baseStyle.fontSize as number;
  const scaledFontSize = Math.round(baseFontSize * fontSizeScale);
  const baseLineHeight = 'lineHeight' in baseStyle ? (baseStyle.lineHeight as number) : undefined;
  const scaledLineHeight = baseLineHeight ? Math.round(baseLineHeight * fontSizeScale) : undefined;
  
  return (
    <Text
      style={[
        baseStyle,
        fontFamily && { fontFamily },
        fontSizeScale !== 1 && { 
          fontSize: scaledFontSize,
          ...(scaledLineHeight && { lineHeight: scaledLineHeight }),
        },
        color && { color },
        { textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  body: {
    fontSize: FONTS.md,
    color: COLORS.text,
    lineHeight: FONTS.md * 2,
  },
  caption: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    lineHeight: FONTS.sm * 1.8,
  },
  talisman: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
    color: COLORS.accent,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
