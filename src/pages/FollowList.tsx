import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, UserCheck, Users } from "lucide-react";
import Avatar from "../components/Avatar";
import {
  getFollowers,
  getFollowing,
  toggleFollow,
} from "../services/userService";
import type { FollowUser } from "../services/userService";

const FollowList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isFollowersTab = location.pathname.includes("/followers");

  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    isFollowersTab ? "followers" : "following"
  );
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [followingLoading, setFollowingLoading] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response =
        activeTab === "followers"
          ? await getFollowers(Number(id), page)
          : await getFollowing(Number(id), page);
      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  }, [id, activeTab, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    // Update URL when tab changes
    const newPath = `/user/${id}/${activeTab}`;
    if (location.pathname !== newPath) {
      navigate(newPath, { replace: true });
    }
  }, [activeTab, id, navigate, location.pathname]);

  const handleToggleFollow = async (userId: number) => {
    if (followingLoading === userId) return;
    setFollowingLoading(userId);
    try {
      const res = await toggleFollow(userId);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                isFollowing: res.isFollowing,
                isMutual: res.isMutual,
              }
            : user
        )
      );
    } catch (error) {
      console.error("Failed to toggle follow", error);
    } finally {
      setFollowingLoading(null);
    }
  };

  const getFollowButtonConfig = (user: FollowUser) => {
    if (user.isSelf) {
      return null;
    }
    if (user.isMutual) {
      return {
        text: "互相关注",
        className: "bg-green-100 text-green-600 border border-green-200",
      };
    }
    if (user.isFollowing) {
      return { text: "已关注", className: "bg-gray-100 text-gray-600" };
    }
    if (user.isFollowedBy) {
      return { text: "回关", className: "bg-blue-500 text-white" };
    }
    return { text: "关注", className: "bg-primary text-white" };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="text-gray-600 mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 flex gap-4">
          <button
            onClick={() => {
              setActiveTab("followers");
              setPage(1);
            }}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-full text-sm font-medium transition-colors ${
              activeTab === "followers"
                ? "bg-primary text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Users size={16} />
            粉丝
          </button>
          <button
            onClick={() => {
              setActiveTab("following");
              setPage(1);
            }}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-full text-sm font-medium transition-colors ${
              activeTab === "following"
                ? "bg-primary text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <UserCheck size={16} />
            关注
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="text-gray-400">加载中...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Users size={48} className="mb-2 opacity-50" />
            <span>
              {activeTab === "followers" ? "暂无粉丝" : "暂未关注任何人"}
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const buttonConfig = getFollowButtonConfig(user);
              return (
                <div
                  key={user.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex items-center gap-3"
                >
                  <button onClick={() => navigate(`/user/${user.id}`)}>
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      size="md"
                      isVerified={user.isVerified}
                    />
                  </button>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/user/${user.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 truncate">
                        {user.name}
                      </span>
                      {user.isMutual && (
                        <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">
                          互关
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {user.school} · {user.department}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {user.bio}
                      </p>
                    )}
                  </div>
                  {buttonConfig && (
                    <button
                      onClick={() => handleToggleFollow(user.id)}
                      disabled={followingLoading === user.id}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${buttonConfig.className}`}
                    >
                      {followingLoading === user.id ? "..." : buttonConfig.text}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowList;
