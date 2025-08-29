import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import PiiDocs from "./pages/PiiDocs";
import ToxDocs from "./pages/ToxDocs";
import JailbreakDocs from "./pages/JailbreakDocs";
import BanDocs from "./pages/BanDocs";
import PolicyDocs from "./pages/PolicyDocs";
import SecretsDocs from "./pages/SecretsDocs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="z-grid-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/about" element={<About />} />
            <Route path="/docs/pii-protection" element={<PiiDocs />} />
            <Route path="/docs/toxicity-protection" element={<ToxDocs />} />
            <Route path="/docs/jailbreak-detection" element={<JailbreakDocs />} />
            <Route path="/docs/ban-bias-safety" element={<BanDocs />} />
            <Route path="/docs/policy-moderation" element={<PolicyDocs />} />
            <Route path="/docs/secrets-detection" element={<SecretsDocs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
