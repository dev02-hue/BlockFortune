'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import { sendDepositEmailToAdmin } from './email'
import { CRYPTO_WALLETS } from '@/type/type'

// Define the types for our crypto constants
type CryptoType = 'BTC' | 'ETH' | 'USDT_TRC20' | 'TRX' | 'SOL'
type CryptoNetworks = Record<CryptoType, string>

// Supported cryptocurrencies with their wallet addresses


const CRYPTO_NETWORKS: CryptoNetworks = {
  BTC: 'Bitcoin Network',
  ETH: 'Ethereum (ERC20)',
  USDT_TRC20: 'USDT (TRC20)',
  TRX: 'Tron (TRX)',
  SOL: 'Solana'
}

export async function initiateBlockFortuneDeposit(
    amount: number,
    cryptoType: CryptoType
  ) {
    try {
      console.log('[INIT] Starting deposit for:', cryptoType, 'Amount:', amount)
  
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
  
      // 3. Validate amount
      if (amount <= 149) {
        console.warn('[ERROR] Invalid deposit amount:', amount)
        return { error: 'Deposit amount must be greater than 149' }
      }
  
      // 4. Generate unique reference
      const  narration = `BlockFortune-DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const  reference= `Deposit to BlockFortune ${cryptoType} Wallet`
      console.log('[STEP 4] Generated Reference:', reference)
      
      // 5. Create deposit record
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
          narration
        }])
        .select()
        .single()
      console.log('[STEP 5] Deposit inserted:', deposit)
  
      if (depositError || !deposit) {
        console.error('[ERROR] Deposit insertion failed:', depositError)
        return { error: 'Failed to initiate deposit' }
      }
  
      // 6. Notify admin
      console.log('[STEP 6] Sending admin email notification...')
      await sendDepositEmailToAdmin({
        userEmail: profile.email,
        amount,
        reference,
        userId,
        cryptoType,
        transactionId: deposit.id
      })
      console.log('[STEP 6] Email sent')
  
      const result = {
        success: true,
        depositDetails: {
          cryptoType,
          cryptoNetwork: CRYPTO_NETWORKS[cryptoType],
          walletAddress: CRYPTO_WALLETS[cryptoType],
          amount,
          reference,
          narration,
          transactionId: deposit.id
        }
      }
  
      console.log('[SUCCESS] Deposit process complete:', result)
      return result
  
    } catch (err) {
      console.error('[FATAL ERROR] Unexpected error in initiateBlockFortuneDeposit:', err)
      return { error: 'An unexpected error occurred. Please try again.' }
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