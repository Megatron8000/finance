import { Box } from '@mui/material';
import type { Currency } from '../../types/account';
import { CURRENCY_META } from '../../types/account';

interface CurrencyFlagProps {
    currency: Currency;
    size?: number;
}

export const CurrencyFlag = ({ currency, size = 24 }: CurrencyFlagProps) => {
    const meta = CURRENCY_META[currency];
    const url = `https://flagcdn.com/${size * 2}x${Math.round(size * 1.5)}/${meta.countryCode}.png`;

    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                bgcolor: '#f0f0f0',
            }}
        >
            <Box
                component="img"
                src={url}
                alt={meta.countryCode}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        </Box>
    );
};
