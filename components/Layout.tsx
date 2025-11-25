import React, { ReactNode } from 'react';
import { Home, Compass, MessageCircle, User as UserIcon, PlusCircle } from 'lucide-react';
import { AppTab } from '../types';

interface LayoutProps {
  children: ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onPostClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onPostClick }) => {
  
  const NavItem = ({ tab, icon: Icon, label }: { tab: AppTab; icon: any; label: string }) => {
    const isActive = activeTab === tab;
    return (
      <button 
        onClick={() => onTabChange(tab)}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-blou-600 dark:text-blou-400' : 'text-gray-500 dark:text-gray-400'}`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white dark:bg-gray-900 shadow-2xl overflow-hidden relative border-x border-gray-200 dark:border-gray-800">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-20 bg-gray-50 dark:bg-gray-900 relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-2 z-50">
        <NavItem tab="home" icon={Home} label="Community" />
        <NavItem tab="discovery" icon={Compass} label="Discovery" />
        
        {/* FAB Style Post Button in Center */}
        <div className="relative -top-5">
           <button 
            onClick={onPostClick}
            className="w-14 h-14 rounded-full bg-blou-600 text-white shadow-lg flex items-center justify-center hover:bg-blou-700 hover:scale-105 transition-all"
           >
             <PlusCircle size={28} />
           </button>
        </div>

        <NavItem tab="chat" icon={MessageCircle} label="Chats" />
        <NavItem tab="profile" icon={UserIcon} label="Profile" />
      </div>
    </div>
  );
};