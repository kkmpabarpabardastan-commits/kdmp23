import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export type Category = {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  created_at: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  category: string | null;
  rating: number;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  category_id: string | null;
  unit: string;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  supplier_id: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  category?: Category | null;
  supplier?: Supplier | null;
};

export type Member = {
  id: string;
  member_number: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  join_date: string;
  status: string;
  simpanan_pokok: number;
  simpanan_wajib: number;
  simpanan_sukarela: number;
  created_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  fee_or_rate: string | null;
  icon: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  type: string;
  description: string | null;
  amount: number;
  member_id: string | null;
  product_id: string | null;
  quantity: number | null;
  transaction_date: string;
  status: string;
  created_at: string;
  member?: Member | null;
  product?: Product | null;
};
