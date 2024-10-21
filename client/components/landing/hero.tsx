"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "../ui/button";
import TextShimmer from "../magicui/text-shimmer";
import { ArrowRightIcon, ChevronRightIcon } from "lucide-react";
import VideoDialog from "../magicui/video-dialog";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1];


function HeroImage() {
  return (
    <motion.div
      className="relative mx-auto flex w-full items-center justify-center"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 1, ease }}
    >
      <VideoDialog
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
        thumbnailSrc="/hero-dark.png"
        thumbnailAlt="Hero Video"
        className="border rounded-lg shadow-lg max-w-screen-lg mt-16"
      />
      <BorderBeam
        size={200}
        duration={12}
        delay={11}
        colorFrom="var(--color-one)"
        colorTo="var(--color-two)"
        className="mt-16 mx-24 rounded-xl"
      />
    </motion.div>
  );
}

export default function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="hero"
      className="relative mx-auto max-w-[80rem] px-6 text-center md:px-8">
      <div
        className="backdrop-filter-[12px] inline-flex h-7 items-center justify-between rounded-full border border-white/5 dark:bg-white/10 bg-black/5 px-3 text-xs text-white dark:text-black transition-all ease-in hover:cursor-pointer dark:hover:bg-white/20 hover:bg-black/10 group gap-1 translate-y-[-1rem] animate-fade-in opacity-0">
        <TextShimmer className="inline-flex items-center justify-center">
          <span>🚀 See the Tech Behind This Build</span>{" "}
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </TextShimmer>
      </div>
      <h1 className="bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter text-transparent text-balance sm:text-6xl md:text-7xl lg:text-8xl translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
        Introducing a new way
        <br className="block" />
        to store your videos.
      </h1>
      <p className="mb-12 text-lg tracking-tight text-gray-400 md:text-xl text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
        Easily upload, track status, and watch your videos on a modern stack built on
        <br className="hidden md:block" />
        Typescript, Next.js, Message Queues, and Serverless technologies.
      </p>
      <Link href="/feature">
      <Button size="sm" className="px-6 dark:border-white dark:bg-white dark:hover:bg-white/85 hover:bg-black/85 border-black bg-black translate-y-[-1rem] animate-fade-in gap-1 rounded-lg text-white dark:text-black opacity-0 ease-in-out [--animation-delay:600ms]">
        <span className="group inline-flex items-center">
          Get Started for free
          <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
        </span>
      </Button>
      </Link>
      <div
        ref={ref}
        className="relative mt-[8rem] animate-fade-up opacity-0 [--animation-delay:400ms] [perspective:2000px] after:absolute after:inset-0 after:z-50 after:[background:linear-gradient(to_top,hsl(var(--background))_30%,transparent)]"
      >
        <div
          className={`rounded-xl border border-white/10 bg-white bg-opacity-[0.01] before:absolute before:bottom-1/2 before:left-0 before:top-0 before:h-full before:w-full before:opacity-0 before:[filter:blur(180px)] before:[background-image:linear-gradient(to_bottom,var(--color-one),var(--color-one),transparent_40%)] ${
            inView ? "before:animate-image-glow" : ""
          }`}
        >
          <BorderBeam
            size={200}
            duration={12}
            delay={11}
            colorFrom="var(--color-one)"
            colorTo="var(--color-two)"
            className="rounded-xl"
          />
          <img
            src="/hero-dark.png"
            alt="Hero Image"
            className="hidden relative w-full h-full rounded-[inherit] border object-contain dark:block"
          />
          <img
            src="/hero-light.png"
            alt="Hero Image"
            className="block relative w-full h-full  rounded-[inherit] border object-contain dark:hidden"
          />
        </div>
      </div>
    </section>
  );
}
