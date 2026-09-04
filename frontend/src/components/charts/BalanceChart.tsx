import { Card, CardContent, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Account } from '../../types/account';
import { formatCompactNumber, formatMoney, toNumber } from '../../utils/money';

interface BalanceChartProps {
    accounts: Account[];
}

export const BalanceChart = ({ accounts }: BalanceChartProps) => {
    const data = accounts.map((account) => ({
        name: account.name,
        balance: toNumber(account.balance),
        currency: account.currency
    })).sort((a, b) => b.balance - a.balance);
    const chartHeight = Math.max(260, data.length * 42 + 40);

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Баланс по счетам
                </Typography>
                <ResponsiveContainer width="100%" height={chartHeight}>
                    <BarChart data={data} layout="vertical" margin={{ top: 8, right: 72, bottom: 8, left: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tickFormatter={formatCompactNumber} />
                        <YAxis type="category" dataKey="name" width={140} tickLine={false} />
                        <Tooltip
                            formatter={(value, _name, item) => {
                                const currency = item.payload?.currency;
                                return [formatMoney(Number(value), currency), 'Баланс'];
                            }}
                        />
                        <Bar dataKey="balance" fill="#42a5f5" radius={[0, 4, 4, 0]} name="Баланс">
                            <LabelList dataKey="balance" position="right" formatter={formatCompactNumber} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
