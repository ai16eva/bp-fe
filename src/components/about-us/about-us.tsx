import { Typography } from '@/components/ui/typography';

export const AboutUs = () => {
  return (
    <div className="app-container lg:pb-20 pt-10 md:pt-12 lg:pt-16">
      <div className="mx-auto w-full md:max-w-4xl flex flex-col items-center">
        <Typography
          className="mb-4 text-center font-medium text-2xl lg:text-5xl"
          level="h2"
        >
          About Us
        </Typography>
        <Typography className="text-center max-w-[700px]">
          “Welcome to BOOM PLAY, the ultimate decentralized Web3 prediction
          challenge platform powered by BNB! At BOOM PLAY, we are transforming
          the collective intelligence prediction experience by integrating
          real-time
          {' '}
          <span className="text-custom-blue-500">decentralized exchange (DEX)</span>
          {' '}
          swaps and innovative DAO (Decentralized Autonomous Organization)
          functionalities.“
        </Typography>
      </div>
      <div className="flex flex-col items-center justify-between lg:flex-row">
        <Typography className="order-2 w-full shrink-0 text-center md:max-w-4xl lg:order-1 lg:max-w-sm">
          Our platform is built for the community, by the community. BOOM PLAY
          isn't just a place to play and win; it’s a space where your voice
          matters. Through our unique
          {' '}
          <span className="text-custom-blue-500">DAO-driven model</span>
          , our community
          members actively participate in voting for quests, determining
          outcomes, and shaping the future of the platform. Your contributions
          and decisions are rewarded, making BOOM PLAY not only a gaming
          experience but a true decentralized ecosystem.
        </Typography>
        <div className="relative order-1 h-[340px] w-[400px] shrink-0 md:h-[442px] md:w-[524px] lg:order-2">
          <img
            alt="about-us-cover"
            src="/assets/images/about-us-bg.png"
            className="absolute inset-0 z-[-1] size-full object-cover"
          />
          <img
            alt="about-us"
            src="/assets/images/about-us.png"
            className="size-full object-cover"
          />
        </div>

        <Typography className="order-3 max-w-sm shrink-0 text-center max-xl:mt-5">
          Whether you're here to predict outcomes, engage in quests, or simply
          be part of an evolving community,
          {' '}
          <span className="text-custom-blue-500">BOOM PLAY offers you the tools, rewards, and freedom</span>
          {' '}
          to play on
          your terms. Join us as we redefine the world of prediction gaming with
          transparency, fairness, and fun at the core.
        </Typography>
      </div>
      <div className="mt-5 xl:mt-2 flex justify-center">
        <Typography
          level="h4"
          className="inline-flex items-center justify-center rounded-xl bg-[#1aa1ff1a] px-6 py-3 text-center text-sm font-semibold text-custom-blue-500 md:text-base lg:text-xl xl:text-2xl"
        >
          Welcome to the future of social challenges.
          <br className="md:hidden" />
          {' '}
          Welcome to BOOM PLAY!
        </Typography>
      </div>
    </div>
  );
};
