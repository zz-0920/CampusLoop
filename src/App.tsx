import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import BottomNav from "./components/BottomNav";
import { SocketProvider } from "./context/SocketContext";

// Lazy load all page components
const Home = React.lazy(() => import("./pages/Home"));
const Discover = React.lazy(() => import("./pages/Discover"));
const Publish = React.lazy(() => import("./pages/Publish"));
const Messages = React.lazy(() => import("./pages/Messages"));
const Profile = React.lazy(() => import("./pages/Profile"));
const LoginPage = React.lazy(() => import("./pages/Auth/Login"));
const PostDetail = React.lazy(() => import("./pages/PostDetail"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const FollowList = React.lazy(() => import("./pages/FollowList"));
const SearchResults = React.lazy(() => import("./pages/SearchResults"));
const ChatDetail = React.lazy(() => import("./pages/Chat/ChatDetail"));
const GroupChatDetail = React.lazy(() => import("./pages/Chat/GroupChatDetail"));
const CreateClub = React.lazy(() => import("./pages/Club/CreateClub"));
const MyClubs = React.lazy(() => import("./pages/Club/MyClubs"));
const CreateEvent = React.lazy(() => import("./pages/Event/CreateEvent"));
const CategoryPosts = React.lazy(() => import("./pages/Post/CategoryPosts"));
const PaperPlane = React.lazy(() => import("./pages/Toolbox/PaperPlane"));
const MedalWall = React.lazy(() => import("./pages/MedalWall"));
const MyPosts = React.lazy(() => import("./pages/MyPosts"));
const MyCollections = React.lazy(() => import("./pages/MyCollections"));
const Settings = React.lazy(() => import("./pages/Settings"));
const ProfileSettings = React.lazy(() => import("./pages/Settings/ProfileSettings"));
const AccountSettings = React.lazy(() => import("./pages/Settings/AccountSettings"));
const NotificationSettings = React.lazy(() => import("./pages/Settings/NotificationSettings"));
const PrivacySettings = React.lazy(() => import("./pages/Settings/PrivacySettings"));
const HelpSettings = React.lazy(() => import("./pages/Settings/HelpSettings"));
const AboutSettings = React.lazy(() => import("./pages/Settings/AboutSettings"));

// Page loading spinner component
const PageLoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      <span className="text-gray-400 text-sm">加载中...</span>
    </div>
  </div>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";
  const isChatPage = location.pathname.startsWith("/chat/");
  const isPostDetailPage = location.pathname.startsWith("/post/");
  const isUserProfilePage = location.pathname.startsWith("/user/");
  const isSearchPage = location.pathname === "/search";
  const isClubCreatePage = location.pathname === "/clubs/create";
  const isMyClubsPage = location.pathname === "/my-clubs";
  const isEventCreatePage = location.pathname === "/events/create";
  const isPaperPlanePage = location.pathname === "/toolbox/paper-plane";
  const isMedalWallPage = location.pathname === "/medals";
  const isMyPostsPage = location.pathname === "/my-posts";
  const isMyCollectionsPage = location.pathname === "/my-collections";
  const isSettingsPage = location.pathname.startsWith("/settings");
  const hideBottomNav =
    isAuthPage ||
    isChatPage ||
    isPostDetailPage ||
    isUserProfilePage ||
    isSearchPage ||
    isClubCreatePage ||
    isMyClubsPage ||
    isEventCreatePage ||
    isPaperPlanePage ||
    isMedalWallPage ||
    isMyPostsPage ||
    isMyCollectionsPage ||
    isSettingsPage;

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
    const mainContainer = document.getElementById("main-scroll-container");
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (mainContainer) mainContainer.scrollTop = 0;
    }, 0);
  }, [location.pathname]);

  // Simple auth guard
  const token = localStorage.getItem("token");
  if (!token && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      className={`flex flex-col min-h-screen ${
        !hideBottomNav ? "pb-20" : ""
      }`}
    >
      <main
        id="main-scroll-container"
        className="flex-1 overflow-y-auto w-full max-w-md mx-auto bg-white min-h-screen relative"
      >
        <Suspense fallback={<PageLoadingSpinner />}>{children}</Suspense>
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <SocketProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/publish" element={<Publish />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:contactId" element={<ChatDetail />} />
            <Route path="/chat/public" element={<GroupChatDetail />} />
            <Route path="/chat/club/:clubId" element={<GroupChatDetail />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/user/:id/followers" element={<FollowList />} />
            <Route path="/user/:id/following" element={<FollowList />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/clubs/create" element={<CreateClub />} />
            <Route path="/my-clubs" element={<MyClubs />} />
            <Route path="/events/create" element={<CreateEvent />} />
            <Route path="/posts/category/:type" element={<CategoryPosts />} />
            <Route path="/toolbox/paper-plane" element={<PaperPlane />} />
            <Route path="/medals" element={<MedalWall />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/my-collections" element={<MyCollections />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/profile" element={<ProfileSettings />} />
            <Route path="/settings/account" element={<AccountSettings />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />
            <Route path="/settings/privacy" element={<PrivacySettings />} />
            <Route path="/settings/help" element={<HelpSettings />} />
            <Route path="/settings/about" element={<AboutSettings />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </SocketProvider>
    </Router>
  );
}

export default App;
