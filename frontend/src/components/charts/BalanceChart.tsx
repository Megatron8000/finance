import { Card, CardContent, Typography } from '@mui/material';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Account } from '../../types/account';
import { toNumber } from '../../utils/money';

interface BalanceChartProps {
    accounts: Account[];
}

export const BalanceChart = ({ accounts }: BalanceChartProps) => {
    // Подготавливаем данные для графика: имя счета и числовой баланс.
    const data = accounts.map((account) => ({ name: account.name, balance: toNumber(account.balance) }));

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Баланс по счетам
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data}>
                        {/* Ось X показывает названия счетов. */}
                        <XAxis dataKey="name" />
                        {/* Ось Y автоматически масштабируется под значения баланса. */}
                        <YAxis />
                        {/* Всплывающая подсказка с данными при наведении. */}
                        <Tooltip />
                        {/* Область графика: линия и заливка для поля balance. */}
                        <Area type="monotone" dataKey="balance" stroke="#1565c0" fill="#90caf9" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
