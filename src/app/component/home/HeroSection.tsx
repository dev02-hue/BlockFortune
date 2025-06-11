"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import Image from "next/image";
 import { useState, useEffect } from "react";
import CountUp from "react-countup";

const slides = [
  {
    id: 1,
    title: "Smart Crypto Investments",
    description: "AI-powered portfolio management for optimal cryptocurrency returns",
    image: "/image20.webp",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    textColor: "text-blue-500",
  },
  {
    id: 2,
    title: "Secure Asset Growth",
    description: "Military-grade security for your digital wealth",
    image: "/image21.webp",
    buttonColor: "bg-purple-500 hover:bg-purple-600",
    textColor: "text-purple-500",
  },
  {
    id: 3,
    title: "Real-Time Analytics",
    description: "Advanced tools to track and optimize your investments",
    image: "/image22.webp",
    buttonColor: "bg-emerald-500 hover:bg-emerald-600",
    textColor: "text-emerald-500",
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-gray-900 text-gray-100 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 -z-10" />
      
      <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text content */}
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={`title-${slide.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                  {slide.title}{' '}
                  <span className={`bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent`}>
                    Made Simple
                  </span>
                </h1>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${slide.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0"
              >
                {slide.description}
              </motion.p>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`button-${slide.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <button
                  className={`px-8 py-3 rounded-lg ${slide.buttonColor} text-white font-medium transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl`}
                >
                  Get Started <FiArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-100 font-medium transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                  Learn More
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Stats */}
            <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5, delay: 0.6 }}
  className="pt-6 flex flex-wrap justify-center lg:justify-start gap-6"
>
  {/* $1.2B+ */}
  <div className="text-center">
    <div className="text-2xl md:text-3xl font-bold">
      $
      <CountUp end={1200} duration={2.5} />
      M+
    </div>
    <div className="text-sm text-gray-400">Assets Managed</div>
  </div>

  {/* 500K+ */}
  <div className="text-center">
    <div className="text-2xl md:text-3xl font-bold">
      <CountUp end={500} duration={2} />
      K+
    </div>
    <div className="text-sm text-gray-400">Investors</div>
  </div>

  {/* 24/7 */}
  <div className="text-center">
    <div className="text-2xl md:text-3xl font-bold">
      <CountUp end={24} duration={1.5} />
      /7
    </div>
    <div className="text-sm text-gray-400">Secure Monitoring</div>
  </div>
</motion.div>

          </div>

          {/* Image */}
          <div className="w-full lg:w-1/2 flex justify-center relative h-[400px] md:h-[500px] lg:h-[600px]">
  <AnimatePresence mode="wait">
    <motion.div
      key={`image-${slide.id}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0"
    >
      <Image
        src={slide.image}
        alt={slide.title}
        fill
        className="object-contain"
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
      />
    </motion.div>
  </AnimatePresence>
</div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="flex justify-center gap-2 mt-8 lg:mt-0 lg:absolute lg:bottom-8 lg:left-1/2 lg:-translate-x-1/2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${currentSlide === index ? 'bg-blue-400' : 'bg-gray-600'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;