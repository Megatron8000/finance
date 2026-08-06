import { Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { MainPage } from './pages/MainPage';

const ProtectedRoutes = () => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <AppLayout />;
};

export default function App() {
    return (
        <ThemeProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoutes />}>
                    <Route path="/" element={<MainPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ThemeProvider>
    );
}
