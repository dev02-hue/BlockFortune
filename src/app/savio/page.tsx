 import { AdminWithdrawalManagement } from "../component/admin/AdminWithdrawalManagement";
import WithdrawalManagement from "../component/admin/WithdrawalManagement";

 
export default function AdminDepositsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pending Deposits</h1>
     
      <WithdrawalManagement />
      <AdminWithdrawalManagement />
    </div>
  )
}