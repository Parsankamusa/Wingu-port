import React from 'react';
import { Facebook, Linkedin } from 'lucide-react';
import XLogo from '../common/XLogo';

const DashboardFooter = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-secondary-900 text-white mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Column 1: Logo and Brand */}
                    <div className="col-span-1 md:col-span-5">
                        <a href="/dashboard" className="flex items-center space-x-2 mb-4">
                            <img src="/logo.png" alt="WinguPort Logo" className="h-9 w-9" />
                            <span className="text-xl font-bold">
                                <span className="text-wingu-light-blue">Wingu</span>
                                <span className="text-wingu-dark-blue">Port</span>
                            </span>
                        </a>
                        <p className="text-secondary-400 max-w-md text-sm">
                            The premier aviation workforce recruitment system, connecting talent with opportunity.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="col-span-1 md:col-span-3 md:col-start-7">
                        <h4 className="font-semibold text-base mb-4 tracking-wide">Navigation</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="/dashboard" className="text-secondary-400 hover:text-primary-400 transition-colors">Dashboard</a></li>
                            <li><a href="/account-settings" className="text-secondary-400 hover:text-primary-400 transition-colors">Settings</a></li>
                            <li><a href="/help" className="text-secondary-400 hover:text-primary-400 transition-colors">Help Center</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Legal */}
                    <div className="col-span-1 md:col-span-3">
                        <h4 className="font-semibold text-base mb-4 tracking-wide">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="/about" className="text-secondary-400 hover:text-primary-400 transition-colors">About Us</a></li>
                            <li><a href="/contact" className="text-secondary-400 hover:text-primary-400 transition-colors">Contact</a></li>
                            <li><a href="/privacy" className="text-secondary-400 hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="/terms" className="text-secondary-400 hover:text-primary-400 transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-secondary-800">
                    {/* Kenyan Flag Decorative Line */}
                    <div className="w-full h-1 mb-8 flex max-w-xs mx-auto">
                        <div className="flex-[4] bg-black"></div>
                        <div className="flex-[1] bg-white"></div>
                        <div className="flex-[4] bg-red-600"></div>
                        <div className="flex-[1] bg-white"></div>
                        <div className="flex-[4] bg-green-600"></div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
                        <p className="text-secondary-500 mb-4 sm:mb-0">&copy; {currentYear} WinguPort. All Rights Reserved.</p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors" aria-label="Facebook">
                                <Facebook size={20}/>
                            </a>
                            <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors" aria-label="X">
                                <XLogo />
                            </a>
                            <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors" aria-label="LinkedIn">
                                <Linkedin size={20}/>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default DashboardFooter;
