'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import { sendVerificationRequestToAdmin, sendVerificationStatusToUser } from './email'

// Submit verification request
export async function submitVerificationRequest(idDocumentUrl: string, phoneNumber: string) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    // Validate inputs
    if (!idDocumentUrl || !phoneNumber) {
      return { error: 'ID document and phone number are required' }
    }

    // Check if user already has a pending verification
    const { data: existingVerification, error: existingError } = await supabase
      .from('blockfortune_verifications')
      .select('id, verification_status')
      .eq('user_id', userId)
      .in('verification_status', ['pending', 'approved'])
      .maybeSingle()

    if (existingError) {
      console.error('Error checking existing verification:', existingError)
      return { error: 'Failed to check existing verification status' }
    }

    if (existingVerification?.verification_status === 'approved') {
      return { error: 'You are already verified' }
    }

    if (existingVerification?.verification_status === 'pending') {
      return { error: 'You already have a pending verification request' }
    }

    // Create verification record
    const { data: verification, error: verificationError } = await supabase
      .from('blockfortune_verifications')
      .insert([{
        user_id: userId,
        id_document_url: idDocumentUrl,
        phone_number: phoneNumber,
        verification_status: 'pending'
      }])
      .select()
      .single()

    if (verificationError || !verification) {
      console.error('Verification submission error:', verificationError)
      return { error: 'Failed to submit verification request' }
    }

    // Update user profile status to pending
    const { error: profileError } = await supabase
      .from('blockfortuneprofile')
      .update({ verification_status: 'pending' })
      .eq('id', userId)

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Continue even if this fails as the verification record is created
    }

    // Get user email for notification
    const { data: profile, error: profileFetchError } = await supabase
      .from('blockfortuneprofile')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single()

    if (!profileFetchError && profile) {
      // Send notification to admin
      await sendVerificationRequestToAdmin({
        userId,
        userEmail: profile.email,
        userName: `${profile.first_name} ${profile.last_name}`,
        verificationId: verification.id
      })
    }

    return { success: true, verificationId: verification.id }
  } catch (err) {
    console.error('Unexpected error in submitVerificationRequest:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

// Admin approve verification
export async function adminApproveVerification(verificationId: string, adminNotes?: string) {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get('user_id')?.value

    if (!adminId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    // Update verification record
    const { data: verification, error: verificationError } = await supabase
      .from('blockfortune_verifications')
      .update({
        verification_status: 'approved',
        admin_notes: adminNotes,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', verificationId)
      .select('user_id')
      .single()

    if (verificationError || !verification) {
      console.error('Verification approval error:', verificationError)
      return { error: 'Failed to approve verification' }
    }

    // Update user profile status
    const { error: profileError } = await supabase
      .from('blockfortuneprofile')
      .update({ verification_status: 'verified' })
      .eq('id', verification.user_id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return { error: 'Verification approved but failed to update user profile' }
    }

    // Get user details for notification
    const { data: userProfile, error: profileFetchError } = await supabase
      .from('blockfortuneprofile')
      .select('email, first_name')
      .eq('id', verification.user_id)
      .single()

    if (!profileFetchError && userProfile) {
      await sendVerificationStatusToUser({
        userEmail: userProfile.email,
        userName: userProfile.first_name,
        status: 'approved',
        notes: adminNotes
      })
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error in adminApproveVerification:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

// Admin reject verification
export async function adminRejectVerification(verificationId: string, adminNotes: string) {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get('user_id')?.value

    if (!adminId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    if (!adminNotes) {
      return { error: 'Notes are required when rejecting verification' }
    }

    // Update verification record
    const { data: verification, error: verificationError } = await supabase
      .from('blockfortune_verifications')
      .update({
        verification_status: 'rejected',
        admin_notes: adminNotes,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', verificationId)
      .select('user_id')
      .single()

    if (verificationError || !verification) {
      console.error('Verification rejection error:', verificationError)
      return { error: 'Failed to reject verification' }
    }

    // Update user profile status
    const { error: profileError } = await supabase
      .from('blockfortuneprofile')
      .update({ verification_status: 'rejected' })
      .eq('id', verification.user_id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return { error: 'Verification rejected but failed to update user profile' }
    }

    // Get user details for notification
    const { data: userProfile, error: profileFetchError } = await supabase
      .from('blockfortuneprofile')
      .select('email, first_name')
      .eq('id', verification.user_id)
      .single()

    if (!profileFetchError && userProfile) {
      await sendVerificationStatusToUser({
        userEmail: userProfile.email,
        userName: userProfile.first_name,
        status: 'rejected',
        notes: adminNotes
      })
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error in adminRejectVerification:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

// Get verification status for current user
export async function getVerificationStatus() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    // Get profile verification status
    const { data: profile, error: profileError } = await supabase
      .from('blockfortuneprofile')
      .select('verification_status')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return { error: 'Failed to fetch verification status' }
    }

    // If verified or not pending, return simple status
    if (profile.verification_status !== 'pending') {
      return { status: profile.verification_status }
    }

    // If pending, get verification details
    const { data: verification, error: verificationError } = await supabase
      .from('blockfortune_verifications')
      .select('id, created_at, admin_notes')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (verificationError) {
      console.error('Verification fetch error:', verificationError)
      return { error: 'Failed to fetch verification details' }
    }

    return {
      status: profile.verification_status,
      verificationId: verification?.id,
      submittedAt: verification?.created_at,
      adminNotes: verification?.admin_notes
    }
  } catch (err) {
    console.error('Unexpected error in getVerificationStatus:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

// Get all pending verifications (admin only)
export async function getPendingVerifications() {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get('user_id')?.value

    if (!adminId) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    // In a real app, you would check if the user is an admin here

    const { data: verifications, error } = await supabase
      .from('blockfortune_verifications')
      .select(`
        id,
        user_id,
        id_document_url,
        phone_number,
        created_at,
        blockfortuneprofile:user_id (email, first_name, last_name, username)
      `)
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching pending verifications:', error)
      return { error: 'Failed to fetch pending verifications' }
    }

    return { verifications }
  } catch (err) {
    console.error('Unexpected error in getPendingVerifications:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}