import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useTheme } from 'next-themes';
import {
  ServiceAwsIcon,
  ServiceBlockchainIcon,
  ServiceHtml5Icon,
  ServiceMobileIcon,
  ServiceRealtimeIcon,
  ServiceWebResponsiveIcon,
} from '@/icons/icons';
import { cn } from '@/utils/cn';

const serviceList = [
  {
    key: 'aws',
    title: 'AWS Cloud',
    subtitle:
      'Our Service based on AWS Cloud Service for Security and Stability.',
    icon: <ServiceAwsIcon />,
  },
  {
    key: 'blockchain',
    title: 'Blockchain',
    subtitle:
      'It ensures transparency and stability and can participate in predictive platforms.',
    icon: <ServiceBlockchainIcon />,
  },
  {
    key: 'html5',
    title: 'HTML5 Web Standard',
    subtitle:
      'Developed by HTML5 Web Standard to support a variety of browsers.',
    icon: <ServiceHtml5Icon />,
  },
  {
    key: 'mobile',
    title: 'Mobile Application',
    subtitle: 'Any Where! Any Time! You can enjoy with Mobile.',
    icon: <ServiceMobileIcon />,
  },
  {
    key: 'responsibleWeb',
    title: 'Responsible Web',
    subtitle:
      'It is possible to participate in services from browsers on various devices through Responsible Web.',
    icon: <ServiceWebResponsiveIcon />,
  },
  {
    key: 'realtime',
    title: 'Realtime Service',
    subtitle:
      'If you have any questions about the service, please feel free to contact us.',
    icon: <ServiceRealtimeIcon />,
  },
];

const ServiceCard = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center gap-2 border-none p-8 text-center',
        'rounded-[32px]',
        'min-h-[246px]',
        isLightMode ? 'bg-[#0000000a]' : 'bg-[#ffffff0a]',
      )}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="flex h-[100px] w-[118px] items-center justify-center">
          {icon}
        </div>
        <Typography 
          className={cn(
            "text-xl font-medium lg:text-2xl",
            isLightMode ? "text-black" : "text-white"
          )} 
          level="h4"
        >
          {title}
        </Typography>
      </div>
      <Typography 
        className={cn(
          "text-sm leading-[140%]",
          isLightMode ? "text-black/60" : "text-white/60"
        )}
      >
        {subtitle}
      </Typography>
    </Card>
  );
};

export const Services = () => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  return (
    <div className="w-full">
      <div className="app-container py-10 lg:py-16">
        <div className={cn(
          "mb-5 xl:mb-10 text-center",
          isLightMode ? "text-black" : "text-white"
        )}>
          <Typography
            className="mb-2 font-medium md:mb-4 text-2xl lg:text-5xl"
            level="h2"
          >
            BOOM PLAY Service
          </Typography>
          <Typography level="h5" className="text-sm font-normal md:text-base">
            Operate the Service Through Advanced Technology
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-4 justify-self-center md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {serviceList.map(item => (
            <ServiceCard {...item} key={item.key} />
          ))}
        </div>
      </div>
    </div>
  );
};
