import { Typography } from '@/components/ui/typography';
import { NotificationIcon } from '@/icons/icons';

type BoardItemProps = {
  name: string;
  date: string;
};

export const BoardItem = ({ name, date }: BoardItemProps) => {
  return (
    <div className="flex justify-between border-b border-[#bebebe] px-2 py-4 dark:border-none dark:bg-[rgba(26,161,255,0.1)] dark:rounded-xl dark:p-6 dark:mb-4 dark:gap-2.5">
      <div className="flex items-start gap-2.5">
        <NotificationIcon className="shrink-0 text-[32px] dark:mt-1 dark:text-base dark:text-[#149FFF]" />
        <div className="flex flex-col gap-2.5">
          <Typography level="body1" className="text-left font-bold dark:font-outfit dark:font-light dark:text-base dark:leading-[140%] dark:tracking-[0.14px] dark:text-white">{name}</Typography>
          <Typography level="body1" className="text-left font-bold dark:font-outfit dark:font-normal dark:text-sm dark:leading-[18px] dark:text-[#E4E4E4] dark:opacity-60 md:hidden">{date}</Typography>
        </div>
      </div>
      <div className="hidden md:block">
        <Typography level="body1" className="font-bold dark:font-outfit dark:font-normal dark:text-sm dark:text-[#E4E4E4]">{date}</Typography>
      </div>
    </div>
  );
};
