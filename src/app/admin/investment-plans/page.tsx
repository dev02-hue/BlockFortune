/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { deleteInvestmentPlans, getAllInvestmentPlans, InvestmentPlan, updateInvestmentPlans } from '@/lib/deposit'
import { useState, useEffect } from 'react'
 

export default function InvestmentPlansManager() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await getAllInvestmentPlans()
      if (data) {
        setPlans(data)
      } else {
        setError(error || 'Failed to load investment plans')
      }
      setError(null)
    } catch (err) {
      setError('Failed to load investment plans')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanChange = (index: number, field: keyof InvestmentPlan, value: any) => {
    const updatedPlans = [...plans]
    updatedPlans[index] = { ...updatedPlans[index], [field]: value }
    setPlans(updatedPlans)
  }

  const handleSaveChanges = async () => {
    setIsLoading(true)
    try {
      await updateInvestmentPlans(plans)
      setError(null)
      alert('Changes saved successfully!')
    } catch (err) {
      setError('Failed to save changes')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePlans = async (ids: number[]) => {
    if (!confirm('Are you sure you want to delete these plans?')) return
    
    setIsLoading(true)
    try {
      await deleteInvestmentPlans(ids)
      setPlans(plans.filter(plan => !ids.includes(plan.id)))
      setError(null)
      alert('Plans deleted successfully!')
    } catch (err) {
      setError('Failed to delete plans')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const addNewPlan = () => {
    setPlans([
      ...plans,
      {
        id: 0, // Temporary ID for new plans
        name: '',
        daily_roi: 0,
        min_amount: 0,
        max_amount: 0,
        duration_days: 0,
        affiliate_commission: 0,
        color: '#000000',
        description: '',
        badge: ''
      }
    ])
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Manage Investment Plans</h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="mb-4">
        <button 
          onClick={addNewPlan}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Add New Plan
        </button>
        <button 
          onClick={handleSaveChanges}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Daily ROI (%)</th>
              <th className="py-2 px-4 border">Min Amount</th>
              <th className="py-2 px-4 border">Max Amount</th>
              <th className="py-2 px-4 border">Duration (days)</th>
              <th className="py-2 px-4 border">Affiliate %</th>
              <th className="py-2 px-4 border">Color</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan, index) => (
              <tr key={plan.id || `new-${index}`} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => handlePlanChange(index, 'name', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="py-2 px-4 border">
                  <input
                    type="number"
                    step="0.01"
                    value={plan.daily_roi}
                    onChange={(e) => handlePlanChange(index, 'daily_roi', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="py-2 px-4 border">
                  <input
                    type="number"
                    value={plan.min_amount}
                    onChange={(e) => handlePlanChange(index, 'min_amount', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="py-2 px-4 border">
                  <input
                    type="number"
                    value={plan.max_amount}
                    onChange={(e) => handlePlanChange(index, 'max_amount', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="py-2 px-4 border">
                  <input
                    type="number"
                    value={plan.duration_days}
                    onChange={(e) => handlePlanChange(index, 'duration_days', parseInt(e.target.value))}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="py-2 px-4 border">
                  <input
                    type="number"
                    step="0.01"
                    value={plan.affiliate_commission}
                    onChange={(e) => handlePlanChange(index, 'affiliate_commission', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="py-2 px-4 border">
                  <input
                    type="color"
                    value={plan.color || '#000000'}
                    onChange={(e) => handlePlanChange(index, 'color', e.target.value)}
                    className="w-full h-10"
                  />
                </td>
                <td className="py-2 px-4 border">
                  <button
                    onClick={() => handleDeletePlans([plan.id])}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}