import {
  Wheat, Home, Coffee, Cookie, HeartPulse, Sprout,
  Hammer, Pencil, Package, Wallet, PiggyBank, Banknote,
  Landmark, ShoppingCart, Zap, Smartphone, Store,
  Handshake, Users, TrendingUp, Boxes, Building2, type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Wheat, Home, Coffee, Cookie, HeartPulse, Sprout,
  Hammer, Pencil, Package, Wallet, PiggyBank, Banknote,
  Landmark, ShoppingCart, Zap, Smartphone, Store,
  Handshake, Users, TrendingUp, Boxes, Building2,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Package;
}
