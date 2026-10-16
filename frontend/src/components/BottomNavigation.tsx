import React from 'react';
import { Home, FileText, Map, UserCheck } from 'lucide-react';

interface BottomNavigationProps {
    currentTab: 'home' | 'lapor' | 'peta' | 'saya';
    onTabChange: (tab: 'home' | 'lapor' | 'peta' | 'saya') => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentTab, onTabChange }) => {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'lapor', label: 'Lapor', icon: FileText },
        { id: 'peta', label: 'Peta', icon: Map },
        { id: 'saya', label: 'Saya', icon: UserCheck },
    ] as const;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg px-3 py-2 max-w-lg mx-auto md:max-w-xl">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                                isActive
                                    ? 'text-teal-700 font-semibold'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <div
                                className={`p-1.5 rounded-xl transition-transform ${
                                    isActive
                                        ? 'bg-teal-50 text-teal-700 scale-110 shadow-xs'
                                        : 'hover:bg-slate-100'
                                }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-2xs mt-0.5 tracking-tight">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
