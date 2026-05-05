/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Image,
  Smile,
  Hash,
  MapPin,
  ChevronRight,
  Globe,
  Plus,
  Search,
  Navigation,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPost, uploadImage } from "../services/postService";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";

declare global {
  interface Window { AMap: any; _AMapSecurityConfig: any; }
}

interface POI {
  id: string;
  name: string;
  address: string;
  location: { lng: number; lat: number };
  distance?: number;
}

const MAX_IMAGES = 9;

const Publish: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get("type") || "normal";

  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(initialType === "confession");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Location state
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [nearbyPOIs, setNearbyPOIs] = useState<POI[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<POI[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    if (!textareaRef.current) return;

    const { selectionStart, selectionEnd } = textareaRef.current;
    const emoji = emojiData.emoji;
    const newContent =
      content.substring(0, selectionStart) +
      emoji +
      content.substring(selectionEnd);

    setContent(newContent);
    setShowEmojiPicker(false);

    // Restore focus and cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = selectionStart + emoji.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handlePublish = async () => {
    if ((!content.trim() && images.length === 0) || loading || uploading)
      return;

    setLoading(true);
    try {
      await createPost({
        content,
        image: images.length > 0 ? images.join(",") : undefined,
        type: initialType,
        isAnonymous: isAnonymous,
        location: selectedLocation || undefined,
      });
      if (initialType !== "normal") {
        navigate(`/posts/category/${initialType}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to publish post", error);
      alert("发布失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // Get current location and nearby POIs
  const getCurrentLocation = useCallback(() => {
    if (!window.AMap) {
      alert("地图服务加载中，请稍后再试");
      return;
    }

    setLoadingLocation(true);

    const geolocation = new window.AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      noIpLocate: 0,
    });

    geolocation.getCurrentPosition(
      (status: string, result: any) => {
        if (status === "complete" && result.position) {
          const pos = {
            lng: result.position.lng,
            lat: result.position.lat,
          };
          setCurrentPosition(pos);
          searchNearby(pos);
        } else {
          // Fallback: use IP-based location
          geolocation.getCityInfo((status2: string, result2: any) => {
            if (status2 === "complete" && result2.center) {
              const pos = {
                lng: result2.center[0],
                lat: result2.center[1],
              };
              setCurrentPosition(pos);
              searchNearby(pos);
            } else {
              setLoadingLocation(false);
              console.error("定位失败", result2);
            }
          });
        }
      }
    );
  }, []);

  // Search nearby POIs
  const searchNearby = (pos: { lng: number; lat: number }) => {
    const placeSearch = new window.AMap.PlaceSearch({
      pageSize: 20,
      pageIndex: 1,
      extensions: "base",
    });

    placeSearch.searchNearBy(
      "",
      [pos.lng, pos.lat],
      1000,
      (status: string, result: any) => {
        setLoadingLocation(false);
        if (status === "complete" && result.poiList) {
          const pois: POI[] = result.poiList.pois.map((poi: any) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address || "",
            location: { lng: poi.location.lng, lat: poi.location.lat },
            distance: poi.distance,
          }));
          setNearbyPOIs(pois);
        }
      }
    );
  };

  // Search POIs by keyword
  const searchPOIs = useCallback(
    (keyword: string) => {
      if (!window.AMap || !keyword.trim()) {
        setSearchResults([]);
        return;
      }

      const placeSearch = new window.AMap.PlaceSearch({
        pageSize: 15,
        pageIndex: 1,
        extensions: "base",
        city: currentPosition ? undefined : "全国",
      });

      const center = currentPosition
        ? [currentPosition.lng, currentPosition.lat]
        : undefined;

      if (center) {
        placeSearch.searchNearBy(
          keyword,
          center,
          50000,
          (status: string, result: any) => {
            if (status === "complete" && result.poiList) {
              const pois: POI[] = result.poiList.pois.map((poi: any) => ({
                id: poi.id,
                name: poi.name,
                address: poi.address || "",
                location: { lng: poi.location.lng, lat: poi.location.lat },
              }));
              setSearchResults(pois);
            }
          }
        );
      } else {
        placeSearch.search(keyword, (status: string, result: any) => {
          if (status === "complete" && result.poiList) {
            const pois: POI[] = result.poiList.pois.map((poi: any) => ({
              id: poi.id,
              name: poi.name,
              address: poi.address || "",
              location: { lng: poi.location.lng, lat: poi.location.lat },
            }));
            setSearchResults(pois);
          }
        });
      }
    },
    [currentPosition]
  );

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    if (searchQuery.trim()) {
      searchTimerRef.current = setTimeout(() => {
        searchPOIs(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchQuery, searchPOIs]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Open location picker
  const openLocationPicker = () => {
    setShowLocationPicker(true);
    if (nearbyPOIs.length === 0) {
      getCurrentLocation();
    }
  };

  // Select a location
  const selectLocation = (name: string) => {
    setSelectedLocation(name);
    setShowLocationPicker(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Remove location
  const removeLocation = () => {
    setSelectedLocation(null);
  };

  const formatDistance = (d?: number) => {
    if (!d) return "";
    if (d < 1000) return `${Math.round(d)}m`;
    return `${(d / 1000).toFixed(1)}km`;
  };

  const displayPOIs = searchQuery.trim() ? searchResults : nearbyPOIs;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white">
      <div className="flex flex-col h-screen p-4 pb-24 overflow-y-auto">
        {/* 1. Header */}
        <div className="flex justify-between items-center mb-8 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-black transition-colors"
          >
            <X size={24} />
          </button>
          <span className="font-display font-bold text-xl text-black">发布</span>
          <button
            onClick={handlePublish}
            disabled={(!content.trim() && images.length === 0) || loading}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
              (content.trim() || images.length > 0) && !loading
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-400 pointer-events-none"
            }`}
          >
            {loading ? "发布中..." : "发布"}
          </button>
        </div>

        {/* 2. Content Input Area */}
        <div className="flex-1 flex flex-col">
          <textarea
            ref={textareaRef}
            placeholder="分享你的想法..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full flex-1 resize-none bg-white border-none outline-none text-xl font-medium text-black placeholder:text-gray-300 min-h-[160px] py-4"
          ></textarea>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100"
                >
                  <img
                    src={img}
                    alt={`Preview ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {/* Add more button */}
              {images.length < MAX_IMAGES && (
                <button
                  onClick={handleImageClick}
                  className="aspect-square rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
                >
                  <Plus size={32} />
                  <span className="text-[10px] mt-1 font-bold">添加</span>
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

          {/* Selected Location Display */}
          {selectedLocation && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-blue-50 rounded-xl border border-blue-100">
              <MapPin size={14} className="text-blue-500 shrink-0" />
              <span className="text-sm text-blue-700 flex-1 truncate">
                {selectedLocation}
              </span>
              <button
                onClick={removeLocation}
                className="p-1 hover:bg-blue-100 rounded-full transition-colors"
              >
                <X size={14} className="text-blue-400" />
              </button>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-24 left-4 right-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-100"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                autoFocusSearch={false}
                theme={Theme.LIGHT}
                width="100%"
                height={400}
                searchPlaceHolder="搜索表情..."
                previewConfig={{ showPreview: false }}
                skinTonesDisabled
              />
            </div>
          )}

          {/* 3. Media Toolbar */}
          <div className="flex items-center justify-between border border-gray-100 rounded-2xl p-2 mb-6 bg-white">
            <div className="flex items-center gap-1">
              <button
                onClick={handleImageClick}
                className="text-black hover:bg-gray-100 rounded-xl p-3 transition-colors"
              >
                <Image size={24} />
              </button>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`rounded-xl p-3 transition-colors ${
                  showEmojiPicker
                    ? "text-blue-500 bg-blue-50"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                <Smile size={24} />
              </button>
              <button className="text-black hover:bg-gray-100 rounded-xl p-3 transition-colors">
                <Hash size={24} />
              </button>
              <button
                onClick={openLocationPicker}
                className={`hover:bg-gray-100 rounded-xl p-3 transition-colors ${
                  selectedLocation ? "text-blue-500" : "text-black"
                }`}
              >
                <MapPin size={24} />
              </button>
            </div>
            <button className="text-black hover:bg-gray-100 rounded-xl p-3 transition-colors">
              <Plus size={24} />
            </button>
          </div>

          {/* 4. Settings List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-black">匿名发布</span>
                <span className="text-[10px] text-gray-400">隐藏个人信息</span>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                  isAnonymous
                    ? "bg-black"
                    : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
                    isAnonymous ? "left-7" : "left-1"
                  }`}
                ></div>
              </button>
            </div>

            <div
              onClick={openLocationPicker}
              className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 text-black">
                <span className="text-sm font-bold">位置</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <span className="text-xs truncate max-w-[160px]">
                  {selectedLocation || "添加地点"}
                </span>
                <ChevronRight size={16} />
              </div>
            </div>

            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 text-black">
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

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
            <div className="flex items-center gap-3 p-4">
              <button
                onClick={() => {
                  setShowLocationPicker(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={22} className="text-black" />
              </button>
              <h2 className="text-lg font-bold text-black flex-1">选择位置</h2>
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  setShowLocationPicker(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="text-xs text-gray-400 px-3 py-1.5 rounded-full border border-gray-100 hover:bg-gray-50"
              >
                不显示位置
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="搜索地点"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-black outline-none placeholder:text-gray-400"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-0.5 rounded-full hover:bg-gray-200"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Relocate button */}
            {!searchQuery && (
              <button
                onClick={getCurrentLocation}
                disabled={loadingLocation}
                className="mx-4 mb-3 flex items-center gap-2 px-3 py-2.5 text-sm text-blue-500 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors w-auto"
              >
                <Navigation size={14} />
                {loadingLocation ? "定位中..." : "重新定位"}
              </button>
            )}
          </div>

          {/* POI List */}
          <div className="flex-1 overflow-y-auto">
            {loadingLocation && nearbyPOIs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-500 rounded-full animate-spin mb-3" />
                <span className="text-sm">正在获取附近位置...</span>
              </div>
            ) : displayPOIs.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {displayPOIs.map((poi) => (
                  <button
                    key={poi.id}
                    onClick={() => selectLocation(poi.name)}
                    className="w-full px-4 py-3.5 flex items-start gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  >
                    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={16} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black truncate">
                        {poi.name}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {poi.address}
                        {poi.distance
                          ? ` · ${formatDistance(poi.distance)}`
                          : ""}
                      </p>
                    </div>
                    {selectedLocation === poi.name && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <MapPin size={40} className="mb-3 opacity-30" />
                <span className="text-sm">未找到相关地点</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <MapPin size={40} className="mb-3 opacity-30" />
                <span className="text-sm">点击"重新定位"获取附近位置</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Publish;
