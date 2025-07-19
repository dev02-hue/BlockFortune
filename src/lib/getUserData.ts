/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

// Type definitions for complete type safety
type UserProfile = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  referral_code: string
  pendingWithdrawal: number
  activeDeposit: number
  withdrawalTotal: number
  earnedTotal: number
  balance: number
  usdtTrc20Address: string
  btcAddress: string
  usdtErc20Address: string
  ethAddress: string
  bnbAddress: string
  createdAt?: string
}

type EditableProfileFields = {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  pendingWithdrawal?: number
  activeDeposit?: number
  withdrawalTotal?: number
  earnedTotal?: number
  balance?: number
  usdtTrc20Address?: string
  btcAddress?: string
  usdtErc20Address?: string
  ethAddress?: string
  bnbAddress?: string
}

type ApiResponse<T> = {
  data?: T
  error?: string
  count?: number
}





 export async function getUserData() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('blockfortuneprofile')
      .select(`
        first_name,
        last_name,
        username,
        email,
        referral_code,
        pending_withdrawal,
        active_deposit,
        withdrawal_total,
        earned_total,
        balance,
        usdt_trc20_address,
        btc_address,
        usdt_erc20_address,
        eth_address,
        bnb_address
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
        referral_code: profile.referral_code || '',
        pendingWithdrawal: profile.pending_withdrawal || 0,
        activeDeposit: profile.active_deposit || 0,
        withdrawalTotal: profile.withdrawal_total || 0,
        earnedTotal: profile.earned_total || 0,
        balance: profile.balance || 0,
        usdtTrc20Address: profile.usdt_trc20_address || '',
        btcAddress: profile.btc_address || '',
        usdtErc20Address: profile.usdt_erc20_address || '',
        ethAddress: profile.eth_address || '',
        bnbAddress: profile.bnb_address || ''
      }
    }
  } catch (err) {
    console.error('Unexpected error in getUserData:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function getAllUserData(
  options?: {
    filter?: {
      isActive?: boolean
      minBalance?: number
      maxBalance?: number
      minPendingWithdrawal?: number
      maxPendingWithdrawal?: number
      minActiveDeposit?: number
      maxActiveDeposit?: number
    }
    orderBy?: keyof UserProfile
    orderAsc?: boolean
    limit?: number
    offset?: number
  }
): Promise<ApiResponse<UserProfile[]>> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    
    if (!userId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    let query = supabase
      .from('blockfortuneprofile')
      .select(`
        id,
        first_name,
        last_name,
        username,
        email,
        referral_code,
        pending_withdrawal,
        active_deposit,
        withdrawal_total,
        earned_total,
        balance,
        usdt_trc20_address,
        btc_address,
        usdt_erc20_address,
        eth_address,
        bnb_address,
        created_at
      `, 
      { count: 'exact' })

    // Apply filters if provided
    if (options?.filter) {
      if (options.filter.isActive !== undefined) {
        query = query.eq('is_active', options.filter.isActive)
      }
      if (options.filter.minBalance !== undefined) {
        query = query.gte('balance', options.filter.minBalance)
      }
      if (options.filter.maxBalance !== undefined) {
        query = query.lte('balance', options.filter.maxBalance)
      }
      if (options.filter.minPendingWithdrawal !== undefined) {
        query = query.gte('pending_withdrawal', options.filter.minPendingWithdrawal)
      }
      if (options.filter.maxPendingWithdrawal !== undefined) {
        query = query.lte('pending_withdrawal', options.filter.maxPendingWithdrawal)
      }
      if (options.filter.minActiveDeposit !== undefined) {
        query = query.gte('active_deposit', options.filter.minActiveDeposit)
      }
      if (options.filter.maxActiveDeposit !== undefined) {
        query = query.lte('active_deposit', options.filter.maxActiveDeposit)
      }
    }

    // Apply sorting if provided
    if (options?.orderBy) {
      const columnName = mapFieldToColumn(options.orderBy)
      query = query.order(columnName, { ascending: options.orderAsc ?? true })
    } else {
      // Default ordering
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination if provided
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 0) - 1)
    }

    const { data, error, count } = await query

    if (error || !data) {
      console.error('Error fetching all user data:', error)
      return { error: error?.message || 'Failed to fetch user data' }
    }

    // Transform the data to match the UserProfile type
    const users: UserProfile[] = data.map((profile: any) => ({
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      username: profile.username,
      email: profile.email,
      referral_code: profile.referral_code || '',
      pendingWithdrawal: profile.pending_withdrawal || 0,
      activeDeposit: profile.active_deposit || 0,
      withdrawalTotal: profile.withdrawal_total || 0,
      earnedTotal: profile.earned_total || 0,
      balance: profile.balance || 0,
      usdtTrc20Address: profile.usdt_trc20_address || '',
      btcAddress: profile.btc_address || '',
      usdtErc20Address: profile.usdt_erc20_address || '',
      ethAddress: profile.eth_address || '',
      bnbAddress: profile.bnb_address || '',
      createdAt: profile.created_at,
    }))

    return {
      data: users,
      count: count || users.length
    }
  } catch (err) {
    console.error('Unexpected error in getAllUserData:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function updateUserProfile(
  updates: EditableProfileFields
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    // Validate at least one field is being updated
    if (Object.keys(updates).length === 0) {
      return { error: 'No fields provided for update' }
    }

    // Prepare update data mapping between frontend and database field names
    const updateData: Record<string, any> = {}

    // Financial fields
    if (updates.pendingWithdrawal !== undefined) {
      if (typeof updates.pendingWithdrawal !== 'number' || updates.pendingWithdrawal < 0) {
        return { error: 'Pending withdrawal must be a positive number' }
      }
      updateData.pending_withdrawal = updates.pendingWithdrawal
    }
    
    if (updates.activeDeposit !== undefined) {
      if (typeof updates.activeDeposit !== 'number' || updates.activeDeposit < 0) {
        return { error: 'Active deposit must be a positive number' }
      }
      updateData.active_deposit = updates.activeDeposit
    }
    
    if (updates.withdrawalTotal !== undefined) {
      if (typeof updates.withdrawalTotal !== 'number' || updates.withdrawalTotal < 0) {
        return { error: 'Withdrawal total must be a positive number' }
      }
      updateData.withdrawal_total = updates.withdrawalTotal
    }
    
    if (updates.earnedTotal !== undefined) {
      if (typeof updates.earnedTotal !== 'number' || updates.earnedTotal < 0) {
        return { error: 'Earned total must be a positive number' }
      }
      updateData.earned_total = updates.earnedTotal
    }
    
    if (updates.balance !== undefined) {
      if (typeof updates.balance !== 'number' || updates.balance < 0) {
        return { error: 'Balance must be a positive number' }
      }
      updateData.balance = updates.balance
    }

    // Crypto address fields
    if (updates.usdtTrc20Address !== undefined) {
      if (typeof updates.usdtTrc20Address !== 'string') {
        return { error: 'USDT TRC20 address must be a string' }
      }
      updateData.usdt_trc20_address = updates.usdtTrc20Address.trim()
    }
    
    if (updates.btcAddress !== undefined) {
      if (typeof updates.btcAddress !== 'string') {
        return { error: 'BTC address must be a string' }
      }
      updateData.btc_address = updates.btcAddress.trim()
    }
    
    if (updates.usdtErc20Address !== undefined) {
      if (typeof updates.usdtErc20Address !== 'string') {
        return { error: 'USDT ERC20 address must be a string' }
      }
      updateData.usdt_erc20_address = updates.usdtErc20Address.trim()
    }
    
    if (updates.ethAddress !== undefined) {
      if (typeof updates.ethAddress !== 'string') {
        return { error: 'ETH address must be a string' }
      }
      updateData.eth_address = updates.ethAddress.trim()
    }
    
    if (updates.bnbAddress !== undefined) {
      if (typeof updates.bnbAddress !== 'string') {
        return { error: 'BNB address must be a string' }
      }
      updateData.bnb_address = updates.bnbAddress.trim()
    }

    // Personal info fields
    if (updates.firstName !== undefined) {
      updateData.first_name = updates.firstName
    }
    if (updates.lastName !== undefined) {
      updateData.last_name = updates.lastName
    }
    if (updates.username !== undefined) {
      updateData.username = updates.username
    }
    if (updates.email !== undefined) {
      updateData.email = updates.email
    }

    const { error } = await supabase
      .from('blockfortuneprofile')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      console.error('Update error:', error)
      return { error: error.message || 'Failed to update profile' }
    }

    return {
      data: {
        success: true,
        message: 'Profile updated successfully'
      }
    }
  } catch (err) {
    console.error('Unexpected error in updateUserProfile:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

// Function to update cryptocurrency addresses
export async function updateCryptoAddresses(addresses: {
  usdtTrc20Address?: string;
  btcAddress?: string;
  usdtErc20Address?: string;
  ethAddress?: string;
  bnbAddress?: string;
}) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    // Prepare the update data
    const updateData: Record<string, string> = {}
    
    if (addresses.usdtTrc20Address !== undefined) {
      updateData.usdt_trc20_address = addresses.usdtTrc20Address
    }
    if (addresses.btcAddress !== undefined) {
      updateData.btc_address = addresses.btcAddress
    }
    if (addresses.usdtErc20Address !== undefined) {
      updateData.usdt_erc20_address = addresses.usdtErc20Address
    }
    if (addresses.ethAddress !== undefined) {
      updateData.eth_address = addresses.ethAddress
    }
    if (addresses.bnbAddress !== undefined) {
      updateData.bnb_address = addresses.bnbAddress
    }

    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return { error: 'No valid address fields provided for update' }
    }

    const { error } = await supabase
      .from('blockfortuneprofile')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      console.error('Update error:', error)
      return { error: 'Failed to update addresses' }
    }

    return { success: true, message: 'Addresses updated successfully' }
  } catch (err) {
    console.error('Unexpected error in updateCryptoAddresses:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

// Function to get just the crypto addresses (if you need a lightweight version)
export async function getCryptoAddresses() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    const { data, error } = await supabase
      .from('blockfortuneprofile')
      .select(`
        usdt_trc20_address,
        btc_address,
        usdt_erc20_address,
        eth_address,
        bnb_address
      `)
      .eq('id', userId)
      .single()

    if (error || !data) {
      console.error('Error fetching addresses:', error)
      return { error: 'Failed to fetch addresses' }
    }

    return {
      addresses: {
        usdtTrc20Address: data.usdt_trc20_address || '',
        btcAddress: data.btc_address || '',
        usdtErc20Address: data.usdt_erc20_address || '',
        ethAddress: data.eth_address || '',
        bnbAddress: data.bnb_address || ''
      }
    }
  } catch (err) {
    console.error('Unexpected error in getCryptoAddresses:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}


function mapFieldToColumn(field: keyof UserProfile): string {
  const mapping: Record<keyof UserProfile, string> = {
    id: 'id',
    firstName: 'first_name',
    lastName: 'last_name',
    username: 'username',
    email: 'email',
    referral_code: 'referral_code',
    pendingWithdrawal: 'pending_withdrawal',
    activeDeposit: 'active_deposit',
    withdrawalTotal: 'withdrawal_total',
    earnedTotal: 'earned_total',
    balance: 'balance',
    usdtTrc20Address: 'usdt_trc20_address',
    btcAddress: 'btc_address',
    usdtErc20Address: 'usdt_erc20_address',
    ethAddress: 'eth_address',
    bnbAddress: 'bnb_address',
    createdAt: 'created_at',
    // lastLogin: 'last_login',
    // isActive: 'is_active'
  }
  return mapping[field] || field
}