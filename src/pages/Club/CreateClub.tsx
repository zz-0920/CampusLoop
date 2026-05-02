import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Camera, Loader2 } from "lucide-react";
import { uploadImage } from "../../services/postService";
import { createClub } from "../../services/clubService";

const CreateClub: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");
    try {
      const res = await uploadImage(file);
      setLogo(res.url);
    } catch (err) {
      setError("图片上传失败");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("请输入社团名称");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await createClub({ name, description, logo });
      navigate("/discover"); // Success navigation
    } catch (err) {
      setError("创建社团失败，请重试");
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
        <h1 className="text-xl font-bold text-black">创建社团</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="flex-1 px-8 py-10 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Logo Upload */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 rounded-full border border-gray-100 bg-white flex items-center justify-center cursor-pointer group transition-all hover:border-black overflow-hidden"
            >
              {logo ? (
                <img src={logo} alt="Club Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  {name ? (
                    <span className="text-4xl font-bold text-black">{name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <Camera size={32} className="text-gray-300 group-hover:text-black transition-colors" />
                  )}
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
            <p className="mt-4 text-xs text-gray-400 font-medium uppercase tracking-widest">
              点击上传社团 Logo
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-black uppercase tracking-widest px-1">
                社团名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：极客俱乐部"
                className="w-full px-4 py-4 bg-white border border-gray-100 rounded-none focus:outline-none focus:border-black text-black placeholder:text-gray-200 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-black uppercase tracking-widest px-1">
                社团简介
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述你的社团，吸引更多成员加入..."
                rows={5}
                className="w-full px-4 py-4 bg-white border border-gray-100 rounded-none focus:outline-none focus:border-black text-black placeholder:text-gray-200 transition-colors resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs font-medium px-1 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full bg-black text-white py-5 rounded-full font-bold tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "创建"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateClub;
