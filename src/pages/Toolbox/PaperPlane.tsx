import React, { useState } from "react";
import { ArrowLeft, Send, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPost, getRandomPaperPlane } from "../../services/postService";

const PaperPlane: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"home" | "throw" | "catch">("home");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [caughtPlane, setCaughtPlane] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleThrow = async () => {
    if (!content.trim() || content.length > 140) return;
    
    setIsSubmitting(true);
    try {
      await createPost({
        content,
        type: "paper_plane",
        isAnonymous: true
      });
      // Success animation will be handled by state
      setMode("home");
      setContent("");
      alert("投递成功！");
    } catch (err) {
      console.error(err);
      alert("投递失败，请稍后再试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCatch = async () => {
    setIsLoading(true);
    setError(null);
    setCaughtPlane(null);
    try {
      const res = await getRandomPaperPlane();
      if (res) {
        setCaughtPlane(res);
        setMode("catch");
      } else {
        setError("海面上没有发现纸飞机...");
      }
    } catch (err) {
      console.error(err);
      setError("捞取失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={() => mode === "home" ? navigate(-1) : setMode("home")} 
          className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-black" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Campus Paper Plane
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {mode === "home" && (
          <div className="space-y-8 w-full max-w-xs text-center animate-in zoom-in-95 duration-500">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center animate-bounce-subtle shadow-xl">
                <Send size={40} className="text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setMode("throw")}
                className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
              >
                投递 (Throw)
              </button>
              <button
                onClick={handleCatch}
                disabled={isLoading}
                className="w-full py-4 bg-white text-black font-bold border-2 border-black rounded-xl hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                捞取 (Catch)
              </button>
            </div>
            
            {error && (
              <p className="text-sm text-gray-500 animate-in fade-in slide-in-from-top-2">{error}</p>
            )}
          </div>
        )}

        {mode === "throw" && (
          <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你想说的话 (最多140字)..."
                className="w-full h-48 p-6 text-lg border-2 border-black rounded-2xl focus:outline-none resize-none placeholder:text-gray-300"
                maxLength={140}
              />
              <div className="absolute bottom-4 right-4 text-sm font-medium text-gray-400">
                {content.length}/140
              </div>
            </div>
            
            <button
              onClick={handleThrow}
              disabled={isSubmitting || !content.trim()}
              className="w-full py-4 bg-black text-white font-bold rounded-xl disabled:opacity-30 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} className="-rotate-45" />}
              {isSubmitting ? "正在投递..." : "立即投递"}
            </button>
          </div>
        )}

        {mode === "catch" && caughtPlane && (
          <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
            <div className="bg-white border-2 border-gray-100 p-8 rounded-3xl shadow-2xl relative transform rotate-1">
              <div className="absolute top-0 left-0 w-full h-full border-2 border-black rounded-3xl -m-1 -z-10 bg-white" />
              
              <div className="prose prose-lg">
                <p className="text-xl leading-relaxed text-black font-medium italic">
                  "{caughtPlane.content}"
                </p>
              </div>
              
              <div className="mt-8 flex justify-between items-center text-sm text-gray-400">
                <span>来自远方的匿名同学</span>
                <span>{new Date(caughtPlane.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <button
              onClick={() => setMode("home")}
              className="mt-12 w-full py-4 text-black font-bold border-b-2 border-black hover:bg-gray-50 transition-colors"
            >
              返回
            </button>
          </div>
        )}
      </div>
      
      {/* Visual background element */}
      <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 transform -rotate-12 scale-150">
          <Send size={400} />
        </div>
      </div>
    </div>
  );
};

export default PaperPlane;
