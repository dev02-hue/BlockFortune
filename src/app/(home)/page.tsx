import CryptoCurrencyTicker from "../component/home/CryptoCurrencyTicker";
import CryptoTable from "../component/home/CryptoTable";
import EnhancedStatsDashboard from "../component/home/EnhancedStatsDashboard";
import FAQComponent from "../component/home/FAQComponent";
import HeroSection from "../component/home/HeroSection";
import InvestmentPlans from "../component/home/InvestmentPlans";
import TradingDashboard from "../component/home/TradingDashboard";
import TradingFeatures from "../component/home/TradingFeatures";
import TradingSignalsDashboard from "../component/home/TradingSignalsDashboard";

 
 
export default function Home() {
  return (
    <div className="bg-gray-900">
      <HeroSection />
      <CryptoCurrencyTicker />
      <TradingFeatures />
      <EnhancedStatsDashboard />
      <TradingDashboard />
      <CryptoTable />
      <InvestmentPlans />
      <TradingSignalsDashboard />
      <FAQComponent />
    </div>
  );
}
