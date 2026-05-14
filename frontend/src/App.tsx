import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { useAuth } from './hooks/useAuth';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SavingsPage } from './pages/SavingsPage';
import { TransactionsPage } from './pages/TransactionsPage';

// Компонент-обертка для маршрутов, доступных только авторизованным пользователям.
const ProtectedRoutes = () => {
    const { isAuthenticated } = useAuth();

    // Если пользователь не авторизован, перенаправляем на страницу входа.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Для авторизованного пользователя отображаем основной layout приложения.
    return <AppLayout />;
};

export default function App() {
    return (
        <Routes>
            {/* Публичный маршрут: страница входа. */}
            <Route path="/login" element={<LoginPage />} />
            {/* Приватные маршруты, которые рендерятся только после проверки авторизации. */}
            <Route element={<ProtectedRoutes />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/savings" element={<SavingsPage />} />
            </Route>
            {/* Обработка неизвестных путей: перенаправление на главную страницу. */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
