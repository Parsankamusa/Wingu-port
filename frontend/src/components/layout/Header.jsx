import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Briefcase, MapPin, Building, Users } from 'lucide-react';
import Button from '../common/Button';
import { useLocation } from 'react-router-dom';

const Header = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const headerRef = useRef(null);

  const navLinks = [
    {
      name: "Find Jobs",
      path: "/job-search",
      hasDropdown: true,
      dropdown: {
        title: "Discover Aviation Careers",
        description: "Find your perfect aviation opportunity on WinguPort",
        sections: [
          {
            title: "Popular Roles",
            icon: Briefcase,
            items: [
              { name: "Pilot Positions", path: "/job-search?role=pilot", description: "Commercial, cargo, and charter opportunities" },
              { name: "Aircraft Maintenance", path: "/job-search?role=maintenance", description: "Licensed technicians and engineers" },
              { name: "Cabin Crew", path: "/job-search?role=cabin-crew", description: "Flight attendant positions worldwide" },
              { name: "Ground Operations", path: "/job-search?role=ground", description: "Airport and airline operations roles" }
            ]
          },
          {
            title: "Top Locations",
            icon: MapPin,
            items: [
              { name: "Middle East", path: "/job-search?region=middle-east", description: "Dubai, Qatar, and Gulf opportunities" },
              { name: "Europe", path: "/job-search?region=europe", description: "European airline positions" },
              { name: "North America", path: "/job-search?region=north-america", description: "US and Canadian aviation jobs" },
              { name: "Browse All Jobs", path: "/job-search", description: "View all available positions" }
            ]
          }
        ]
      }
    },
    {
      name: "For Employers",
      path: "/pricing",
      hasDropdown: true,
      dropdown: {
        title: "Hire Aviation Professionals",
        description: "Connect with verified aviation talent on WinguPort",
        sections: [
          {
            title: "Get Started",
            icon: Building,
            items: [
              { name: "Post a Job", path: "/signup?type=recruiter", description: "Reach qualified aviation professionals" },
              { name: "View Pricing", path: "/pricing", description: "Choose the right plan for your needs" },
              { name: "Browse Talent", path: "/pricing", description: "Search verified professional profiles" }
            ]
          },
          {
            title: "Support",
            icon: Users,
            items: [
              { name: "Contact Sales", path: "/contact", description: "Speak with our recruitment experts" },
              { name: "Success Stories", path: "/about", description: "See how companies hire on WinguPort" },
              { name: "Help Center", path: "/help", description: "Get answers to common questions" }
            ]
          }
        ]
      }
    },
    { name: "About Us", path: "/about", hasDropdown: false },
    { name: "Contact", path: "/contact", hasDropdown: false },
  ];

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (path) => {
    onNavigate(path);
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleMouseEnter = (index) => {
    if (window.innerWidth >= 1024) {
      setActiveDropdown(index);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) {
      setActiveDropdown(null);
    }
  };

  return (
    <header
      ref={headerRef}
      className={`fixed w-full top-0 z-50 transition-all duration-300 backdrop-blur-md ${
        isScrolled ? 'bg-white/90 shadow-md border-b border-secondary-200' : 'bg-white/60 border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('/')}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <img src="/logo.png" alt="WinguPort Logo" className="h-9 w-9" />
          <span className="text-xl font-bold">
            <span className="text-wingu-light-blue">Wingu</span>
            <span className="text-wingu-dark-blue">Port</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-2">
          {navLinks.map((link, index) => (
            <div
              key={link.name}
              className="relative group"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() =>
                  link.hasDropdown
                    ? setActiveDropdown(activeDropdown === index ? null : index)
                    : handleNavClick(link.path)
                }
                className={`flex items-center text-sm font-medium py-2 px-3 rounded-md transition-all duration-200 ${
                  location.pathname === link.path || activeDropdown === index
                    ? 'bg-secondary-100 text-primary-600'
                    : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
                }`}
              >
                {link.name}
                {link.hasDropdown && (
                  <ChevronDown
                    className={`ml-1 w-4 h-4 transition-transform duration-300 ${
                      activeDropdown === index ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Underline hover effect */}
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-primary-500 rounded-full transition-all duration-300 ${
                  location.pathname === link.path || activeDropdown === index
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`}
              />

              {/* Dropdown */}
              {link.hasDropdown && activeDropdown === index && (
                <div className="absolute left-0 top-full mt-3 w-[520px] bg-white rounded-xl shadow-xl border border-secondary-100 overflow-hidden animate-fadeIn">
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {link.dropdown.sections.map((section) => (
                      <div key={section.title}>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-primary-50 rounded-lg">
                            <section.icon className="w-5 h-5 text-primary-600" />
                          </div>
                          <h4 className="font-semibold text-secondary-900">{section.title}</h4>
                        </div>
                        <div className="space-y-2">
                          {section.items.map((item) => (
                            <button
                              key={item.name}
                              onClick={() => handleNavClick(item.path)}
                              className="block w-full text-left p-2.5 rounded-lg hover:bg-secondary-50 transition-colors group"
                            >
                              <div className="font-medium text-secondary-800 group-hover:text-primary-600 text-sm">
                                {item.name}
                              </div>
                              <div className="text-xs text-secondary-600">{item.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center space-x-2">
          <Button variant="link" size="md" onClick={() => handleNavClick('/signin')}>
            Sign In
          </Button>
          <Button variant="primary" size="md" onClick={() => handleNavClick('/signup')}>
            Get Started
          </Button>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-secondary-700 hover:text-primary-600 focus:outline-none p-2 rounded-lg hover:bg-secondary-100 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-sm border-t border-secondary-200 shadow-md animate-slideDown">
          <nav className="p-4">
            <div className="space-y-1 mb-6">
              {navLinks.map((link, index) => (
                <div key={link.name} className="border-b border-secondary-100 last:border-b-0">
                  {link.hasDropdown ? (
                    <>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                        className="flex justify-between items-center w-full text-left p-3 rounded-lg text-secondary-700 hover:bg-secondary-50 font-medium"
                      >
                        {link.name}
                        <ChevronDown
                          className={`transition-transform duration-300 ${
                            activeDropdown === index ? 'rotate-180' : ''
                          }`}
                          size={18}
                        />
                      </button>
                      {activeDropdown === index && (
                        <div className="pl-4 mt-1 space-y-1 pb-2 animate-fadeIn">
                          {link.dropdown.sections
                            .flatMap((section) => section.items)
                            .map((item) => (
                              <button
                                key={item.name}
                                onClick={() => handleNavClick(item.path)}
                                className="block w-full text-left p-2 text-sm rounded-lg text-secondary-600 hover:bg-secondary-100"
                              >
                                {item.name}
                              </button>
                            ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleNavClick(link.path)}
                      className="block w-full text-left p-3 rounded-lg text-secondary-700 hover:bg-secondary-100 font-medium"
                    >
                      {link.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-4 border-t">
              <Button variant="outline" fullWidth onClick={() => handleNavClick('/signin')}>
                Sign In
              </Button>
              <Button variant="primary" fullWidth onClick={() => handleNavClick('/signup')}>
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
