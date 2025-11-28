'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import { sendDepositEmailToAdmin, sendWithdrawalEmailToAdmin } from './email'
import nodemailer from 'nodemailer'
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
  
      // 4. Process referral earnings if applicable
      try {
        // Check if user was referred
        const { data: profile, error: profileError } = await supabase
          .from('blockfortuneprofile')
          .select('referred_by, referral_code')
          .eq('id', deposit.user_id)
          .single()
  
        if (!profileError && profile?.referred_by) {
          // Get the investment plan to determine referral percentage
          const { data: plan, error: planError } = await supabase
            .from('blockfortune_investment_plans')
            .select('affiliate_commission')
            .eq('id', deposit.investment_plan_id)
            .single()
  
          if (!planError && plan) {
            const referralEarnings = deposit.amount * (plan.affiliate_commission / 100)
            
            // Create referral record
            await supabase
              .from('blockfortunereferrals')
              .insert({
                referrer_id: profile.referred_by,
                referee_id: deposit.user_id,
                earned_amount: referralEarnings,
                status: 'pending',
                deposit_id: deposit.id
              })
  
            // Update referrer's pending earnings
            await supabase.rpc('increment_referral_earnings', {
              user_id: profile.referred_by,
              amount: referralEarnings
            })
  
            console.log(`Processed referral earnings of $${referralEarnings} for referrer ${profile.referred_by}`)
          }
        }
      } catch (referralError) {
        console.error('Error processing referral earnings:', referralError)
        // Don't fail deposit approval if referral processing fails
      }
  
      // 5. Fetch user details for email
      const { data: user, error: userError } = await supabase
        .from('blockfortuneprofile')
        .select('email, first_name, username')
        .eq('id', deposit.user_id)
        .single();
  
      // 6. Send approval email if user exists
      if (!userError && user?.email) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.EMAIL_PASSWORD,
            },
          });
  
          const mailOptions = {
            from: process.env.EMAIL_FROM || 'BlockFortune <noreply@blockfortune.com>',
            to: user.email,
            subject: '✅ Your BlockFortune Deposit Has Been Approved',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                <h2 style="color: #0a0a0a;">Deposit Approved, ${user.first_name || 'User'}!</h2>
                <p>We're pleased to inform you that your deposit of <strong>$${deposit.amount}</strong> has been approved and credited to your BlockFortune account.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Deposit Details:</strong></p>
                  <ul style="margin: 10px 0 0 20px; padding: 0;">
                    <li>Amount: $${deposit.amount}</li>
                    <li>Status: Approved</li>
                    <li>Processed at: ${new Date().toLocaleString()}</li>
                  </ul>
                </div>
  
                <p>You can now use these funds for your investments on our platform.</p>
                <p>If you have any questions about this transaction, please don't hesitate to contact our support team.</p>
                <br />
                <p>Happy investing!</p>
                <p style="margin-top: 20px;">Best regards,<br/>The BlockFortune Team</p>
                <hr style="margin-top: 30px; border: none; border-top: 1px solid #eaeaea;" />
                <small style="color: #555;">This is an automated message. Do not reply directly to this email.</small>
              </div>
            `,
          };
  
          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
          // Don't fail the whole operation if email fails
        }
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
  
      // 3. Fetch user details for email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email, first_name, username')
        .eq('id', deposit.user_id)
        .single();
  
      // 4. Send rejection email if user exists
      if (!userError && user?.email) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.EMAIL_PASSWORD,
            },
          });
  
          const mailOptions = {
            from: process.env.EMAIL_FROM || 'BlockFortune <noreply@blockfortune.com>',
            to: user.email,
            subject: '❌ Your BlockFortune Deposit Has Been Rejected',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                <h2 style="color: #0a0a0a;">Deposit Rejected, ${user.first_name || 'User'}!</h2>
                <p>We regret to inform you that your deposit of <strong>$${deposit.amount}</strong> has been rejected.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Deposit Details:</strong></p>
                  <ul style="margin: 10px 0 0 20px; padding: 0;">
                    <li>Amount: $${deposit.amount}</li>
                    <li>Status: Rejected</li>
                    <li>Processed at: ${new Date().toLocaleString()}</li>
                    ${adminNotes ? `<li>Admin Notes: ${adminNotes}</li>` : ''}
                  </ul>
                </div>
  
                <p>If you believe this was a mistake or have any questions, please contact our support team for assistance.</p>
                <br />
                <p style="margin-top: 20px;">Best regards,<br/>The BlockFortune Team</p>
                <hr style="margin-top: 30px; border: none; border-top: 1px solid #eaeaea;" />
                <small style="color: #555;">This is an automated message. Do not reply directly to this email.</small>
              </div>
            `,
          };
  
          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError);
          // Don't fail the whole operation if email fails
        }
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
  console.log('🚀 APPROVE WITHDRAWAL FUNCTION STARTED');
  console.log('📝 Withdrawal ID:', withdrawalId);
  
  try {
    // 1. Fetch withdrawal record
    console.log('🔍 Step 1: Fetching withdrawal record...');
    const { data: withdrawal, error: fetchError } = await supabase
      .from('blockfortunewithdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single()

    console.log('📊 Withdrawal fetch result:', { withdrawal, fetchError });

    if (fetchError || !withdrawal) {
      console.error('❌ Withdrawal fetch failed:', fetchError);
      console.log('📝 Withdrawal data:', withdrawal);
      return { error: 'Withdrawal not found' }
    }

    console.log('✅ Withdrawal found:', {
      id: withdrawal.id,
      status: withdrawal.status,
      user_id: withdrawal.user_id,
      amount: withdrawal.amount,
      crypto_type: withdrawal.crypto_type
    });

    if (withdrawal.status !== 'pending') {
      console.log('⚠️ Withdrawal already processed. Current status:', withdrawal.status);
      return { 
        error: 'Withdrawal already processed',
        currentStatus: withdrawal.status 
      }
    }

    // 2. Update withdrawal status to completed
    console.log('🔄 Step 2: Updating withdrawal status to completed...');
    const { error: updateError } = await supabase
      .from('blockfortunewithdrawals')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', withdrawalId)

    console.log('📊 Withdrawal update result:', { updateError });

    if (updateError) {
      console.error('❌ Withdrawal update failed:', updateError);
      return { error: 'Failed to complete withdrawal' }
    }

    console.log('✅ Withdrawal status updated to completed');

    // 3. Get user details for email
    console.log('👤 Step 3: Fetching user details for email...');
    console.log('📝 User ID to fetch:', withdrawal.user_id);
    
    const { data: user, error: userError } = await supabase
      .from('blockfortuneprofile')
      .select('email, first_name, username')
      .eq('id', withdrawal.user_id)
      .single();

    console.log('📊 User fetch result:', { user, userError });

    // 4. Send approval email if user exists
    if (userError) {
      console.error('❌ User fetch error:', userError);
      console.log('📝 User data that was found:', user);
    }

    if (!userError && user?.email) {
      console.log('📧 Step 4: Preparing to send email...');
      console.log('📝 User email found:', user.email);
      console.log('📝 User details:', {
        first_name: user.first_name,
        username: user.username,
        email: user.email
      });

      // Check environment variables
      console.log('🔐 Checking email environment variables...');
      console.log('📝 EMAIL_USERNAME exists:', !!process.env.EMAIL_USERNAME);
      console.log('📝 EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
      console.log('📝 EMAIL_FROM exists:', !!process.env.EMAIL_FROM);
      
      // Log actual values (be careful with this in production)
      console.log('🔍 EMAIL_USERNAME value:', process.env.EMAIL_USERNAME ? '***' + process.env.EMAIL_USERNAME.slice(-3) : 'undefined');
      console.log('🔍 EMAIL_PASSWORD value:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-3) : 'undefined');
      console.log('🔍 EMAIL_FROM value:', process.env.EMAIL_FROM);

      try {
        console.log('📨 Creating email transporter...');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        console.log('✅ Email transporter created');

        const mailOptions = {
          from: process.env.EMAIL_FROM || 'BlockFortune <noreply@blockfortune.com>',
          to: user.email,
          subject: '✅ Your Withdrawal Has Been Approved - BlockFortune',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
              <h2 style="color: #0a0a0a;">Withdrawal Approved, ${user.first_name || 'User'}!</h2>
              <p>Your withdrawal request has been processed successfully.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Transaction Details:</strong></p>
                <ul style="margin: 10px 0 0 20px; padding: 0;">
                  <li>Amount: ${withdrawal.amount} ${withdrawal.crypto_type}</li>
                  <li>Destination: ${withdrawal.wallet_address}</li>
                  <li>Status: Completed</li>
                  <li>Processed at: ${new Date().toLocaleString()}</li>
                </ul>
              </div>

              <p>The funds should arrive in your wallet shortly, depending on network conditions.</p>
              <p>If you don't receive the funds within 24 hours, please contact our support team.</p>
              <br />
              <p>Thank you for using BlockFortune!</p>
              <p style="margin-top: 20px;">Best regards,<br/>The BlockFortune Team</p>
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #eaeaea;" />
              <small style="color: #555;">This is an automated message. Do not reply directly to this email.</small>
            </div>
          `,
        };

        console.log('✉️ Mail options prepared:', {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject
        });

        console.log('📤 Attempting to send email...');
        const emailResult = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('📊 Email response:', {
          messageId: emailResult.messageId,
          response: emailResult.response,
          accepted: emailResult.accepted,
          rejected: emailResult.rejected
        });

      } catch (emailError) {
        console.error('❌ FAILED TO SEND WITHDRAWAL APPROVAL EMAIL:', emailError);
        // Safely extract error properties from unknown
        const emailErrorInfo = (emailError instanceof Error)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? { name: emailError.name, message: emailError.message, stack: emailError.stack, code: (emailError as any).code }
          : { name: 'UnknownError', message: String(emailError), stack: undefined, code: undefined };
        console.error('📝 Email error details:', emailErrorInfo);
        
        // Test email configuration
        console.log('🔧 Testing email configuration...');
        if (process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
          console.log('✅ Email credentials are present');
        } else {
          console.error('❌ Email credentials are missing!');
          console.log('📝 EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
          console.log('📝 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' : 'undefined');
        }
        
        // Don't fail the operation if email fails
        console.log('⚠️ Continuing withdrawal approval despite email failure');
      }
    } else {
      console.log('❌ Cannot send email - user or email not found');
      console.log('📝 User error:', userError);
      console.log('📝 User data:', user);
      console.log('📝 User email exists:', !!user?.email);
    }

    console.log('🎉 Withdrawal approval process completed successfully');
    return { 
      success: true,
      withdrawalId,
      userId: withdrawal.user_id,
      amount: withdrawal.amount,
      emailSent: !userError && !!user?.email
    }
  } catch (err) {
    console.error('💥 UNEXPECTED ERROR IN APPROVE BLOCK FORTUNE WITHDRAWAL:', err);
    const errorInfo = err instanceof Error
      ? { name: err.name, message: err.message, stack: err.stack }
      : { name: 'UnknownError', message: String(err), stack: undefined };
    console.error('📝 Error details:', errorInfo);
    return { error: 'An unexpected error occurred. Please try again.' }
  } finally {
    console.log('🏁 APPROVE WITHDRAWAL FUNCTION COMPLETED');
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

    // 3. Get user details for email (matching deposit logic pattern)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, first_name, username')
      .eq('id', withdrawal.user_id)
      .single();

    // 4. Send rejection email if user exists (using same style as deposit emails)
    if (!userError && user?.email) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_FROM || 'BlockFortune <noreply@blockfortune.com>',
          to: user.email,
          subject: '❌ Your Withdrawal Has Been Rejected - BlockFortune',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
              <h2 style="color: #0a0a0a;">Withdrawal Rejected, ${user.first_name || 'User'}!</h2>
              <p>We regret to inform you that your withdrawal request has been rejected.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Transaction Details:</strong></p>
                <ul style="margin: 10px 0 0 20px; padding: 0;">
                  <li>Amount: ${withdrawal.amount} ${withdrawal.crypto_type}</li>
                  <li>Destination: ${withdrawal.wallet_address}</li>
                  <li>Status: Rejected</li>
                  <li>Processed at: ${new Date().toLocaleString()}</li>
                  ${adminNotes ? `<li>Admin Notes: ${adminNotes}</li>` : ''}
                </ul>
              </div>

              <p>The funds remain available in your BlockFortune account balance.</p>
              <p>If you believe this was a mistake or need clarification, please contact our support team.</p>
              <br />
              <p style="margin-top: 20px;">Best regards,<br/>The BlockFortune Team</p>
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #eaeaea;" />
              <small style="color: #555;">This is an automated message. Do not reply directly to this email.</small>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Failed to send withdrawal rejection email:', emailError);
        // Don't fail the operation if email fails
      }
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