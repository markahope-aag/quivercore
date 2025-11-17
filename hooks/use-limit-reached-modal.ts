'use client'

/**
 * Hook for managing limit reached modal state
 * Handles overage payment and upgrade flows
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface LimitReachedData {
  currentUsage: number
  limit: number
  planTier: 'explorer' | 'researcher' | 'strategist'
  overageRate: number
  overageAmount: number
  promptCount: number
  nextTier?: string | null
  nextTierLimit?: number | null
}

export function useLimitReachedModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [limitData, setLimitData] = useState<LimitReachedData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const openModal = useCallback((data: LimitReachedData) => {
    setLimitData(data)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setLimitData(null)
  }, [])

  const handlePayOverage = useCallback(async () => {
    if (!limitData) return

    setIsProcessing(true)
    try {
      // Enable overage mode - just acknowledge and close modal
      // Overage will be tracked and billed at month's end
      toast.success(
        `Overage mode enabled. You'll be billed $${limitData.overageRate.toFixed(2)}/prompt at month's end.`,
        { duration: 5000 }
      )

      closeModal()

      // Refresh the page to update usage display
      router.refresh()
    } catch (error) {
      console.error('Overage mode error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to enable overage mode')
    } finally {
      setIsProcessing(false)
    }
  }, [limitData, router, closeModal])

  const handleUpgrade = useCallback(() => {
    // Redirect to pricing page with upgrade intent
    router.push('/pricing?upgrade=true')
    closeModal()
  }, [router, closeModal])

  return {
    isOpen,
    limitData,
    isProcessing,
    openModal,
    closeModal,
    handlePayOverage,
    handleUpgrade,
  }
}
