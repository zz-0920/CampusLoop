import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchPosts } from "../services/postService";
import type { SearchResult } from "../services/postService";
import Avatar from "./Avatar";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "搜索内容...",
  className = "",
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchPosts(query);
        setResults(res);
        setIsOpen(true);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults(null);
    setIsOpen(false);
  };

  const handlePostClick = (postId: number) => {
    setIsOpen(false);
    navigate(`/post/${postId}`);
  };

  const hasResults =
    results &&
    ((results.posts && results.posts.length > 0) ||
      (results.users && results.users.length > 0) ||
      (results.clubs && results.clubs.length > 0));

  const handleSearch = () => {
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="bg-gray-50 rounded-lg flex items-center px-4 py-2.5 gap-3 text-gray-400 border border-gray-100 transition-all duration-300 focus-within:bg-white focus-within:ring-1 focus-within:ring-gray-200 focus-within:border-gray-200">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && results && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-transparent border-none focus:outline-none text-[15px] text-gray-800 w-full placeholder:text-gray-400"
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto z-50 transition-all duration-200">
          {loading ? (
            <div className="p-6 text-center text-gray-500 text-sm font-medium">
              搜索中...
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center text-gray-500 text-sm font-medium">
              无搜索结果
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {/* Users */}
              {results?.users && results.users.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2">用户</div>
                  {results.users.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/user/${user.id}`);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                    >
                      <Avatar src={user.avatar} alt={user.name} size="sm" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {user.school}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Clubs */}
              {results?.clubs && results.clubs.length > 0 && (
                <div className="pt-2 border-t border-gray-50">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2">社团</div>
                  {results.clubs.slice(0, 5).map((club) => (
                    <div
                      key={club.id}
                      onClick={() => {
                        // TODO: Navigate to club detail page
                        console.log("Club clicked", club.id);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                    >
                      <Avatar
                        src={club.logo}
                        alt={club.name}
                        size="sm"
                        shape="square"
                        className="rounded-md"
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {club.name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          成员 {club.memberCount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Posts */}
              {results?.posts && results.posts.length > 0 && (
                <div className="pt-2 border-t border-gray-50">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2">帖子</div>
                  {results.posts.slice(0, 5).map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handlePostClick(post.id)}
                      className="p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                    >
                      <div className="text-sm text-gray-600 line-clamp-2 group-hover:text-black leading-relaxed">
                        {post.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
