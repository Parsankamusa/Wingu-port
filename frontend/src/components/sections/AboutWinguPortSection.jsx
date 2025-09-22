import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import Button from "../common/Button";

const AboutWinguPortSection = ({ onNavigate }) => {
  return (
    <section className="py-20 bg-secondary-50 overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-x-12 gap-y-10 items-center">
          {/* ==== LEFT SIDE IMAGE ==== */}
          <div className="relative">
            {/* Image with diagonal reveal (clipPath) */}
            <motion.img
              src="/images/about-us.jpg"
              alt="Aviation professionals planning a flight"
              className="rounded-2xl shadow-2xl w-full h-full object-cover"
              initial={{ clipPath: "inset(100% 0 0 0 round 20px)" }}
              whileInView={{ clipPath: "inset(0% 0 0 0 round 20px)" }}
              transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
              viewport={{ once: true }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/600x400/e2e8f0/475569?text=WinguPort";
              }}
            />

            {/* Floating Stat Card */}
            <motion.div
              className="absolute -bottom-8 right-[-2rem] md:right-[-4rem] w-full max-w-sm"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="bg-white p-6 rounded-xl shadow-lg border border-secondary-100"
                animate={{
                  y: [0, -6, 0], // bob up and down
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-secondary-900">
                      98.5%
                    </div>
                    <div className="text-sm font-medium text-secondary-600">
                      Successful Placement Rate
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* ==== RIGHT SIDE CONTENT ==== */}
          <div className="space-y-6 lg:pl-8 relative">
            {/* Heading with animated contrail underline */}
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-secondary-900 leading-tight relative inline-block"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Your Flight Path to{" "}
              <span className="relative text-primary-600">
                Aviation Excellence
                {/* Contrail underline (SVG path animation) */}
                <svg
                  className="absolute left-0 -bottom-2 w-full h-4"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M0,5 C30,10 70,0 100,5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary-500"
                    fill="transparent"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                    viewport={{ once: true }}
                  />
                </svg>
              </span>
            </motion.h2>

            {/* Text with "takeoff" animation */}
            <motion.p
              className="text-lg text-secondary-700"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
              viewport={{ once: true }}
            >
              WinguPort is transforming how aviation careers take flight. We
              bridge the gap between exceptional, verified talent and prestigious
              opportunities across the global aviation industry. Our mission is
              to power the future of aviation, one successful connection at a
              time.
            </motion.p>

            {/* Button with bounce-in */}
            <motion.div
              className="pt-4"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 10,
                delay: 0.6,
              }}
              viewport={{ once: true }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate("/about")}
                icon={<ArrowRight />}
                iconPosition="right"
              >
                Discover Our Story
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutWinguPortSection;
