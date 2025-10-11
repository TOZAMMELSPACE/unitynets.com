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
                <Route path="/profile" element={<Profile currentUser={props.currentUser} onSignOut={props.onSignOut} posts={props.posts} onUpdateProfile={props.onUpdateProfile} />} />
                <Route path="/groups" element={<Groups currentUser={props.currentUser} onSignOut={props.onSignOut} />} />
                <Route path="/settings" element={<Settings currentUser={props.currentUser} onSignOut={props.onSignOut} />} />
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
