import React from 'react';
import Button from '../common/Button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CTASection = ({ onNavigate }) => {
    return (
        <section className="relative bg-secondary-800 py-20 overflow-hidden">
            {/* Background image */}
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: "url('/images/cta-bg.jpg')" }}
            ></div>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700/80 to-secondary-900/80"></div>

            {/* Contrail Path */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 1000 400"
                preserveAspectRatio="none"
            >
                <motion.path
                    d="M -200 300 C 200 150, 600 450, 1200 200"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="transparent"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
                />
            </svg>

            {/* Floating plane following contrail */}
            <motion.img
                src="/images/plane.png"
                alt="Plane"
                className="absolute w-20 opacity-80 pointer-events-none"
                animate={{ x: [0, 1000], y: [300, 200] }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            />

            <div className="container mx-auto px-6 text-center relative z-10">
                <motion.h2 
                    className="text-3xl md:text-4xl font-bold text-white mb-4"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    Ready to Take Flight?
                </motion.h2>

                <motion.p 
                    className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    Your next chapter in the aviation industry starts here. 
                    Join thousands of professionals and leading companies on WinguPort today.
                </motion.p>

                <motion.div 
                    className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    viewport={{ once: true }}
                >
                    <Button 
                        variant="secondary"
                        size="lg" 
                        onClick={() => onNavigate('/signup')} 
                        className="bg-white text-primary-600 hover:bg-primary-50 shadow-xl transform hover:scale-105 hover:shadow-primary-400/40 transition-all"
                        icon={<ArrowRight />}
                        iconPosition="right"
                    >
                        Find Your Next Job
                    </Button>
                    <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => onNavigate('/signup?type=recruiter')} 
                        className="border-2 border-white text-white hover:bg-white hover:text-primary-700 hover:shadow-lg transition-all"
                    >
                        I'm Hiring
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection;
