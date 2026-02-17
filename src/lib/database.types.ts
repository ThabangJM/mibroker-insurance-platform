export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          name: string
          subscription_tier: string
          subscription_status: string
          trial_ends_at: string | null
          owner_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subscription_tier?: string
          subscription_status?: string
          trial_ends_at?: string | null
          owner_id: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subscription_tier?: string
          subscription_status?: string
          trial_ends_at?: string | null
          owner_id?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      store_users: {
        Row: {
          id: string
          store_id: string
          user_id: string
          role: 'Admin' | 'Manager' | 'Cashier'
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          user_id: string
          role: 'Admin' | 'Manager' | 'Cashier'
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          user_id?: string
          role?: 'Admin' | 'Manager' | 'Cashier'
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          store_id: string
          category_id: string | null
          sku: string
          barcode: string | null
          name: string
          description: string
          price: number
          cost: number
          image_url: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          category_id?: string | null
          sku: string
          barcode?: string | null
          name: string
          description?: string
          price: number
          cost?: number
          image_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          category_id?: string | null
          sku?: string
          barcode?: string | null
          name?: string
          description?: string
          price?: number
          cost?: number
          image_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          store_id: string
          quantity: number
          low_stock_threshold: number
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          store_id: string
          quantity?: number
          low_stock_threshold?: number
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          store_id?: string
          quantity?: number
          low_stock_threshold?: number
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          store_id: string
          name: string
          email: string
          phone: string
          loyalty_points: number
          total_purchases: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          email?: string
          phone?: string
          loyalty_points?: number
          total_purchases?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          email?: string
          phone?: string
          loyalty_points?: number
          total_purchases?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          store_id: string
          customer_id: string | null
          cashier_id: string
          transaction_number: string
          subtotal: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          payment_method: 'Cash' | 'Card' | 'Mobile'
          payment_status: 'Completed' | 'Refunded' | 'Partial'
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          customer_id?: string | null
          cashier_id: string
          transaction_number: string
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total_amount: number
          payment_method: 'Cash' | 'Card' | 'Mobile'
          payment_status?: 'Completed' | 'Refunded' | 'Partial'
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          customer_id?: string | null
          cashier_id?: string
          transaction_number?: string
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          payment_method?: 'Cash' | 'Card' | 'Mobile'
          payment_status?: 'Completed' | 'Refunded' | 'Partial'
          notes?: string
          created_at?: string
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          product_id: string
          quantity: number
          unit_price: number
          discount: number
          total: number
        }
        Insert: {
          id?: string
          transaction_id: string
          product_id: string
          quantity: number
          unit_price: number
          discount?: number
          total: number
        }
        Update: {
          id?: string
          transaction_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          discount?: number
          total?: number
        }
      }
      refunds: {
        Row: {
          id: string
          transaction_id: string
          store_id: string
          refund_amount: number
          reason: string
          processed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          store_id: string
          refund_amount: number
          reason?: string
          processed_by: string
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          store_id?: string
          refund_amount?: number
          reason?: string
          processed_by?: string
          created_at?: string
        }
      }
    }
  }
}
