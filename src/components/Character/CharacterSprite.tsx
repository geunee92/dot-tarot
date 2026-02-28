import React, { useEffect } from 'react';
import { StyleSheet, Image, ImageSourcePropType } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { EvolutionStage, CharacterAnimationState } from '../../types/character';
import { COLORS } from '../theme';

export interface CharacterSpriteProps {
  evolutionStage: EvolutionStage;
  animationState: CharacterAnimationState;
  size?: 'small' | 'medium' | 'large' | 'hero';
}

const CHARACTER_IMAGES: Record<EvolutionStage, ImageSourcePropType> = {
  apprentice: require('../../../assets/characters/apprentice.png'),
  journeyman: require('../../../assets/characters/journeyman.png'),
  adept: require('../../../assets/characters/adept.png'),
  master: require('../../../assets/characters/master.png'),
  grandmaster: require('../../../assets/characters/grandmaster.png'),
};

const STAGE_CONFIG: Record<EvolutionStage, { glow: string }> = {
  apprentice: { glow: '#a855f7' },
  journeyman: { glow: '#3b82f6' },
  adept: { glow: COLORS.accent },
  master: { glow: COLORS.aurora },
  grandmaster: { glow: '#ec4899' },
};

const SIZE_CONFIG = {
  small: { size: 48 },
  medium: { size: 80 },
  large: { size: 120 },
  hero: { size: 200 },
};

export function CharacterSprite({
  evolutionStage,
  animationState,
  size = 'medium',
}: CharacterSpriteProps) {
  const config = STAGE_CONFIG[evolutionStage];
  const dimensions = SIZE_CONFIG[size];

  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Reset animations
    cancelAnimation(translateY);
    cancelAnimation(scale);
    cancelAnimation(opacity);
    cancelAnimation(glowOpacity);

    translateY.value = 0;
    scale.value = 1;
    opacity.value = 1;
    glowOpacity.value = 0.5;

    switch (animationState) {
      case 'idle':
        translateY.value = withRepeat(
          withTiming(-4, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
          -1,
          true
        );
        break;
      case 'reading':
        glowOpacity.value = withRepeat(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
          -1,
          true
        );
        break;
      case 'happy':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-8, { duration: 300, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) })
          ),
          -1,
          false
        );
        break;
      case 'tired':
        translateY.value = withTiming(4, { duration: 1000 });
        opacity.value = withTiming(0.7, { duration: 1000 });
        break;
      case 'levelup':
        scale.value = withSequence(
          withTiming(1.2, { duration: 200 }),
          withRepeat(
            withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.quad) }),
            -1,
            true
          )
        );
        glowOpacity.value = withRepeat(
          withTiming(1, { duration: 300 }),
          -1,
          true
        );
        break;
    }
  }, [animationState]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowOpacity: glowOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: dimensions.size,
          height: dimensions.size,
        },
        animatedStyle,
        glowStyle,
        {
          shadowColor: config.glow,
          shadowRadius: animationState === 'levelup' ? 20 : 10,
        },
      ]}
    >
      <Image
        source={CHARACTER_IMAGES[evolutionStage]}
        style={{
          width: dimensions.size,
          height: dimensions.size,
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
});
