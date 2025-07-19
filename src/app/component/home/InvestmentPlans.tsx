"use client";

import { motion, Variants } from "framer-motion";
import {  FaChartLine, FaCoins, FaPiggyBank, FaGem } from "react-icons/fa";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const plans = [
  {
    name: "5-Day Plan",
    dailyROI: 3.5,
    min: 150,
    max: 4999,
    duration: 5,
    affiliate: 10,
    color: "bg-blue-500",
    description: "Includes principal after 5 days",
    icon: <FaCoins className="text-yellow-500" />,
    image: "/surface-GCKO2AAsTI0-unsplash.jpg", // Replace with your actual image paths
    badge: "Starter"
  },
  {
    name: "7-Day Plan",
    dailyROI: 5.5,
    min: 5000,
    max: 19999,
    duration: 7,
    affiliate: 10,
    color: "bg-purple-500",
    description: "Includes principal after 7 days",
    icon: <FaChartLine className="text-purple-500" />,
    image: "/den-lyons-m5SGlo611H8-unsplash.jpg",
    badge: "Popular"
  },
  {
    name: "10-Day Plan",
    dailyROI: 7.5,
    min: 20000,
    max: 49999,
    duration: 10,
    affiliate: 10,
    color: "bg-indigo-500",
    description: "Includes principal after 10 days",
    icon: <FaPiggyBank className="text-indigo-500" />,
    image: "/karl-edwards-w_afsP_mS-w-unsplash.jpg",
    badge: "Premium"
  },
  {
    name: "13-Day Plan",
    dailyROI: 10.5,
    min: 50000,
    max: 100000,
    duration: 13,
    affiliate: 10,
    color: "bg-green-500",
    description: "Includes principal after 13 days",
    icon: <FaGem className="text-green-500" />,
    image: "/priscilla-du-preez-xM4wUnvbCKk-unsplash.jpg",
    badge: "VIP"
  }
];

const containerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      when: "beforeChildren",
    },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      type: "spring",
      stiffness: 100,
    },
  }),
  hover: {
    y: -10,
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 },
  },
  focus: {
    scale: 1.03,
    boxShadow: "0 0 0 3px rgba(5, 150, 105, 0.4)",
    transition: { duration: 0.2 },
  },
};

export default function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sectionRef.current) return;

      const focusableElements = sectionRef.current.querySelectorAll(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      );

      if (e.key === "Tab") {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-gray-50 to-white py-20 px-4 md:px-12 lg:px-24"
      id="pricing"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
        variants={containerVariant}
        className="max-w-7xl mx-auto"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-teal-600 font-medium uppercase tracking-wider"
          >
            Investment Plans
          </motion.h3>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mt-4 leading-tight"
          >
            Tailored Investment <br className="hidden md:block" /> Solutions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Choose from our flexible investment plans designed to help you achieve your financial goals with competitive returns.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariant}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-lg bg-white transition-all ${plan.color} bg-opacity-5`}
              variants={cardVariant}
              custom={index}
              whileHover="hover"
              whileFocus="focus"
              whileTap={{ scale: 0.98 }}
              initial="hidden"
              animate="visible"
              tabIndex={0}
            >
              {/* Plan Badge */}
              {plan.badge && (
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                  plan.badge === "Popular" 
                    ? "bg-orange-100 text-orange-800" 
                    : plan.badge === "VIP" 
                      ? "bg-purple-100 text-purple-800"
                      : plan.badge === "Premium"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* Plan Image */}
              <div className="h-40 relative overflow-hidden">
                <Image
                  src={plan.image}
                  alt={plan.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h4 className="text-2xl font-bold text-white">{plan.name}</h4>
                </div>
              </div>

              <div className="p-6 flex flex-col items-center flex-grow">
                <div className="relative w-full">
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className="text-5xl font-bold text-gray-900 flex items-center justify-center gap-1 mb-6"
                  >
                    <span className="text-3xl">%</span>
                    {plan.dailyROI}
                    <span className="text-lg font-medium text-gray-500 ml-1">
                      /Daily
                    </span>
                  </motion.div>
                </div>

                <div className="w-full mt-2">
                  <ul className="text-gray-700 space-y-3 w-full text-lg">
                    <li className="flex items-start">
                      <span className="text-teal-600 mr-2">✓</span>
                      <span>Min: <strong>${plan.min.toLocaleString()}</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-600 mr-2">✓</span>
                      <span>Max: <strong>${plan.max.toLocaleString()}</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-600 mr-2">✓</span>
                      <span>Duration: <strong>{plan.duration} Days</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-600 mr-2">✓</span>
                      <span>Affiliate: <strong>{plan.affiliate}%</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-600 mr-2">✓</span>
                      <span className="text-sm">{plan.description}</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-auto w-full">
  <Link href="/signup" passHref>
    <motion.a
      whileHover={{ 
        backgroundColor: "#047857",
        color: "white",
        scale: 1.05 
      }}
      whileFocus={{ 
        backgroundColor: "#047857",
        color: "white",
        scale: 1.05,
        boxShadow: "0 0 0 3px rgba(5, 150, 105, 0.5)"
      }}
      whileTap={{ scale: 0.95 }}
      className="mt-8 w-full bg-teal-600 text-white hover:bg-teal-700 px-6 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2  text-center"
    >
      {plan.icon}
      Invest Now
    </motion.a>
  </Link>
</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600">
            * All plans include principal return at maturity. Past performance is not indicative of future results.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <span className="text-gray-700">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-700">Secure Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-700">Instant Withdrawals</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}