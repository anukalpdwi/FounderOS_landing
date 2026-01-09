import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  colSpan?: number;
}

export interface Agent {
  title: string;
  role: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image?: string;
}

export interface PricingFeature {
  text: string;
  included: boolean;
}