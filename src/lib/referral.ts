'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Type for referral data
type ReferralData = {
  id: string
  referrer_id?: string
  referee_id: string
  created_at: string
  earned_amount: number
  status: 'pending' | 'paid'
  referee: {
    username: string | null
    email: string
    created_at: string
  }
}

// Type for referral stats
export interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  pending_earnings: number
  referral_code: string
  referral_link: string
  monthly_earnings: {
    month: string
    earnings: number
  }[]
}

/**
 * Get referral statistics for the current user
 */
export async function getReferralStats(): Promise<{ data?: ReferralStats, error?: string }> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { error: 'Not authenticated' }
    }

    // Get user's referral code
    const { data: profile, error: profileError } = await supabase
      .from('blockfortuneprofile')
      .select('referral_code')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { error: 'Failed to fetch profile' }
    }

    // Get referral statistics
    const { data: stats, error: statsError } = await supabase.rpc('get_referral_stats', {
      user_id: userId
    })

    if (statsError) {
      console.error('Error fetching referral stats:', statsError)
      return { error: 'Failed to fetch referral statistics' }
    }

    return {
      data: {
        total_referrals: stats?.total_referrals || 0,
        active_referrals: stats?.active_referrals || 0,
        total_earnings: stats?.total_earnings || 0,
        pending_earnings: stats?.pending_earnings || 0,
        referral_code: profile.referral_code,
        monthly_earnings: stats?.monthly_earnings || [],
        referral_link: `${process.env.NEXT_PUBLIC_SITE_URL}/signup?ref=${profile.referral_code}`
      }
    }
  } catch (err) {
    console.error('Unexpected error in getReferralStats:', err)
    return { error: 'An unexpected error occurred' }
  }
}

export async function recordReferral(refereeId: string, referredCode: string) {
  try {
    // 1. Get direct referrer
    const { data: referrer, error: referrerError } = await supabase
      .from('blockfortuneprofile')
      .select('id')
      .eq('referral_code', referredCode)
      .single()

    if (referrerError || !referrer) {
      console.error('Invalid referral code or error:', referrerError)
      return { success: false, error: 'Invalid referral code' }
    }

    // 2. Create referral record
    const { error: referralError } = await supabase
      .from('blockfortunereferrals')
      .insert({
        referrer_id: referrer.id,
        referee_id: refereeId,
        earned_amount: 0,
        status: 'pending'
      })

    if (referralError) {
      console.error('Error creating referral:', referralError)
      return { success: false, error: 'Failed to record referral' }
    }
  
    return { success: true }
  } catch (err) {
    console.error('Unexpected error in recordReferral:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get list of referrals for the current user
 */
export async function getReferralList(): Promise<{ data?: ReferralData[], error?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return { error: 'Not authenticated' };
    }

    const { data: referrals, error } = await supabase
      .from('blockfortunereferrals')
      .select(`
        id,
        referee_id,
        created_at,
        earned_amount,
        status,
        referee:referee_id (
          username,
          email,
          created_at
        )
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals:', error);
      return { error: 'Failed to fetch referral list' };
    }

    const formattedReferrals = referrals.map(ref => ({
      id: ref.id,
      referee_id: ref.referee_id,
      created_at: ref.created_at,
      earned_amount: ref.earned_amount,
      status: ref.status,
      referee: Array.isArray(ref.referee) ? ref.referee[0] : ref.referee || {
        username: null,
        email: 'unknown@email.com',
        created_at: new Date().toISOString()
      }
    }));

    return { data: formattedReferrals as ReferralData[] };
  } catch (err) {
    console.error('Unexpected error in getReferralList:', err);
    return { error: 'An unexpected error occurred' };
  }
}


/**
 * Process referral earnings when a deposit is made
 */
export async function processReferralEarnings(
  depositId: string,
  userId: string,
  amount: number
): Promise<{ success: boolean, error?: string }> {
  try {
    // 1. Check if user was referred
    const { data: profile, error: profileError } = await supabase
      .from('blockfortuneprofile')
      .select('referred_by, referral_code')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return { success: false, error: 'Failed to process referral' }
    }

    // If user wasn't referred, nothing to do
    if (!profile.referred_by) {
      return { success: true }
    }

    // 2. Get the investment plan for this deposit
    const { data: deposit, error: depositError } = await supabase
      .from('blockfortunedeposits')
      .select('investment_plan_id')
      .eq('id', depositId)
      .single()

    if (depositError || !deposit) {
      console.error('Error fetching deposit:', depositError)
      return { success: false, error: 'Failed to process referral' }
    }

    // 3. Get the plan details
    const { data: plan, error: planError } = await supabase
      .from('blockfortune_investment_plans')
      .select('affiliate_commission')
      .eq('id', deposit.investment_plan_id)
      .single()

    if (planError || !plan) {
      console.error('Error fetching plan:', planError)
      return { success: false, error: 'Failed to process referral' }
    }

    // 4. Calculate referral earnings
    const referralEarnings = amount * (plan.affiliate_commission / 100)

    // 5. Create referral record
    const { error: referralError } = await supabase
      .from('blockfortunereferrals')
      .insert({
        referrer_id: profile.referred_by,
        referee_id: userId,
        earned_amount: referralEarnings,
        status: 'pending',
        deposit_id: depositId
      })

    if (referralError) {
      console.error('Error creating referral:', referralError)
      return { success: false, error: 'Failed to process referral' }
    }

    // 6. Update referrer's pending earnings
    const { error: updateError } = await supabase.rpc('increment_referral_earnings', {
      user_id: profile.referred_by,
      amount: referralEarnings
    })

    if (updateError) {
      console.error('Error updating referrer earnings:', updateError)
      return { success: false, error: 'Failed to process referral' }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error in processReferralEarnings:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Withdraw referral earnings
 */
export async function withdrawReferralEarnings(): Promise<{ success: boolean, error?: string }> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    // 1. Get pending referral earnings
    const { data: stats, error: statsError } = await supabase.rpc('get_referral_stats', {
      user_id: userId
    })

    if (statsError || !stats) {
      return { success: false, error: 'Failed to fetch referral earnings' }
    }

    if (stats.pending_earnings <= 0) {
      return { success: false, error: 'No pending earnings to withdraw' }
    }

    // 2. Start transaction
    const { data: referralWithdrawal, error: withdrawalError } = await supabase
      .from('blockfortunereferralwithdrawals')
      .insert({
        user_id: userId,
        amount: stats.pending_earnings,
        status: 'pending'
      })
      .select()
      .single()

    if (withdrawalError || !referralWithdrawal) {
      console.error('Error creating withdrawal:', withdrawalError)
      return { success: false, error: 'Failed to initiate withdrawal' }
    }

    // 3. Mark referrals as paid
    const { error: updateError } = await supabase
      .from('blockfortunereferrals')
      .update({ status: 'paid' })
      .eq('referrer_id', userId)
      .eq('status', 'pending')

    if (updateError) {
      console.error('Error updating referral status:', updateError)
      return { success: false, error: 'Failed to complete withdrawal' }
    }

    // 4. Add to user balance
    const { error: balanceError } = await supabase.rpc('increment_user_balance', {
      user_id: userId,
      amount: stats.pending_earnings
    })

    if (balanceError) {
      console.error('Error updating user balance:', balanceError)
      return { success: false, error: 'Failed to credit earnings' }
    }

    revalidatePath('/user/invite')
    return { success: true }
  } catch (err) {
    console.error('Unexpected error in withdrawReferralEarnings:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}