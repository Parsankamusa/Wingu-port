import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../common/Button';

const backgroundImages = [
    '/images/hero-1.jpg',
    '/images/hero-2.jpg',
    '/images/hero-3.jpg'
];

const planePath = "M 100 400 Q 400 100, 900 300"; // A nice curve (can be adjusted)

const HeroSection = ({ onNavigate }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [searchFilters, setSearchFilters] = useState({
        query: '',
        location: ''
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        }, 7000);
        
        return () => clearInterval(interval);
    }, []);

    const handleFilterChange = (field, value) => {
        setSearchFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchFilters.query) {
            params.append('query', searchFilters.query);
        }
        if (searchFilters.location) {
            params.append('location', searchFilters.location);
        }
        onNavigate(`/job-search?${params.toString()}`);
    };

    return (
        <section className="relative overflow-hidden bg-secondary-900 min-h-[90vh] flex items-center justify-center text-center">
            {/* Background slideshow */}
            <div className="absolute inset-0 z-0">
                {backgroundImages.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
                            index === activeImageIndex ? 'opacity-40' : 'opacity-0'
                        }`}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-secondary-900 via-secondary-900/70 to-transparent"></div>

            {/* Plane + Trail */}
            <svg className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none">
                {/* Trail Path */}
                <motion.path
                    d={planePath}
                    fill="transparent"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, strokeDashoffset: 0 }}
                    transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
                    className="opacity-60"
                />

                {/* Plane */}
                <motion.image
                    href="/images/plane.png" // <-- Add your small plane PNG/SVG in public/images
                    width="40"
                    height="40"
                    x="0"
                    y="0"
                    animate={{ pathLength: 1 }}
                >
                    <animateMotion
                        dur="6s"
                        repeatCount="indefinite"
                        rotate="auto"
                        keyTimes="0;1"
                        keySplines="0.42 0 0.58 1"
                    >
                        <mpath href="#planePath" />
                    </animateMotion>
                </motion.image>
            </svg>

            {/* Hero Content */}
            <div className="container mx-auto px-6 py-16 relative z-30">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Your Aviation Career
                        <span className="block text-primary-400 mt-2">
                            Takes Flight Here
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-secondary-200 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        Connect with leading airlines and aerospace companies. 
                        Your next opportunity is just one search away.
                    </p>

                    {/* Search Form */}
                    <form 
                        onSubmit={handleSearch} 
                        className="w-full max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-2 mt-10 rounded-xl shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400"
                    >
                        <div className="grid md:grid-cols-12 gap-2 items-center">
                            <div className="md:col-span-5 relative flex items-center">
                                <Briefcase className="absolute left-3 w-5 h-5 text-secondary-400" />
                                <input
                                    type="text"
                                    placeholder="Job title or keyword"
                                    value={searchFilters.query}
                                    onChange={(e) => handleFilterChange('query', e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 bg-transparent focus:outline-none text-white placeholder-secondary-300 font-medium rounded-lg"
                                />
                            </div>
                           <div className="md:col-span-4 relative flex items-center md:border-l md:border-white/20 md:pl-2">
                                <MapPin className="absolute left-3 w-5 h-5 text-secondary-400" />
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={searchFilters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 bg-transparent focus:outline-none text-white placeholder-secondary-300 font-medium rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <Button variant="primary" size="lg" fullWidth type="submit" icon={<Search />}>
                                    Search
                                </Button>
                            </div>
                        </div>
                    </form>
                    
                    {/* CTA Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
                        <Button variant="primary" size="lg" onClick={() => onNavigate('/signup')}>
                            Upload Your CV
                        </Button>
                        <Button 
                            variant="link" 
                            size="lg" 
                            className="text-white hover:text-primary-300 font-semibold" 
                            onClick={() => onNavigate('/signup?type=recruiter')}
                            icon={<ArrowRight className="h-4 w-4" />}
                            iconPosition="right"
                        >
                            I'm an Employer
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
