import React from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, ArrowRight } from "lucide-react";
import Button from "../common/Button";

const ValuePropositionSection = ({ onNavigate }) => {
  // Parent container to handle stagger
  const containerVariant = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.35, // delay between cards
      },
    },
  };

  // Card animation variant
  const cardVariant = {
    hidden: { opacity: 0, y: 100, rotateX: 15, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20,
      },
    },
  };

  return (
    <section id="employers" className="py-20 bg-white relative overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 opacity-70"
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-3">
            Built for Aviation Excellence
          </h2>
          <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
            Whether you're a professional seeking new heights or an employer
            building a world-class team, WinguPort provides the specialized
            tools you need to succeed.
          </p>
        </motion.div>

        {/* Cards with staggered flight formation */}
        <motion.div
          className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
          variants={containerVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Professionals Card */}
          <motion.div
            className="relative bg-secondary-800 text-white p-8 rounded-2xl overflow-hidden group shadow-lg"
            variants={cardVariant}
            whileHover={{
              y: -12,
              scale: 1.02,
              boxShadow:
                "0px 20px 30px rgba(0,0,0,0.2), 0px 0px 25px rgba(59,130,246,0.5)",
            }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30"
              style={{ backgroundImage: "url('/images/professionals-bg.jpg')" }}
              initial={{ scale: 1.15 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex-grow">
                <Users className="w-8 h-8 text-primary-400 mb-4" />
                <h3 className="text-2xl font-bold">
                  For Aviation Professionals
                </h3>
                <p className="text-secondary-300 my-4">
                  Access exclusive opportunities, build a standout profile, and
                  connect with top aviation companies worldwide. Your next
                  career move is waiting.
                </p>
              </div>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => onNavigate("/signup")}
                  icon={<ArrowRight />}
                  iconPosition="right"
                >
                  Start Your Journey
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Employers Card */}
          <motion.div
            className="relative bg-primary-600 text-white p-8 rounded-2xl overflow-hidden group shadow-lg"
            variants={cardVariant}
            whileHover={{
              y: -12,
              scale: 1.02,
              boxShadow:
                "0px 20px 30px rgba(0,0,0,0.2), 0px 0px 25px rgba(16,185,129,0.5)",
            }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30"
              style={{ backgroundImage: "url('/images/employers-bg.jpg')" }}
              initial={{ scale: 1.15 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex-grow">
                <Briefcase className="w-8 h-8 text-white mb-4" />
                <h3 className="text-2xl font-bold">For Employers</h3>
                <p className="text-primary-100 my-4">
                  Tap into a pool of verified, qualified aviation professionals.
                  Post jobs, manage applicants, and streamline your hiring
                  process with our powerful tools.
                </p>
              </div>
              <div className="mt-6">
                <Button
                  variant="secondary"
                  className="bg-white text-primary-600 hover:bg-primary-50"
                  onClick={() => onNavigate("/pricing")}
                  icon={<ArrowRight />}
                  iconPosition="right"
                >
                  Start Hiring
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;
