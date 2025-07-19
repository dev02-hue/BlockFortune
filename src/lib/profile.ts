/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import { cookies } from 'next/headers'
import { sendVerificationEmailToAdmin } from './email'
import { supabase } from './supabaseClient'
import { validate as isUuid } from 'uuid'

type FileInfo = {
  name: string
  size: number
  type: string
}

// Helper function to get authenticated user ID
async function getAuthenticatedUserId(): Promise<{ userId?: string, error?: string }> {
  const cookieStore =await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    return { error: 'Not authenticated. Please log in again.' }
  }

  if (!isUuid(userId)) {
    return { error: 'Invalid user ID format' }
  }

  return { userId }
}

export async function submitVerificationRequest(
  documentType: 'passport' | 'driving_license' | 'id_card',
  frontImage: FileInfo,
  backImage?: FileInfo | null
) {
  try {
    const { userId, error: authError } = await getAuthenticatedUserId()
    if (authError || !userId) {
      return { error: authError || 'Not authenticated' }
    }

    // Get user profile with verification status
    const { data: profile, error: profileError } = await supabase
      .from('blockfortuneprofile')
      .select('id, email, first_name, last_name, verification_status')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return { error: 'Failed to fetch user profile' }
    }

    // Check verification status
    if (profile.verification_status === 'verified') {
      return { error: 'Your account is already verified' }
    }
    if (profile.verification_status === 'pending') {
      return { error: 'Your verification is already pending review' }
    }

    // Update to pending status
    const { error: statusError } = await supabase
      .from('blockfortuneprofile')
      .update({ 
        verification_status: 'pending',
        verification_rejected_reason: null // Clear any previous rejection
      })
      .eq('id', userId)

    if (statusError) {
      console.error('Error updating status:', statusError)
      return { error: 'Failed to update verification status' }
    }

    // Notify admin
    await sendVerificationEmailToAdmin({
      userEmail: profile.email,
      userId,
      userName: `${profile.first_name} ${profile.last_name}`,
      documentType,
      verificationId: `verify-${Date.now()}`
    })

    return { success: true }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function getVerificationStatus() {
  try {
    const { userId, error: authError } = await getAuthenticatedUserId()
    if (authError || !userId) {
      return { error: authError || 'Not authenticated' }
    }

    const { data: profile, error } = await supabase
      .from('blockfortuneprofile')
      .select('verification_status, verification_rejected_reason, verified_at')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      console.error('Error fetching verification status:', error)
      return { error: 'Failed to fetch verification status' }
    }

    return { 
      status: profile.verification_status || 'unverified',
      rejectionReason: profile.verification_rejected_reason || null,
      verifiedAt: profile.verified_at || null
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

// Admin functions
export async function approveVerification(userId: string) {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      return { error: 'User ID is required' }
    }

    if (!isUuid(userId)) {
      return { error: 'Invalid user ID format' }
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('blockfortuneprofile')
      .select('id, verification_status, email, first_name, last_name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('Error finding user:', userError)
      return { error: 'User not found' }
    }

    if (user.verification_status !== 'pending') {
      return { 
        error: user.verification_status === 'verified' 
          ? 'User is already verified' 
          : 'User verification is not in pending status'
      }
    }

    // Update to verified status
    const { error } = await supabase
      .from('blockfortuneprofile')
      .update({ 
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        verification_rejected_reason: null
      })
      .eq('id', userId)

    if (error) {
      console.error('Error approving verification:', error)
      return { error: 'Failed to approve verification' }
    }

    return { 
      success: true,
      user: {
        email: user.email,
        name: `${user.first_name} ${user.last_name}`
      }
    }
  } catch (err) {
    console.error('Unexpected error in approveVerification:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function rejectVerification(userId: string, reason: string) {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      return { error: 'User ID is required' }
    }

    if (!isUuid(userId)) {
      return { error: 'Invalid user ID format' }
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return { error: 'Rejection reason must be at least 5 characters' }
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('blockfortuneprofile')
      .select('id, verification_status, email, first_name, last_name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('Error finding user:', userError)
      return { error: 'User not found' }
    }

    if (user.verification_status !== 'pending') {
      return { 
        error: user.verification_status === 'verified' 
          ? 'User is already verified' 
          : 'User verification is not in pending status'
      }
    }

    // Update to unverified with reason
    const { error } = await supabase
      .from('blockfortuneprofile')
      .update({ 
        verification_status: 'unverified',
        verification_rejected_reason: reason.trim(),
        verified_at: null
      })
      .eq('id', userId)

    if (error) {
      console.error('Error rejecting verification:', error)
      return { error: 'Failed to reject verification' }
    }

    return { 
      success: true,
      user: {
        email: user.email,
        name: `${user.first_name} ${user.last_name}`
      }
    }
  } catch (err) {
    console.error('Unexpected error in rejectVerification:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function getPendingVerifications() {
  try {
    const { data: profiles, error } = await supabase
      .from('blockfortuneprofile')
      .select(`
        id,
        first_name,
        last_name,
        email,
        verification_status,
        created_at,
        username
      `)
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching pending verifications:', error)
      return { data: null, error: 'Failed to fetch pending verifications' }
    }

    return { data: profiles, error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}