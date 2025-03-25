'use client';

import { useEffect } from 'react';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  DepthOfField,
  HueSaturation,
  BrightnessContrast,
  SMAA
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

interface PostProcessingEffectsProps {
  condition: string;
  timeOfDay: 'day' | 'night';
  intensity?: number;
  temperature?: number;
  isRaining?: boolean;
  isSnowing?: boolean;
  isFoggy?: boolean;
  hasLightning?: boolean;
}

const PostProcessingEffects = ({
  condition,
  timeOfDay,
  intensity = 0.5,
  temperature = 70,
  isRaining = false,
  isSnowing = false,
  isFoggy = false,
  hasLightning = false
}: PostProcessingEffectsProps) => {
  // Calculate base effect intensities
  const isDaytime = timeOfDay === 'day';
  const isExtremeCold = temperature < 32;
  const isExtremeHot = temperature > 90;

  // Dynamic bloom settings
  const bloomIntensity = isDaytime ? 0.5 : 0.8;
  const bloomLevels = isDaytime ? 3 : 5;
  
  // Weather-based color adjustments
  const getHueSaturation = () => {
    if (isExtremeCold) return { hue: 0.6, saturation: -0.2 }; // Cooler tones
    if (isExtremeHot) return { hue: -0.1, saturation: 0.2 }; // Warmer tones
    if (condition === 'cloudy') return { hue: 0, saturation: -0.2 };
    if (timeOfDay === 'night') return { hue: 0.1, saturation: -0.3 };
    return { hue: 0, saturation: 0 };
  };

  // Dynamic brightness/contrast based on conditions
  const getBrightnessContrast = () => {
    if (timeOfDay === 'night') return { brightness: -0.1, contrast: 0.2 };
    if (isFoggy) return { brightness: 0.1, contrast: -0.1 };
    if (condition === 'cloudy') return { brightness: -0.05, contrast: 0.1 };
    return { brightness: 0, contrast: 0 };
  };

  const { hue, saturation } = getHueSaturation();
  const { brightness, contrast } = getBrightnessContrast();

  return (
    <EffectComposer multisampling={4}>
      <SMAA />
      
      <HueSaturation
        hue={hue}
        saturation={saturation}
        blendFunction={BlendFunction.NORMAL}
      />

      <BrightnessContrast
        brightness={brightness}
        contrast={contrast}
        blendFunction={BlendFunction.NORMAL}
      />

      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        kernelSize={KernelSize.LARGE}
        levels={bloomLevels}
        blendFunction={BlendFunction.SCREEN}
      />

      <Vignette
        darkness={isDaytime ? 0.3 : 0.5}
        offset={0.5}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Weather-specific effects */}
      {(isRaining || isSnowing) && (
        <ChromaticAberration
          offset={[0.002 * intensity, 0.002 * intensity]}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={true}
          modulationOffset={0.5}
        />
      )}

      {isFoggy && (
        <DepthOfField
          focusDistance={0.01}
          focalLength={0.02}
          bokehScale={3}
          height={480}
        />
      )}

      {hasLightning && (
        <BrightnessContrast
          brightness={0.3}
          contrast={0.2}
          blendFunction={BlendFunction.OVERLAY}
        />
      )}
    </EffectComposer>
  );
};

export default PostProcessingEffects; 