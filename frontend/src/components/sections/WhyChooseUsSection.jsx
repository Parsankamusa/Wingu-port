import React from 'react';
import { Plane, Shield, Search, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const WhyChooseUsSection = () => {
  const features = [
    { 
      icon: Plane, 
      title: 'Aviation-Focused', 
      description: 'Exclusively for aviation professionals and companies, ensuring relevant opportunities and talent.' 
    },
    { 
      icon: Shield, 
      title: 'Verified Professionals', 
      description: 'Rigorous verification for licenses and certifications, providing trusted and qualified candidates.' 
    },
    { 
      icon: Search, 
      title: 'Advanced Matching', 
      description: 'Our AI-powered algorithms connect you with the perfect role or candidate based on your unique needs.' 
    },
    { 
      icon: Globe, 
      title: 'Global Network', 
      description: 'Access a vast network of opportunities and talent from leading aviation companies across 45+ countries.' 
    }
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.2 }
    }
  };

  const card = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { type: "spring", stiffness: 120, damping: 20 } 
    }
  };

  const icon = {
    hover: { y: -6, scale: 1.1, transition: { yoyo: Infinity, duration: 0.4 } }
  };

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-white to-secondary-50">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-3">
            Why Choose WinguPort?
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            We are the premier platform dedicated to advancing careers and building teams in the aviation industry.
          </p>
        </motion.div>

        <motion.div 
          variants={container} 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={card}
              whileHover={{ scale: 1.05, rotateX: 3, rotateY: -3 }}
              className="relative bg-white shadow-md p-8 rounded-2xl border border-secondary-100 text-center group overflow-hidden"
            >
              {/* Animated glow background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl" />

              <motion.div 
                variants={icon} 
                whileHover="hover" 
                className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6 mx-auto"
              >
                <feature.icon className="w-8 h-8 text-primary-600" />
              </motion.div>

              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-secondary-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
