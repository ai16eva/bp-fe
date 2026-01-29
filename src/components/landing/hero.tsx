'use client';

import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import type { ComponentPropsWithRef } from 'react';
import React from 'react';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { useDotButton } from '@/hooks/use-dot-button';
import { cn } from '@/utils/cn';

const heroImages = [
  '/assets/banners/1_welcome.jpg',
  '/assets/banners/2_daily_reward_open.jpg',
  '/assets/banners/3_creator.jpg',
  '/assets/banners/4_swap_open.jpg',
  '/assets/banners/5_get_your_dao.jpg',
];

export const Hero = () => {
  const [api, setApi] = React.useState<CarouselApi>();

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api);

  return (
    <div className="relative">
      <div className="size-full">
        <Carousel
          setApi={setApi}
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
          opts={{
            loop: true,
          }}
          className="size-full [&>div]:h-full"
        >
          <CarouselContent noSpace className="relative h-full">
            {heroImages.map((url, index) => (
              <CarouselItem key={index} noSpace>
                <div className="relative size-full">
                  <Image
                    src={url}
                    alt="hero"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4">
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            selected={index === selectedIndex}
          >
            {index}
          </DotButton>
        ))}
      </div>
    </div>
  );
};

type PropType = ComponentPropsWithRef<'button'> & {
  selected?: boolean;
};

export const DotButton: React.FC<PropType> = (props) => {
  const { children, className, selected = false, ...restProps } = props;

  return (
    <button
      className={cn(
        'border-2 rounded-full',
        'w-10 h-4 md:w-14 lg:w-20 lg:h-7',
        { 'bg-white border-border shadow-light': selected },
        { 'border-white/50': !selected },
        className,
      )}
      type="button"
      {...restProps}
    >
      <span className="sr-only">{children}</span>
    </button>
  );
};
