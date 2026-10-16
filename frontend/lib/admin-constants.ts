// lib/admin-constants.ts

import { Currency, ExchangeRates, SocialLink } from "@/types/admin";

export const CURRENCIES: Currency[] = [
  { code: "KSH", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

export const DEFAULT_RATES: ExchangeRates = {
  USD: { buying: 129, selling: 131 },
  EUR: { buying: 140, selling: 142 },
  CNY: { buying: 18, selling: 19 },
  GBP: { buying: 163, selling: 165 },
};

export const ALL_SOCIALS: SocialLink[] = [
  { id: "github", platform: "GitHub", icon: "🐙", url: "" },
  { id: "linkedin", platform: "LinkedIn", icon: "💼", url: "" },
  { id: "whatsapp", platform: "WhatsApp", icon: "💬", url: "https://wa.me/254112554165" },
  { id: "upwork", platform: "Upwork", icon: "🟢", url: "" },
  { id: "kaggle", platform: "Kaggle", icon: "🔬", url: "" },
  { id: "twitter", platform: "Twitter / X", icon: "𝕏", url: "" },
  { id: "youtube", platform: "YouTube", icon: "▶️", url: "" },
  { id: "medium", platform: "Medium", icon: "✍️", url: "" },
  { id: "devto", platform: "Dev.to", icon: "👩‍💻", url: "" },
  { id: "hashnode", platform: "Hashnode", icon: "#️⃣", url: "" },
  { id: "stackoverflow", platform: "Stack Overflow", icon: "📚", url: "" },
  { id: "huggingface", platform: "HuggingFace", icon: "🤗", url: "" },
  { id: "portfolio", platform: "Portfolio", icon: "🌐", url: "" },
  { id: "discord", platform: "Discord", icon: "💬", url: "" },
  { id: "telegram", platform: "Telegram", icon: "✈️", url: "" },
];

export const API_ROUTES = {
  projects: "/api/projects",
  blog: "/api/blog",
  gallery: "/api/gallery",
  videos: "/api/videos",
  settings: "/api/settings",
  experience: "/api/experience",
  services: "/api/services",
  socials: "/api/socials",
  currency: "/api/currency",
  upload: "/api/upload",
  adminLogin: "/api/admin/login",
  adminLogout: "/api/admin/logout",
  adminVerify: "/api/admin/verify",
} as const;