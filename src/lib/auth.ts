'use server'

import { supabase } from '@/lib/supabaseClient'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import nodemailer from 'nodemailer'
import { recordReferral } from './referral'

type SignUpInput = {
  firstName: string
  lastName: string
  username: string
  email: string
  confirmEmail: string
  password: string
  confirmPassword: string
  secretQuestion: string
  secretAnswer: string
  usdtTrc20Address?: string
  btcAddress?: string
  usdtErc20Address?: string
  ethAddress?: string
  bnbAddress?: string
  referredCode?: string
}

type ChangeEmailInput = {
  newEmail: string
  confirmNewEmail: string
  password: string
}


type SignInInput = {
  username: string
  password: string
}

type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

type ResetPasswordInput = {
  username: string
  newPassword: string
  confirmNewPassword: string
  secretAnswer: string
}

type SendOTPInput = {
  username: string
}

type VerifyOTPInput = {
  username: string
  otp: string
  newPassword: string
  confirmNewPassword: string
}

export async function signUp({
  firstName,
  lastName,
  username,
  email,
  confirmEmail,
  password,
  confirmPassword,
  secretQuestion,
  secretAnswer,
  usdtTrc20Address,
  btcAddress,
  usdtErc20Address,
  ethAddress,
  bnbAddress,
  referredCode,
}: SignUpInput) {
  try {
    // 1. Validate input
    if (email !== confirmEmail) return { error: 'Emails do not match' }
    if (password !== confirmPassword) return { error: 'Passwords do not match' }
    if (password.length < 8) return { error: 'Password must be at least 8 characters long' }
    if (!secretQuestion || !secretAnswer) return { error: 'Secret question and answer are required' }

    // 2. Check if username or email already exists
    const { data: existingUser, error: lookupError } = await supabase
      .from('blockfortuneprofile')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`)

    if (lookupError) {
      console.error('User lookup error:', lookupError)
      return { error: 'Error checking existing users' }
    }

    if (existingUser && existingUser.length > 0) {
      const isUsernameTaken = existingUser.some((user: { username: string }) => user.username === username)
      const isEmailTaken = existingUser.some((user: { email: string }) => user.email === email)
      
      if (isUsernameTaken) return { error: 'Username already taken' }
      if (isEmailTaken) return { error: 'Email already registered' }
    }

    // 3. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username,
        },
      },
    })

    if (authError || !authData?.user) {
      console.error('Auth error:', authError)
      return { error: authError?.message || 'Signup failed' }
    }

    const userId = authData.user.id
    // Generate a more secure and readable referral code
    const referralCode = `BF-${uuidv4().split('-')[0].toUpperCase()}${userId.slice(0, 4)}`

    // 4. Process referral if provided
    let referredByUserId: string | null = null
    
    if (referredCode) {
      // Validate referral code format before querying
      if (referredCode.length < 8 || referredCode.length > 20) {
        console.warn('Invalid referral code format:', referredCode)
      } else {
        const { data: referrerProfile, error: referralError } = await supabase
          .from('blockfortuneprofile')
          .select('id, first_name, email')
          .eq('referral_code', referredCode)
          .single()

        if (!referralError && referrerProfile?.id) {
          referredByUserId = referrerProfile.id

          // Prevent self-referral
          if (referredByUserId === userId) {
            await supabase.auth.admin.deleteUser(userId)
            return { error: 'Cannot refer yourself' }
          }

          const { success, error } = await recordReferral(userId, referredCode)
          if (!success) {
            console.error('Failed to record referral:', error)
            // You might want to handle this case differently
          }

          // Send notification to referrer
          try {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
              },
            })

            const mailOptions = {
              from: process.env.EMAIL_FROM,
              to: referrerProfile.email,
              subject: '🎉 You Have a New Referral on BlockFortune!',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                  <h2 style="color: #0a0a0a;">Congratulations, ${referrerProfile.first_name}!</h2>
                  <p>You have a new referral on BlockFortune:</p>
                  <p><strong>New Member:</strong> ${firstName} ${lastName} (${email})</p>
                  <p>You'll earn 10% of all their deposits once they start investing.</p>
                  <br />
                  <p>Keep sharing your referral link to earn more rewards!</p>
                  <p style="margin-top: 20px;">Happy earning,<br/>The BlockFortune Team</p>
                </div>
              `,
            };
            
            await transporter.sendMail(mailOptions)
           
          } catch (emailError) {
            console.error('Failed to send referral notification:', emailError)
          }
        }
      }
    }

    // 5. Create user profile with enhanced data
    const now = new Date().toISOString()
    const { error: profileError } = await supabase.from('blockfortuneprofile').insert([{
      id: userId,
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      secret_question: secretQuestion,
      secret_answer: secretAnswer,
      usdt_trc20_address: usdtTrc20Address,
      btc_address: btcAddress,
      usdt_erc20_address: usdtErc20Address,
      eth_address: ethAddress,
      bnb_address: bnbAddress,
      referral_code: referralCode,
      referred_by: referredByUserId,
      created_at: now,
      verification_status: 'pending',
    }])

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId)
      return { error: 'Failed to create profile: ' + profileError.message }
    }

    // 6. Send welcome email with referral information
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      const referralInfo = referredByUserId 
        ? `<p>You joined using a referral link - you're helping someone earn rewards!</p>`
        : `<p>Share your referral link to earn 10% of your friends' deposits: <strong>${process.env.NEXT_PUBLIC_SITE_URL}/signup?ref=${referralCode}</strong></p>`

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: '👋 Welcome to BlockFortune – Secure Your Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="color: #0a0a0a;">Welcome to <span style="color: #4f46e5;">BlockFortune</span>, ${firstName}!</h2>
            <p>Thank you for joining <strong>BlockFortune</strong>, your trusted platform for secure and rewarding crypto investments.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Username:</strong> ${username}</p>
              <p><strong>Your Referral Code:</strong> ${referralCode}</p>
              ${referralInfo}
            </div>
            <p>🔒 <strong>Security Tip:</strong> Never share your login details with anyone.</p>
            <p>If you didn't sign up for this account, please contact our support team immediately.</p>
            <br />
            <p>We're excited to have you on board!</p>
            <p style="margin-top: 20px;">Warm regards,<br/>The BlockFortune Team</p>
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #eaeaea;" />
            <small style="color: #555;">This is an automated message. Do not reply directly to this email.</small>
          </div>
        `,
      };
      
      await transporter.sendMail(mailOptions)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }

    return {
      user: authData.user,
      session: authData.session,
      referralCode,
      referredBy: referredByUserId,
      message: 'Signup successful! Please check your email for confirmation.',
    }

  } catch (err) {
    console.error('Unexpected signup error:', err)
    return { error: 'An unexpected error occurred during signup' }
  }
}

export async function signIn({ username, password }: SignInInput) {
  console.log('SignIn function called with username:', username)
  try {
    // 1. Validate input
    console.log('Validating input...')
    if (!username || !password) {
      console.log('Validation failed: username or password missing')
      return { error: 'Username and password are required' }
    }

    // 2. Get user's email from profile
    console.log('Fetching user profile for username:', username)
    const { data: profile, error: profileError } = await supabase
      .from('blockfortuneprofile')
      .select('email')
      .eq('username', username)
      .single()

    if (profileError || !profile) {
      console.log('Profile error:', profileError?.message || 'No profile found')
      return { error: 'Invalid username or password' }
    }
    console.log('Profile found with email:', profile.email)

    // 3. Attempt authentication
    console.log('Attempting authentication with email:', profile.email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    })

    if (error) {
      console.error('Authentication failed:', error.message)
      return { error: 'Invalid username or password' }
    }
    console.log('Authentication successful')

    // 4. Handle session
    console.log('Processing session data...')
    const sessionToken = data.session?.access_token
    const refreshToken = data.session?.refresh_token
    const userId = data.user?.id

    if (!sessionToken || !refreshToken || !userId) {
      console.error('Incomplete session data:', {
        hasSessionToken: !!sessionToken,
        hasRefreshToken: !!refreshToken,
        hasUserId: !!userId
      })
      return { error: 'Failed to create session' }
    }
    console.log('Session data complete:', { userId })

    // 5. Set cookies
    console.log('Setting cookies...')
    const cookieStore = await cookies()
    const oneYear = 31536000 // 1 year in seconds

    cookieStore.set('sb-access-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('sb-refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('user_id', userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('username', username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    console.log('Cookies set successfully')
    console.log('Login completed successfully for user:', username)

    return {
      user: data.user,
      session: data.session,
      message: 'Login successful'
    }

  } catch (err) {
    console.error('Unexpected login error:', err)
    return { error: 'An unexpected error occurred' }
  }
}

export async function changePassword({
  currentPassword,
  newPassword,
  confirmNewPassword,
}: ChangePasswordInput) {
  try {
    // 1. Validate input
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return { error: 'All fields are required' }
    }
    if (newPassword !== confirmNewPassword) {
      return { error: 'New passwords do not match' }
    }
    if (newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters long' }
    }

    // 2. Get session from cookies
    const cookieStore =await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken || !refreshToken) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    // 3. Set the session on the Supabase client
    const { data: { user }, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (sessionError || !user) {
      console.error('Session error:', sessionError)
      return { error: 'Session expired. Please log in again.' }
    }

    // 4. Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password: currentPassword,
    })

    if (signInError) {
      return { error: 'Current password is incorrect' }
    }

    // 5. Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { error: updateError.message || 'Failed to update password' }
    }

    return { 
      success: true, 
      message: 'Password updated successfully' 
    }

  } catch (err) {
    console.error('Unexpected error in changePassword:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function resetPasswordWithSecret({
  username,
  newPassword,
  confirmNewPassword,
  secretAnswer,
}: ResetPasswordInput) {
  try {
    // 1. Validate input
    if (!username || !newPassword || !confirmNewPassword || !secretAnswer) {
      return { error: 'All fields are required' }
    }
    if (newPassword !== confirmNewPassword) {
      return { error: 'New passwords do not match' }
    }
    if (newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters long' }
    }

    // 2. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('blockfortuneprofile')
      .select('id, secret_answer, email')
      .eq('username', username)
      .single()

    if (profileError || !profile) {
      return { error: 'User not found' }
    }

    // 3. Verify secret answer
    if (profile.secret_answer !== secretAnswer) {
      return { error: 'Incorrect answer to secret question' }
    }

    // 4. Use admin client to reset password
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return { error: 'Failed to update password. Please try again.' }
    }

    return {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    }
  } catch (err) {
    console.error('Unexpected error in resetPasswordWithSecret:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function sendPasswordResetOTP({ username }: SendOTPInput) {
  try {
    // Validate input
    if (!username) return { error: 'Username is required' }

    // Find user by username
    const { data: user, error: userError } = await supabase
      .from('blockfortuneprofile')
      .select('id, email')
      .eq('username', username)
      .single()

    if (userError || !user) {
      return { error: 'No account found with this username' }
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    // Store OTP in database
    const { error: otpError } = await supabase
      .from('password_reset_otps')
      .upsert({
        user_id: user.id,
        otp,
        expires_at: otpExpiresAt.toISOString(),
        contact_method: 'email',
        contact_value: user.email,
      })

    if (otpError) {
      console.error('Failed to store OTP:', otpError)
      return { error: 'Failed to generate reset code' }
    }

    // Send OTP via email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: '🔐 Your BlockFortune Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="color: #4f46e5;">BlockFortune Password Reset</h2>
            <p>Hello,</p>
            <p>You requested a password reset. Use the OTP below to proceed:</p>
            
            <p style="font-size: 20px; font-weight: bold; color: #0a0a0a;">🔢 OTP: <strong>${otp}</strong></p>
      
            <p>This code is valid for <strong>15 minutes</strong>.</p>
            <p>If you didn’t request a password reset, you can safely ignore this email.</p>
      
            <br />
            <p>Need help? Contact our support team anytime.</p>
            <p style="margin-top: 20px;">– The BlockFortune Team</p>
      
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #eaeaea;" />
            <small style="color: #888;">This is an automated message. Do not reply directly.</small>
          </div>
        `,
      };
      

      await transporter.sendMail(mailOptions)
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
      return { error: 'Failed to send reset code' }
    }

    return { 
      success: true, 
      message: 'Reset code sent successfully to your registered email',
    }

  } catch (err) {
    console.error('Unexpected error in sendPasswordResetOTP:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function resetPasswordWithOTP({
  username,
  otp,
  newPassword,
  confirmNewPassword,
}: VerifyOTPInput) {
  try {
    // Validate input
    if (!username || !otp || !newPassword || !confirmNewPassword) {
      return { error: 'All fields are required' }
    }
    if (newPassword !== confirmNewPassword) {
      return { error: 'Passwords do not match' }
    }
    if (newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters long' }
    }

    // Find user by username
    const { data: user, error: userError } = await supabase
      .from('blockfortuneprofile')
      .select('id')
      .eq('username', username)
      .single()

    if (userError || !user) {
      return { error: 'No account found with this username' }
    }

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('password_reset_otps')
      .select('*')
      .eq('user_id', user.id)
      .eq('otp', otp)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (otpError || !otpRecord) {
      return { error: 'Invalid or expired OTP. Please request a new one.' }
    }

    // Use admin client to reset password
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return { error: 'Failed to update password. Please try again.' }
    }

    // Delete used OTP
    await supabase
      .from('password_reset_otps')
      .delete()
      .eq('id', otpRecord.id)

    return {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    }
  } catch (err) {
    console.error('Unexpected error in resetPasswordWithOTP:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function signOut() {
  try {
    // 1. Sign out from Supabase Auth
    const { error: authError } = await supabase.auth.signOut()
    
    if (authError) {
      console.error('Supabase sign out error:', authError.message)
      return { error: 'Failed to sign out from authentication service' }
    }

    // 2. Clear all auth-related cookies
    const cookieStore =await cookies()
    
    cookieStore.delete('sb-access-token')
    cookieStore.delete('sb-refresh-token')
    cookieStore.delete('user_id')
    cookieStore.delete('username')

    // 3. Return success
    return { success: true, message: 'Signed out successfully' }

  } catch (err) {
    console.error('Unexpected sign out error:', err)
    return { error: 'An unexpected error occurred during sign out' }
  }
}



export async function changeAuthEmail({
  newEmail,
  confirmNewEmail,
  password,
}: ChangeEmailInput) {
  try {
    // 1. Validate input
    if (!newEmail || !confirmNewEmail || !password) {
      return { error: 'All fields are required' }
    }
    if (newEmail !== confirmNewEmail) {
      return { error: 'Emails do not match' }
    }

    // 2. Get session from cookies
    const cookieStore =await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken || !refreshToken) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    // 3. Set the session on the Supabase client
    const { data: { user }, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (sessionError || !user) {
      console.error('Session error:', sessionError)
      return { error: 'Session expired. Please log in again.' }
    }

    // 4. Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password,
    })

    if (signInError) {
      return { error: 'Current password is incorrect' }
    }

    // 5. Check if new email is already in use in auth
    const { data: existingAuthUser, error: authLookupError } = await supabase
      .from('blockfortuneprofile')
      .select('email')
      .eq('email', newEmail)
      .single()

    if (authLookupError && authLookupError.code !== 'PGRST116') { // Ignore "no rows" error
      console.error('Auth email lookup error:', authLookupError)
      return { error: 'Error checking email availability' }
    }

    if (existingAuthUser) {
      return { error: 'This email is already registered' }
    }

    // 6. Update auth email (this will trigger a confirmation email from Supabase)
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (updateError) {
      return { error: updateError.message || 'Failed to update email' }
    }

    // 7. Send notification email to old and new addresses
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      // Email to old address
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email || '',
        subject: 'BlockFortune - Email Change Notification',
        html: `
          <p>Hello,</p>
          <p>We're notifying you that your BlockFortune account email is being changed to ${newEmail}.</p>
          <p>If you didn't initiate this change, please contact support immediately.</p>
        `,
      })

      // Email to new address
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: newEmail,
        subject: 'BlockFortune - Email Change Verification',
        html: `
          <p>Hello,</p>
          <p>Your BlockFortune account email is being updated to this address.</p>
          <p>Please check your inbox for a verification email from Supabase to complete the process.</p>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send notification emails:', emailError)
      // Not critical, so we continue
    }

    return { 
      success: true, 
      message: 'Email update initiated. Please check your new email for verification.' 
    }

  } catch (err) {
    console.error('Unexpected error in changeAuthEmail:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}