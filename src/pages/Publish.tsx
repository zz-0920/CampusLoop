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
    <div className="flex flex-col h-screen overflow-y-auto bg-white p-4">
      {/* 1. Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400">
          <X size={24} />
        </button>
        <span className="font-bold text-gray-800">发布</span>
        <button
          onClick={handlePublish}
          disabled={(!content.trim() && images.length === 0) || loading}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            (content.trim() || images.length > 0) && !loading
              ? "bg-primary text-white shadow-md shadow-blue-100"
              : "bg-gray-100 text-gray-300 pointer-events-none"
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
          className="w-full flex-1 resize-none text-sm text-gray-800 focus:outline-none placeholder:text-gray-300 min-h-[120px]"
        ></textarea>

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden group"
              >
                <img
                  src={img}
                  alt={`Preview ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {/* Add more button */}
            {images.length < MAX_IMAGES && (
              <button
                onClick={handleImageClick}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-primary hover:text-primary transition-colors"
              >
                <Plus size={24} />
              </button>
            )}
          </div>
        )}

        {uploading && (
          <div className="text-xs text-gray-400 mb-2">上传中...</div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />

        {/* 3. Media Icons */}
        <div className="flex items-center gap-6 py-4 border-b border-gray-50">
          <button
            onClick={handleImageClick}
            className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
          >
            <Image size={24} />
            {images.length > 0 && (
              <span className="text-xs">
                {images.length}/{MAX_IMAGES}
              </span>
            )}
          </button>
          <button className="text-gray-400 hover:text-primary transition-colors">
            <Smile size={24} />
          </button>
          <button className="text-gray-400 hover:text-primary transition-colors">
            <Hash size={24} />
          </button>
          <button className="text-gray-400 hover:text-primary transition-colors">
            <MapPin size={24} />
          </button>
        </div>

        {/* 4. Settings List */}
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">匿名发布</span>
              <span className="text-[10px] text-gray-400">显示简称</span>
            </div>
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                isAnonymous ? "bg-primary" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                  isAnonymous ? "left-5.5" : "left-0.5 shadow-sm"
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between cursor-pointer active:bg-gray-50 rounded-lg py-1 transition-colors">
            <div className="flex items-center gap-2 text-gray-800">
              <span className="text-sm font-bold">位置</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <span className="text-xs">选择位置</span>
              <ChevronRight size={16} />
            </div>
          </div>

          <div className="flex items-center justify-between cursor-pointer active:bg-gray-50 rounded-lg py-1 transition-colors">
            <div className="flex items-center gap-2 text-gray-800">
              <span className="text-sm font-bold">可见范围</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <span className="text-xs flex items-center gap-1">
                <Globe size={12} /> 公开
              </span>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publish;
