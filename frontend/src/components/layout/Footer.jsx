import React from "react";
import { Facebook, Linkedin, Mail, Phone } from "lucide-react";
import XLogo from "../common/XLogo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "For Candidates",
      links: [
        { name: "Find a Job", path: "/job-search" },
        { name: "Create Profile", path: "/signup" },
        { name: "Career Advice", path: "#" },
        { name: "Job Alerts", path: "#" },
      ],
    },
    {
      title: "For Employers",
      links: [
        { name: "Post a Job", path: "/signup?type=recruiter" },
        { name: "Search Resumes", path: "/pricing" },
        { name: "Pricing", path: "/pricing" },
        { name: "Recruiting Solutions", path: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Contact Us", path: "/contact" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand + tagline */}
          <div className="lg:col-span-4 space-y-6">
            <a href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="WinguPort Logo" className="h-12 w-12" />
              <span className="text-3xl font-extrabold tracking-tight">
                <span className="text-wingu-light-blue">Wingu</span>
                <span className="text-wingu-dark-blue">Port</span>
              </span>
            </a>
            <p className="text-secondary-400 max-w-sm">
              Connecting the world's best aviation talent with premier
              opportunities.
            </p>
            {/* Social icons */}
            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                className="p-2 bg-secondary-800 rounded-full hover:bg-primary-600 transition transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="p-2 bg-secondary-800 rounded-full hover:bg-primary-600 transition transform hover:scale-110"
                aria-label="X"
              >
                <XLogo />
              </a>
              <a
                href="#"
                className="p-2 bg-secondary-800 rounded-full hover:bg-primary-600 transition transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((section) => (
              <div
                key={section.title}
                className="p-6 bg-secondary-800/60 rounded-xl border border-secondary-700 hover:border-primary-500 transition"
              >
                <h4 className="font-semibold text-base mb-4 uppercase tracking-wide">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.path}
                        className="text-secondary-400 hover:text-primary-400 hover:underline transition-colors text-sm"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider runway bar */}
        <div className="mt-16 mb-6 h-6 w-full flex rounded overflow-hidden shadow-lg">
        <div className="flex-[4] bg-black animate-pulse"></div>
        <div className="flex-[1] bg-white"></div>
        <div className="flex-[4] bg-red-600 animate-pulse"></div>
        <div className="flex-[1] bg-white"></div>
        <div className="flex-[4] bg-green-600 animate-pulse"></div>
        </div>



        {/* Bottom note */}
        <div className="text-center text-secondary-500 text-sm">
          <p>
            &copy; {currentYear}{" "}
            <span className="font-semibold text-white">
              WinguPort Aviation Workforce Recruitment System
            </span>
            . All Rights Reserved.
          </p>
          <div className="mt-2 flex items-center justify-center space-x-6 text-secondary-400 text-sm">
            <div className="flex items-center space-x-2">
              <Mail size={16} /> <span>support@winguport.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={16} /> <span>+254 700 123 456</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
