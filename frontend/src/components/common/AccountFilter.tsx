import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
    Box,
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    type SelectChangeEvent
} from '@mui/material';
import type { Account } from '../../types/account';
import { CurrencyFlag } from './CurrencyFlag';

interface AccountFilterProps {
    accounts: Account[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" color="primary" />;

export const AccountFilter = ({ accounts, selectedIds, onChange }: AccountFilterProps) => {
    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value as string[];
        if (value.length > 0) {
            onChange(value);
        }
    };

    return (
        <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel>Фильтр счетов</InputLabel>
            <Select
                multiple
                label="Фильтр счетов"
                value={selectedIds}
                onChange={handleChange}
                renderValue={(selected) =>
                    selected.length === accounts.length
                        ? 'Все счета'
                        : `Выбрано: ${selected.length}`
                }
            >
                {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            checked={selectedIds.includes(account.id)}
                        />
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <CurrencyFlag currency={account.currency} size={16} />
                                    {account.name}
                                </Box>
                            }
                        />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
