import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import HeroSection from "@/components/marketplace/HeroSection";
import FeaturedVenues from "@/components/marketplace/FeaturedVenues";
import CuratedProfessionals from "@/components/marketplace/CuratedProfessionals";
import BudgetCalculator from "@/components/marketplace/BudgetCalculator";
import TrustAndProof from "@/components/marketplace/TrustAndProof";
import Footer from "@/components/shared/Footer";

export default function HomePage() {
  return (
    <SwipeTransition>
      <Navbar />
      <main className="bg-gradient-to-br from-[#4A0000] via-[#3A0000] to-[#2a0000]">
        <HeroSection />
        <FeaturedVenues />
        <CuratedProfessionals />
        <BudgetCalculator />
        <TrustAndProof />
        <Footer />
      </main>
    </SwipeTransition>
  );
}
