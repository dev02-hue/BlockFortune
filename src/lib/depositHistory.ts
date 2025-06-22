// app/depositHistory.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export type Deposit = {
  id: string
  created_at: string
  amount: number
  crypto_type: string
  status: 'pending' | 'completed' | 'rejected'
  reference: string
  narration: string
  processed_at: string | null
  admin_notes: string | null
}

export async function fetchDepositHistory() {
  try {
    // 1. Get user_id from cookies
    const cookieStore =await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      console.error('User not authenticated')
      return { data: null, error: 'Not authenticated' }
    }

    // 2. Fetch deposit history
    const { data, error } = await supabase
      .from('blockfortunedeposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching deposits:', error)
      return { data: null, error: 'Failed to fetch deposits' }
    }

    return { data: data as Deposit[], error: null }
  } catch (err) {
    console.error('Unexpected error in fetchDepositHistory:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}