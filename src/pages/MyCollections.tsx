import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Bookmark } from "lucide-react";
import { getUserCollections } from "../services/userService";
import PostCard from "../components/PostCard";

const MyCollections: React.FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const data = await getUserCollections();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPosts(data as any);
    } catch (error) {
      console.error("Failed to fetch collections", error);
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
        <h1 className="text-xl font-bold text-black">我的收藏</h1>
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
              <Bookmark size={40} />
            </div>
            <div>
              <p className="text-base font-bold text-gray-300">暂无收藏</p>
              <p className="text-xs mt-1">看到感兴趣的内容，点击收藏即可保存到这里</p>
            </div>
            <button 
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-2 bg-black text-white rounded-full text-sm font-bold active:scale-95 transition-all"
            >
              去逛逛
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCollections;
