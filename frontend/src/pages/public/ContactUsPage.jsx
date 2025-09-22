import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";

const ContactUsPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  // Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  return (
    <div className="bg-secondary-50">
      {/* Hero Section */}
      <section className="bg-primary-700 text-white py-20 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            whileHover={{ scale: 1.05 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="text-xl text-primary-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            We'd love to hear from you. Reach out with any questions.
          </motion.p>
        </div>
      </section>

      {/* Form & Contact Info */}
      <motion.section
        className="py-16"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <motion.div
              variants={fadeInUp}
              className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md"
            >
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Send a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <label className="block text-sm font-semibold text-secondary-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </motion.div>
                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <label className="block text-sm font-semibold text-secondary-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </motion.div>
                </div>
                <motion.div whileFocus={{ scale: 1.02 }}>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows="5"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  ></textarea>
                </motion.div>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-4 bg-primary-600 text-white rounded-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isSubmitting ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.6, repeat: isSubmitting ? Infinity : 0 }}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              className="space-y-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: Mail,
                  title: "Email",
                  value: "support@winguport.com",
                },
                {
                  icon: Phone,
                  title: "Phone",
                  value: "+254 123 456 789",
                },
                {
                  icon: MapPin,
                  title: "Office",
                  value: "123 Aviation Rd, Nairobi, Kenya",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(0,0,0,0.15)" }}
                  className="bg-white p-6 rounded-xl shadow-md cursor-pointer"
                >
                  <item.icon className="w-8 h-8 text-primary-600 mb-3" />
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-secondary-600">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default ContactUsPage;
