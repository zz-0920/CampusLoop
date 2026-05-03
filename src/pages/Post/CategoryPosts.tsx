import React from 'react';
import { useParams } from 'react-router-dom';

const CategoryPosts: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">分类: {type}</h1>
      <p className="text-gray-500">该分类下的帖子正在开发中...</p>
    </div>
  );
};

export default CategoryPosts;
