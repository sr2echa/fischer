"use client";
import { useScroll, useTransform } from "motion/react";
import React from "react";
import { GoogleGeminiEffect } from "../animated/google-gemini-effect";

export function FischerGeminiBackground() {
  const { scrollYProgress } = useScroll();

  // Map the animation to the entire page scroll
  const pathLengthFirst = useTransform(scrollYProgress, [0, 1], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 1], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 1], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 1], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 1], [0, 1.2]);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <GoogleGeminiEffect
        pathLengths={[
          pathLengthFirst,
          pathLengthSecond,
          pathLengthThird,
          pathLengthFourth,
          pathLengthFifth,
        ]}
        hideContent={true}
        className="w-full h-full relative"
      />
    </div>
  );
}
