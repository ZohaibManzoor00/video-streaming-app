import Link from "next/link";
import { Icons } from "@/components/landing/icons";
import Section from "@/components/section";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

export default function CTA() {
  return (
    <Section
      id="cta"
      title="Ready to get started?"
      subtitle="Start your free trial today."
      className="bg-secondary py-16"
    >
      <div className="flex flex-col w-full sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
        <Link
          href="/signup"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full sm:w-auto text-background flex gap-2"
          )}
        >
          <Icons.logo className="h-6 w-6" />
          Get started for free
        </Link>
      </div>
    </Section>
  );
}