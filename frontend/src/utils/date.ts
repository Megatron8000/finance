import dayjs from 'dayjs';

// Возвращает текущую дату в формате YYYY-MM-DD для API.
export const today = () => dayjs().format('YYYY-MM-DD');
// Возвращает дату N дней назад в том же формате YYYY-MM-DD.
export const daysAgo = (days: number) => dayjs().subtract(days, 'day').format('YYYY-MM-DD');
// Преобразует дату в формате ISO в вид DD.MM.YYYY для интерфейса.
export const formatDate = (value: string) => dayjs(value).format('DD.MM.YYYY');
