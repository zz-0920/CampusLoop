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

// Page loading spinner component
const PageLoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-transparent">
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
  const hideBottomNav =
    isAuthPage ||
    isChatPage ||
    isPostDetailPage ||
    isUserProfilePage ||
    isSearchPage;

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
        className="flex-1 overflow-y-auto w-full max-w-md mx-auto bg-transparent min-h-screen relative"
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
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/user/:id/followers" element={<FollowList />} />
            <Route path="/user/:id/following" element={<FollowList />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </SocketProvider>
    </Router>
  );
}

export default App;
