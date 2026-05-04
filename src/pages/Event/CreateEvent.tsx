import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Camera, Loader2, ChevronDown } from 'lucide-react';
import { getOwnedClubs, createEvent } from '../../services/eventService';
import { uploadImage } from '../../services/postService';
import type { Club, UploadResponse } from '../../types';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubId, setClubId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await getOwnedClubs() as unknown as Club[];
        setClubs(res);
        if (res && res.length > 0) {
          setClubId(Number(res[0].id));
        }
      } catch (err) {
        console.error('Failed to fetch clubs', err);
        setError('无法获取您的社团列表');
      }
    };
    fetchClubs();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      const res: UploadResponse = await uploadImage(file);
      setImage(res.url);
    } catch {
      setError('图片上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!clubId || !title.trim() || !date.trim() || !location.trim()) {
      setError('请填写完整活动信息');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await createEvent({
        clubId: clubId as number,
        title,
        date,
        location,
        description,
        image
      });
      navigate(-1);
    } catch {
      setError('发布活动失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-black hover:bg-gray-50 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
        <h1 className="text-xl font-bold text-black">发布活动</h1>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading}
          className="text-black font-bold text-sm px-4 py-2 hover:bg-gray-50 rounded-full transition-colors disabled:opacity-30"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : '发布'}
        </button>
      </header>

      <main className="flex-1 px-8 py-10 max-w-md mx-auto w-full">
        <div className="space-y-8">
          {/* Club Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black uppercase tracking-widest px-1">
              举办社团
            </label>
            <div className="relative">
              <select
                value={clubId}
                onChange={(e) => setClubId(Number(e.target.value))}
                className="w-full px-4 py-4 bg-white border border-gray-100 rounded-none appearance-none focus:outline-none focus:border-black text-black transition-colors"
              >
                <option value="" disabled>选择社团</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Poster Upload */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black uppercase tracking-widest px-1">
              活动海报
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-[16/9] w-full border border-gray-100 bg-white flex items-center justify-center cursor-pointer group transition-all hover:border-black overflow-hidden"
            >
              {image ? (
                <img src={image} alt="Event Poster" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Camera size={32} className="text-gray-300 group-hover:text-black transition-colors" />
                  <span className="text-[10px] text-gray-300 group-hover:text-black uppercase tracking-widest transition-colors">上传海报</span>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="animate-spin text-black" size={24} />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>

          {/* Text Inputs */}
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-black uppercase tracking-widest px-1">活动名称</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给活动起个吸引人的名字"
                className="w-full px-4 py-4 bg-white border border-gray-100 rounded-none focus:outline-none focus:border-black text-black placeholder:text-gray-200 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-black uppercase tracking-widest px-1">活动时间</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="例如：周五 19:00"
                  className="w-full px-4 py-4 bg-white border border-gray-100 rounded-none focus:outline-none focus:border-black text-black placeholder:text-gray-200 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-black uppercase tracking-widest px-1">活动地点</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="例如：图书馆三楼"
                  className="w-full px-4 py-4 bg-white border border-gray-100 rounded-none focus:outline-none focus:border-black text-black placeholder:text-gray-200 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-black uppercase tracking-widest px-1">活动详情</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="介绍一下活动的亮点..."
                rows={6}
                className="w-full px-4 py-4 bg-white border border-gray-100 rounded-none focus:outline-none focus:border-black text-black placeholder:text-gray-200 transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs font-medium px-1 animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateEvent;
