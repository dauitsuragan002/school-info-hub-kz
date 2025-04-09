import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import SchoolInfoPage from "./pages/SchoolInfoPage";
import MapPage from "./pages/MapPage";
import BirthdaysPage from "./pages/BirthdaysPage";
import { Footer } from "./components/Footer";
import { useAuth, AuthProvider } from "./hooks/useAuth";
import { NavBar } from "./components/NavBar";

const queryClient = new QueryClient();

// Қорғалған маршрут компоненті
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('ProtectedRoute check - Auth status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
  
  // Жүктелу күйінде бос контент қайтару
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Жүктелуде...</div>;
  }
  
  // Аутентификация жоқ болса, тек админ беттеріне кіру формасын көрсету
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Аутентификация болса, қорғалған контентті көрсету
  return <>{children}</>;
};

// Қолданбаның лейауты
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <NavBar />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

// Болашақ флагтарын қосу
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppLayout>
        <SchoolInfoPage />
      </AppLayout>
    ),
  },
  {
    path: "/login",
    element: (
      <AppLayout>
        <div className="max-w-md mx-auto py-10">
          <h1 className="text-2xl font-bold mb-6 text-center">Жүйеге кіру</h1>
          <AdminPage />
        </div>
      </AppLayout>
    ),
  },
  {
    path: "/admin",
    element: (
      <AppLayout>
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: "/map",
    element: (
      <AppLayout>
        <MapPage />
      </AppLayout>
    ),
  },
  {
    path: "/welcome",
    element: (
      <AppLayout>
        <Index />
      </AppLayout>
    ),
  },
  {
    path: "/birthdays",
    element: (
      <AppLayout>
        <BirthdaysPage />
      </AppLayout>
    ),
  },
  {
    path: "*",
    element: (
      <AppLayout>
        <NotFound />
      </AppLayout>
    ),
  },
], 
{
  future: {
    v7_relativeSplatPath: true
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
