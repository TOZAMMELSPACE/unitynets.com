import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Groups from "./pages/Groups";
import Settings from "./pages/Settings";
import UnityNote from "./pages/UnityNote";
import UnityGovernment from "./pages/UnityGovernment";
import ImpactReport from "./pages/ImpactReport";
import LearningZone from "./pages/LearningZone";
import TermsAndConditions from "./pages/TermsAndConditions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            {(props) => (
              <Routes>
                <Route path="/" element={<Index {...props} />} />
                <Route path="/notifications" element={<Notifications currentUser={props.currentUser} users={props.users} onSignOut={props.onSignOut} socialActions={props.socialActions} setUsers={props.setUsers} />} />
                <Route path="/messages" element={<Messages currentUser={props.currentUser} users={props.users} onSignOut={props.onSignOut} />} />
                <Route path="/explore" element={<Explore currentUser={props.currentUser} users={props.users} onSignOut={props.onSignOut} socialActions={props.socialActions} setUsers={props.setUsers} />} />
                <Route path="/unity-note" element={<UnityNote currentUser={props.currentUser} users={props.users} onSignOut={props.onSignOut} />} />
                <Route path="/impact-report" element={<ImpactReport currentUser={props.currentUser} users={props.users} onSignOut={props.onSignOut} />} />
                <Route path="/profile" element={<Profile currentUser={props.currentUser} onSignOut={props.onSignOut} posts={props.posts} onUpdateProfile={props.onUpdateProfile} />} />
                <Route path="/groups" element={<Groups currentUser={props.currentUser} onSignOut={props.onSignOut} />} />
                <Route path="/settings" element={<Settings currentUser={props.currentUser} onSignOut={props.onSignOut} />} />
                <Route path="/unity-government" element={<UnityGovernment currentUser={props.currentUser} users={props.users} onSignOut={props.onSignOut} />} />
                <Route path="/learning-zone" element={<LearningZone currentUser={props.currentUser} onSignOut={props.onSignOut} />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            )}
          </AppLayout>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

/**
 * UnityNet - A modern web platform
 * 
 * @author Tozammel Haque
 * @copyright 2025 Tozammel Haque. All rights reserved.
 * @license MIT - See LICENSE file
 * 
 * এই কোডটি শিক্ষামূলক উদ্দেশ্যে পাবলিক। বাণিজ্যিক ব্যবহারের জন্য যোগাযোগ করুন।
 */
