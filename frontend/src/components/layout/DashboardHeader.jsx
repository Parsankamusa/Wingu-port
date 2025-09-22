import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, X, User, Settings, LogOut, Briefcase, ChevronDown, Plus, Home, MessageSquare, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardHeader = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const getNavLinks = () => {
        const baseLinks = [{ name: "Dashboard", path: "/dashboard", icon: Home }];
        if (user?.role === 'professional') {
            return [ ...baseLinks, { name: "Find Jobs", path: "/job-search", icon: Briefcase }, { name: "My Applications", path: "/my-applications", icon: MessageSquare }];
        }
        if (user?.role === 'recruiter') {
            return [ ...baseLinks, { name: "Post Job", path: "/post-job", icon: Plus }, { name: "Manage Jobs", path: "/manage-jobs", icon: Briefcase }, { name: "Applications", path: "/view-applications/all", icon: MessageSquare }];
        }
        return baseLinks;
    };

    const navLinks = getNavLinks();

    const getProfileMenuItems = () => {
        if (user?.role === 'professional') {
            return [
                { name: "My Profile", path: "/manage-profile", icon: User },
                { name: "Account Settings", path: "/account-settings", icon: Settings },
                { name: "Sign Out", action: logout, icon: LogOut, danger: true }
            ];
        }
        if (user?.role === 'recruiter') {
            return [
                { name: "Company Profile", path: "/company-profile", icon: Building },
                { name: "Account Settings", path: "/account-settings", icon: Settings },
                { name: "Sign Out", action: logout, icon: LogOut, danger: true }
            ];
        }
        return [{ name: "Sign Out", action: logout, icon: LogOut, danger: true }];
    };

    const profileMenuItems = getProfileMenuItems();

    const handleNavClick = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    const handleProfileMenuClick = (item) => {
        if (item.action) {
            item.action();
        } else {
            navigate(item.path);
        }
        setIsProfileMenuOpen(false);
    };

    const getDisplayName = () => {
        if (!user) return "";
        if (user.role === 'recruiter') return user.company_name || `${user.first_name} ${user.last_name}`;
        return user.full_name || `${user.first_name} ${user.last_name}`;
    };
    
    const getDisplayAvatarChar = () => {
        if (!user) return "?";
        if (user.role === 'recruiter' && user.company_name) return user.company_name.charAt(0).toUpperCase();
        if (user.full_name) return user.full_name.charAt(0).toUpperCase();
        if (user.first_name) return user.first_name.charAt(0).toUpperCase();
        return user.email.charAt(0).toUpperCase();
    };

    return (
        <>
            <header className={`bg-white/80 backdrop-blur-lg fixed w-full top-0 z-50 border-b border-secondary-200/80 transition-all duration-300 ${isScrolled ? 'shadow-sm' : ''}`}>
                <div className="container mx-auto px-4 md:px-6 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-8">
                            <button onClick={() => handleNavClick('/dashboard')} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                                <img src="/logo.png" alt="WinguPort Logo" className="h-9 w-9" />
                                <span className="text-xl font-bold">
                                    <span className="text-wingu-light-blue">Wingu</span>
                                    <span className="text-wingu-dark-blue">Port</span>
                                </span>
                            </button>
                            <nav className="hidden lg:flex items-center space-x-1">
                                {navLinks.map(link => {
                                    const isActive = location.pathname === link.path;
                                    return (
                                        <button 
                                            key={link.name} 
                                            onClick={() => handleNavClick(link.path)} 
                                            className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-300 py-2 px-3 rounded-lg ${
                                                isActive 
                                                ? 'bg-primary-100 text-primary-600' 
                                                : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-100'
                                            }`}
                                        >
                                            {link.icon && <link.icon size={16} />}
                                            <span>{link.name}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <button onClick={() => navigate('/notifications')} className="relative p-2 text-secondary-600 hover:text-primary-600 hover:bg-secondary-100 rounded-full transition-colors">
                                <Bell size={20} />
                            </button>
                            <div className="relative" ref={profileMenuRef}>
                                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-secondary-100 transition-colors">
                                    <img src={user?.profile_picture || `https://placehold.co/100x100/E2E8F0/475569?text=${getDisplayAvatarChar()}`} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" />
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-semibold text-secondary-800">{getDisplayName()}</p>
                                    </div>
                                    <ChevronDown size={16} className={`text-secondary-500 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-2xl border border-secondary-100 animate-in fade-in-5 zoom-in-95 z-50">
                                        <div className="p-2">
                                            <div className="px-3 py-2 border-b border-secondary-100 mb-1">
                                                <p className="text-sm font-semibold text-secondary-900 truncate">{getDisplayName()}</p>
                                                <p className="text-xs text-secondary-500 truncate">{user?.email}</p>
                                            </div>
                                            {profileMenuItems.map((item, index) => (
                                                <button key={index} onClick={() => handleProfileMenuClick(item)} className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-secondary-700 hover:bg-secondary-100'}`}>
                                                    <item.icon size={16} className={item.danger ? 'text-red-500' : 'text-secondary-500'} />
                                                    <span className="font-medium">{item.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="lg:hidden">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-secondary-700 hover:text-primary-600 focus:outline-none p-2 rounded-lg hover:bg-secondary-100 transition-colors">
                                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`lg:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                <div className={`fixed right-0 top-0 h-full w-[280px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex justify-between items-center p-4 border-b border-secondary-100">
                        <span className="font-bold text-lg text-secondary-800">Menu</span>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 text-secondary-500 hover:text-secondary-700 rounded-full hover:bg-secondary-100">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="py-4 space-y-1 px-2">
                        {navLinks.map(link => {
                            const isActive = location.pathname === link.path;
                            return (
                                <button 
                                    key={link.name} 
                                    onClick={() => handleNavClick(link.path)} 
                                    className={`flex w-full items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                                        isActive ? 'bg-primary-50 text-primary-600' : 'text-secondary-700 hover:bg-primary-50 hover:text-primary-600'
                                    }`}
                                >
                                    {link.icon && <link.icon size={18} />}
                                    <span className="font-medium">{link.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardHeader;
