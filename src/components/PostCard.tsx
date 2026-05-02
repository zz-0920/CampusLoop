import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import Avatar from "./Avatar";
import { interactPost } from "../services/postService";

interface Author {
  id?: number;
  name?: string;
  avatar?: string;
  school?: string;
  department?: string;
  isVerified?: boolean;
}

interface Post {
  id: number;
  content: string;
  image?: string;
  likes?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  comments?: number;
  shares?: number;
  bookmarks?: number;
  author?: Author;
  user?: Author;
  _count?: {
    interactions?: number;
  };
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarks || 0);

  const handleLike = async () => {
    try {
      await interactPost(post.id, "like");
      setIsLiked(!isLiked);
      setLikes((prev: number) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Failed to like post", error);
    }
  };

  const handleBookmark = async () => {
    try {
      await interactPost(post.id, "bookmark");
      setIsBookmarked(!isBookmarked);
      setBookmarkCount((prev: number) => (isBookmarked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Failed to bookmark post", error);
    }
  };

  const userId = post.author?.id || post.user?.id;
  const handleUserClick = () => {
    if (userId) {
      navigate(`/user/${userId}`);
    }
  };

  return (
    <div className="glass rounded-3xl p-5 shadow-lg mb-6 elastic-press">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={handleUserClick}
        >
          <Avatar
            src={post.author?.avatar || post.user?.avatar}
            alt={post.author?.name || post.user?.name}
            isVerified={post.author?.isVerified || post.user?.isVerified}
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-800 text-sm hover:text-primary transition-colors">
                {post.author?.name || post.user?.name}
              </span>
            </div>
            <div className="text-[10px] text-gray-400">
              {post.author?.school || post.user?.school} ·{" "}
              {post.author?.department || post.user?.department}
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <div
        className="mb-3 cursor-pointer"
        onClick={() => navigate(`/post/${post.id}`)}
      >
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          {post.content}
        </p>
        {post.image &&
          (() => {
            const images = post.image.split(",").filter(Boolean);
            if (images.length === 1) {
              return (
                <div className="relative group">
                  <img
                    src={images[0]}
                    alt="Post content"
                    loading="lazy"
                    className="w-full h-48 object-cover rounded-2xl border border-white/10"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none" />
                </div>
              );
            }
            // Multiple images: grid layout
            const gridCols = images.length <= 2 ? "grid-cols-2" : "grid-cols-3";
            return (
              <div
                className={`grid ${gridCols} gap-1.5 rounded-2xl overflow-hidden border border-white/10 relative`}
              >
                {images.slice(0, 9).map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Post content ${index + 1}`}
                    loading="lazy"
                    className="w-full aspect-square object-cover"
                  />
                ))}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none" />
              </div>
            );
          })()}
      </div>

      {/* Interaction Footer */}
      <div className="flex items-center justify-between text-gray-400 pt-1">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-all duration-300 elastic-press ${
              isLiked ? "text-red-500 scale-105" : "hover:text-red-500"
            }`}
          >
            <Heart 
              size={18} 
              fill={isLiked ? "currentColor" : "none"} 
              className={isLiked ? "animate-pulse" : ""}
            />
            <span className="text-xs font-medium">{likes}</span>
          </button>
          <button
            onClick={() => navigate(`/post/${post.id}`)}
            className="flex items-center gap-1 hover:text-primary transition-colors elastic-press"
          >
            <MessageCircle size={18} />
            <span className="text-xs font-medium">{post.comments || 0}</span>
          </button>
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1 transition-colors elastic-press ${
              isBookmarked ? "text-yellow-500" : "hover:text-yellow-500"
            }`}
          >
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            <span className="text-xs font-medium">{bookmarkCount}</span>
          </button>
        </div>
        <button className="flex items-center gap-1 hover:text-primary transition-colors elastic-press">
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
