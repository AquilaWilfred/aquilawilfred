// types/admin.ts

export type Section =
  | "dashboard"
  | "cv"
  | "projects"
  | "blog"
  | "gallery"
  | "videos"
  | "services"
  | "experience"
  | "socials"
  | "settings";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface ExchangeRate {
  buying: number;
  selling: number;
}

export interface ExchangeRates {
  [key: string]: ExchangeRate;
}

export interface PriceMap {
  [key: string]: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  icon: string;
  url: string;
  visible?: boolean;
  sort_order?: number;
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  prices: PriceMap;
  exchange_rates: ExchangeRates;
  feasibility: string;
  visible: boolean;
  sort_order?: number;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  highlights: string[];
  visible: boolean;
  sort_order?: number;
}

export interface Extras {
  experience: Experience[];
  services: Service[];
  socials: SocialLink[];
}