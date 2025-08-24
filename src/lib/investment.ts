 "use server";
import { cookies } from 'next/headers';
import { InvestmentPlan } from './deposit';
import { supabase } from './supabaseClient';

export interface Investment {
  id: number;
  user_id: string;
  investment_plan_id: number;
  amount: number;
  daily_roi: number;
  expected_return: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  plan_name?: string;
  plan_duration?: number;
}

// Define proper return types
export type InvestmentResult = 
  | { success: true; investment: Investment; newBalance: number }
  | { success: false; error: string };

export type InvestmentPlansResult =
  | { success: true; data: InvestmentPlan[] }
  | { success: false; error: string };

export type UserInvestmentsResult =
  | { success: true; data: Investment[] }
  | { success: false; error: string };

export type BalanceResult =
  | { success: true; data: number }
  | { success: false; error: string };

export async function createInvestment(planId: number, amount: number): Promise<InvestmentResult> {
  try {
    console.log('[INIT] Creating investment for plan:', planId, 'Amount:', amount);

    // 1. Get user_id from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    console.log('[STEP 1] userId:', userId);

    if (!userId) {
      console.error('[ERROR] User not authenticated');
      return { success: false, error: 'Not authenticated. Please log in again.' };
    }

    // 2. Fetch investment plan details
    const { data: plan, error: planError } = await supabase
      .from('blockfortune_investment_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('[ERROR] Plan fetch failed:', planError);
      return { success: false, error: 'Invalid investment plan selected' };
    }

    // 3. Validate amount against plan limits
    if (amount < plan.min_amount || amount > plan.max_amount) {
      console.warn('[ERROR] Invalid investment amount for plan:', amount, plan);
      return { 
        success: false, 
        error: `Amount must be between $${plan.min_amount} and $${plan.max_amount} for this plan`
      };
    }

    // 4. Check user balance
    const { data: profile, error: profileError } = await supabase
      .from('blockfortuneprofile')
      .select('balance, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('[ERROR] Profile fetch failed:', profileError);
      return { success: false, error: 'Failed to fetch user profile' };
    }

    if (profile.balance < amount) {
      console.error('[ERROR] Insufficient balance:', profile.balance, amount);
      return { success: false, error: 'Insufficient balance for this investment' };
    }

    // 5. Calculate investment details
    const dailyROI = plan.daily_roi;
    const expectedReturn = amount + (amount * (dailyROI / 100) * plan.duration_days);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    // 6. Start transaction (using Supabase's transaction via RPC would be better but we'll simulate)
    // First deduct from balance
    const newBalance = profile.balance - amount;
    const { error: updateBalanceError } = await supabase
      .from('blockfortuneprofile')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateBalanceError) {
      console.error('[ERROR] Balance update failed:', updateBalanceError);
      return { success: false, error: 'Failed to process investment' };
    }

    // 7. Create investment record
    const { data: investment, error: investmentError } = await supabase
      .from('blockfortune_investments')
      .insert([{
        user_id: userId,
        investment_plan_id: planId,
        amount,
        daily_roi: dailyROI,
        expected_return: expectedReturn,
        end_date: endDate.toISOString(),
        status: 'active'
      }])
      .select(`
        *,
        blockfortune_investment_plans (
          name,
          duration_days
        )
      `)
      .single();

    if (investmentError || !investment) {
      console.error('[ERROR] Investment creation failed:', investmentError);
      
      // Rollback balance deduction if investment creation failed
      await supabase
        .from('blockfortuneprofile')
        .update({ balance: profile.balance })
        .eq('id', userId);
        
      return { success: false, error: 'Failed to create investment' };
    }

    // 8. Return success response
    const result: InvestmentResult = {
      success: true,
      investment: {
        id: investment.id,
        user_id: userId,
        investment_plan_id: planId,
        amount: investment.amount,
        daily_roi: investment.daily_roi,
        expected_return: investment.expected_return,
        start_date: investment.start_date,
        end_date: investment.end_date,
        status: 'active',
        created_at: investment.created_at,
        updated_at: investment.updated_at,
        plan_name: investment.blockfortune_investment_plans?.name,
        plan_duration: investment.blockfortune_investment_plans?.duration_days
      },
      newBalance
    };

    console.log('[SUCCESS] Investment created:', result);
    return result;

  } catch (err) {
    console.error('[FATAL ERROR] Unexpected error in createInvestment:', err);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

// Get user's active investments
export async function getUserInvestments(userId: string): Promise<UserInvestmentsResult> {
  try {
    const { data: investments, error } = await supabase
      .from('blockfortune_investments')
      .select(`
        *,
        blockfortune_investment_plans (
          name,
          duration_days
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user investments:', error);
      return { success: false, error: 'Failed to fetch investments' };
    }

    return { success: true, data: investments as Investment[] };
  } catch (err) {
    console.error('Unexpected error in getUserInvestments:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get user balance
export async function getUserBalance(userId: string): Promise<BalanceResult> {
  try {
    const { data: profile, error } = await supabase
      .from('blockfortuneprofile')
      .select('balance')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user balance:', error);
      return { success: false, error: 'Failed to fetch balance' };
    }

    return { success: true, data: profile.balance };
  } catch (err) {
    console.error('Unexpected error in getUserBalance:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}