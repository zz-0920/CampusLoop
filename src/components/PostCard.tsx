import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Share2,
  MapPin,
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
  location?: string;
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
    <div className="bg-white border-b border-gray-100 py-8 px-4">
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
              <span className="font-semibold text-black text-base transition-colors">
                {post.author?.name || post.user?.name}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
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
        className="mb-4 cursor-pointer"
        onClick={() => navigate(`/post/${post.id}`)}
      >
        <p className="text-[15px] text-gray-800 leading-relaxed mb-4">
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
                    className="w-full h-auto max-h-[400px] object-cover rounded-lg border border-gray-100"
                  />
                </div>
              );
            }
            // Multiple images: grid layout
            const gridCols = images.length <= 2 ? "grid-cols-2" : "grid-cols-3";
            return (
              <div
                className={`grid ${gridCols} gap-2 rounded-lg overflow-hidden border border-gray-100 relative`}
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

      {/* Location */}
      {post.location && (
        <div className="flex items-center gap-1 mb-3 text-gray-400">
          <MapPin size={12} />
          <span className="text-[11px]">{post.location}</span>
        </div>
      )}

      {/* Interaction Footer */}
      <div className="flex items-center justify-between text-gray-400 pt-2">
        <div className="flex items-center gap-8">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors ${
              isLiked ? "text-red-500" : "hover:text-black"
            }`}
          >
            <Heart 
              size={18} 
              fill={isLiked ? "currentColor" : "none"} 
            />
            <span className="text-xs font-medium">{likes}</span>
          </button>
          <button
            onClick={() => navigate(`/post/${post.id}`)}
            className="flex items-center gap-1.5 hover:text-black transition-colors"
          >
            <MessageCircle size={18} />
            <span className="text-xs font-medium">{post.comments || 0}</span>
          </button>
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 transition-colors ${
              isBookmarked ? "text-yellow-500" : "hover:text-black"
            }`}
          >
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            <span className="text-xs font-medium">{bookmarkCount}</span>
          </button>
        </div>
        <button className="flex items-center gap-1 hover:text-black transition-colors">
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
