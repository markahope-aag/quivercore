'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Plus, Tag } from 'lucide-react'

interface PromoCode {
  id: string
  code: string
  description: string
  discount_type: string
  discount_value: number
  max_uses: number | null
  current_uses: number
  is_active: boolean
  valid_until: string | null
  created_at: string
}

export function PromoCodeManagement() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxUses: '',
    validUntil: '',
  })

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  const fetchPromoCodes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/promo-codes')
      if (response.ok) {
        const data = await response.json()
        setPromoCodes(data.promoCodes || [])
      }
    } catch (error) {
      console.error('Failed to fetch promo codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPromoCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          description: formData.description,
          discountType: formData.discountType,
          discountValue: parseInt(formData.discountValue.toString()),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          validUntil: formData.validUntil || null,
        }),
      })

      if (response.ok) {
        setShowCreate(false)
        setFormData({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: 0,
          maxUses: '',
          validUntil: '',
        })
        fetchPromoCodes()
      }
    } catch (error) {
      console.error('Failed to create promo code:', error)
    }
  }

  const formatDiscount = (type: string, value: number) => {
    if (type === 'percentage') {
      return `${value}% off`
    }
    return `$${(value / 100).toFixed(2)} off`
  }

  if (loading && promoCodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading promo codes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Promotional Codes</CardTitle>
              <CardDescription>Create and manage discount codes</CardDescription>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Code
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Create Form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Promo Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createPromoCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="SUMMER2024"
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Summer promotion"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Value {formData.discountType === 'percentage' ? '(%)' : '(cents)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: parseInt(e.target.value)})}
                    required
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Uses (optional)</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                    placeholder="Unlimited"
                    min="1"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Valid Until (optional)</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Promo Code</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Promo Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promoCodes.map((promo) => (
              <div
                key={promo.id}
                className="flex items-center justify-between border-b border-slate-200 pb-4 last:border-0 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-mono font-bold">{promo.code}</p>
                    <p className="text-sm text-muted-foreground">{promo.description}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDiscount(promo.discount_type, promo.discount_value)}</span>
                      <span>•</span>
                      <span>{promo.current_uses} / {promo.max_uses || '∞'} uses</span>
                      {promo.valid_until && (
                        <>
                          <span>•</span>
                          <span>Expires: {new Date(promo.valid_until).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {promo.is_active ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
            ))}
            {promoCodes.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No promo codes created yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
