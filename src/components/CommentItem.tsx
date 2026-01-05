import React from "react";
import Avatar from "./Avatar";

interface CommentUser {
  id: number;
  name: string;
  avatar?: string;
  school?: string;
  department?: string;
}

interface CommentProps {
  comment: {
    id: number;
    content: string;
    createdAt: string;
    user: CommentUser;
  };
}

const CommentItem: React.FC<CommentProps> = ({ comment }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString("zh-CN");
  };

  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-b-0">
      <Avatar src={comment.user.avatar} alt={comment.user.name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-800">
            {comment.user.name}
          </span>
          <span className="text-[10px] text-gray-400">
            {comment.user.school}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed wrap-break-word">
          {comment.content}
        </p>
        <span className="text-[10px] text-gray-400 mt-1 block">
          {formatTime(comment.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default CommentItem;
