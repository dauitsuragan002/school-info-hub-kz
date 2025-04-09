import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import SchoolInfoPage from "./pages/SchoolInfoPage";
import MapPage from "./pages/MapPage";
import BirthdaysPage from "./pages/BirthdaysPage";
import { Footer } from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<SchoolInfoPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/welcome" element={<Index />} />
              <Route path="/birthdays" element={<BirthdaysPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
