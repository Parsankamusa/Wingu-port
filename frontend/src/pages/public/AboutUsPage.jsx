import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Plane,
  Users,
  Globe,
  Award,
  Target,
  Heart,
  Shield,
  TrendingUp,
} from "lucide-react";

const AboutUsPage = () => {
  const stats = [
    { label: "Aviation Professionals", value: "50,000+", icon: Users },
    { label: "Partner Airlines", value: "250+", icon: Plane },
    { label: "Countries Served", value: "45+", icon: Globe },
    { label: "Successful Placements", value: "15,000+", icon: Award },
  ];

  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description:
        "Prioritizing the highest safety standards in recruitment.",
    },
    {
      icon: Target,
      title: "Precision Matching",
      description: "Advanced algorithms for perfect career matches.",
    },
    {
      icon: Heart,
      title: "Passion for Aviation",
      description: "Founded by aviation professionals for the industry.",
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Committed to helping aviation careers soar.",
    },
  ];

  // Scroll-based transforms
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0.5]);

  // Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  return (
    <div className="bg-white relative overflow-hidden">
      {/* 🔥 Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary-600 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Section with Parallax Background */}
     {/* Hero Section with Animated Plane */}
<section className="relative h-[70vh] flex items-center justify-center bg-gradient-to-b from-sky-400 to-sky-600 text-white overflow-hidden">
  {/* Contrail Path */}
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 1000 500"
    preserveAspectRatio="none"
  >
    <motion.path
      d="M -200 400 C 200 200, 600 600, 1200 200"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="transparent"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
    />
  </svg>

  {/* Plane moving across the screen */}
  <motion.div
    className="absolute"
    animate={{ x: [0, 1000], y: [400, 200] }}
    transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
  >
    <Plane className="w-14 h-14 text-white drop-shadow-lg rotate-45" />
  </motion.div>

  {/* Hero Content */}
  <div className="relative z-10 text-center">
    <motion.h1
      className="text-4xl md:text-6xl font-bold mb-4"
      initial={{ opacity: 0, y: -60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, type: "spring" }}
      whileHover={{ scale: 1.08 }}
    >
      About WinguPort
    </motion.h1>
    <motion.p
      className="text-xl md:text-2xl text-sky-100"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 1 }}
    >
      Connecting aviation talent with premier opportunities.
    </motion.p>
  </div>
</section>


      {/* Stats Section */}
      <motion.section
        className="py-16 bg-secondary-50"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.1, rotate: 2 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4 shadow-lg">
                  <stat.icon className="w-8 h-8" />
                </div>
                <motion.div
                  className="text-3xl font-bold text-secondary-900 mb-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    repeat: Infinity,
                    repeatDelay: 4,
                    duration: 2,
                  }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-secondary-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        className="py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div
          className="container mx-auto px-6"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-secondary-600">
              To revolutionize aviation recruitment by creating meaningful
              connections between talented professionals and leading aviation
              companies worldwide. We believe every aviation professional
              deserves the opportunity to soar to new heights in their career.
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* Values Section */}
      <motion.section
        className="py-20 bg-secondary-50"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4"
              variants={fadeInUp}
            >
              Our Core Values
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(0,0,0,0.2)" }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-white p-8 rounded-xl shadow-md cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-primary-100 rounded-lg">
                    <value.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-secondary-600">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default AboutUsPage;
