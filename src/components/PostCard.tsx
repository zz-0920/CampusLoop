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
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
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
        <button className="text-gray-400">
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
                <img
                  src={images[0]}
                  alt="Post content"
                  loading="lazy"
                  className="w-full h-48 object-cover rounded-xl"
                />
              );
            }
            // Multiple images: grid layout
            const gridCols = images.length <= 2 ? "grid-cols-2" : "grid-cols-3";
            return (
              <div
                className={`grid ${gridCols} gap-1 rounded-xl overflow-hidden`}
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
              </div>
            );
          })()}
      </div>

      {/* Interaction Footer */}
      <div className="flex items-center justify-between text-gray-400 pt-1">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors ${
              isLiked ? "text-red-500" : "hover:text-red-500"
            }`}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            <span className="text-xs">{likes}</span>
          </button>
          <button
            onClick={() => navigate(`/post/${post.id}`)}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <MessageCircle size={18} />
            <span className="text-xs">{post.comments || 0}</span>
          </button>
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1 transition-colors ${
              isBookmarked ? "text-yellow-500" : "hover:text-yellow-500"
            }`}
          >
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            <span className="text-xs">{bookmarkCount}</span>
          </button>
        </div>
        <button className="flex items-center gap-1 hover:text-primary transition-colors">
          <Share2 size={18} />
          {/* <span className="text-xs">{post.shares || 0}</span> Optional share count */}
        </button>
      </div>
    </div>
  );
};

export default PostCard;
