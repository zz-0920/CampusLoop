import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, MessageCircle } from "lucide-react";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import {
  getUserById,
  getUserPosts,
  toggleFollow,
} from "../services/userService";
import type { UserProfile as UserProfileType } from "../services/userService";

interface Post {
  id: number;
  content: string;
  image?: string;
  likes?: number;
  comments?: number;
}

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const data = await getUserById(Number(id));
      setUser(data);
    } catch (error) {
      console.error("Failed to load user", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadPosts = useCallback(async () => {
    try {
      const data = await getUserPosts(Number(id));
      setPosts(data as unknown as Post[]);
    } catch (error) {
      console.error("Failed to load posts", error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadUser();
      loadPosts();
    }
  }, [id, loadUser, loadPosts]);

  const handleFollow = async () => {
    if (!user || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await toggleFollow(user.id);
      setUser({
        ...user,
        isFollowing: res.isFollowing,
        isMutual: res.isMutual,
        followersCount: user.followersCount + (res.isFollowing ? 1 : -1),
      });
    } catch (error) {
      console.error("Failed to toggle follow", error);
    } finally {
      setFollowLoading(false);
    }
  };

  // Get button text and style based on follow status
  const getFollowButtonConfig = () => {
    if (!user) return { text: "关注", className: "bg-primary text-white" };
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-gray-500">用户不存在</div>
        <button onClick={() => navigate(-1)} className="text-primary">
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <span className="font-bold text-gray-800">{user.name}</span>
        {user.isSelf ? (
          <button className="text-gray-600">
            <Settings size={24} />
          </button>
        ) : (
          <button className="text-gray-600">
            <MessageCircle size={24} />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-start gap-4">
          <Avatar
            src={user.avatar}
            alt={user.name}
            size="lg"
            isVerified={user.isVerified}
          />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">{user.name}</h1>
            <p className="text-xs text-gray-400">
              {user.school} · {user.department}
            </p>
            {user.bio && (
              <p className="text-sm text-gray-600 mt-2">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              {user.postsCount}
            </div>
            <div className="text-xs text-gray-400">帖子</div>
          </div>
          <button
            onClick={() => navigate(`/user/${user.id}/followers`)}
            className="text-center hover:bg-gray-50 rounded-lg py-1 transition-colors"
          >
            <div className="text-lg font-bold text-gray-800">
              {user.followersCount}
            </div>
            <div className="text-xs text-gray-400">粉丝</div>
          </button>
          <button
            onClick={() => navigate(`/user/${user.id}/following`)}
            className="text-center hover:bg-gray-50 rounded-lg py-1 transition-colors"
          >
            <div className="text-lg font-bold text-gray-800">
              {user.followingCount}
            </div>
            <div className="text-xs text-gray-400">关注</div>
          </button>
        </div>

        {/* Action Buttons */}
        {!user.isSelf && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                getFollowButtonConfig().className
              }`}
            >
              {followLoading ? "..." : getFollowButtonConfig().text}
            </button>
            <button
              onClick={() => navigate(`/chat/${user.id}`)}
              className="flex-1 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              私信
            </button>
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="p-4 space-y-4">
        <h2 className="text-sm font-bold text-gray-800">Ta 的帖子</h2>
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-10 text-gray-400">暂无帖子</div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
