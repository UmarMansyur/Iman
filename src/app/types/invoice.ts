/* eslint-disable @typescript-eslint/no-explicit-any */
export type PaymentMethod = {
  id: number;
  name: string;
}

export type Factory = {
  id: number;
  nickname: string;
  name: string;
  logo: string | null;
  address: string;
  user_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export type DeliveryTracking = {
  id: number;
  invoice_id: number;
  desc: string;
  location: string;
  latitude: number;
  longitude: number;
  cost: number;
  created_at: string;
  updated_at: string;
  status: string;
}

export type User = {
  id: number;
  email: string;
  username: string;
  password: string;
  gender: string;
  date_of_birth: string;
  thumbnail: string | null;
  address: string;
  user_type: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type DetailInvoice = {
  id: number;
  product_id: number | null;
  desc: string;
  amount: number;
  price: number;
  discount: number;
  sub_total: number;
  invoice_id: number;
  product: null | any; // Bisa diganti dengan type Product jika ada
}

export type Invoice = {
  id: number;
  factory_id: number;
  user_id: number;
  invoice_code: string;
  amount: number;
  discount: number | null;
  ppn: number;
  buyer: string;
  sales_man: string;
  recipient: string;
  maturity_date: string;
  item_amount: number;
  discon_member: number | null;
  buyer_address: string;
  down_payment: number;
  total: number;
  sub_total: number;
  remaining_balance: number;
  payment_status: string;
  payment_method_id: number;
  proof_of_payment: string | null;
  created_at: string;
  updated_at: string;
  payment_method: PaymentMethod;
  factory: Factory;
  deliveryTracking: DeliveryTracking[];
  user: User;
  detailInvoices: DetailInvoice[];
} 