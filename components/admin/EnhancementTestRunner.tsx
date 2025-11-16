'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import { CheckCircle2, XCircle, AlertCircle, Play, Loader2 } from 'lucide-react'
import {
  runAllTests,
  runAllIndividualTests,
  runAllCombinationTests,
  testCompleteFlow,
  validatePromptQuality,
  type TestResult,
} from '@/lib/utils/enhancement-tests'
import type { AdvancedEnhancements } from '@/lib/types/enhancements'
import type { VSEnhancement } from '@/lib/types/prompt-builder'
import { logger } from '@/lib/utils/logger'

export function EnhancementTestRunner() {
  const [testPrompt, setTestPrompt] = useState('')
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
  const [error, setError] = useState<string | null>(null)

  const handleRunAllTests = async () => {
    setIsRunning(true)
    setCurrentTest('Running all tests...')
    setError(null)
    setTestResults(null)
    
    // Use requestAnimationFrame to ensure UI updates before running tests
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    
    try {
      const results = runAllTests()
      // Add a small delay to ensure loading state is visible
      await new Promise((resolve) => setTimeout(resolve, 300))
      setTestResults(results)
    } catch (error: any) {
      logger.error('Test execution error in Run All Tests', error)
      setError(error?.message || 'Failed to run tests. Please check the console for details.')
    } finally {
      setIsRunning(false)
      setCurrentTest(null)
    }
  }

  const handleRunIndividualTests = async () => {
    setIsRunning(true)
    setCurrentTest('Running individual tests...')
    setError(null)
    setTestResults(null)
    
    // Use requestAnimationFrame to ensure UI updates before running tests
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    
    try {
      const individual = runAllIndividualTests()
      const combinations: TestResult[] = []
      // Add a small delay to ensure loading state is visible
      await new Promise((resolve) => setTimeout(resolve, 300))
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
      logger.error('Test execution error in Individual Tests', error)
      setError(error?.message || 'Failed to run individual tests. Please check the console for details.')
    } finally {
      setIsRunning(false)
      setCurrentTest(null)
    }
  }

  const handleRunCombinationTests = async () => {
    setIsRunning(true)
    setCurrentTest('Running combination tests...')
    setError(null)
    setTestResults(null)
    
    // Use requestAnimationFrame to ensure UI updates before running tests
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    
    try {
      const combinations = runAllCombinationTests()
      const individual: TestResult[] = []
      // Add a small delay to ensure loading state is visible
      await new Promise((resolve) => setTimeout(resolve, 300))
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
      logger.error('Test execution error in Combination Tests', error)
      setError(error?.message || 'Failed to run combination tests. Please check the console for details.')
    } finally {
      setIsRunning(false)
      setCurrentTest(null)
    }
  }

  const handleTestCurrentFlow = async () => {
    if (!testPrompt) {
      alert('Please enter a test prompt first')
      return
    }

    setIsRunning(true)
    setCurrentTest('Testing current flow...')
    setError(null)
    setTestResults(null)

    // Use requestAnimationFrame to ensure UI updates before running tests
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

    try {
      const flowResult = testCompleteFlow(
        testPrompt,
        {} as AdvancedEnhancements,
        {} as VSEnhancement
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

      // Add a small delay to ensure loading state is visible
      await new Promise((resolve) => setTimeout(resolve, 300))
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
      logger.error('Flow test error', error)
      setError(error?.message || 'Failed to test current flow. Please check the console for details.')
    } finally {
      setIsRunning(false)
      setCurrentTest(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Test Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Enter a test prompt to validate (optional for general tests)</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Enter a test prompt for flow testing..."
            className="w-full min-h-[100px] rounded-md border border-slate-300 p-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            This prompt will be used for "Test Current Flow" only. Other tests run with predefined scenarios.
          </p>
        </CardContent>
      </Card>

      {/* Loading Indicator */}
      {isRunning && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-blue-900 dark:text-blue-100">
                  {currentTest || 'Running tests...'}
                </h4>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  Please wait while tests are executing. This may take a few moments.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ 
                    width: '60%',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && !isRunning && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-100">Error Running Tests</h4>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Check the browser console (F12) for more details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
      {testResults && !isRunning && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Test Results Summary
            </CardTitle>
            <CardDescription>
              {testResults.summary.total} tests completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">{testResults.summary.total}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {testResults.summary.passed}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {testResults.summary.failed}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {testResults.summary.warnings}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Test Results */}
      {testResults && !isRunning && testResults.individual.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Individual Enhancement Tests ({testResults.individual.length})
            </CardTitle>
            <CardDescription>Tests for each enhancement category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.individual.map((result, index) => (
                <TestResultCard key={`individual-${index}`} result={result} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Combination Test Results */}
      {testResults && !isRunning && testResults.combinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Combination Tests ({testResults.combinations.length})
            </CardTitle>
            <CardDescription>Tests for multiple enhancements combined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.combinations.map((result, index) => (
                <TestResultCard key={`combination-${index}`} result={result} />
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

