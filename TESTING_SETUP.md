# Testing Setup with Vitest

This project uses **Vitest** for unit and integration testing. Vitest is a fast, Vite-native test runner that's compatible with Jest.

## Why Vitest?

- ✅ **Faster** than Jest (uses Vite's fast HMR)
- ✅ **Better ESM support** (matches our Next.js 16 + TypeScript setup)
- ✅ **Jest-compatible API** (easy migration from Jest)
- ✅ **Built-in TypeScript support**
- ✅ **Great watch mode** for development

## Installation

Run this command to install all dependencies:

```bash
npm install
```

This will install:
- `vitest` - Test runner
- `@vitest/ui` - Visual test UI
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/user-event` - User interaction simulation
- `jsdom` - DOM environment for tests
- `@vitejs/plugin-react` - React plugin for Vite

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (recommended for development)
```bash
npm test
# Press 'a' to run all tests
# Press 'f' to run only failed tests
# Press 'u' to update snapshots
```

### Run tests with UI (visual test runner)
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Files

Tests should be placed next to the files they test, with `.test.ts` or `.spec.ts` extension:

```
lib/utils/
  ├── prompt-generation.ts
  ├── prompt-generation.test.ts  ✅
  ├── enhancement-tests.ts
  └── enhancement-tests.test.ts   ✅
```

## Writing Tests

### Example Test

```typescript
import { describe, it, expect } from 'vitest'
import { generateEnhancedPrompt } from './prompt-generation'

describe('Prompt Generation', () => {
  it('should generate a prompt', () => {
    const result = generateEnhancedPrompt(baseConfig, vsEnhancement)
    expect(result.finalPrompt).toContain('expected text')
  })
})
```

### React Component Testing

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Configuration

- **`vitest.config.ts`** - Main Vitest configuration
- **`vitest.setup.ts`** - Test setup (mocks, global config)

## Current Test Coverage

✅ **Enhancement Tests** (`lib/utils/enhancement-tests.test.ts`)
- Individual enhancement tests
- Combination tests
- Quality validation
- Complete flow testing

✅ **Prompt Generation** (`lib/utils/prompt-generation.test.ts`)
- Basic prompt generation
- Advanced enhancements integration
- Metadata validation

## Manual Testing vs Automated Testing

This project has **both**:

1. **Manual Testing** (`EnhancementTestRunner` component)
   - Quick validation in the browser
   - Interactive testing during development
   - Available in Preview & Execute step

2. **Automated Testing** (Vitest)
   - CI/CD integration
   - Regression prevention
   - Code coverage tracking
   - Fast feedback loop

## Next Steps

1. **Install dependencies**: `npm install`
2. **Run tests**: `npm test`
3. **Add more tests** as you develop new features
4. **Set up CI/CD** to run tests automatically

## Tips

- Use watch mode during development: `npm test` (auto-runs on file changes)
- Use UI mode for debugging: `npm run test:ui`
- Write tests alongside code (TDD approach)
- Test edge cases and error scenarios
- Keep tests fast and focused

## Troubleshooting

### Tests not running?
- Make sure you've run `npm install`
- Check that test files have `.test.ts` or `.spec.ts` extension

### TypeScript errors in tests?
- Vitest has built-in TypeScript support
- Make sure `vitest.setup.ts` is properly configured

### Need to mock Next.js features?
- See `vitest.setup.ts` for Next.js router mocks
- Add more mocks as needed

