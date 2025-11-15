# Advanced Enhancements Testing & Validation

This document describes the testing utilities for validating advanced enhancements in the prompt builder.

## Overview

The testing system provides comprehensive validation for:
- Individual enhancement categories
- Combinations of multiple enhancements
- Prompt quality assessment
- Complete flow testing (base prompt → enhancements → execution)

## Test Utilities

### Location
- **Test Utilities**: `lib/utils/enhancement-tests.ts`
- **UI Component**: `components/prompt-builder/EnhancementTestRunner.tsx`

## Usage

### In Browser Console

The test utilities are available in the browser console:

```javascript
// Run all tests
const results = runEnhancementTests()

// Test complete flow
const flowResult = testCompleteFlow(
  "Write a blog post about AI",
  advancedEnhancementsObject,
  vsEnhancementObject
)

// Validate prompt quality
const quality = validatePromptQuality(generatedPrompt)
```

### In UI Component

The `EnhancementTestRunner` component can be added to any page:

```tsx
import { EnhancementTestRunner } from '@/components/prompt-builder/EnhancementTestRunner'

<EnhancementTestRunner />
```

## Test Categories

### 1. Individual Enhancement Tests

Tests each enhancement category in isolation:

- **Role Enhancement - Expert**: Tests expert role with specific expertise
- **Role Enhancement - Persona**: Tests custom persona role
- **Format Controller - JSON**: Tests JSON structured output
- **Format Controller - Markdown**: Tests Markdown formatting
- **Smart Constraints - Length**: Tests word/character length constraints
- **Smart Constraints - Tone**: Tests tone requirements
- **Smart Constraints - Audience**: Tests audience targeting
- **Reasoning Scaffold - Analysis**: Tests analytical reasoning framework
- **Reasoning Scaffold - Decision**: Tests decision matrix framework
- **Conversation Flow - Iterative**: Tests iterative conversation flow
- **Conversation Flow - Clarifying**: Tests clarifying question flow

### 2. Combination Tests

Tests multiple enhancements working together:

- **Role + Format**: Expert role with Markdown formatting
- **Constraints + Reasoning**: Length/tone constraints with analytical reasoning
- **All Enhancements**: All enhancement types enabled simultaneously

### 3. Quality Validation

Validates prompt quality based on:

- **Length**: Appropriate prompt length (50-5000 characters)
- **Clarity**: Use of directive language
- **Structure**: Well-organized with formatting
- **Instructions**: Specific, actionable instructions
- **Role/Context**: Clear role and context definition

### 4. Complete Flow Test

Tests the entire flow:

1. Validates base prompt
2. Generates advanced enhancements
3. Combines into final prompt
4. Validates prompt quality
5. Returns comprehensive results

## Test Results

Each test returns a `TestResult` object:

```typescript
interface TestResult {
  testName: string
  passed: boolean
  errors: string[]
  warnings: string[]
  generatedPrompt?: string
  metadata?: any
}
```

## Running Tests

### Programmatic Usage

```typescript
import {
  runAllTests,
  runAllIndividualTests,
  runAllCombinationTests,
  testCompleteFlow,
  validatePromptQuality,
} from '@/lib/utils/enhancement-tests'

// Run all tests
const allResults = runAllTests()
console.log(`Passed: ${allResults.summary.passed}/${allResults.summary.total}`)

// Run individual tests only
const individualResults = runAllIndividualTests()

// Run combination tests only
const combinationResults = runAllCombinationTests()

// Test current configuration
const flowResult = testCompleteFlow(
  basePrompt,
  advancedEnhancements,
  vsEnhancement
)

// Validate prompt quality
const quality = validatePromptQuality(generatedPrompt)
console.log(`Quality Score: ${quality.score}/100`)
```

### Expected Output Validation

Tests can include expected output validation:

```typescript
{
  name: 'Role Enhancement - Expert',
  expectedOutput: {
    contains: ['expert', 'AI and Machine Learning', 'domain knowledge'],
    notContains: ['error', 'undefined'],
    minLength: 100,
    maxLength: 5000,
  }
}
```

## Quality Scoring

Quality scores are calculated based on:

- **Length** (0-20 points): Appropriate prompt length
- **Clarity** (0-5 points): Clear directive language
- **Structure** (0-5 points): Well-organized format
- **Instructions** (0-10 points): Specific, actionable instructions
- **Role/Context** (0-10 points): Clear role definition

Total: 0-100 points

## Best Practices

1. **Run tests regularly**: Validate enhancements after making changes
2. **Test combinations**: Ensure multiple enhancements work together
3. **Check quality scores**: Aim for scores above 70
4. **Review warnings**: Address warnings to improve prompt quality
5. **Test complete flow**: Verify end-to-end functionality

## Troubleshooting

### Tests Failing

1. Check that enhancement generators are working correctly
2. Verify expected output strings match actual output
3. Review error messages for specific issues
4. Check that all required fields are populated

### Quality Scores Low

1. Add more specific instructions
2. Include role/context information
3. Improve prompt structure
4. Add clarity indicators (please, should, must, etc.)

### Warnings Appearing

1. Review warning messages
2. Check prompt length constraints
3. Verify enhancement integration
4. Ensure all enhancements are properly combined

## Integration

To add the test runner to your prompt builder:

```tsx
import { EnhancementTestRunner } from '@/components/prompt-builder/EnhancementTestRunner'

// In your component
<EnhancementTestRunner />
```

The test runner will automatically use the current prompt builder state when running "Test Current Flow".

