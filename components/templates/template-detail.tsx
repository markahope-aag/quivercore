'use client'

/**
 * Template Detail Component
 * 
 * Comprehensive template browsing/discovery page with rich metadata:
 * - Tags, difficulty, ratings, reviews
 * - Usage guidance and best practices
 * - Enhancement recommendations
 * - Related templates
 * - User reviews and ratings
 * 
 * This is for browsing the template library and deciding which template to use.
 * For functional testing, see TestPanel component.
 */

import { useState } from 'react'
import Link from 'next/link'
import { 
  Star, Edit, Copy, FileText, TrendingUp, Users, 
  CheckCircle, Lightbulb, AlertTriangle, Clock,
  ChevronUp, ChevronDown, X
} from 'lucide-react'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import type { PromptTemplate } from '@/lib/types/templates'
import { TemplateReviewForm } from './template-review-form'
import { TemplateReviewList } from './template-review-list'
import { RelatedTemplates } from './related-templates'
import { TemplateMetadataForm } from './template-metadata-form'

interface TemplateDetailProps {
  template: PromptTemplate
  onUse?: () => void
  onEdit?: () => void
}

export function TemplateDetail({ template, onUse, onEdit }: TemplateDetailProps) {
  const [showReviews, setShowReviews] = useState(false)
  const [showRelated, setShowRelated] = useState(false)
  const [isEditingMetadata, setIsEditingMetadata] = useState(false)

  const difficultyColors = {
    Beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/30',
    Intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-500/30',
    Advanced: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-500/30',
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(template.content)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{template.name}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">{template.description}</p>
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="secondary" size="sm" onClick={handleCopy} className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            {onEdit && (
              <Button variant="secondary" size="sm" onClick={onEdit} className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {onUse && (
              <Button variant="default" size="sm" onClick={onUse} className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600">
                Use Template
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {template.quality.userRating.toFixed(1)}/5
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({template.social.comments.length} reviews)
            </span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Used {template.quality.usageCount} times
          </div>
          <Badge 
            variant="secondary" 
            className={`text-xs border-2 ${difficultyColors[template.metadata.difficultyLevel]}`}
          >
            {template.metadata.difficultyLevel}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
            <Clock className="h-4 w-4" />
            {template.metadata.estimatedTime}
          </div>
        </div>
      </div>

      {/* Tags and Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tags & Categories</h3>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingMetadata(!isEditingMetadata)}
              className="text-xs"
            >
              {isEditingMetadata ? (
                <>
                  <X className="mr-1 h-3 w-3" />
                  Cancel Edit
                </>
              ) : (
                <>
                  <Edit className="mr-1 h-3 w-3" />
                  Edit Metadata
                </>
              )}
            </Button>
          )}
        </div>
        {!isEditingMetadata ? (
          <div className="flex flex-wrap gap-2">
            {template.metadata.industry && (
              <Badge variant="default" className="bg-blue-50 text-blue-700 border-2 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">
                {template.metadata.industry}
              </Badge>
            )}
            {template.metadata.useCaseTags.map(tag => (
              <Badge key={tag} variant="secondary" className="border-2 border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-blue-200 bg-white shadow-sm dark:border-blue-800 dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">Edit Template Metadata</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Update metadata to improve discoverability and provide guidance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateMetadataForm
                template={template}
                onSave={() => {
                  setIsEditingMetadata(false)
                  // Optionally refresh the template data
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-base text-slate-900 dark:text-white">Expected Output</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">{template.metadata.outputLength}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-base text-slate-900 dark:text-white">Business Impact</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">{template.metadata.businessImpact}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-base text-slate-900 dark:text-white">Team Usage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {template.metadata.teamUsage.join(', ') || 'All teams'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Guidance Section */}
      <Card className="border-2 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900 dark:text-white">Usage Guidance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Prerequisites</h4>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                {template.guidance.prerequisites.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Best Practices</h4>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                {template.guidance.bestPractices.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {template.guidance.commonPitfalls.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                Common Pitfalls to Avoid
              </h4>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                {template.guidance.commonPitfalls.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhancement Recommendations */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900 dark:text-white">Recommended Enhancements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Verbalized Sampling</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">{template.recommendations.vsSettings}</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Compatible Frameworks</h4>
              <div className="flex gap-2 flex-wrap">
                {template.recommendations.compatibleFrameworks.map(framework => (
                  <Badge key={framework} variant="secondary" className="border-2 border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
                    {framework}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Content */}
      <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900 dark:text-white">Template Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200 font-mono max-h-[600px] overflow-y-auto">
              {template.content}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Template Variables */}
      {template.templateVariables.length > 0 && (
        <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">Template Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {template.templateVariables.map(variable => (
                <div key={variable.name} className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                  <div className="font-semibold text-slate-900 dark:text-white">{variable.name}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{variable.description}</div>
                  {variable.example && (
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      Example: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">{variable.example}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Reviews Section */}
      <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-slate-900 dark:text-white">User Reviews</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {template.social.comments.length} review{template.social.comments.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowReviews(!showReviews)}
              className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              {showReviews ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showReviews && (
          <CardContent className="space-y-4">
            <TemplateReviewForm templateId={template.id} />
            <TemplateReviewList comments={template.social.comments} />
          </CardContent>
        )}
      </Card>

      {/* Related Templates */}
      {template.social.relatedTemplates.length > 0 && (
        <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-900 dark:text-white">Related Templates</CardTitle>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowRelated(!showRelated)}
                className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                {showRelated ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showRelated && (
            <CardContent>
              <RelatedTemplates templateIds={template.social.relatedTemplates} />
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}

