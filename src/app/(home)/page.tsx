import AboutUs from "../component/home/AboutUs";
import CryptoCurrencyTicker from "../component/home/CryptoCurrencyTicker";
import CryptoTable from "../component/home/CryptoTable";
import { FAQ } from "../component/home/FAQComponent";
// import EnhancedStatsDashboard from "../component/home/EnhancedStatsDashboard";
// import FAQComponent from "../component/home/FAQComponent";
import HeroSection from "../component/home/HeroSection";
import InvestmentCalculator from "../component/home/InvestmentCalculator";
import PricingSection from "../component/home/InvestmentPlans";
// import InvestmentPlans from "../component/home/InvestmentPlans";
import LetsDoGreat from "../component/home/LetsDoGreat";
 import OurAdvantage from "../component/home/OurAdvantage";
import TeamSection from "../component/home/TeamSection";
// import TradingDashboard from "../component/home/TradingDashboard";
// import TradingFeatures from "../component/home/TradingFeatures";
// import TradingSignalsDashboard from "../component/home/TradingSignalsDashboard";
import TranslateBody from "../component/layout/TranslateBody";
import ContactForm from "../component/user/ContactForm";
  
 
 
export default function Home() {
  return (
    <div className=" bg-white">
      <TranslateBody />
       <HeroSection />
      <CryptoCurrencyTicker />
      <OurAdvantage />
      <LetsDoGreat />
      <AboutUs />
      {/* <TradingFeatures /> */}
      {/* <EnhancedStatsDashboard /> */}
      {/* <TradingDashboard /> */}
      <CryptoTable />
      <PricingSection />
      <InvestmentCalculator />
      <TeamSection />
      <FAQ />
      <ContactForm />
      {/* <InvestmentPlans /> */}
      {/* <TradingSignalsDashboard /> */}
      {/* <FAQComponent /> */}
    </div>
  );
}
