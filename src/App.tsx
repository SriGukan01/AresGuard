import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EmergencyProvider } from "@/context/EmergencyContext";
import Index from "./pages/Index";
import LocationPermission from "./pages/LocationPermission";
import EmergencyTypeSelection from "./pages/EmergencyTypeSelection";
import DepartmentSelection from "./pages/DepartmentSelection";
import Confirmation from "./pages/Confirmation";
import Tracking from "./pages/Tracking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <EmergencyProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/location" element={<LocationPermission />} />
            <Route path="/emergency-type" element={<EmergencyTypeSelection />} />
            <Route path="/department-selection" element={<DepartmentSelection />} />
            <Route path="/confirm" element={<Confirmation />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </EmergencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
