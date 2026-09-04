import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Sparkles, Smile } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const ChatBox = () => {
  const { messages, sendMessage, sendTyping, isPartnerTyping, matchStatus, sessionId } = useSocket();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isMatched = matchStatus === 'matched';

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    if (isMatched) {
      sendTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 1500);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !isMatched) return;

    sendMessage(inputText);
    setInputText('');
    sendTyping(false);
  };

  const addQuickEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white glass-panel rounded-3xl border border-violet-100 overflow-hidden shadow-xl shadow-violet-500/5">
      
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-violet-100 flex items-center justify-between bg-violet-50/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-600" />
          <h4 className="text-xs sm:text-sm font-extrabold text-violet-950 uppercase tracking-wider">
            Live Chat
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-violet-700">
          {isMatched ? '1-on-1 Encrypted' : 'Waiting for connection'}
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 min-h-[220px] bg-[#fdfdff]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-violet-400">
            <Sparkles className="w-10 h-10 mb-2 opacity-50 text-brand-600" />
            <p className="text-xs sm:text-sm font-semibold text-violet-700">
              {isMatched ? 'Say hello to break the ice!' : 'Connect to a partner to start texting.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === sessionId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm break-words leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none shadow-violet-500/20 font-medium'
                      : 'bg-violet-50/90 text-violet-950 border border-violet-100 rounded-bl-none font-medium'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-violet-500 font-semibold mt-1 px-1">
                  {isMe ? 'You' : 'Partner'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}

        {/* Partner Typing Indicator */}
        {isPartnerTyping && (
          <div className="flex items-center gap-1.5 text-xs text-brand-600 font-bold italic py-1">
            <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce [animation-delay:0.4s]" />
            <span className="ml-1 text-[11px] text-violet-600">Partner is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis */}
      {isMatched && (
        <div className="px-3 py-1.5 border-t border-violet-100 flex items-center gap-2 overflow-x-auto bg-violet-50/30">
          {['👋', '😄', '✨', '🔥', '📍 Where you from?', '👍'].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addQuickEmoji(item)}
              className="text-xs px-2.5 py-1 rounded-full bg-white hover:bg-violet-100 text-violet-800 border border-violet-200 transition-colors whitespace-nowrap font-medium shadow-xs"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Input Field */}
      <form onSubmit={handleSend} className="p-3 border-t border-violet-100 flex items-center gap-2 bg-white">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          disabled={!isMatched}
          maxLength={500}
          placeholder={isMatched ? "Type a message... (Enter to send)" : "Waiting for partner..."}
          className="flex-1 bg-violet-50/50 border border-violet-200 focus:bg-white focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-violet-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-violet-950 placeholder-violet-400 disabled:opacity-40 transition-all font-medium"
        />

        <button
          type="submit"
          disabled={!isMatched || !inputText.trim()}
          className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 transition-all flex items-center justify-center shadow-md shadow-brand-500/20 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
