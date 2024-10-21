import Image from "next/image";
import Hero from "@/components/magicui/hero";
import Particles from "@/components/magicui/particles";
import Logos from "@/components/logos";
import Problem from "@/components/problem";
import Solution from "@/components/solution";
import HowItWorks from "@/components/how-it-works";
import FeaturesLanding from "@/components/features";
import CTA from "@/components/cta";
import { OrbitingCirclesLanding } from "@/components/orbiting-landing";
import TechStackLanding from "@/components/tech-stack-landing";

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
