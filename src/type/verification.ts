export interface Verification {
    id: string
    user_id: string
    verification_status: 'pending' | 'approved' | 'rejected'
    id_document_url: string
    phone_number: string
    admin_notes?: string
    created_at: string
    updated_at?: string
    reviewed_by?: string
    reviewed_at?: string
    blockfortuneprofile?: {
      first_name: string
      last_name: string
      email: string
      username: string
    }
  }
  
  export interface VerificationResult {
    verifications?: Verification[]
    error?: string
  }