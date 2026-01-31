import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const APP_TIMEZONE = 'Asia/Seoul';

dayjs.tz.setDefault(APP_TIMEZONE);

export const now = () => dayjs.tz(dayjs(), APP_TIMEZONE);

export const parseToKST = (date?: string | Date | dayjs.Dayjs) => {
    if (!date) return now();
    return dayjs(date).tz(APP_TIMEZONE);
};

export const formatKST = (
    date: string | Date | dayjs.Dayjs,
    format: string = 'YYYY-MM-DD HH:mm:ss'
) => {
    return parseToKST(date).format(format);
};

export const toKSTISOString = (date: string | Date | dayjs.Dayjs) => {
    return parseToKST(date).toISOString();
};

export const getKSTTimestamp = (date?: string | Date | dayjs.Dayjs) => {
    return parseToKST(date).valueOf();
};

export { dayjs };
export default dayjs;
