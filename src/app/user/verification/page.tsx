import VerificationForm from "@/app/component/user/VerificationForm"
import VerificationStatus from "@/app/component/user/VerificationStatus"
import { getVerificationStatus } from "@/lib/verification"

 
export default async function VerificationPage() {
  const status = await getVerificationStatus()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Account Verification</h1>
        
        <VerificationStatus  />
        
        {(!status.status || status.status === 'unverified' || status.status === 'rejected') && (
          <VerificationForm />
        )}
      </div>
    </div>
  )
}