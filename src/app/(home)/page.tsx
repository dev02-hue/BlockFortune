import CryptoCurrencyTicker from "../component/home/CryptoCurrencyTicker";
import EnhancedStatsDashboard from "../component/home/EnhancedStatsDashboard";
import HeroSection from "../component/home/HeroSection";
import TradingFeatures from "../component/home/TradingFeatures";

 
 
export default function Home() {
  return (
    <div className="bg-gray-900">
      <HeroSection />
      <CryptoCurrencyTicker />
      <TradingFeatures />
      <EnhancedStatsDashboard />
    </div>
  );
}
