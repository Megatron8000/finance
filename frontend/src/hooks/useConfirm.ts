import { useCallback, useState } from 'react';

export const useConfirm = () => {
    // Флаг видимости диалога подтверждения.
    const [open, setOpen] = useState(false);
    // Сохраняем resolve текущего Promise, чтобы завершить его после выбора пользователя.
    const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback(
        // Открывает диалог и возвращает Promise с результатом выбора пользователя.
        () =>
            new Promise<boolean>((resolve) => {
                setResolver(() => resolve);
                setOpen(true);
            }),
        []
    );

    const handleClose = useCallback((accepted: boolean) => {
        // Возвращаем результат в Promise и сбрасываем внутреннее состояние.
        resolver?.(accepted);
        setOpen(false);
        setResolver(null);
    }, [resolver]);

    return { open, confirm, handleClose };
};
