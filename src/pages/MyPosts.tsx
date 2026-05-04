import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, FileText } from "lucide-react";
import { getUserPosts, getUserProfile } from "../services/userService";
import PostCard from "../components/PostCard";
import type { User } from "../types";

const MyPosts: React.FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userData = await getUserProfile() as unknown as User;
      setUser(userData);
      const postsData = await getUserPosts(userData.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPosts(postsData as any);
    } catch (error) {
      console.error("Failed to fetch my posts", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-black" />
        </button>
        <h1 className="text-xl font-bold text-black">我的发布</h1>
      </div>

      <div className="flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">加载中...</span>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4 px-10 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200">
              <FileText size={40} />
            </div>
            <div>
              <p className="text-base font-bold text-gray-300">暂无发布内容</p>
              <p className="text-xs mt-1">去分享你的校园生活吧</p>
            </div>
            <button 
              onClick={() => navigate("/publish")}
              className="mt-4 px-6 py-2 bg-black text-white rounded-full text-sm font-bold active:scale-95 transition-all"
            >
              立即发布
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
