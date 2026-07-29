import Hero from "@/components/Hero/Hero";
import Synthesis from "@/components/Synthesis/Synthesis";
import Projects from "@/components/Projects/Projects";
import ArchiveClient from "@/components/Archive/ArchiveClient";

export default function Home() {
  return (
    <>
      <Hero />

      <Synthesis />

      <Projects />

      <ArchiveClient />
    </>
  );
}