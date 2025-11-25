import React, { useState } from 'react';
import { VILLAGES } from '../constants';
import { Search, TrendingUp, Calendar, Trophy, Heart, ArrowLeft, MapPin, X } from 'lucide-react';
import { Feed } from './Feed';
import { PostCategory, User } from '../types';
import { useApp } from '../contexts/AppContext';

export const Discovery = () => {
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | null>(null);
  const { activeVillageFilter, setVillageFilter, posts, viewProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate trending villages based on post count
  const trendingVillages = React.useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
        counts[p.village] = (counts[p.village] || 0) + 1;
    });
    
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1]) // Sort by post count descending
        .slice(0, 5) // Top 5
        .map(([name, count]) => ({ name, count }));
  }, [posts]);

  // Get a unique list of users from posts for searching
  const uniqueUsers = React.useMemo(() => {
    const usersMap = new Map<string, User>();
    posts.forEach(post => {
        if (!usersMap.has(post.userId)) {
            usersMap.set(post.userId, {
                id: post.userId,
                fullName: post.userName,
                avatar: post.userAvatar,
                village: post.village,
                // Add other required User fields with default/dummy values
                dob: '',
                phoneNumber: '',
                followers: 0,
                following: 0,
                isOnline: false,
                isVerified: post.userIsVerified
            });
        }
    });
    return Array.from(usersMap.values());
  }, [posts]);

  const filteredVillages = searchQuery 
    ? VILLAGES.filter(v => v.toLowerCase().includes(searchQuery.toLowerCase())) 
    : [];

  const filteredUsers = searchQuery
    ? uniqueUsers.filter(u => u.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const CategoryCard = ({ icon: Icon, title, color, category }: { icon: any, title: string, color: string, category: PostCategory }) => (
    <button 
        onClick={() => setSelectedCategory(category)}
        className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 ${color} bg-opacity-10 dark:bg-opacity-10 cursor-pointer active:scale-95 transition-transform w-full`}
    >
        <div className={`p-3 rounded-full mb-2 ${color} text-white shadow-md`}>
            <Icon size={20} />
        </div>
        <span className="text-sm font-semibold dark:text-gray-200">{title}</span>
    </button>
  );

  if (selectedCategory) {
      return (
          <div className="flex flex-col h-full">
              <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                  <button onClick={() => setSelectedCategory(null)} className="p-2 -ml-2 text-gray-600 dark:text-white">
                      <ArrowLeft size={24} />
                  </button>
                  <h1 className="text-xl font-bold ml-2 dark:text-white">{selectedCategory}</h1>
              </div>
              <Feed filterCategory={selectedCategory} />
          </div>
      );
  }

  if (activeVillageFilter) {
      return (
          <div className="flex flex-col h-full">
              <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                  <button onClick={() => setVillageFilter(null)} className="p-2 -ml-2 text-gray-600 dark:text-white">
                      <ArrowLeft size={24} />
                  </button>
                  <h1 className="text-xl font-bold ml-2 dark:text-white">{activeVillageFilter}</h1>
              </div>
              <Feed filterVillage={activeVillageFilter} />
          </div>
      );
  }

  return (
    <div className="pt-4 pb-20">
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-bold text-blou-900 dark:text-white mb-2">Discovery</h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search village or people..." 
            className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={18} />
            </button>
          )}
        </div>
      </div>

      {searchQuery ? (
        <div className="animate-fade-in px-4">
            {filteredVillages.length === 0 && filteredUsers.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <p className="font-semibold">No results found</p>
                    <p className="text-sm">Try searching for something else.</p>
                </div>
            ) : (
                <>
                    {filteredUsers.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">People</h3>
                            <div className="space-y-2">
                                {filteredUsers.map(u => (
                                    <div 
                                        key={u.id} 
                                        onClick={() => { viewProfile(u.id); setSearchQuery(''); }}
                                        className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <img src={u.avatar} className="w-10 h-10 rounded-full object-cover mr-3" />
                                        <div>
                                            <p className="font-semibold text-sm dark:text-white">{u.fullName}</p>
                                            <p className="text-xs text-gray-500">{u.village}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {filteredVillages.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Villages</h3>
                            <div className="space-y-2">
                                {filteredVillages.map(v => (
                                    <div 
                                        key={v} 
                                        onClick={() => { setVillageFilter(v); setSearchQuery(''); }}
                                        className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <MapPin size={16} className="mr-3 text-blou-500" />
                                        <p className="font-semibold text-sm dark:text-white">{v}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
      ) : (
        <>
          {/* Categories */}
          <div className="px-4 grid grid-cols-3 gap-3 mb-6">
            <CategoryCard icon={Heart} title="Funerals" category="Funerals" color="bg-gray-500" />
            <CategoryCard icon={Calendar} title="Events" category="Events" color="bg-purple-500" />
            <CategoryCard icon={Trophy} title="Sports" category="Sports" color="bg-green-500" />
          </div>

          {/* Trending List - Dynamic */}
          {trendingVillages.length > 0 && (
            <div className="bg-white dark:bg-gray-800 mx-4 rounded-xl p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4 text-blou-600 dark:text-blou-400 font-semibold border-b border-gray-100 dark:border-gray-700 pb-2">
                <TrendingUp size={20} />
                <h2>Trending Villages</h2>
                </div>
                
                <div className="space-y-3">
                    {trendingVillages.map((village, index) => (
                        <div 
                            key={village.name} 
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                            onClick={() => setVillageFilter(village.name)}
                        >
                            <div className="flex items-center space-x-3">
                                <span className={`text-sm font-bold w-4 ${index < 3 ? 'text-blou-600' : 'text-gray-400'}`}>#{index + 1}</span>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{village.name}</p>
                                    <p className="text-[10px] text-gray-500">{village.count} posts</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold flex items-center">
                                🔥 Hot
                            </span>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* Area List */}
          <div className="px-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">All Areas ({VILLAGES.length})</h3>
            <div className="grid grid-cols-2 gap-3">
              {VILLAGES.map((v) => (
                <div 
                    key={v} 
                    onClick={() => setVillageFilter(v)}
                    className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 flex justify-between items-center group active:scale-95 transition-transform cursor-pointer"
                >
                  <span className="text-sm font-medium dark:text-gray-200 truncate">{v}</span>
                  <div className="w-2 h-2 rounded-full bg-green-400 opacity-0 group-hover:opacity-100"></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};