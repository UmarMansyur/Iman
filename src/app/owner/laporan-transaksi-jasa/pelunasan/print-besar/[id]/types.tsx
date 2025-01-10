// types/index.ts
export interface Service {
  id: number
  name: string
  price: number
  factory_id: number
  created_at: string
  updated_at: string
}

export interface DetailTransactionService {
  id: number
  transaction_service_id: number
  desc: string
  amount: number
  price: number
  discount: number
  subtotal: number
  subtotal_discount: number
  service_id: number
  created_at: string
  updated_at: string
  service: Service
}

export interface Buyer {
  id: number
  factory_id: number
  name: string
  address: string
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: number
  name: string
}

export interface User {
  id: number
  email: string
  username: string
  gender: string
  date_of_birth: string
  thumbnail: string | null
  address: string
  user_type: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Factory {
  id: number
  nickname: string
  name: string
  logo: string | null
  address: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  factory: Factory
  transaction_code: string
  user_id: number
  buyer_id: number
  amount: number
  payment_method_id: number
  down_payment: number
  maturity_date: string
  remaining_balance: number
  desc: string
  proof_of_payment: string | null
  status: string
  created_at: string
  updated_at: string
  DetailTransactionService: DetailTransactionService[]
  buyer: Buyer
  payment_method: PaymentMethod
  user: User
}