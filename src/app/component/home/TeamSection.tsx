'use client';
import { motion } from 'framer-motion';
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaShareAlt } from 'react-icons/fa';
import Image from 'next/image';

const teamMembers = [
  {
    name: 'Ethan Coleman',
    title: 'FOUNDER',
    image: '/7fGoXFKQNtIxY7BekxXa1ZxwomAnIdf1ea0QoYol.jpg',
    socials: { 
      facebook: '#', 
      linkedin: '#', 
      twitter: '#' 
    },
  },
  {
    name: 'Henry Wright',
    title: 'Head Of Operations',
    image: '/mYm7lkdwlUOAM4Qcn5tBlxtEF6EJHLA7lGnxR36r.jpg',
    socials: { 
      facebook: '#', 
      linkedin: '#', 
      twitter: '#' 
    },
  },
  {
    name: 'Amelia Brooks',
    title: 'Head Of Marketing',
    image: '/vV2jU4e7iOebrM8urD9HDfK2JADwJJVjAgdWQZz9.jpg',
    socials: { 
      facebook: '#', 
      linkedin: '#', 
      twitter: '#' 
    },
  },
];

const TeamSection = () => {
  return (
    <section className="py-16 bg-white text-center mt-10">
      <h2 className="text-[#1c3f32] font-semibold mb-2 text-sm tracking-wide">
        &#128279; Our Team
      </h2>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#1c3f32] mb-12">
        Your Business with the Professional
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4 md:px-20">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            className="relative bg-white rounded-2xl shadow-md overflow-hidden group transition-all duration-300"
          >
            <div className="relative">
              <Image
                src={member.image}
                alt={member.name}
                width={500}
                height={400}
                className="w-full h-64 object-cover"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4"
              >
                <FaShareAlt className="text-white text-xl cursor-pointer hover:text-gray-300 transition-colors" />
              </motion.div>
            </div>
            <div className="py-6 px-4">
              <h3 className="text-lg font-semibold text-[#1c3f32]">{member.name}</h3>
              <p className="text-gray-500 text-sm mt-1 mb-3">{member.title}</p>
              
              {/* Social media handles - always visible */}
              <div className="flex justify-center items-center gap-4 mt-4">
                <a 
                  href={member.socials.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <FaFacebookF className="text-xl" />
                </a>
                <a 
                  href={member.socials.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-700 transition-colors"
                >
                  <FaLinkedinIn className="text-xl" />
                </a>
                <a 
                  href={member.socials.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-400 transition-colors"
                >
                  <FaTwitter className="text-xl" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;