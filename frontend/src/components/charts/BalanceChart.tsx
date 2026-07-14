import { Card, CardContent, Typography } from '@mui/material';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Account } from '../../types/account';
import { toNumber } from '../../utils/money';

interface BalanceChartProps {
    accounts: Account[];
}

export const BalanceChart = ({ accounts }: BalanceChartProps) => {
    const data = accounts.map((account) => ({
        name: account.name,
        balance: toNumber(account.balance)
    }));

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Баланс по счетам
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="balance" stroke="#1565c0" fill="#90caf9" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
