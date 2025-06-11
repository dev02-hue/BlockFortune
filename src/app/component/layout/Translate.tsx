// components/Translate.tsx
"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: {
          new (options: object, containerId: string): void;
          InlineLayout: {
            SIMPLE: string;
            HORIZONTAL: string;
            VERTICAL: string;
          };
        };
      };
    };
  }
}

const Translate = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const addScript = () => {
      // Check if script is already added
      if (document.querySelector('script[src*="translate.google.com"]')) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onload = () => setIsLoaded(true);
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        if (window.google?.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: getAllLanguages().join(','),
              layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
              autoDisplay: false,
              multilanguagePage: true
            },
            "google_translate_element"
          );
        }
      };
    };

    addScript();

    return () => {
      // Cleanup function
      const script = document.querySelector('script[src*="translate.google.com"]');
      if (script) {
        document.body.removeChild(script);
      }
      delete window.googleTranslateElementInit;
    };
  }, []);

  // Function to get all supported language codes
  const getAllLanguages = () => {
    return [
      'af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'zh-CN', 'zh-TW', 
      'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gu', 
      'ht', 'ha', 'haw', 'he', 'hi', 'hmn', 'hu', 'is', 'ig', 'id', 'ga', 'it', 'ja', 'jv', 'kn', 'kk', 
      'km', 'rw', 'ko', 'ku', 'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 
      'mr', 'mn', 'my', 'ne', 'no', 'ny', 'or', 'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 
      'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tl', 'tg', 'ta', 'tt', 
      'te', 'th', 'tr', 'tk', 'uk', 'ur', 'ug', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu'
    ];
  };

  return (
    <div className="relative">
      <div 
        id="google_translate_element" 
        className={`
          ${isLoaded ? 'opacity-100' : 'opacity-0'} 
          transition-opacity duration-300
          w-full max-w-md mx-auto
        `}
      />
      
      {!isLoaded && (
        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
          <div className="animate-pulse flex space-x-4">
            <div className="h-8 w-24 bg-gray-300 rounded"></div>
            <div className="h-8 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
.goog-logo-link {
    display: none !important;
  }
  .goog-te-gadget {
    color: transparent !important;
  }
  .goog-te-gadget .goog-te-combo {
    color: #4b5563 !important; /* gray-600 */
  }
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        .goog-te-menu-value span {
          color: #4b5563 !important; /* gray-600 */
        }
        .goog-te-menu-value {
          border: 1px solid #d1d5db !important; /* gray-300 */
          border-radius: 0.375rem !important; /* rounded-md */
          padding: 0.5rem 1rem !important;
          background-color: white !important;
        }
        .goog-te-menu-value:hover {
          border-color: #9ca3af !important; /* gray-400 */
        }
        .goog-te-gadget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
        }
        .goog-te-combo {
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          background-color: white;
        }
      `}</style>
    </div>
  );
};

export default Translate;