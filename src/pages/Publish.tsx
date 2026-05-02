import React, { useState } from "react";
import {
  X,
  Image,
  Smile,
  Hash,
  MapPin,
  ChevronRight,
  Globe,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPost, uploadImage } from "../services/postService";

const MAX_IMAGES = 9;

const Publish: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (images.length >= MAX_IMAGES) {
      alert(`最多只能上传${MAX_IMAGES}张图片`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(`只能再上传${remainingSlots}张图片`);
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToUpload) {
        const res = await uploadImage(file);
        uploadedUrls.push(res.url);
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error("Upload failed", error);
      alert("上传失败，请重试");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if ((!content.trim() && images.length === 0) || loading || uploading)
      return;

    setLoading(true);
    try {
      await createPost({
        content,
        // Store multiple images as comma-separated string or first image
        image: images.length > 0 ? images.join(",") : undefined,
      });
      navigate("/");
    } catch (error) {
      console.error("Failed to publish post", error);
      alert("发布失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-transparent">
      {/* Full-screen Blur Overlay */}
      <div className="fixed inset-0 backdrop-blur-3xl bg-white/10 -z-10" />

      <div className="flex flex-col h-screen p-4 pb-24 overflow-y-auto">
        {/* 1. Header */}
        <div className="flex justify-between items-center mb-8 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white elastic-press"
          >
            <X size={24} />
          </button>
          <span className="font-display font-bold text-xl text-white">发布</span>
          <button
            onClick={handlePublish}
            disabled={(!content.trim() && images.length === 0) || loading}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all elastic-press shadow-lg ${
              (content.trim() || images.length > 0) && !loading
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-primary/20"
                : "bg-white/10 text-white/30 pointer-events-none"
            }`}
          >
            {loading ? "发布中..." : "发布"}
          </button>
        </div>

        {/* 2. Content Input Area */}
        <div className="flex-1 flex flex-col">
          <textarea
            placeholder="分享你的想法..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full flex-1 resize-none bg-transparent border-none outline-none text-xl font-medium text-white placeholder:text-white/40 min-h-[160px] py-4"
          ></textarea>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-2xl overflow-hidden group ring-1 ring-white/20 shadow-xl"
                >
                  <img
                    src={img}
                    alt={`Preview ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {/* Add more button */}
              {images.length < MAX_IMAGES && (
                <button
                  onClick={handleImageClick}
                  className="aspect-square rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-white/40 hover:bg-white/10 hover:border-white/40 transition-all elastic-press"
                >
                  <Plus size={32} />
                  <span className="text-[10px] mt-1 font-bold">添加</span>
                </button>
              )}
            </div>
          )}

          {uploading && (
            <div className="text-xs text-white/40 mb-2">上传中...</div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />

          {/* 3. Media Toolbar (Floating) */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px]">
            <div className="glass rounded-full px-6 py-3 flex items-center justify-between shadow-2xl ring-1 ring-white/20">
              <button
                onClick={handleImageClick}
                className="text-primary-light elastic-press p-2"
              >
                <Image size={24} />
              </button>
              <button className="text-secondary-light elastic-press p-2">
                <Smile size={24} />
              </button>
              <button className="text-accent elastic-press p-2">
                <Hash size={24} />
              </button>
              <button className="text-primary elastic-press p-2">
                <MapPin size={24} />
              </button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button className="text-white/60 elastic-press p-2">
                <Plus size={24} />
              </button>
            </div>
          </div>

          {/* 4. Settings List */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between bg-white/5 backdrop-blur-md rounded-2xl px-4 py-3 ring-1 ring-white/10">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">匿名发布</span>
                <span className="text-[10px] text-white/40">隐藏个人信息</span>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                  isAnonymous
                    ? "bg-accent shadow-[0_0_12px_rgba(0,210,255,0.4)]"
                    : "bg-white/20"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
                    isAnonymous ? "left-7" : "left-1"
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between bg-white/5 backdrop-blur-md rounded-2xl px-4 py-3 ring-1 ring-white/10 cursor-pointer active:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 text-white">
                <span className="text-sm font-bold">位置</span>
              </div>
              <div className="flex items-center gap-1 text-white/40">
                <span className="text-xs">添加地点</span>
                <ChevronRight size={16} />
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/5 backdrop-blur-md rounded-2xl px-4 py-3 ring-1 ring-white/10 cursor-pointer active:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 text-white">
                <span className="text-sm font-bold">可见范围</span>
              </div>
              <div className="flex items-center gap-1 text-white/40">
                <span className="text-xs flex items-center gap-1">
                  <Globe size={12} /> 公开
                </span>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publish;
