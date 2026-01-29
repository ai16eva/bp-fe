import { CheckIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import type { QuestDetail } from '@/types/schema';
import { getQuestUrl } from '@/utils/quest';
import { ShareIcon } from "@/icons/icons";

type QuestCardType = {
  quest: QuestDetail;
  isCopyable?: boolean;
};

export const QuestCard = ({ quest, isCopyable = true }: QuestCardType) => {
  const [copiedText, copy, setCopiedText] = useCopyToClipboard();

  return (
    <div className="relative aspect-[18/10] w-full overflow-hidden rounded-3xl bg-gray-200 shadow-xl lg:aspect-square lg:h-[500px] lg:w-[860px]">
      {isCopyable && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-6 top-6 z-[1] size-9 rounded-full border-none lg:size-16"
          onClick={() => {
            if (quest) {
              copy(getQuestUrl(quest.quest_key)).then(() =>
                setTimeout(() => {
                  setCopiedText('');
                }, 1000),
              );
            }
          }}
        >
          {copiedText
            ? (
              <CheckIcon className="size-4 lg:size-8" />
            )
            : (
              <ShareIcon className="size-4 lg:size-8" />
            )}
        </Button>
      )}
      <Image
        src={quest?.quest_image_url ?? ''}
        alt={quest?.quest_title ?? ''}
        fill
        className="object-cover"
        sizes="(max-width: 1280px) 100vw, 860px"
      />
    </div>
  );
};
