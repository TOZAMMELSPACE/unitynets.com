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
const LandingPage = lazy(() => import("./pages/LandingPage"));
const About = lazy(() => import("./pages/About"));
const Donation = lazy(() => import("./pages/Donation"));
const PublicLearningZone = lazy(() => import("./pages/PublicLearningZone"));
const PublicFeed = lazy(() => import("./pages/PublicFeed"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing page - New vibrant homepage */}
            <Route path="/" element={
              <Suspense fallback={<PageLoader />}>
                <LandingPage />
              </Suspense>
            } />
            
            {/* About/Mission page */}
            <Route path="/about" element={
              <Suspense fallback={<PageLoader />}>
                <About />
              </Suspense>
            } />
            
            {/* Auth page for direct login */}
            <Route path="/auth" element={
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
            
            {/* Donation page */}
            <Route path="/donation" element={
              <Suspense fallback={<PageLoader />}>
                <Donation />
              </Suspense>
            } />
            
            {/* Public Learning Zone */}
            <Route path="/learning-zone" element={
              <Suspense fallback={<PageLoader />}>
                <PublicLearningZone />
              </Suspense>
            } />
            
            {/* Public Feed */}
            <Route path="/feed" element={
              <Suspense fallback={<PageLoader />}>
                <PublicFeed />
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
 * UnityNets - A modern web platform
 * 
 * @author Tozammel Haque
 * @copyright 2025 Tozammel Haque. All rights reserved.
 * @license MIT - See LICENSE file
 * 
 * এই কোডটি শিক্ষামূলক উদ্দেশ্যে পাবলিক। বাণিজ্যিক ব্যবহারের জন্য যোগাযোগ করুন।
 */
