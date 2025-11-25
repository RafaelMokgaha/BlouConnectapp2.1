import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Chat, Message, User } from '../types';
import { ArrowLeft, Send, Mic, Image as ImageIcon, Smile, MoreVertical, X, Settings, User as UserIcon, StopCircle, Trash2, Eraser, Wallpaper } from 'lucide-react';
import { EmojiPicker } from '../components/EmojiPicker';

export const ChatSection = () => {
  const { chats, user, messages, sendMessage, updateChatSettings, toggleFollow, clearChat, deleteChat, isFollowing, viewProfile } = useApp();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  if (activeChatId) {
    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) {
        // Chat might have been deleted
        setActiveChatId(null);
        return null;
    }
    return (
        <ChatRoom 
            chat={activeChat} 
            messages={messages[activeChat.id] || []} 
            onBack={() => setActiveChatId(null)} 
            onSend={(msg) => sendMessage(activeChat.id, msg)} 
            currentUserId={user?.id || ''}
            onUpdateSettings={(s) => updateChatSettings(activeChat.id, s)}
            onFollow={() => toggleFollow(activeChat.id)}
            isFollowing={isFollowing(activeChat.id)}
            onClear={() => clearChat(activeChat.id)}
            onDelete={() => {
                deleteChat(activeChat.id);
                setActiveChatId(null);
            }}
            // Assumed mapped logic: For private chat, the participant ID is needed. 
            // For mock, let's assume chat.id IS the other user ID for private chats or we have a way to get it.
            onViewProfile={() => viewProfile(activeChat.id)} 
        />
    );
  }

  return (
    <div className="pt-4 pb-20">
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-bold text-blou-900 dark:text-white">Chats</h1>
      </div>
      
      <div className="space-y-0">
        {chats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No active chats. Start a conversation from the Community!</div>
        ) : chats.map(chat => (
          <div 
            key={chat.id} 
            onClick={() => setActiveChatId(chat.id)}
            className="flex items-center px-4 py-3 bg-white dark:bg-gray-900 active:bg-gray-100 dark:active:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800"
          >
            <div className="relative">
              <img src={chat.avatar} className="w-12 h-12 rounded-lg object-cover" />
              {chat.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {chat.unreadCount}
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">{chat.name}</h3>
                <span className="text-[10px] text-gray-400">
                  {new Date(chat.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sub-component: Individual Chat Room
const ChatRoom = ({ 
    chat, 
    messages, 
    onBack, 
    onSend, 
    currentUserId,
    onUpdateSettings,
    onFollow,
    isFollowing,
    onClear,
    onDelete,
    onViewProfile
}: { 
    chat: Chat, 
    messages: Message[], 
    onBack: () => void, 
    onSend: (m: Message) => void, 
    currentUserId: string,
    onUpdateSettings: (settings: { wallpaper?: string, wallpaperOpacity?: number }) => void,
    onFollow: () => void,
    isFollowing: boolean,
    onClear: () => void,
    onDelete: () => void,
    onViewProfile: () => void
}) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showEmoji]);

  const handleSendText = () => {
    if (!text.trim()) return;
    onSend({
      id: Date.now().toString(),
      senderId: currentUserId,
      content: text,
      type: 'text',
      timestamp: Date.now()
    });
    setText('');
    setShowEmoji(false);
    simulateReply();
  };

  const simulateReply = () => {
    setIsTyping(true);
    setTimeout(() => {
       setIsTyping(false);
       onSend({
        id: Date.now().toString() + 'r',
        senderId: 'other',
        content: "That sounds great! I'll check it out.",
        type: 'text',
        timestamp: Date.now()
      });
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          const type = file.type.startsWith('video') ? 'video' : 'image';
          onSend({
            id: Date.now().toString(),
            senderId: currentUserId,
            content: url, // For local preview
            type: type,
            timestamp: Date.now()
          });
          simulateReply();
      }
  };

  const handleWallpaperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          onUpdateSettings({ wallpaper: url });
      }
  };

  // Voice Recording
  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];
        
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            onSend({
                id: Date.now().toString(),
                senderId: currentUserId,
                content: url,
                type: 'voice',
                timestamp: Date.now(),
                duration: '0:05' // Mock duration
            });
            stream.getTracks().forEach(t => t.stop());
        };
        
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
    } catch (err) {
        console.error("Mic error", err);
        alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
      if(mediaRecorder && isRecording) {
          mediaRecorder.stop();
          setIsRecording(false);
          setMediaRecorder(null);
      }
  };

  return (
    <div className="flex flex-col h-full relative z-50 overflow-hidden">
      
      {/* Background with Opacity */}
      <div 
        className="absolute inset-0 z-0 bg-repeat transition-all duration-300"
        style={{
            backgroundColor: '#ededed', 
            backgroundImage: chat.wallpaper ? `url(${chat.wallpaper})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: chat.wallpaper ? (chat.wallpaperOpacity || 0.5) : 1
        }}
      />
      {/* Dark mode overlay fix if no wallpaper or for contrast */}
      <div className="absolute inset-0 z-0 bg-black/0 dark:bg-black/50 pointer-events-none"></div>

      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-between shadow-sm border-b border-gray-200 dark:border-gray-800 relative z-20">
        <div className="flex items-center cursor-pointer" onClick={() => setShowProfile(true)}>
          <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="mr-3 text-gray-700 dark:text-white">
            <ArrowLeft size={24} />
          </button>
          <img src={chat.avatar} className="w-9 h-9 rounded-full object-cover mr-3" />
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white leading-tight">{chat.name}</h2>
            <span className="text-[10px] text-green-500">Online</span>
          </div>
        </div>
        
        {/* Settings Icon */}
        <button onClick={() => setShowSettings(!showSettings)} className="text-gray-600 dark:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
           <MoreVertical size={20} />
        </button>
        
        {/* Professional Settings Modal */}
        {showSettings && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}></div>
                
                <div className="bg-white dark:bg-gray-800 w-full sm:w-80 rounded-t-2xl sm:rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-slide-up">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                            <Settings size={18} className="mr-2" /> 
                            Chat Options
                        </h3>
                        <button onClick={() => setShowSettings(false)} className="text-gray-500"><X size={20}/></button>
                    </div>

                    <div className="p-2 space-y-1">
                        <button 
                            onClick={() => wallpaperInputRef.current?.click()} 
                            className="w-full flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-blou-100 dark:bg-gray-700 text-blou-600 flex items-center justify-center mr-3">
                                <Wallpaper size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm dark:text-white">Change Wallpaper</p>
                                <p className="text-xs text-gray-500">Custom background for this chat</p>
                            </div>
                        </button>
                        <input type="file" ref={wallpaperInputRef} className="hidden" accept="image/*" onChange={handleWallpaperChange} />

                        {chat.wallpaper && (
                            <div className="px-3 py-2">
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs text-gray-500 font-bold uppercase">Opacity</label>
                                    <span className="text-xs text-gray-400">{Math.round((chat.wallpaperOpacity || 0.5) * 100)}%</span>
                                </div>
                                <input 
                                    type="range" min="0.1" max="1" step="0.1" 
                                    value={chat.wallpaperOpacity || 0.5} 
                                    onChange={(e) => onUpdateSettings({ wallpaperOpacity: parseFloat(e.target.value) })}
                                    className="w-full accent-blou-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        )}

                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-3"></div>

                        <button 
                             onClick={() => { onClear(); setShowSettings(false); }}
                             className="w-full flex items-center p-3 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl transition-colors text-left text-orange-600"
                        >
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mr-3">
                                <Eraser size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Clear Chat</p>
                                <p className="text-xs opacity-70">Delete messages for me</p>
                            </div>
                        </button>

                        <button 
                             onClick={() => { onDelete(); setShowSettings(false); }}
                             className="w-full flex items-center p-3 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors text-left text-red-600"
                        >
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-3">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Delete Chat</p>
                                <p className="text-xs opacity-70">Remove conversation completely</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[80] bg-white dark:bg-gray-900 animate-slide-up flex flex-col">
            <div className="h-64 relative">
                <img src={chat.avatar} className="w-full h-full object-cover" />
                <button onClick={() => setShowProfile(false)} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white"><ArrowLeft /></button>
            </div>
            <div className="p-6">
                <h2 className="text-2xl font-bold dark:text-white mb-1">{chat.name}</h2>
                <p className="text-gray-500 mb-6">BlouConnect User</p>
                <div className="flex space-x-4 mb-8">
                    <button 
                        onClick={onFollow} 
                        className={`flex-1 py-2 rounded-lg font-semibold shadow-lg transition-colors ${
                            isFollowing 
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                            : 'bg-blou-600 text-white shadow-blou-600/30'
                        }`}
                    >
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                    <button onClick={() => { onViewProfile(); setShowProfile(false); }} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white py-2 rounded-lg font-semibold">View Profile</button>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">About</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Community member of {chat.name}. Using BlouConnect to stay in touch.</p>
                </div>
            </div>
            <div className="mt-auto p-6 text-center text-xs text-gray-400">
                FROM RAFAPROJECT.0.0.1
            </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 z-10">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${
                isMe 
                ? 'bg-blou-500 text-white rounded-xl rounded-tr-none' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl rounded-tl-none shadow-sm'
              } p-2`}>
                {msg.type === 'text' && <div className="px-2 py-1 text-sm">{msg.content}</div>}
                {msg.type === 'image' && <img src={msg.content} className="rounded-lg max-h-60" />}
                {msg.type === 'video' && <video src={msg.content} controls className="rounded-lg max-h-60 bg-black" />}
                {msg.type === 'voice' && (
                    <div className="flex items-center space-x-2 px-2 py-1">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Mic size={16} />
                        </div>
                        <div className="flex flex-col">
                             <span className="text-xs font-bold">Voice Note</span>
                             <audio src={msg.content} controls className="h-6 w-32" />
                        </div>
                    </div>
                )}
                
                <div className={`text-[9px] mt-1 text-right px-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl rounded-tl-none shadow-sm flex space-x-1">
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
             </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input & Emoji Container */}
      <div className="flex flex-col flex-shrink-0 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-20">
        <div className="p-2">
            <div className="flex items-center space-x-2">
                {isRecording ? (
                    <button onClick={stopRecording} className="p-2 text-red-500 animate-pulse bg-red-100 dark:bg-red-900/30 rounded-full"><StopCircle size={24} /></button>
                ) : (
                    <button onClick={startRecording} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"><Mic size={24} /></button>
                )}
                
                <div className="flex-1 relative">
                    <input 
                        value={text}
                        onChange={e => setText(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 rounded-full border-none focus:ring-0 bg-white dark:bg-gray-800 dark:text-white shadow-sm"
                        placeholder={isRecording ? "Recording..." : "Message..."}
                        onKeyDown={e => e.key === 'Enter' && handleSendText()}
                        disabled={isRecording}
                        onClick={() => setShowEmoji(false)}
                    />
                    <button onClick={() => setShowEmoji(!showEmoji)} className={`absolute right-3 top-2.5 hover:text-yellow-500 transition-colors ${showEmoji ? 'text-yellow-500' : 'text-gray-400'}`}><Smile size={20} /></button>
                </div>
                
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"><ImageIcon size={24} /></button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                
                {text.length > 0 && (
                    <button onClick={handleSendText} className="p-2 bg-blou-600 hover:bg-blou-700 text-white rounded-full animate-fade-in shadow-md"><Send size={20} /></button>
                )}
            </div>
        </div>
        
        {/* Emoji Picker Section */}
        {showEmoji && (
           <div className="h-64 border-t border-gray-200 dark:border-gray-800">
               <EmojiPicker onEmojiClick={(emoji) => setText(prev => prev + emoji)} />
           </div>
        )}
      </div>
    </div>
  );
};