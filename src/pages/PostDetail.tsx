import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Send, MapPin } from "lucide-react";
import Avatar from "../components/Avatar";
import CommentItem from "../components/CommentItem";
import {
  getPostById,
  getComments,
  createComment,
  interactPost,
} from "../services/postService";

interface PostUser {
  id: number;
  name: string;
  avatar?: string;
  school?: string;
  department?: string;
  isVerified?: boolean;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: PostUser;
}

interface PostData {
  id: number;
  content: string;
  image?: string;
  location?: string;
  createdAt: string;
  user: PostUser;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadPost = useCallback(async () => {
    try {
      const res = await getPostById(Number(id));
      setPost(res);
      setIsLiked(res.isLiked);
      setLikesCount(res.likes);
    } catch (error) {
      console.error("Failed to load post", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    try {
      const res = await getComments(Number(id));
      setComments(res.comments || []);
    } catch (error) {
      console.error("Failed to load comments", error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadPost();
      loadComments();
    }
  }, [id, loadPost, loadComments]);

  const handleLike = async () => {
    if (!post) return;
    try {
      await interactPost(post.id, "like");
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Failed to like post", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting || !id) return;

    setSubmitting(true);
    try {
      const res = await createComment(Number(id), commentText.trim());
      setComments((prev) => [res, ...prev]);
      setCommentText("");
      if (post) {
        setPost({ ...post, comments: post.comments + 1 });
      }
    } catch (error) {
      console.error("Failed to submit comment", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500">帖子不存在</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-primary font-medium"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
        <span className="font-bold text-gray-800">帖子详情</span>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Post Content */}
        <div className="p-4 border-b border-gray-100">
          {/* Author */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              src={post.user.avatar}
              alt={post.user.name}
              isVerified={post.user.isVerified}
            />
            <div>
              <div className="font-bold text-gray-800 text-sm">
                {post.user.name}
              </div>
              <div className="text-[10px] text-gray-400">
                {post.user.school} · {post.user.department}
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-800 leading-relaxed mb-3">{post.content}</p>

          {/* Images */}
          {post.image &&
            (() => {
              const images = post.image.split(",").filter(Boolean);
              if (images.length === 1) {
                return (
                  <img
                    src={images[0]}
                    alt="Post content"
                    loading="lazy"
                    className="w-full rounded-xl mb-3 object-cover max-h-96"
                  />
                );
              }
              // Multiple images: grid layout
              const gridCols =
                images.length === 2 || images.length === 4
                  ? "grid-cols-2"
                  : "grid-cols-3";
              return (
                <div
                  className={`grid ${gridCols} gap-2 rounded-xl overflow-hidden mb-3`}
                >
                  {images.map((img, index) => (
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

          {/* Time & Location */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span>{formatTime(post.createdAt)}</span>
            {post.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {post.location}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
              }`}
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>
            <button
              onClick={() => inputRef.current?.focus()}
              className="flex items-center gap-1.5 text-gray-400"
            >
              <span className="text-sm">评论 {post.comments}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-4">
          <h3 className="font-bold text-gray-800 mb-3">
            全部评论 ({comments.length})
          </h3>

          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              暂无评论，快来发表第一条评论吧~
            </div>
          ) : (
            <div>
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-white border-t border-gray-100 p-3 flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="写下你的评论..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
        />
        <button
          onClick={handleSubmitComment}
          disabled={!commentText.trim() || submitting}
          className={`p-2.5 rounded-full transition-colors ${
            commentText.trim() && !submitting
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default PostDetail;
