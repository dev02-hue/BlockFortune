'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export async function getUserData() {
  try {
    // 1. Get user_id from cookies
    const cookieStore =await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    // 2. Fetch user profile and financial data directly using user_id
    const { data: profile, error: profileError } = await supabase
      .from('blockfortuneprofile')
      .select(`
        first_name,
        last_name,
        username,
        email,
        pending_withdrawal,
        active_deposit,
        withdrawal_total,
        earned_total,
        balance
      `)
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Profile error:', profileError)
      return { error: 'Failed to fetch user profile' }
    }

    return {
      user: {
        id: userId,
        firstName: profile.first_name,
        lastName: profile.last_name,
        username: profile.username,
        email: profile.email,
        pendingWithdrawal: profile.pending_withdrawal || 0,
        activeDeposit: profile.active_deposit || 0,
        withdrawalTotal: profile.withdrawal_total || 0,
        earnedTotal: profile.earned_total || 0,
        balance: profile.balance || 0
      }
    }
  } catch (err) {
    console.error('Unexpected error in getUserData:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}