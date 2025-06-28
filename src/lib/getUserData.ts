'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

// Updated getUserData to include crypto addresses
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