// Quality validation utilities for prompts

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

export function validateBasePrompt(prompt: string): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Check if prompt is empty
  if (!prompt || prompt.trim().length === 0) {
    errors.push({
      field: 'basePrompt',
      message: 'Base prompt cannot be empty',
      code: 'PROMPT_REQUIRED',
    })
  }

  // Check minimum length
  if (prompt && prompt.trim().length < 10) {
    warnings.push({
      field: 'basePrompt',
      message: 'Prompt is very short. Consider adding more detail for better results.',
      code: 'PROMPT_TOO_SHORT',
    })
  }

  // Check maximum length
  if (prompt && prompt.length > 20000) {
    errors.push({
      field: 'basePrompt',
      message: 'Prompt exceeds maximum length of 20,000 characters',
      code: 'PROMPT_TOO_LONG',
    })
  }

  // Check for placeholder text
  const placeholders = ['lorem ipsum', 'placeholder', 'todo', 'fill this in']
  const hasPlaceholder = placeholders.some((p) => prompt.toLowerCase().includes(p))
  if (hasPlaceholder) {
    warnings.push({
      field: 'basePrompt',
      message: 'Prompt may contain placeholder text',
      code: 'PLACEHOLDER_DETECTED',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validateFrameworkConfig(
  framework: string,
  config: any
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  switch (framework) {
    case 'Role-Based':
      if (!config.roleBasedRole || config.roleBasedRole.trim().length === 0) {
        errors.push({
          field: 'roleBasedRole',
          message: 'Role-based framework requires a role to be specified',
          code: 'ROLE_REQUIRED',
        })
      }
      break

    case 'Few-Shot':
      if (!config.fewShotExamples || config.fewShotExamples.length === 0) {
        errors.push({
          field: 'fewShotExamples',
          message: 'Few-shot framework requires at least one example',
          code: 'EXAMPLES_REQUIRED',
        })
      } else {
        config.fewShotExamples.forEach((ex: any, idx: number) => {
          if (!ex.input || ex.input.trim().length === 0) {
            errors.push({
              field: `fewShotExamples[${idx}].input`,
              message: `Example ${idx + 1} is missing input`,
              code: 'EXAMPLE_INPUT_REQUIRED',
            })
          }
          if (!ex.output || ex.output.trim().length === 0) {
            errors.push({
              field: `fewShotExamples[${idx}].output`,
              message: `Example ${idx + 1} is missing output`,
              code: 'EXAMPLE_OUTPUT_REQUIRED',
            })
          }
        })
      }
      break

    case 'Chain-of-Thought':
      if (
        config.reasoningStructure === 'custom' &&
        (!config.customReasoningStructure || config.customReasoningStructure.trim().length === 0)
      ) {
        errors.push({
          field: 'customReasoningStructure',
          message: 'Custom reasoning structure requires a description',
          code: 'CUSTOM_REASONING_REQUIRED',
        })
      }
      break

    case 'Template/Fill-in':
      if (!config.templateVariables || Object.keys(config.templateVariables).length === 0) {
        warnings.push({
          field: 'templateVariables',
          message: 'Template framework works best with defined variables',
          code: 'VARIABLES_RECOMMENDED',
        })
      }
      break

    case 'Constraint-Based':
      if (!config.constraintSpecs || config.constraintSpecs.length === 0) {
        errors.push({
          field: 'constraintSpecs',
          message: 'Constraint-based framework requires at least one constraint',
          code: 'CONSTRAINTS_REQUIRED',
        })
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validateVSEnhancement(vsConfig: any): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (!vsConfig.enabled) {
    return { isValid: true, errors, warnings }
  }

  // Validate response count
  if (vsConfig.numberOfResponses < 1 || vsConfig.numberOfResponses > 10) {
    errors.push({
      field: 'numberOfResponses',
      message: 'Number of responses must be between 1 and 10',
      code: 'INVALID_RESPONSE_COUNT',
    })
  }

  // Validate distribution type
  if (
    !['broad_spectrum', 'rarity_hunt', 'balanced_categories'].includes(
      vsConfig.distributionType
    )
  ) {
    errors.push({
      field: 'distributionType',
      message: 'Invalid distribution type',
      code: 'INVALID_DISTRIBUTION_TYPE',
    })
  }

  // Validate balanced categories configuration
  if (vsConfig.distributionType === 'balanced_categories') {
    const totalDimensions =
      (vsConfig.dimensions?.length || 0) + (vsConfig.customDimensions?.length || 0)
    if (totalDimensions === 0) {
      errors.push({
        field: 'dimensions',
        message: 'Balanced categories requires at least one dimension',
        code: 'DIMENSIONS_REQUIRED',
      })
    }
  }

  // Validate rarity threshold
  if (
    vsConfig.distributionType === 'rarity_hunt' &&
    vsConfig.probabilityThreshold &&
    (vsConfig.probabilityThreshold < 0 || vsConfig.probabilityThreshold > 1)
  ) {
    errors.push({
      field: 'probabilityThreshold',
      message: 'Probability threshold must be between 0 and 1',
      code: 'INVALID_THRESHOLD',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validateAdvancedEnhancements(enhancements: any): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Validate role enhancement
  if (enhancements.roleEnhancement?.enabled) {
    const type = enhancements.roleEnhancement.type
    if (type === 'expert' && !enhancements.roleEnhancement.expertise) {
      errors.push({
        field: 'roleEnhancement.expertise',
        message: 'Expert role requires expertise field',
        code: 'EXPERTISE_REQUIRED',
      })
    }
    if (type === 'persona' && !enhancements.roleEnhancement.customRole) {
      errors.push({
        field: 'roleEnhancement.customRole',
        message: 'Persona role requires custom role description',
        code: 'CUSTOM_ROLE_REQUIRED',
      })
    }
    if (type === 'perspective' && !enhancements.roleEnhancement.perspective) {
      errors.push({
        field: 'roleEnhancement.perspective',
        message: 'Perspective role requires perspective description',
        code: 'PERSPECTIVE_REQUIRED',
      })
    }
  }

  // Validate format controller
  if (enhancements.formatController?.enabled) {
    const type = enhancements.formatController.type
    if (type === 'custom' && !enhancements.formatController.customFormat) {
      errors.push({
        field: 'formatController.customFormat',
        message: 'Custom format requires format specification',
        code: 'CUSTOM_FORMAT_REQUIRED',
      })
    }
  }

  // Validate smart constraints
  if (enhancements.smartConstraints) {
    const sc = enhancements.smartConstraints

    // Length constraints
    if (sc.length?.enabled) {
      if (sc.length.min < 0 || sc.length.max < 0) {
        errors.push({
          field: 'smartConstraints.length',
          message: 'Length constraints cannot be negative',
          code: 'INVALID_LENGTH',
        })
      }
      if (sc.length.min > sc.length.max && sc.length.max > 0) {
        errors.push({
          field: 'smartConstraints.length',
          message: 'Minimum length cannot exceed maximum length',
          code: 'INVALID_LENGTH_RANGE',
        })
      }
    }

    // Tone constraints
    if (sc.tone?.enabled && (!sc.tone.tones || sc.tone.tones.length === 0)) {
      warnings.push({
        field: 'smartConstraints.tone',
        message: 'Tone constraint is enabled but no tones selected',
        code: 'NO_TONES_SELECTED',
      })
    }

    // Audience constraints
    if (sc.audience?.enabled && !sc.audience.target) {
      warnings.push({
        field: 'smartConstraints.audience',
        message: 'Audience constraint is enabled but no target specified',
        code: 'NO_AUDIENCE_SPECIFIED',
      })
    }
  }

  // Validate reasoning scaffold
  if (
    enhancements.reasoningScaffold?.enabled &&
    enhancements.reasoningScaffold.type === 'custom' &&
    !enhancements.reasoningScaffold.customFramework
  ) {
    errors.push({
      field: 'reasoningScaffold.customFramework',
      message: 'Custom reasoning scaffold requires framework description',
      code: 'CUSTOM_FRAMEWORK_REQUIRED',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validateCompletePromptConfig(config: {
  basePrompt: string
  framework: string
  frameworkConfig: any
  vsEnhancement: any
  advancedEnhancements?: any
}): ValidationResult {
  const allErrors: ValidationError[] = []
  const allWarnings: ValidationWarning[] = []

  // Validate base prompt
  const baseResult = validateBasePrompt(config.basePrompt)
  allErrors.push(...baseResult.errors)
  allWarnings.push(...baseResult.warnings)

  // Validate framework config
  if (config.framework) {
    const frameworkResult = validateFrameworkConfig(config.framework, config.frameworkConfig)
    allErrors.push(...frameworkResult.errors)
    allWarnings.push(...frameworkResult.warnings)
  }

  // Validate VS enhancement
  const vsResult = validateVSEnhancement(config.vsEnhancement)
  allErrors.push(...vsResult.errors)
  allWarnings.push(...vsResult.warnings)

  // Validate advanced enhancements
  if (config.advancedEnhancements) {
    const advancedResult = validateAdvancedEnhancements(config.advancedEnhancements)
    allErrors.push(...advancedResult.errors)
    allWarnings.push(...advancedResult.warnings)
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  }
}
