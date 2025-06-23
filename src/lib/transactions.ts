'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export type Transaction = {
  id: string
  type: 'deposit' | 'withdrawal'
  created_at: string
  amount: number
  crypto_type: string
  status: 'pending' | 'completed' | 'rejected'
  reference: string
  narration?: string
  wallet_address?: string
  processed_at: string | null
  admin_notes: string | null
  network_fee?: number
}

export async function fetchAllTransactions(filters: {
  type?: 'deposit' | 'withdrawal'
  status?: 'pending' | 'completed' | 'rejected'
  limit?: number
  offset?: number
} = {}) {
  try {
    // 1. Get user_id from cookies
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      console.error('User not authenticated')
      return { data: null, error: 'Not authenticated' }
    }

    // 2. Initialize variables for combined data
    let transactions: Transaction[] = []
    let count = 0

    // 3. Fetch deposits if no type filter or type is deposit
    if (!filters.type || filters.type === 'deposit') {
      let depositQuery = supabase
        .from('blockfortunedeposits')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (filters.status) {
        depositQuery = depositQuery.eq('status', filters.status)
      }

      const { data: deposits, error: depositError, count: depositCount } = await depositQuery

      if (depositError) {
        console.error('Error fetching deposits:', depositError)
      } else {
        transactions = [
          ...transactions,
          ...(deposits?.map(deposit => ({
            ...deposit,
            type: 'deposit' as const,
            wallet_address: undefined // Deposits don't have wallet_address
          })) || [])
        ]
        count += depositCount || 0
      }
    }

    // 4. Fetch withdrawals if no type filter or type is withdrawal
    if (!filters.type || filters.type === 'withdrawal') {
      let withdrawalQuery = supabase
        .from('blockfortunewithdrawals')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (filters.status) {
        withdrawalQuery = withdrawalQuery.eq('status', filters.status)
      }

      const { data: withdrawals, error: withdrawalError, count: withdrawalCount } = await withdrawalQuery

      if (withdrawalError) {
        console.error('Error fetching withdrawals:', withdrawalError)
      } else {
        transactions = [
          ...transactions,
          ...(withdrawals?.map(withdrawal => ({
            ...withdrawal,
            type: 'withdrawal' as const,
            narration: undefined // Withdrawals don't have narration
          })) || [])
        ]
        count += withdrawalCount || 0
      }
    }

    // 5. Sort all transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 6. Apply pagination
    if (filters.limit || filters.offset) {
      const limit = filters.limit || 10
      const offset = filters.offset || 0
      transactions = transactions.slice(offset, offset + limit)
    }

    return {
      data: transactions,
      count,
      error: null
    }
  } catch (err) {
    console.error('Unexpected error in fetchAllTransactions:', err)
    return { data: null, error: 'An unexpected error occurred', count: 0 }
  }
}