import React, { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { mockNotices } from "../data/mockData";
import PostCard from "../components/PostCard";
import SearchBar from "../components/SearchBar";
import Tabs from "../components/Tabs";
import { getPosts } from "../services/postService";

interface Post {
  id: number;
  content: string;
  image?: string;
  likes?: number;
  isLiked?: boolean;
}

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState("recommend");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await getPosts({ tab: activeTab })) as unknown as Post[];
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const tabs = [
    { id: "recommend", label: "推荐" },
    { id: "follow", label: "关注" },
    { id: "hot", label: "热榜" },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-30 w-full max-w-md mx-auto bg-gray-50/95 backdrop-blur-sm pt-4 px-4 pb-2 shadow-sm transition-all duration-300">
        {/* Search Header */}
        <div className="flex items-center gap-3 mb-4">
          <SearchBar placeholder="搜索帖子/用户/社团" className="flex-1" />
          <button className="relative text-gray-600">
            <Bell size={24} />
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
          </button>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-2"
        />
      </div>

      {/* Content */}
      <div className="pt-[140px] px-4 pb-20 space-y-4">
        {/* Notice Board */}
        <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary text-xs font-bold whitespace-nowrap">
            校园通知
          </div>
          <div className="text-sm text-gray-700 leading-relaxed truncate">
            {mockNotices[0].content}
          </div>
        </div>

        {/* Post List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-400">加载中...</div>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-10 text-gray-400">暂无内容</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
