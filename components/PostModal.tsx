import React, { useState, useRef } from 'react';
import { X, MapPin, Image as ImageIcon, Video, FileVideo, Tag } from 'lucide-react';
import { VILLAGES } from '../constants';
import { useApp } from '../contexts/AppContext';
import { PostCategory } from '../types';

export const PostModal = ({ onClose }: { onClose: () => void }) => {
  const { addPost, user } = useApp();
  const [selectedVillage, setSelectedVillage] = useState(user?.village || VILLAGES[0]);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('General');
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'video'>('text');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!content.trim() && !mediaUrl) return;
    addPost({
      id: Date.now().toString(),
      userId: user?.id || 'anon',
      userName: user?.fullName || 'Anonymous',
      userAvatar: user?.avatar || 'https://picsum.photos/50',
      village: selectedVillage,
      category: selectedCategory,
      content,
      mediaType: mediaType === 'text' ? undefined : mediaType,
      mediaUrl: mediaUrl || undefined,
      timestamp: Date.now(),
      likes: 0,
      comments: 0
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      if(e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          setMediaType(type);
          setMediaUrl(url);
      }
  };

  const categories: PostCategory[] = ['General', 'Funerals', 'Events', 'Sports'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-lg dark:text-white">Create Post</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full"><X size={16} className="dark:text-white" /></button>
        </div>

        <div className="p-4 overflow-y-auto">
             {/* Village Selector */}
             <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Location</label>
                 <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-blou-600" size={16} />
                    <select 
                      value={selectedVillage}
                      onChange={(e) => setSelectedVillage(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl appearance-none dark:text-white focus:ring-2 focus:ring-blou-500 text-sm"
                    >
                      {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                 </div>
             </div>

             {/* Category Selector */}
             <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">Category</label>
                 <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                     {categories.map(cat => (
                         <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                                selectedCategory === cat 
                                ? 'bg-blou-600 text-white border-blou-600' 
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                            }`}
                         >
                             {cat}
                         </button>
                     ))}
                 </div>
             </div>

             <textarea 
               className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl resize-none focus:outline-none dark:text-white placeholder-gray-400 text-sm"
               placeholder={`What's happening in ${selectedVillage}?`}
               value={content}
               onChange={e => setContent(e.target.value)}
             />

             {mediaUrl && (
                 <div className="mt-2 relative">
                     <button onClick={() => setMediaUrl('')} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full z-10"><X size={12} /></button>
                     {mediaType === 'image' ? (
                         <img src={mediaUrl} className="w-full h-40 object-cover rounded-xl" />
                     ) : (
                         <video src={mediaUrl} controls className="w-full h-40 bg-black rounded-xl" />
                     )}
                 </div>
             )}

             <div className="flex space-x-2 mt-4 mb-6">
                <label className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${mediaType === 'image' && mediaUrl ? 'bg-blou-50 border-blou-200 text-blou-600' : 'border-gray-200 dark:border-gray-600 dark:text-gray-300'}`}>
                  <ImageIcon size={16} />
                  <span>Photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                </label>
                <label className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${mediaType === 'video' && mediaUrl ? 'bg-blou-50 border-blou-200 text-blou-600' : 'border-gray-200 dark:border-gray-600 dark:text-gray-300'}`}>
                  <FileVideo size={16} />
                  <span>Video</span>
                  <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                </label>
             </div>

             <button 
              onClick={handleSubmit}
              disabled={!content && !mediaUrl}
              className="w-full bg-blou-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blou-600/30 disabled:opacity-50"
            >
              Post
            </button>
          </div>
      </div>
    </div>
  );
};