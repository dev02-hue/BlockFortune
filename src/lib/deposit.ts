'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import { sendDepositEmailToAdmin, sendWithdrawalConfirmationToUser, sendWithdrawalEmailToAdmin } from './email'
import { CRYPTO_NETWORKS, CRYPTO_WALLETS } from '@/type/type'
import { revalidatePath } from 'next/cache'

// Define the types for our crypto constants
type CryptoType = 'BTC' | 'ETH' | 'USDT_TRC20' | 'TRX' | 'SOL'

const WITHDRAWAL_FEES: Record<CryptoType, number> = {
  BTC: 0.0005,
  ETH: 0.01,
  USDT_TRC20: 1,
  TRX: 5,
  SOL: 0.01
}

// Type for investment plan
export type InvestmentPlan = {
  id: number;
  name: string;
  daily_roi: number;
  min_amount: number;
  max_amount: number;
  duration_days: number;
  affiliate_commission: number;
  color?: string;
  description?: string;
  badge?: string;
}

export async function updateInvestmentPlans(plans: InvestmentPlan[]) {
  try {
    const { data, error } = await supabase
      .from('blockfortune_investment_plans')
      .upsert(plans)
      .select()

    if (error) {
      console.error('Error updating investment plans:', error)
      throw error
    }

    revalidatePath('/admin/investment-plans')
    return data as InvestmentPlan[]
  } catch (err) {
    console.error('Unexpected error in updateInvestmentPlans:', err)
    throw err
  }
}

// Delete multiple investment plans
export async function deleteInvestmentPlans(ids: number[]) {
  try {
    const { error } = await supabase
      .from('blockfortune_investment_plans')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('Error deleting investment plans:', error)
      throw error
    }

    revalidatePath('/admin/investment-plans')
    return { success: true }
  } catch (err) {
    console.error('Unexpected error in deleteInvestmentPlans:', err)
    throw err
  }
}

 
// Get all investment plans
export async function getAllInvestmentPlans() {
  try {
    const { data: plans, error } = await supabase
      .from('blockfortune_investment_plans')
      .select('*')
      .order('min_amount', { ascending: true })

    if (error) {
      console.error('Error fetching investment plans:', error)
      return { error: 'Failed to fetch investment plans', data: null }
    }

    return { data: plans as InvestmentPlan[], error: null }
  } catch (err) {
    console.error('Unexpected error in getAllInvestmentPlans:', err)
    return { error: 'An unexpected error occurred', data: null }
  }
}

// Get a single investment plan by ID
export async function getInvestmentPlanById(planId: number) {
  try {
    const { data: plan, error } = await supabase
      .from('blockfortune_investment_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (error) {
      console.error('Error fetching investment plan:', error)
      return { error: 'Investment plan not found', data: null }
    }

    return { data: plan as InvestmentPlan, error: null }
  } catch (err) {
    console.error('Unexpected error in getInvestmentPlanById:', err)
    return { error: 'An unexpected error occurred', data: null }
  }
}

export async function initiateBlockFortuneDeposit(
  amount: number,
  cryptoType: CryptoType,
  planId: number
) {
  try {
    console.log('[INIT] Starting deposit for:', cryptoType, 'Amount:', amount, 'Plan ID:', planId)

    // 1. Get user_id from cookies
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    console.log('[STEP 1] userId:', userId)

    if (!userId) {
      console.error('[ERROR] User not authenticated')
      return { error: 'Not authenticated. Please log in again.' }
    }

    // 2. Fetch user profile to get email
    const { data: profile, error: profileError } = await supabase
      .from('blockfortuneprofile')
      .select('email, balance')
      .eq('id', userId)
      .single()
    console.log('[STEP 2] Profile:', profile)

    if (profileError || !profile) {
      console.error('[ERROR] Profile fetch failed:', profileError)
      return { error: 'Failed to fetch user profile' }
    }

    // 3. Fetch investment plan details
    const { data: plan, error: planError } = await supabase
      .from('blockfortune_investment_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      console.error('[ERROR] Plan fetch failed:', planError)
      return { error: 'Invalid investment plan selected' }
    }

    // 4. Validate amount against plan limits
    if (amount < plan.min_amount || amount > plan.max_amount) {
      console.warn('[ERROR] Invalid deposit amount for plan:', amount, plan)
      return { 
        error: `Amount must be between $${plan.min_amount} and $${plan.max_amount} for this plan`
      }
    }

    // 5. Generate unique reference
    const narration = `BlockFortune-DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const reference = `Deposit to ${plan.name} (${plan.duration_days} days)`
    console.log('[STEP 5] Generated Reference:', reference)
    
    // 6. Create deposit record with plan information
    const { data: deposit, error: depositError } = await supabase
      .from('blockfortunedeposits')
      .insert([{
        user_id: userId,
        amount,
        crypto_type: cryptoType,
        status: 'pending',
        reference,
        user_email: profile.email,
        wallet_address: CRYPTO_WALLETS[cryptoType],
        narration,
        investment_plan_id: plan.id,
        plan_name: plan.name,
        plan_duration: plan.duration_days,
        daily_roi: plan.daily_roi
      }])
      .select()
      .single()
    console.log('[STEP 6] Deposit inserted:', deposit)

    if (depositError || !deposit) {
      console.error('[ERROR] Deposit insertion failed:', depositError)
      return { error: 'Failed to initiate deposit' }
    }

    // 7. Notify admin
    console.log('[STEP 7] Sending admin email notification...')
    await sendDepositEmailToAdmin({
      userEmail: profile.email,
      amount,
      reference,
      userId,
      cryptoType,
      transactionId: deposit.id,
      planName: plan.name
    })
    console.log('[STEP 7] Email sent')

    const result = {
      success: true,
      depositDetails: {
        cryptoType,
        cryptoNetwork: CRYPTO_NETWORKS[cryptoType],
        walletAddress: CRYPTO_WALLETS[cryptoType],
        amount,
        reference,
        narration,
        transactionId: deposit.id,
        plan: {
          id: plan.id,
          name: plan.name,
          duration: plan.duration_days,
          dailyROI: plan.daily_roi
        }
      }
    }

    console.log('[SUCCESS] Deposit process complete:', result)
    return result

  } catch (err) {
    console.error('[FATAL ERROR] Unexpected error in initiateBlockFortuneDeposit:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

// ... [keep all your existing functions below, they don't need modification]


  export async function getTotalCompletedDeposits() {
    try {
      // 1. Get user_id from cookies
      const cookieStore = await cookies()
      const userId = cookieStore.get('user_id')?.value
      console.log('[STEP 1] userId:', userId)
  
      if (!userId) {
        console.error('[ERROR] User not authenticated')
        return { error: 'Not authenticated. Please log in again.', total: 0 }
      }
  
      // 2. Fetch all completed deposits for the user
      const { data: deposits, error } = await supabase
        .from('blockfortunedeposits')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'completed')
  
      if (error) {
        console.error('[ERROR] Failed to fetch deposits:', error)
        return { error: 'Failed to fetch deposit history', total: 0 }
      }
  
      // 3. Calculate total amount
      const total = deposits.reduce((sum, deposit) => sum + deposit.amount, 0)
      console.log(`[SUCCESS] Calculated total deposits for user ${userId}: ${total}`)
  
      return { total }
  
    } catch (err) {
      console.error('[FATAL ERROR] Unexpected error in getTotalCompletedDeposits:', err)
      return { error: 'An unexpected error occurred. Please try again.', total: 0 }
    }
  }
  
export async function approveBlockFortuneDeposit(depositId: string) {
  try {
    // 1. Fetch deposit record
    const { data: deposit, error: fetchError } = await supabase
      .from('blockfortunedeposits')
      .select('*')
      .eq('id', depositId)
      .single()

    if (fetchError || !deposit) {
      console.error('Deposit fetch failed:', fetchError)
      return { error: 'Deposit not found' }
    }

    if (deposit.status !== 'pending') {
      return { 
        error: 'Deposit already processed',
        currentStatus: deposit.status 
      }
    }

    // 2. Update user balance and active deposit
    const { error: updateError } = await supabase.rpc('update_blockfortune_balance', {
      user_id: deposit.user_id,
      amount: deposit.amount
    })

    if (updateError) {
      console.error('Balance update failed:', updateError)
      return { error: 'Failed to update user balance' }
    }

    // 3. Mark deposit as completed
    const { error: updateDepositError } = await supabase
      .from('blockfortunedeposits')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', depositId)

    if (updateDepositError) {
      console.error('Deposit update failed:', updateDepositError)
      return { error: 'Failed to complete deposit' }
    }

    return { 
      success: true,
      depositId,
      userId: deposit.user_id,
      amount: deposit.amount
    }
  } catch (err) {
    console.error('Unexpected error in approveBlockFortuneDeposit:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function rejectBlockFortuneDeposit(depositId: string, adminNotes: string = '') {
  try {
    // 1. Verify deposit exists and is pending
    const { data: deposit, error: fetchError } = await supabase
      .from('blockfortunedeposits')
      .select('status')
      .eq('id', depositId)
      .single()

    if (fetchError || !deposit) {
      console.error('Deposit fetch failed:', fetchError)
      return { error: 'Deposit not found' }
    }

    if (deposit.status !== 'pending') {
      return { 
        error: 'Deposit already processed',
        currentStatus: deposit.status 
      }
    }

    // 2. Update status to rejected
    const { error: updateError } = await supabase
      .from('blockfortunedeposits')
      .update({ 
        status: 'rejected',
        processed_at: new Date().toISOString(),
        admin_notes: adminNotes
      })
      .eq('id', depositId)

    if (updateError) {
      console.error('Rejection failed:', updateError)
      return { error: 'Failed to reject deposit' }
    }

    return { 
      success: true,
      depositId
    }
  } catch (err) {
    console.error('Unexpected error in rejectBlockFortuneDeposit:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}


// ---------------------------// Withdrawal Functions
// ---------------------------//


export async function initiateBlockFortuneWithdrawal(
  amount: number,
  cryptoType: CryptoType,
  walletAddress: string
) {
  try {
    console.log('[INIT] Starting withdrawal for:', cryptoType, 'Amount:', amount)

    // 1. Get user_id from cookies
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    console.log('[STEP 1] userId:', userId)

    if (!userId) {
      console.error('[ERROR] User not authenticated')
      return { error: 'Not authenticated. Please log in again.' }
    }

    // 2. Fetch user profile to get email and balance
    const { data: profile, error: profileError } = await supabase
      .from('blockfortuneprofile')
      .select('email, balance')
      .eq('id', userId)
      .single()
    console.log('[STEP 2] Profile:', profile)

    if (profileError || !profile) {
      console.error('[ERROR] Profile fetch failed:', profileError)
      return { error: 'Failed to fetch user profile' }
    }

    // 3. Validate amount (minimum $50 withdrawal)
    if (amount < 50) {
      console.warn('[ERROR] Invalid withdrawal amount:', amount)
      return { error: 'Minimum withdrawal amount is $50' }
    }

    // 4. Check sufficient balance (including fee)
    const fee = WITHDRAWAL_FEES[cryptoType] || 0
    if (profile.balance < amount + fee) {
      console.warn('[ERROR] Insufficient balance:', profile.balance)
      return { error: 'Insufficient balance for withdrawal' }
    }

    // 5. Validate wallet address format (basic validation)
    if (!walletAddress || walletAddress.length < 10) {
      console.warn('[ERROR] Invalid wallet address:', walletAddress)
      return { error: 'Please provide a valid wallet address' }
    }

    // 6. Generate unique reference
    const reference = `BlockFortune-WDL-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const narration = `Withdrawal from BlockFortune to ${walletAddress}`
    console.log('[STEP 6] Generated Reference:', reference)

    // 7. Create withdrawal record
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('blockfortunewithdrawals')
      .insert([{
        user_id: userId,
        amount,
        crypto_type: cryptoType,
        wallet_address: walletAddress,
        status: 'pending',
        reference,
        user_email: profile.email,
        narration,
        network_fee: fee
      }])
      .select()
      .single()
    console.log('[STEP 7] Withdrawal inserted:', withdrawal)

    if (withdrawalError || !withdrawal) {
      console.error('[ERROR] Withdrawal insertion failed:', withdrawalError)
      return { error: 'Failed to initiate withdrawal' }
    }

    // 8. Notify admin
    console.log('[STEP 8] Sending admin email notification...')
    await sendWithdrawalEmailToAdmin({
      userEmail: profile.email,
      amount,
      reference,
      userId,
      cryptoType,
      walletAddress,
      transactionId: withdrawal.id,
      fee
    })
    console.log('[STEP 8] Email sent')

    const result = {
      success: true,
      withdrawalDetails: {
        cryptoType,
        cryptoNetwork: CRYPTO_NETWORKS[cryptoType],
        walletAddress,
        amount,
        fee,
        reference,
        narration,
        transactionId: withdrawal.id
      }
    }

    console.log('[SUCCESS] Withdrawal process complete:', result)
    return result

  } catch (err) {
    console.error('[FATAL ERROR] Unexpected error in initiateBlockFortuneWithdrawal:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function getTotalPendingWithdrawals() {
  try {
    // 1. Get user_id from cookies
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    console.log('[STEP 1] userId:', userId)

    if (!userId) {
      console.error('[ERROR] User not authenticated')
      return { error: 'Not authenticated. Please log in again.', total: 0 }
    }

    // 2. Fetch all pending withdrawals for the user
    const { data: withdrawals, error } = await supabase
      .from('blockfortunewithdrawals')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'pending')

    if (error) {
      console.error('[ERROR] Failed to fetch withdrawals:', error)
      return { error: 'Failed to fetch pending withdrawals', total: 0 }
    }

    // 3. Calculate total amount
    const total = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0)
    console.log(`[SUCCESS] Calculated pending withdrawals for user ${userId}: ${total}`)

    return { total }

  } catch (err) {
    console.error('[FATAL ERROR] Unexpected error in getTotalPendingWithdrawals:', err)
    return { error: 'An unexpected error occurred. Please try again.', total: 0 }
  }
}

export async function getTotalCompletedWithdrawals() {
  try {
    // 1. Get user_id from cookies
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    console.log('[STEP 1] userId:', userId)

    if (!userId) {
      console.error('[ERROR] User not authenticated')
      return { error: 'Not authenticated. Please log in again.', total: 0 }
    }

    // 2. Fetch all completed withdrawals for the user
    const { data: withdrawals, error } = await supabase
      .from('blockfortunewithdrawals')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (error) {
      console.error('[ERROR] Failed to fetch withdrawals:', error)
      return { error: 'Failed to fetch completed withdrawals', total: 0 }
    }

    // 3. Calculate total amount
    const total = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0)
    console.log(`[SUCCESS] Calculated completed withdrawals for user ${userId}: ${total}`)

    return { total }

  } catch (err) {
    console.error('[FATAL ERROR] Unexpected error in getTotalCompletedWithdrawals:', err)
    return { error: 'An unexpected error occurred. Please try again.', total: 0 }
  }
}

export async function approveBlockFortuneWithdrawal(withdrawalId: string) {
  try {
    // 1. Fetch withdrawal record
    const { data: withdrawal, error: fetchError } = await supabase
      .from('blockfortunewithdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single()

    if (fetchError || !withdrawal) {
      console.error('Withdrawal fetch failed:', fetchError)
      return { error: 'Withdrawal not found' }
    }

    if (withdrawal.status !== 'pending') {
      return { 
        error: 'Withdrawal already processed',
        currentStatus: withdrawal.status 
      }
    }

    // 2. Update withdrawal status to completed (trigger will handle balance deduction)
    const { error: updateError } = await supabase
      .from('blockfortunewithdrawals')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', withdrawalId)

    if (updateError) {
      console.error('Withdrawal update failed:', updateError)
      return { error: 'Failed to complete withdrawal' }
    }

    // 3. Send confirmation to user
    await sendWithdrawalConfirmationToUser({
      userEmail: withdrawal.user_email,
      amount: withdrawal.amount,
      cryptoType: withdrawal.crypto_type as CryptoType,
      walletAddress: withdrawal.wallet_address
    })

    return { 
      success: true,
      withdrawalId,
      userId: withdrawal.user_id,
      amount: withdrawal.amount
    }
  } catch (err) {
    console.error('Unexpected error in approveBlockFortuneWithdrawal:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function rejectBlockFortuneWithdrawal(
  withdrawalId: string, 
  adminNotes: string = ''
) {
  try {
    // 1. Verify withdrawal exists and is pending
    const { data: withdrawal, error: fetchError } = await supabase
      .from('blockfortunewithdrawals')
      .select('status, user_email, amount, crypto_type')
      .eq('id', withdrawalId)
      .single()

    if (fetchError || !withdrawal) {
      console.error('Withdrawal fetch failed:', fetchError)
      return { error: 'Withdrawal not found' }
    }

    if (withdrawal.status !== 'pending') {
      return { 
        error: 'Withdrawal already processed',
        currentStatus: withdrawal.status 
      }
    }

    // 2. Update status to rejected
    const { error: updateError } = await supabase
      .from('blockfortunewithdrawals')
      .update({ 
        status: 'rejected',
        processed_at: new Date().toISOString(),
        admin_notes: adminNotes
      })
      .eq('id', withdrawalId)

    if (updateError) {
      console.error('Rejection failed:', updateError)
      return { error: 'Failed to reject withdrawal' }
    }

    return { 
      success: true,
      withdrawalId
    }
  } catch (err) {
    console.error('Unexpected error in rejectBlockFortuneWithdrawal:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}


export async function getBlockFortuneWithdrawalHistory(
  filters: {
    status?: 'pending' | 'completed' | 'rejected',
    limit?: number,
    offset?: number
  } = {}
) {
  try {
    // 1. Get user_id from cookies
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    console.log('[STEP 1] userId:', userId)

    if (!userId) {
      console.error('[ERROR] User not authenticated')
      return { error: 'Not authenticated. Please log in again.', data: null }
    }

    // 2. Build base query
    let query = supabase
      .from('blockfortunewithdrawals')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // 3. Apply filters if provided
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    // 4. Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('[ERROR] Withdrawal history fetch failed:', error)
      return { error: 'Failed to fetch withdrawal history', data: null }
    }

    return {
      data: data.map(withdrawal => ({
        id: withdrawal.id,
        amount: withdrawal.amount,
        cryptoType: withdrawal.crypto_type,
        walletAddress: withdrawal.wallet_address,
        status: withdrawal.status,
        reference: withdrawal.reference,
        createdAt: withdrawal.created_at,
        processedAt: withdrawal.processed_at,
        networkFee: withdrawal.network_fee,
        adminNotes: withdrawal.admin_notes
      })),
      count: count || 0,
      error: null
    }

  } catch (err) {
    console.error('[FATAL ERROR] Unexpected error in getBlockFortuneWithdrawalHistory:', err)
    return { error: 'An unexpected error occurred. Please try again.', data: null }
  }
}

export async function getAllWithdrawals(
  filters: {
    status?: 'pending' | 'completed' | 'rejected',
    userId?: string,
    limit?: number,
    offset?: number
  } = {}
) {
  try {
    // Build base query
    let query = supabase
      .from('blockfortunewithdrawals')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('[ERROR] Withdrawals fetch failed:', error)
      return { error: 'Failed to fetch withdrawals', data: null }
    }

    return {
      data: data.map(withdrawal => ({
        id: withdrawal.id,
        userId: withdrawal.user_id,
        userEmail: withdrawal.user_email,
        amount: withdrawal.amount,
        cryptoType: withdrawal.crypto_type,
        walletAddress: withdrawal.wallet_address,
        status: withdrawal.status,
        reference: withdrawal.reference,
        createdAt: withdrawal.created_at,
        processedAt: withdrawal.processed_at,
        networkFee: withdrawal.network_fee,
        adminNotes: withdrawal.admin_notes
      })),
      count: count || 0,
      error: null
    }

  } catch (err) {
    console.error('[FATAL ERROR] Unexpected error in getAllWithdrawals:', err)
    return { error: 'An unexpected error occurred. Please try again.', data: null }
  }
}