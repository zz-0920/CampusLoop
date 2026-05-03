import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';
import { getPosts } from '../../services/postService';
import PostCard from '../../components/PostCard';

const typeMap: Record<string, string> = {
  lost_found: '失物招领',
  trade: '二手交易',
  confession: '表白墙',
};

const CategoryPosts: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = type ? typeMap[type] || '分类动态' : '分类动态';

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getPosts({ type });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (response as any).data || response;
        const postsArray = Array.isArray(data) ? data : (data.posts || []);
        setPosts(postsArray);
      } catch (err) {
        console.error('Failed to fetch category posts:', err);
        setError('加载失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    if (type) {
      fetchPosts();
    }
  }, [type]);

  return (
    <div className="min-h-screen bg-white text-black relative">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-4 border-b border-gray-50 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold font-display">{title}</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Content Area */}
      <main className="flex-1 pb-24 no-scrollbar overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-400 text-sm">
            加载中...
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-64 text-gray-400 gap-4">
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => navigate(0)} 
              className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              重试
            </button>
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-400 text-sm">
            暂无动态
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate(`/publish?type=${type}`)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] h-14 bg-black text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform z-20 hover:bg-gray-900 font-bold tracking-[0.2em]"
      >
        <Plus size={24} className="mr-2" />
        发布信息
      </button>
    </div>
  );
};

export default CategoryPosts;
