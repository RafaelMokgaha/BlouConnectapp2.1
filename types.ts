export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  village: string;
  avatar: string;
  banner?: string;
  about?: string;
  dob: string;
  isOnline: boolean;
  followers: number;
  following: number;
  followingIds?: string[]; // List of IDs this user follows
  totalLikes?: number; // Total likes received on posts
  isVerified?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: number;
}

export type PostCategory = 'General' | 'Funerals' | 'Events' | 'Sports';

export interface Reaction {
  userId: string;
  emoji: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userIsVerified?: boolean;
  village: string;
  category?: PostCategory;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  timestamp: number;
  likes: number;
  reactions?: Reaction[];
  comments: number;
  commentsList?: Comment[];
  isRepost?: boolean;
  originalAuthor?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string; // text or url if media
  type: 'text' | 'image' | 'video' | 'voice';
  timestamp: number;
  duration?: string; // for voice notes
}

export interface Chat {
  id: string;
  name: string; // Name of person or group
  avatar: string;
  type: 'private' | 'group';
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  participants: string[];
  wallpaper?: string;
  wallpaperOpacity?: number;
}

export interface Status {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  timestamp: number;
}

export type ViewState = 'splash' | 'auth' | 'app';
export type AppTab = 'home' | 'discovery' | 'chat' | 'profile';