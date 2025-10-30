import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import Theory from "./pages/Theory";
import Search from "./pages/Search";
import TheoryDetail from "./pages/TheoryDetail";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirectRoute from "./components/AuthRedirectRoute";
import NotFound from "./pages/NotFound";
import Curso from "./pages/Curso";
import CourseDetail from "./components/CourseDetail";
import CourseReview from "./pages/CourseReview"; 
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import TestVocacional from "./pages/TestVocacional";
import Memberships from "./pages/Memberships";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="fitness-edu-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route element={<AuthRedirectRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
              </Route>
              <Route element={<Layout />}>
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/test-vocacional" element={<TestVocacional />} />
                  <Route path="/curso" element={<Curso />} />
                  <Route path="/curso/:courseId" element={<CourseDetail />} />
                  <Route path="/course/:courseId/review" element={<CourseReview />} /> 
                  <Route path="/teoria" element={<Theory />} />
                  <Route path="/teoria/:contentId" element={<TheoryDetail />} />
                  <Route path="/membresias" element={<Memberships />} />
                  <Route path="/busqueda" element={<Search />} />
                  <Route path="/perfil" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
