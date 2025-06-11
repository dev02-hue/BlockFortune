import CryptoCurrencyTicker from "../component/home/CryptoCurrencyTicker";
import HeroSection from "../component/home/HeroSection";

 
 
export default function Home() {
  return (
    <div className="bg-gray-900">
      <HeroSection />
      <CryptoCurrencyTicker />
    </div>
  );
}
