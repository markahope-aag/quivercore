'use client'

/**
 * Pricing Page Content v3
 * Complete rebuild with new pricing strategy and detailed content
 */

import { useState } from 'react'
import { PricingCardV3 } from './pricing-card-v3'
import { BillingPeriodToggle, type BillingPeriod } from './billing-period-toggle'
import { Sparkles, CreditCard, TrendingUp } from 'lucide-react'

export function PricingPageContentV3() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const explorerFeatures = [
    { text: '50 AI-enhanced prompts per month', highlight: true },
    { text: 'All Verbalized Sampling patterns (Broad Spectrum, Rarity Hunt, Balanced Categories)', highlight: false },
    { text: 'Complete framework library (10 patterns)', highlight: false },
    { text: 'All advanced enhancements included', highlight: false },
    { text: '30 curated professional templates', highlight: true },
    { text: 'Text export for your prompts', highlight: false },
    { text: 'Basic analytics dashboard', highlight: false },
    { text: 'Community support access', highlight: false },
    { text: '💡 Save 2+ hours per creative project', highlight: false },
  ]

  const researcherFeatures = [
    { text: '150 AI-enhanced prompts per month', highlight: true },
    { text: 'All Verbalized Sampling patterns with advanced configuration options', highlight: true },
    { text: 'Complete framework library with deep customization', highlight: false },
    { text: 'All advanced enhancements included', highlight: false },
    { text: '40+ templates + 2 new monthly', highlight: true },
    { text: 'Export in Text, JSON, and Markdown formats', highlight: false },
    { text: 'Prompt performance & effectiveness tracking', highlight: false },
    { text: 'Email support + prompt engineering best practices guide', highlight: false },
    { text: 'Priority access to new features and updates', highlight: false },
    { text: '🚀 Generate 5x more creative options', highlight: false },
  ]

  const strategistFeatures = [
    { text: '500 AI-enhanced prompts per month', highlight: true },
    { text: 'All Verbalized Sampling patterns with enterprise-grade configurations', highlight: true },
    { text: 'Complete framework library + custom framework development assistance', highlight: true },
    { text: 'All advanced enhancements included', highlight: false },
    { text: '50+ templates + quarterly custom creation', highlight: true },
    { text: 'All export formats (Text, JSON, Markdown, CSV)', highlight: false },
    { text: 'Full analytics suite + ROI tracking dashboard', highlight: false },
    { text: 'API access for integration with your tools', highlight: false },
    { text: 'Team collaboration features', highlight: false },
    { text: 'Priority support + dedicated success manager', highlight: true },
    { text: 'SSO integration + custom branding options', highlight: false },
    { text: '⚡ Scale AI creativity across your entire team', highlight: false },
  ]

  // Calculate prices based on billing period
  const explorerPrice = billingPeriod === 'monthly' ? 29 : 279
  const researcherPrice = billingPeriod === 'monthly' ? 79 : 758
  const strategistPrice = billingPeriod === 'monthly' ? 299 : 2870

  // Get appropriate Stripe price ID
  const getStripePriceId = (plan: string) => {
    if (billingPeriod === 'monthly') {
      switch (plan) {
        case 'explorer': return process.env.NEXT_PUBLIC_STRIPE_EXPLORER_PRICE_ID
        case 'researcher': return process.env.NEXT_PUBLIC_STRIPE_RESEARCHER_PRICE_ID
        case 'strategist': return process.env.NEXT_PUBLIC_STRIPE_STRATEGIST_PRICE_ID
      }
    } else {
      switch (plan) {
        case 'explorer': return process.env.NEXT_PUBLIC_STRIPE_EXPLORER_ANNUAL_PRICE_ID
        case 'researcher': return process.env.NEXT_PUBLIC_STRIPE_RESEARCHER_ANNUAL_PRICE_ID
        case 'strategist': return process.env.NEXT_PUBLIC_STRIPE_STRATEGIST_ANNUAL_PRICE_ID
      }
    }
  }

  return (
    <div className="space-y-12">
      {/* Billing Period Toggle */}
      <div className="flex justify-center">
        <BillingPeriodToggle value={billingPeriod} onChange={setBillingPeriod} />
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <PricingCardV3
          planName="explorer"
          price={explorerPrice}
          subtitle="Break free from predictable AI - discover what your AI can really create"
          features={explorerFeatures}
          perfectFor="Individual content creators, freelancers, and small business owners testing AI creativity"
          socialProof="Join 200+ creators"
          isPopular={false}
          stripePriceId={getStripePriceId('explorer')}
          billingPeriod={billingPeriod}
          index={0}
        />

        <PricingCardV3
          planName="researcher"
          price={researcherPrice}
          subtitle="Harness Stanford's breakthrough research - systematic creative AI for professionals"
          features={researcherFeatures}
          perfectFor="Marketing agencies, consultants, and professional writers who need systematic prompt engineering"
          socialProof="Trusted by 50+ agencies"
          isPopular={true}
          stripePriceId={getStripePriceId('researcher')}
          billingPeriod={billingPeriod}
          index={1}
        />

        <PricingCardV3
          planName="strategist"
          price={strategistPrice}
          subtitle="Command enterprise-grade AI creativity - asymmetric advantages at scale"
          features={strategistFeatures}
          perfectFor="Enterprise teams, large agencies, and organizations requiring advanced AI strategy tools at scale"
          socialProof="Used by enterprise teams"
          isPopular={false}
          stripePriceId={getStripePriceId('strategist')}
          billingPeriod={billingPeriod}
          index={2}
        />
      </div>

      {/* Annual Savings Callout - Only show when monthly is selected */}
      {billingPeriod === 'monthly' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl p-8 shadow-xl border-2 border-blue-400 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <span className="font-semibold">Limited Time Offer</span>
          </div>
          <h3 className="text-3xl font-bold mb-3">
            Save 20% with Annual Billing
          </h3>
          <p className="text-lg opacity-95 mb-6">
            Lock in your plan and save $69-$718 per year
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="font-bold text-2xl mb-1">$279</div>
              <div className="opacity-90">Explorer Annual</div>
              <div className="text-xs opacity-75 line-through">$348</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border-2 border-white/30">
              <div className="font-bold text-2xl mb-1">$758</div>
              <div className="opacity-90">Researcher Annual</div>
              <div className="text-xs opacity-75 line-through">$948</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="font-bold text-2xl mb-1">$2,870</div>
              <div className="opacity-90">Strategist Annual</div>
              <div className="text-xs opacity-75 line-through">$3,588</div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Overage Pricing Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
            What if I exceed my monthly limit?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
            You're always in control. Choose what works best for you:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Option 1: Pay As You Go */}
            <div className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/50 dark:to-slate-900 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">Pay As You Go</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Continue creating without interruption. Pay only for what you use until your limits reset next month.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-2 border-t border-emerald-200 dark:border-emerald-800">
                  <span className="text-slate-600 dark:text-slate-400">Explorer overage:</span>
                  <span className="font-bold text-slate-900 dark:text-white">$0.75/prompt</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-emerald-200 dark:border-emerald-800">
                  <span className="text-slate-600 dark:text-slate-400">Researcher overage:</span>
                  <span className="font-bold text-slate-900 dark:text-white">$0.75/prompt</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-emerald-200 dark:border-emerald-800">
                  <span className="text-slate-600 dark:text-slate-400">Strategist overage:</span>
                  <span className="font-bold text-slate-900 dark:text-white">$0.50/prompt</span>
                </div>
              </div>
            </div>

            {/* Option 2: Upgrade */}
            <div className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/50 dark:to-slate-900 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">Upgrade Your Plan</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Get more monthly prompts plus advanced features. Better value if you consistently need more capacity.
              </p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Higher monthly limits</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Advanced features & customization</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Better long-term value</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Priority support & updates</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Note:</span> Your usage limits reset on the 1st of each month. Overage charges are one-time payments that don't affect your subscription.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 text-center">
            All plans include:
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>14-day free trial</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Cancel anytime</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Full access to all frameworks and enhancements</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Regular platform updates and improvements</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
