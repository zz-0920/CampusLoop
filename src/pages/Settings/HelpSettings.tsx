import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle, HelpCircle, Loader2 } from "lucide-react";

const HelpSettings: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!feedback.trim()) return;
    setSending(true);
    // Mock API call
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setFeedback("");
    }, 1500);
  };

  const faqItems = [
    { q: "如何修改头像？", a: "在设置 -> 个人资料中点击头像即可更换。" },
    { q: "如何找回密码？", a: "目前请联系管理员进行密码重置。" },
    { q: "怎么发布帖子？", a: "点击底部导航栏中间的“发布”按钮即可。" },
  ];

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-black" />
        </button>
        <h1 className="text-xl font-bold text-black">帮助与反馈</h1>
      </div>

      <div className="px-4 py-6 space-y-8 max-w-md mx-auto">
        {/* FAQ Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">常见问题</h3>
          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
                  <HelpCircle size={16} className="text-gray-400" />
                  {item.q}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">意见反馈</h3>
          {submitted ? (
            <div className="bg-green-50 p-8 rounded-3xl border border-green-100 text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <Send size={28} />
              </div>
              <h4 className="font-bold text-green-800">提交成功</h4>
              <p className="text-xs text-green-600">感谢你的反馈，我们会尽快处理！</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-green-700 underline"
              >
                再次反馈
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black transition-colors min-h-[150px] resize-none"
                placeholder="请详细描述你的问题或建议..."
              />
              <button
                onClick={handleSubmit}
                disabled={sending || !feedback.trim()}
                className="w-full py-4 bg-black text-white rounded-2xl text-sm font-bold disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {sending ? "提交中..." : "提交反馈"}
              </button>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="flex flex-col items-center gap-2 pt-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <MessageCircle size={20} />
          </div>
          <span className="text-xs text-gray-400">联系在线客服 (9:00 - 18:00)</span>
        </div>
      </div>
    </div>
  );
};

export default HelpSettings;
