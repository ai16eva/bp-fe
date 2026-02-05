import Image from 'next/image';

import { InstallButton } from '@/components/layouts/install-button';



export const Footer = () => {
  return (
    <footer className="w-full border-t border-[#E4E4E4] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] dark:border-[#15172C] dark:bg-[#15172C] dark:shadow-none">
      <div className="app-container flex flex-col gap-5 px-4 pb-[29px] pt-5">
        <div className="flex w-full items-center justify-between border-b border-[#E4E4E4] pb-5 dark:border-[rgba(255,255,255,0.1)]">
          <Image src="/logo.svg" alt="Boom Play" width={153} height={37} />
          <InstallButton />
        </div>

        <div className="flex w-full items-start justify-between gap-2.5 border-b border-[#E4E4E4] pb-5 dark:border-[rgba(255,255,255,0.1)]">
          <div className="flex flex-col gap-1">
            <h5 className="font-poppins text-sm font-semibold leading-[140%] text-black dark:text-white">
              Contact
            </h5>
            <a href="mailto:info@boomplay.io" className="font-poppins text-xs font-normal leading-[18px] text-[#1F1F1F] dark:text-sm dark:text-white">
              info@boomplay.io
            </a>
          </div>

          <div className="flex flex-col gap-1">
            <h5 className="font-poppins text-sm font-semibold leading-[140%] text-black dark:text-white">
              Social Platform
            </h5>
            <div className="flex items-center gap-1">
              <a
                href="https://x.com/1boomplay"
                rel="noopener noreferrer"
                target="_blank"
                className="flex size-8 items-center justify-center"
              >
                <Image
                  src="/assets/icons/x.png"
                  alt="X"
                  width={20}
                  height={20}
                  className="size-5 object-contain"
                />
              </a>
              <a
                href="https://t.me/UNILAPSEGlobal"
                rel="noopener noreferrer"
                target="_blank"
                className="flex size-8 items-center justify-center"
              >
                <Image
                  src="/assets/icons/telegram.png"
                  alt="Telegram"
                  width={20}
                  height={20}
                  className="size-5 object-contain"
                />
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-0.5 max-md:justify-center">
          <span className="font-poppins text-xs font-normal leading-[18px] text-[#1F1F1F] dark:font-light dark:text-[#767676]">
            Copyright ©
          </span>
          <span className="font-poppins text-xs font-semibold uppercase leading-[18px] text-[#1F1F1F] dark:text-white">
            BOOM Company
          </span>
          <span className="font-poppins text-xs font-normal leading-[18px] text-[#1F1F1F] dark:font-light dark:text-[#767676]">
            Co., LTD. All Rights Reserved.
          </span>
        </div>
      </div>

    </footer >
  );
};
