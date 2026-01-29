import { Typography } from '@/components/ui/typography';
import { useTheme } from 'next-themes';
import { cn } from '@/utils/cn';

export const WhatIsBoomPlay = () => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  return (
    <div
      className="w-full py-[100px] max-lg:pt-0"
    >
      <div className="w-full px-8 text-center md:mx-auto md:max-w-[1200px]">
        <Typography
          level="h2"
          className={cn(
            "mb-4 lg:mb-14 font-medium text-2xl lg:text-5xl",
            isLightMode ? "text-brand" : "text-white"
          )}
        >
          What is BOOM PLAY
        </Typography>
        <Typography className="text-lg">
          BOOM PLAY is an innovative collective intelligence prediction platform
          where users generate and participate in predictions on various topics,
          receiving rewards based on their results. On this platform, prediction
          creators craft engaging prediction challenges, participants submit
          their best answers through analysis and discussion, and everyone
          competes and earns rewards based on actual outcomes.
        </Typography>
        <Typography className="text-lg mt-4">
          Your contributions and decisions are rewarded, making BOOM PLAY not
          only a prediction voting experience but a true decentralized
          ecosystem. Join us as we redefine the world of prediction challenge
          with transparency, fairness, and fun at the core.
        </Typography>
      </div>
    </div>
  );
};
