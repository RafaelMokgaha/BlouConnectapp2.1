
import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { User, Post, Chat, Message, Comment, Status } from '../types';
import { MOCK_CHATS_INIT, MOCK_POSTS_INIT } from '../constants';

interface AppContextType {
  // Auth & Settings
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toggleFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;

  // View States
  viewingProfileId: string | null;
  viewProfile: (userId: string | null) => void;
  activeVillageFilter: string | null;
  setVillageFilter: (village: string | null) => void;

  // Data
  posts: Post[];
  addPost: (post: Post) => void;
  addComment: (postId: string, comment: Comment) => void;
  repost: (post: Post) => void;
  reactToPost: (postId: string, emoji: string) => void;
  
  chats: Chat[];
  updateChatSettings: (chatId: string, settings: { wallpaper?: string, wallpaperOpacity?: number }) => void;
  messages: Record<string, Message[]>; // chatId -> messages
  sendMessage: (chatId: string, message: Message) => void;
  clearChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  
  statuses: Status[];
  addStatus: (status: Status) => void;

  // UI State
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [activeVillageFilter, setActiveVillageFilter] = useState<string | null>(null);
  
  // Data State
  const [posts, setPosts] = useState<Post[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [statuses, setStatuses] = useState<Status[]>([]);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      const storedUser = localStorage.getItem('blou_user');
      if (storedUser) setUser(JSON.parse(storedUser));
      
      const storedTheme = localStorage.getItem('blou_theme');
      if (storedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
      setLoading(false);
    }, 1500);
  }, []);

  const checkVerification = (u: User): boolean => {
      // Logic: >1000 followers and >10000 total likes
      return (u.followers >= 1000 && (u.totalLikes || 0) >= 10000);
  };

  const login = (userData: User) => {
    // Add default stats if new user
    const userWithStats: User = {
        ...userData,
        followers: userData.followers || 0,
        following: userData.following || 0,
        followingIds: userData.followingIds || [],
        totalLikes: userData.totalLikes || 0,
        isVerified: false,
        banner: userData.banner || ''
    };

    // Auto-verify check
    if (checkVerification(userWithStats)) {
        userWithStats.isVerified = true;
    }

    setUser(userWithStats);
    localStorage.setItem('blou_user', JSON.stringify(userWithStats));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('blou_user');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      
      // Auto-verify check whenever data updates
      updated.isVerified = checkVerification(updated);

      setUser(updated);
      localStorage.setItem('blou_user', JSON.stringify(updated));

      // CRITICAL: Update all posts and comments by this user to reflect new Name/Avatar/Verification
      setPosts(prevPosts => prevPosts.map(p => {
        let needsUpdate = false;
        let updatedPost = { ...p };

        // Update Post Author
        if (p.userId === updated.id) {
            updatedPost = {
                ...updatedPost,
                userName: updated.fullName,
                userAvatar: updated.avatar,
                userIsVerified: updated.isVerified,
                village: updated.village
            };
            needsUpdate = true;
        }

        // Update Comments
        if (updatedPost.commentsList && updatedPost.commentsList.length > 0) {
            const newComments = updatedPost.commentsList.map(c => {
                if (c.userId === updated.id) {
                    return { ...c, userName: updated.fullName, userAvatar: updated.avatar };
                }
                return c;
            });
            // Check if any comment actually changed
            if (JSON.stringify(newComments) !== JSON.stringify(updatedPost.commentsList)) {
                updatedPost.commentsList = newComments;
                needsUpdate = true;
            }
        }

        return updatedPost;
      }));
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('blou_theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const isFollowing = (userId: string) => {
    return user?.followingIds?.includes(userId) || false;
  };

  const toggleFollow = (targetId: string) => {
    if (!user) return;
    
    const currentFollowing = user.followingIds || [];
    const isAlreadyFollowing = currentFollowing.includes(targetId);
    
    let newFollowingIds;
    let newCount = user.following;

    if (isAlreadyFollowing) {
        newFollowingIds = currentFollowing.filter(id => id !== targetId);
        newCount = Math.max(0, newCount - 1);
    } else {
        newFollowingIds = [...currentFollowing, targetId];
        newCount = newCount + 1;
    }

    updateUser({ 
        following: newCount,
        followingIds: newFollowingIds
    });
  };

  const viewProfile = (userId: string | null) => {
    setViewingProfileId(userId);
  };

  const setVillageFilter = (village: string | null) => {
    setActiveVillageFilter(village);
  };

  const addPost = (post: Post) => {
    // Attach current verification status
    const postWithVerification = {
        ...post,
        userIsVerified: user?.isVerified
    };
    setPosts(prev => [postWithVerification, ...prev]);
  };

  const addComment = (postId: string, comment: Comment) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments + 1,
          commentsList: [...(p.commentsList || []), comment]
        };
      }
      return p;
    }));
  };

  const repost = (originalPost: Post) => {
    if (!user) return;
    const newPost: Post = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.fullName,
        userAvatar: user.avatar,
        userIsVerified: user.isVerified, // Include verification
        village: user.village,
        category: originalPost.category,
        content: originalPost.content,
        mediaUrl: originalPost.mediaUrl,
        mediaType: originalPost.mediaType,
        timestamp: Date.now(),
        likes: 0,
        comments: 0,
        isRepost: true,
        originalAuthor: originalPost.userName,
        reactions: []
    };
    addPost(newPost);
  };

  const reactToPost = (postId: string, emoji: string) => {
      if (!user) return;
      setPosts(prev => prev.map(p => {
          if (p.id === postId) {
              const currentReactions = p.reactions || [];
              const existingIndex = currentReactions.findIndex(r => r.userId === user.id);
              let newReactions = [...currentReactions];

              if (existingIndex >= 0) {
                  // If clicking same emoji, remove it (toggle off)
                  if (currentReactions[existingIndex].emoji === emoji) {
                      newReactions.splice(existingIndex, 1);
                  } else {
                      // Change reaction
                      newReactions[existingIndex] = { userId: user.id, emoji };
                  }
              } else {
                  // Add new reaction
                  newReactions.push({ userId: user.id, emoji });
              }
              
              return {
                  ...p,
                  reactions: newReactions,
                  likes: newReactions.length
              };
          }
          return p;
      }));
  };

  const addStatus = (status: Status) => {
    setStatuses(prev => [status, ...prev]);
  };

  const updateChatSettings = (chatId: string, settings: { wallpaper?: string, wallpaperOpacity?: number }) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, ...settings } : c));
  };

  const clearChat = (chatId: string) => {
      setMessages(prev => ({ ...prev, [chatId]: [] }));
  };

  const deleteChat = (chatId: string) => {
      setChats(prev => prev.filter(c => c.id !== chatId));
  };

  const sendMessage = (chatId: string, message: Message) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message]
    }));
    
    // Update chat last message
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          lastMessage: message.type === 'text' ? message.content : `Sent a ${message.type}`,
          lastMessageTime: message.timestamp,
          unreadCount: 0
        };
      }
      return c;
    }).sort((a, b) => b.lastMessageTime - a.lastMessageTime));
  };

  return (
    <AppContext.Provider value={{
      user, login, logout, updateUser,
      isDarkMode, toggleDarkMode, toggleFollow, isFollowing,
      viewingProfileId, viewProfile, activeVillageFilter, setVillageFilter,
      posts, addPost, addComment, repost, reactToPost,
      chats, messages, sendMessage, updateChatSettings, clearChat, deleteChat,
      statuses, addStatus,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
