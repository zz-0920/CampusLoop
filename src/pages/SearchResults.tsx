import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import Tabs from "../components/Tabs";
import { searchPosts } from "../services/postService";
import type { SearchResult } from "../services/postService";

interface Post {
  id: number;
  content: string;
  image?: string;
  likes?: number;
  comments?: number;
}

interface User {
  id: number;
  username: string;
  name: string;
  avatar?: string;
  school?: string;
  department?: string;
  bio?: string;
}

interface Club {
  id: number;
  name: string;
  logo?: string;
  description?: string;
  memberCount: number;
}

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(query);
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "all", label: "综合" },
    { id: "users", label: "用户" },
    { id: "clubs", label: "社团" },
    { id: "posts", label: "帖子" },
  ];

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const type = activeTab as "all" | "posts" | "users" | "clubs";
        const data = await searchPosts(query, type);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, activeTab]);

  const handleSearch = () => {
    if (inputValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleUserClick = (userId: number) => {
    navigate(`/user/${userId}`);
  };

  const posts = results?.posts || [];
  const users = results?.users || [];
  const clubs = results?.clubs || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2 gap-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索帖子/用户/社团"
              className="bg-transparent border-none focus:outline-none text-sm text-gray-800 w-full placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="text-primary text-sm font-medium"
          >
            搜索
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-3">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
          />
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">搜索中...</div>
        ) : !query ? (
          <div className="text-center py-10 text-gray-400">请输入搜索内容</div>
        ) : (
          <>
            {/* Users Section */}
            {(activeTab === "all" || activeTab === "users") &&
              users.length > 0 && (
                <div className="mb-6">
                  {activeTab === "all" && (
                    <h2 className="text-sm font-bold text-gray-800 mb-3">
                      用户
                    </h2>
                  )}
                  <div className="bg-white rounded-xl divide-y divide-gray-50">
                    {users.map((user: User) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserClick(user.id)}
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Avatar src={user.avatar} alt={user.name} />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.school} · {user.department}
                          </div>
                          {user.bio && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {user.bio}
                            </div>
                          )}
                        </div>
                        <button className="px-3 py-1 bg-primary text-white text-xs rounded-full">
                          关注
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Clubs Section */}
            {(activeTab === "all" || activeTab === "clubs") &&
              clubs.length > 0 && (
                <div className="mb-6">
                  {activeTab === "all" && (
                    <h2 className="text-sm font-bold text-gray-800 mb-3">
                      社团
                    </h2>
                  )}
                  <div className="bg-white rounded-xl divide-y divide-gray-50">
                    {clubs.map((club: Club) => (
                      <div
                        key={club.id}
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          // 暂无社团详情页，先不做跳转或跳转到占位
                          console.log("Club clicked", club.id);
                        }}
                      >
                        <Avatar
                          src={club.logo}
                          alt={club.name}
                          shape="square"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {club.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            成员 {club.memberCount}
                          </div>
                          {club.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {club.description}
                            </div>
                          )}
                        </div>
                        <button className="px-3 py-1 bg-gray-100 text-primary text-xs font-medium rounded-full hover:bg-primary/10">
                          详情
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Posts Section */}
            {(activeTab === "all" || activeTab === "posts") &&
              posts.length > 0 && (
                <div>
                  {activeTab === "all" && (
                    <h2 className="text-sm font-bold text-gray-800 mb-3">
                      帖子
                    </h2>
                  )}
                  <div className="space-y-4">
                    {posts.map((post: Post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}

            {/* No Results */}
            {users.length === 0 && posts.length === 0 && clubs.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                未找到"{query}"相关内容
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
