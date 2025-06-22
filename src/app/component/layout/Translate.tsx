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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Skip if already initialized
    if (initialized) return;

    const addScript = () => {
      // Check if script is already added
      if (window.google?.translate || document.querySelector('script[src*="translate.google.com"]')) {
        return;
      }

      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onload = () => setIsLoaded(true);
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        if (window.google?.translate && !document.getElementById('google_translate_element')?.hasChildNodes()) {
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
          setInitialized(true);
        }
      };
    };

    addScript();

    return () => {
      // Cleanup function
      const iframe = document.querySelector('iframe[src*="translate.google.com"]');
      if (iframe) {
        iframe.remove();
      }
    };
  }, [initialized]);

  // Complete list of supported languages
  const getAllLanguages = () => {
    return [
      'af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'zh-CN', 'zh-TW',
      'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gu',
      'ht', 'ha', 'haw', 'he', 'hi', 'hmn', 'hu', 'is', 'ig', 'id', 'ga', 'it', 'ja', 'jv', 'kn', 'kk',
      'km', 'rw', 'ko', 'ku', 'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi',
      'mr', 'mn', 'my', 'ne', 'no', 'ny', 'or', 'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd',
      'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tl', 'tg', 'ta', 'tt',
      'te', 'th', 'tr', 'tk', 'uk', 'ur', 'ug', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu',
      // Additional languages
      'as', 'ay', 'bm', 'bi', 'dv', 'dz', 'ee', 'fj', 'gn', 'gsw', 'ht', 'ik', 'iu', 'kl', 'ln',
      'lg', 'mfe', 'na', 'nr', 'om', 'rn', 'sg', 'sq', 'ss', 'ti', 'ts', 'tw', 've', 'wo'
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
          color: #4b5563 !important;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          background-color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          width: 100%;
          max-width: 200px;
        }
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        .goog-te-menu-value span {
          color: #4b5563 !important;
        }
        .goog-te-menu-value {
          display: none !important;
        }
        .goog-te-gadget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
        }
        .goog-te-combo:hover {
          border-color: #9ca3af !important;
        }
        /* Mobile responsive styles */
        @media (max-width: 640px) {
          .goog-te-combo {
            padding: 0.5rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Translate;