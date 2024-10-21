import Hero from "@/components/landing/hero";
import Particles from "@/components/magicui/particles";
import CTA from "@/components/landing/cta";
import Logos from "@/components/landing/logos";
import HowItWorks from "@/components/landing/how-it-works";
import TechStackLanding from "@/components/landing/tech-stack-landing";
import Problem from "@/components/landing/problem";
import Solution from "@/components/landing/solution";
import FeaturesLanding from "@/components/landing/features";

export default function Home() {
  return (
    <>
      <Hero />
      <Logos />
      <Problem />
      <Solution />
      <HowItWorks />
      <FeaturesLanding />
      <TechStackLanding />
      <CTA />
      <Particles
        className="absolute inset-0 -z-10"
        quantity={50}
        ease={70}
        size={0.05}
        staticity={40}
        color={"#ffffff"}
      />
    </>
  );
}
