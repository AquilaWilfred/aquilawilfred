import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}","./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sky: { 50:"#F0F9FF",100:"#E0F2FE",200:"#BAE6FD",300:"#7DD3FC",400:"#38BDF8",500:"#0EA5E9",600:"#0284C7",700:"#0369A1",800:"#075985",900:"#0C4A6E",950:"#082F49" },
        violet: { 50:"#F5F3FF",100:"#EDE9FE",400:"#A78BFA",500:"#8B5CF6",600:"#7C3AED",700:"#6D28D9",800:"#5B21B6",900:"#3B0764" },
        emerald: { 400:"#34D399",500:"#10B981",600:"#059669",700:"#047857" },
        amber: { 400:"#FBBF24",500:"#F59E0B" },
      },
      fontFamily: {
        display:["'Orbitron'","monospace"],
        heading:["'Exo 2'","sans-serif"],
        body:["'DM Sans'","sans-serif"],
        mono:["'Fira Code'","monospace"],
      },
      animation: {
        "float":"floatForever 5s ease-in-out infinite",
        "spin-slow":"spin 8s linear infinite",
        "pulse-slow":"pulse 4s ease-in-out infinite",
      },
      boxShadow: {
        "blue":"0 8px 30px rgba(14,165,233,0.4)",
        "purple":"0 8px 30px rgba(124,58,237,0.4)",
        "card":"0 4px 24px rgba(12,74,110,0.1)",
        "card-hover":"0 16px 48px rgba(12,74,110,0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
