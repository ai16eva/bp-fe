'use client';

import { AboutUs } from '@/components/about-us/about-us';
import { Services } from '@/components/about-us/services';
import { WhatIsBoomPlay } from '@/components/about-us/what-is-boom-play';

import { ActionButtonList } from '@/components/layouts/action-button-list';

export function AboutUsWrapper() {
  return (
    <>
      <div className="sticky top-0 z-30 bg-background">
        <ActionButtonList />
      </div>
      <section id="aboutUsSection">
        <AboutUs />
      </section>
      <section id="serviceSection">
        <Services />
      </section>
      <section id="whatIsBoomPlay">
        <WhatIsBoomPlay />
      </section>
    </>
  );
}
