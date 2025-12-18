import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ThemeProvider } from "@/hooks/useTheme";

// Lazy load page components for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Notifications = lazy(() => import("./pages/Notifications"));
const MessagesDB = lazy(() => import("./pages/MessagesDB"));
const Explore = lazy(() => import("./pages/Explore"));
const Profile = lazy(() => import("./pages/Profile"));
const Groups = lazy(() => import("./pages/Groups"));
const Settings = lazy(() => import("./pages/Settings"));
const UnityNote = lazy(() => import("./pages/UnityNote"));
const UnityGovernment = lazy(() => import("./pages/UnityGovernment"));
const ImpactReport = lazy(() => import("./pages/ImpactReport"));
const LearningZone = lazy(() => import("./pages/LearningZone"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const Auth = lazy(() => import("./pages/Auth"));
const PostView = lazy(() => import("./pages/PostView"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing page - Auth as main page */}
            <Route path="/" element={
              <Suspense fallback={<PageLoader />}>
                <Auth />
              </Suspense>
            } />
            
            {/* Public post view route */}
            <Route path="/post/:postId" element={
              <Suspense fallback={<PageLoader />}>
                <PostView />
              </Suspense>
            } />
            
            {/* Terms route outside AppLayout */}
            <Route path="/terms" element={
              <Suspense fallback={<PageLoader />}>
                <TermsAndConditions />
              </Suspense>
            } />
            
            {/* All other routes inside AppLayout (require auth) */}
            <Route path="/*" element={
              <AppLayout>
                {(props) => (
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/home" element={<Index {...props} />} />
                      <Route path="/notifications" element={<Notifications currentUser={props.currentUser} users={props.users} onSignOut={props.onSignOut} socialActions={props.socialActions} socialDB={props.socialDB} setUsers={props.setUsers} />} />
                      <Route path="/messages" element={<MessagesDB currentUserId={props.currentUserId} />} />
                      <Route path="/explore" element={<Explore currentUser={props.currentUser} currentUserId={props.currentUserId} users={props.users} onSignOut={props.onSignOut} socialActions={props.socialActions} socialDB={props.socialDB} setUsers={props.setUsers} />} />
                      <Route path="/unity-note" element={<UnityNote currentUser={props.currentUser} users={props.users} onSignOut={props.onSignOut} />} />
                      <Route path="/impact-report" element={<ImpactReport currentUser={props.currentUser} users={props.users} onSignOut={props.onSignOut} />} />
                      <Route path="/profile" element={<Profile currentUser={props.currentUser} onSignOut={props.onSignOut} posts={props.posts} onUpdateProfile={props.onUpdateProfile} users={props.users} socialDB={props.socialDB} />} />
                      <Route path="/groups" element={<Groups currentUser={props.currentUser} onSignOut={props.onSignOut} />} />
                      <Route path="/settings" element={<Settings currentUser={props.currentUser} onSignOut={props.onSignOut} />} />
                      <Route path="/unity-government" element={<UnityGovernment currentUser={props.currentUser} users={props.users} onSignOut={props.onSignOut} />} />
                      <Route path="/learning-zone" element={<LearningZone currentUser={props.currentUser} onSignOut={props.onSignOut} />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                )}
              </AppLayout>
            } />
          </Routes>
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
