import { useCallback, useState } from 'react';

export const useConfirm = () => {
    const [open, setOpen] = useState(false);
    const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback(
        () =>
            new Promise<boolean>((resolve) => {
                setResolver(() => resolve);
                setOpen(true);
            }),
        []
    );

    const handleClose = useCallback((accepted: boolean) => {
        resolver?.(accepted);
        setOpen(false);
        setResolver(null);
    }, [resolver]);

    return { open, confirm, handleClose };
};