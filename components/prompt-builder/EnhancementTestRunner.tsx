'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertCircle, Play, Loader2 } from 'lucide-react'
import {
  runAllTests,
  runAllIndividualTests,
  runAllCombinationTests,
  testCompleteFlow,
  validatePromptQuality,
  type TestResult,
} from '@/lib/utils/enhancement-tests'
import { usePromptBuilder } from '@/contexts/PromptBuilderContext'

export function EnhancementTestRunner() {
  const { state } = usePromptBuilder()
  const [testResults, setTestResults] = useState<{
    individual: TestResult[]
    combinations: TestResult[]
    summary: {
      total: number
      passed: number
      failed: number
      warnings: number
    }
  } | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)

  const handleRunAllTests = () => {
    setIsRunning(true)
    setCurrentTest('Running all tests...')
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const results = runAllTests()
        setTestResults(results)
      } catch (error: any) {
        console.error('Test execution error:', error)
      } finally {
        setIsRunning(false)
        setCurrentTest(null)
      }
    }, 100)
  }

  const handleRunIndividualTests = () => {
    setIsRunning(true)
    setCurrentTest('Running individual tests...')
    
    setTimeout(() => {
      try {
        const individual = runAllIndividualTests()
        const combinations: TestResult[] = []
        setTestResults({
          individual,
          combinations,
          summary: {
            total: individual.length,
            passed: individual.filter((t) => t.passed).length,
            failed: individual.filter((t) => !t.passed).length,
            warnings: individual.reduce((sum, t) => sum + t.warnings.length, 0),
          },
        })
      } catch (error: any) {
        console.error('Test execution error:', error)
      } finally {
        setIsRunning(false)
        setCurrentTest(null)
      }
    }, 100)
  }

  const handleRunCombinationTests = () => {
    setIsRunning(true)
    setCurrentTest('Running combination tests...')
    
    setTimeout(() => {
      try {
        const combinations = runAllCombinationTests()
        const individual: TestResult[] = []
        setTestResults({
          individual,
          combinations,
          summary: {
            total: combinations.length,
            passed: combinations.filter((t) => t.passed).length,
            failed: combinations.filter((t) => !t.passed).length,
            warnings: combinations.reduce((sum, t) => sum + t.warnings.length, 0),
          },
        })
      } catch (error: any) {
        console.error('Test execution error:', error)
      } finally {
        setIsRunning(false)
        setCurrentTest(null)
      }
    }, 100)
  }

  const handleTestCurrentFlow = () => {
    if (!state.baseConfig.basePrompt) {
      alert('Please configure a base prompt first')
      return
    }

    setIsRunning(true)
    setCurrentTest('Testing current flow...')
    
    setTimeout(() => {
      try {
        const flowResult = testCompleteFlow(
          state.baseConfig.basePrompt,
          state.advancedEnhancements,
          state.vsEnhancement
        )

        // Convert flow result to test results format for display
        const testResult: TestResult = {
          testName: 'Complete Flow Test',
          passed: flowResult.success,
          errors: flowResult.steps.filter((s) => !s.success).map((s) => s.message),
          warnings: flowResult.quality?.issues || [],
          generatedPrompt: flowResult.finalPrompt,
          metadata: {
            quality: flowResult.quality,
            steps: flowResult.steps,
          },
        }

        setTestResults({
          individual: [testResult],
          combinations: [],
          summary: {
            total: 1,
            passed: flowResult.success ? 1 : 0,
            failed: flowResult.success ? 0 : 1,
            warnings: flowResult.quality?.issues.length || 0,
          },
        })
      } catch (error: any) {
        console.error('Flow test error:', error)
      } finally {
        setIsRunning(false)
        setCurrentTest(null)
      }
    }, 100)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enhancement Testing & Validation</h2>
        <p className="text-muted-foreground">
          Test individual enhancements, combinations, and validate prompt quality
        </p>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Runner</CardTitle>
          <CardDescription>Run tests to validate advanced enhancements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleRunAllTests} disabled={isRunning}>
              {isRunning && currentTest === 'Running all tests...' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run All Tests
                </>
              )}
            </Button>
            <Button onClick={handleRunIndividualTests} disabled={isRunning} variant="outline">
              {isRunning && currentTest === 'Running individual tests...' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Individual Tests
                </>
              )}
            </Button>
            <Button onClick={handleRunCombinationTests} disabled={isRunning} variant="outline">
              {isRunning && currentTest === 'Running combination tests...' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Combination Tests
                </>
              )}
            </Button>
            <Button onClick={handleTestCurrentFlow} disabled={isRunning} variant="outline">
              {isRunning && currentTest === 'Testing current flow...' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Test Current Flow
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Summary */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">{testResults.summary.total}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {testResults.summary.passed}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {testResults.summary.failed}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {testResults.summary.warnings}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Test Results */}
      {testResults && testResults.individual.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Enhancement Tests</CardTitle>
            <CardDescription>Tests for each enhancement category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.individual.map((result, index) => (
                <TestResultCard key={index} result={result} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Combination Test Results */}
      {testResults && testResults.combinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Combination Tests</CardTitle>
            <CardDescription>Tests for multiple enhancements combined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.combinations.map((result, index) => (
                <TestResultCard key={index} result={result} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TestResultCard({ result }: { result: TestResult }) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className={result.passed ? 'border-green-200' : 'border-red-200'}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {result.passed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <h4 className="font-semibold">{result.testName}</h4>
              {result.warnings.length > 0 && (
                <Badge variant="outline" className="text-yellow-600">
                  {result.warnings.length} warning{result.warnings.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="mt-2 space-y-1">
                {result.errors.map((error, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-red-600">
                    <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="mt-2 space-y-1">
                {result.warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-yellow-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {result.metadata?.quality && (
              <div className="mt-3">
                <div className="text-sm font-medium">Quality Score: {result.metadata.quality.score}/100</div>
                {result.metadata.quality.strengths.length > 0 && (
                  <div className="mt-1 text-xs text-green-600">
                    Strengths: {result.metadata.quality.strengths.join(', ')}
                  </div>
                )}
              </div>
            )}

            {result.metadata?.steps && (
              <div className="mt-3 space-y-1">
                {result.metadata.steps.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className={`text-xs flex items-center gap-2 ${
                      step.success ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {step.success ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    <span>
                      {step.step}: {step.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {result.generatedPrompt && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="ml-4"
            >
              {showDetails ? 'Hide' : 'Show'} Prompt
            </Button>
          )}
        </div>

        {showDetails && result.generatedPrompt && (
          <div className="mt-4 rounded-md bg-gray-900 p-4">
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-gray-100">
              <code>{result.generatedPrompt}</code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

