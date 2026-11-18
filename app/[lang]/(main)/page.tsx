import { Advantages } from "@/components/sections/home/advantages";
import { Categories } from "@/components/sections/home/categories";
import { ExamRules } from "@/components/sections/home/exam-rules";
import { Faq } from "@/components/sections/home/faq";
import { Hero } from "@/components/sections/home/hero";
import { HowItWorks } from "@/components/sections/home/how-it-works";
import { LicenseSteps } from "@/components/sections/home/license-steps";
import { Modes } from "@/components/sections/home/modes";
import { TelegramCta } from "@/components/sections/home/telegram-cta";
import { Topics } from "@/components/sections/home/topics";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Modes />
      <HowItWorks />
      <ExamRules />
      <Topics />
      <Categories />
      <LicenseSteps />
      <Advantages />
      <Faq />
      <TelegramCta />
    </>
  );
}
