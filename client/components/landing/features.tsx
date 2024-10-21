import Section from "@/components/section";
import { BarChart3, Brain, FileText, LineChart } from "lucide-react";
import Features from "../features-horizontal";

const data = [
  {
    id: 1,
    title: "AI-Powered Dashboard",
    content: "Visualize trends and gain insights at a glance.",
    image: "/hero-light.png",
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
  },
  {
    id: 2,
    title: "Natural Language Processing",
    content: "Analyze text and extract sentiment effortlessly.",
    image: "/hero-dark.png",
    icon: <Brain className="h-6 w-6 text-primary" />,
  },
  {
    id: 3,
    title: "Predictive Analytics",
    content: "Forecast trends and make data-driven decisions.",
    image: "/hero-light.png",
    icon: <LineChart className="h-6 w-6 text-primary" />,
  },
  {
    id: 4,
    title: "Automated Reporting",
    content: "Generate comprehensive reports with one click.",
    image: "/hero-dark.png",
    icon: <FileText className="h-6 w-6 text-primary" />,
  },
];

export default function FeaturesLanding() {
  return (
    <Section title="Features" subtitle="User Flows and Navigational Structures">
      <Features collapseDelay={10000} linePosition="bottom" data={data} />
    </Section>
  );
}
