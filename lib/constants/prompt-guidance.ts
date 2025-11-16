import { FrameworkType } from '@/lib/types/prompt-builder'

export interface PromptGuidance {
  structure: string
  length: string
  tips: string[]
  example: string
  avoid: string[]
}

export const PROMPT_GUIDANCE: Record<string, PromptGuidance> = {
  'Role-Based': {
    structure: 'Context + Role Definition + Task + Constraints',
    length: 'Medium (100-300 words)',
    tips: [
      "Start with context: 'I'm working on...'",
      'Define the expert role clearly with specific expertise',
      'Be specific about what decisions/advice you need',
      'Include relevant background information',
    ],
    example:
      "I'm launching a SaaS product for small accounting firms. You are a B2B SaaS marketing expert with 10+ years helping accounting software companies grow. I need a go-to-market strategy that addresses the unique challenges of selling to accountants who are typically risk-averse and prefer referrals over cold outreach. Consider our limited budget of $50K and 6-month timeline to first revenue.",
    avoid: [
      'Being too vague about the expertise needed',
      'Skipping context about your situation',
      'Asking for generic advice without specifics',
    ],
  },

  'Few-Shot': {
    structure: 'Examples + Pattern Explanation + Your Task',
    length: 'Long (200-500 words)',
    tips: [
      'Provide 2-3 high-quality examples first',
      'Explain what makes the examples good',
      'Be clear about what you want generated',
      'Include format specifications',
    ],
    example:
      "Here are three examples of effective cold email subject lines:\n\n1. 'Quick question about [Company]'s Q3 goals' - personal, specific, shows research\n2. '[Mutual connection] suggested I reach out' - leverages social proof\n3. 'Noticed your recent [achievement] - quick idea' - congratulatory + value-focused\n\nEach works because they're personal, specific, and promise quick value. Now write 5 subject lines for my email to CTOs at mid-size companies about our API security tool.",
    avoid: [
      'Using poor quality examples',
      'Not explaining why examples work',
      'Being unclear about desired output format',
    ],
  },

  'Chain-of-Thought': {
    structure: 'Problem Statement + Context + Request for Step-by-Step Analysis',
    length: 'Medium (150-400 words)',
    tips: [
      'Clearly state the complex problem',
      'Provide all relevant context upfront',
      'Ask for step-by-step reasoning',
      'Specify what kind of logic you want to see',
    ],
    example:
      "I need to decide whether to hire a full-time developer or continue with freelancers for our startup. Context: We're a 5-person team, have $200K runway for 8 months, currently spend $8K/month on freelancers, and need to build 3 major features. A full-time dev would cost $120K/year plus benefits. Walk me through this decision step-by-step, weighing the financial, timeline, and quality factors. Show your reasoning at each stage.",
    avoid: [
      'Leaving out crucial context',
      'Not asking for reasoning to be shown',
      'Making the problem too simple for this framework',
    ],
  },

  Generative: {
    structure: 'Creative Brief + Constraints + Inspiration',
    length: 'Short-Medium (75-250 words)',
    tips: [
      'Give creative freedom while setting boundaries',
      'Include inspiration or style references',
      'Be clear about quantity and format desired',
      'Mention target audience',
    ],
    example:
      "Generate creative names for a meal planning app targeting busy parents. The app helps plan healthy weeknight dinners in under 10 minutes. Think modern, approachable, and family-friendly - avoid overly cute or complicated names. Consider names like 'Mealime' or 'PlateJoy' as style references. I need 10 options with brief explanations of why each would resonate with stressed parents.",
    avoid: [
      'Being too restrictive and killing creativity',
      'Not providing enough direction',
      'Forgetting to specify your target audience',
    ],
  },

  Analytical: {
    structure: 'Situation Description + Data/Factors + Analysis Request',
    length: 'Medium-Long (200-400 words)',
    tips: [
      'Provide all relevant data points',
      'List factors you want analyzed',
      'Be specific about the type of analysis',
      'Include what decision you're trying to make',
    ],
    example:
      'Analyze whether we should expand our subscription box service from monthly to weekly deliveries. Current data: 2,500 monthly subscribers at $39/box, 15% churn rate, $18 cost per box, 85% customer satisfaction. Survey showed 40% interest in weekly option at $22/box. Consider: operational complexity (we\'d need 4x inventory), customer lifetime value changes, market positioning vs. competitors, and cash flow impact. Structure your analysis around financial, operational, and strategic factors.',
    avoid: [
      'Withholding important data',
      'Not specifying what factors to analyze',
      'Being unclear about the decision context',
    ],
  },

  Comparative: {
    structure: 'Options List + Comparison Criteria + Decision Context',
    length: 'Medium (150-300 words)',
    tips: [
      'List all options clearly',
      'Define specific comparison criteria',
      'Provide context for the decision',
      'Specify what factors matter most',
    ],
    example:
      "Compare three email marketing platforms for our e-commerce store: Mailchimp, Klaviyo, and ConvertKit. We have 15,000 subscribers, send 2 campaigns per week, need advanced segmentation, and have a $200/month budget. Evaluate each on: ease of use, automation capabilities, pricing at scale, integration with Shopify, and deliverability rates. Which would you recommend and why?",
    avoid: [
      'Not defining clear comparison criteria',
      'Leaving out important options',
      'Being vague about your priorities',
    ],
  },

  'Template/Fill-in': {
    structure: 'Template Structure + Variable Definitions + Fill Instructions',
    length: 'Medium (100-300 words)',
    tips: [
      'Create a clear template structure',
      'Define each variable clearly',
      'Provide examples for each variable',
      'Specify the format you want',
    ],
    example:
      "Create a product launch announcement template with these variables: [PRODUCT_NAME], [KEY_FEATURE], [TARGET_AUDIENCE], [LAUNCH_DATE], [CALL_TO_ACTION]. Fill it with: Product Name: 'CloudSync Pro', Key Feature: 'Real-time collaboration across devices', Target Audience: 'Remote teams', Launch Date: 'March 15, 2024', Call to Action: 'Start your free trial'. Format as a press release.",
    avoid: [
      'Using unclear variable names',
      'Not providing examples',
      'Being ambiguous about the format',
    ],
  },

  'Constraint-Based': {
    structure: 'Goal Statement + Constraints List + Requirements',
    length: 'Medium-Long (150-400 words)',
    tips: [
      'State your goal clearly',
      'List all constraints explicitly',
      'Specify what must be included',
      'Define what must be avoided',
    ],
    example:
      "Write a job description for a Senior Product Manager role. Constraints: Must be under 500 words, cannot mention specific salary ranges, must include remote work option, must emphasize collaboration skills, cannot use jargon like 'synergy' or 'disruptive', must include 5 key responsibilities, must mention our company values (innovation, integrity, inclusion). Target audience: experienced PMs with 5+ years in SaaS.",
    avoid: [
      'Being vague about constraints',
      'Forgetting to list requirements',
      'Not being explicit about limitations',
    ],
  },

  'Iterative/Multi-Turn': {
    structure: 'Initial Request + Context + Iteration Instructions',
    length: 'Short-Medium (100-250 words)',
    tips: [
      'Start with your initial request',
      'Provide context for iterations',
      'Specify how you want to refine',
      'Set expectations for multiple rounds',
    ],
    example:
      "I'm developing a mobile app onboarding flow. Start by proposing a 3-screen onboarding sequence. After you provide it, I'll give feedback on each screen and we'll iterate. For the first version, focus on: explaining our core value prop, collecting email for account creation, and requesting notification permissions. Keep it concise (under 30 seconds total).",
    avoid: [
      'Not setting iteration expectations',
      'Being unclear about feedback format',
      'Making the initial request too complex',
    ],
  },

  Transformation: {
    structure: 'Source Format + Target Format + Transformation Rules',
    length: 'Medium (100-300 words)',
    tips: [
      'Clearly describe the source format',
      'Specify the desired target format',
      'List any transformation rules or constraints',
      'Include examples if format is complex',
    ],
    example:
      "Transform this customer feedback into a structured product requirements document. The feedback is in free-form text with complaints and suggestions. Convert it into: Problem Statement, User Impact, Proposed Solution, Priority Level (High/Medium/Low), and Estimated Effort. Maintain all specific details from the original feedback. Here's the feedback: [paste feedback here]",
    avoid: [
      'Not specifying the target format clearly',
      'Losing important information during transformation',
      'Being vague about transformation rules',
    ],
  },
}

/**
 * Get placeholder text based on selected framework
 */
export function getPlaceholderText(framework?: FrameworkType | string): string {
  const placeholders: Record<string, string> = {
    'Role-Based':
      "Describe your situation, then define the expert role you need (e.g., 'You are a senior marketing strategist...'). Be specific about the expertise and context required.",
    'Few-Shot':
      'Start with 2-3 clear examples of what you want, explain why they work, then describe what you need generated in the same style.',
    'Chain-of-Thought':
      'Describe a complex problem or decision, provide all relevant context, then ask for step-by-step reasoning through the solution.',
    Generative:
      'Describe what you want created, your target audience, any style preferences, and how many options you need.',
    Analytical:
      'Provide the situation, relevant data points, and specify what factors you want systematically analyzed.',
    Comparative:
      'List the options you want compared and the criteria for evaluation.',
    'Template/Fill-in':
      'Create a template structure with [VARIABLE] placeholders, then describe how each should be filled.',
    'Constraint-Based':
      'Describe your goal, then list all constraints, requirements, and limitations that must be followed.',
    'Iterative/Multi-Turn':
      'Start with your initial request, provide context, and specify how you want to iterate and refine.',
    Transformation:
      'Describe the source format, specify the target format, and list any transformation rules or constraints.',
  }

  return (
    placeholders[framework || ''] ||
    'Provide your core instructions and context. This is the foundation of your prompt - be as detailed as necessary.'
  )
}

/**
 * Get prompt quality score and feedback
 */
export function getPromptQualityScore(
  prompt: string,
  framework?: FrameworkType | string
): { score: number; feedback: string[] } {
  let score = 0
  const feedback: string[] = []

  // Length check
  if (prompt.length > 100) {
    score += 25
  } else {
    feedback.push('Add more detail and context')
  }

  // Context check
  const promptLower = prompt.toLowerCase()
  if (promptLower.includes('i am') || promptLower.includes('i need') || promptLower.includes("i'm")) {
    score += 25
  } else {
    feedback.push('Include context about your situation')
  }

  // Framework-specific checks
  if (framework === 'Role-Based' && promptLower.includes('you are')) {
    score += 25
  } else if (framework === 'Role-Based') {
    feedback.push("Define the AI's role with 'You are...'")
  }

  if (framework === 'Few-Shot' && (promptLower.includes('example') || promptLower.includes('here are'))) {
    score += 25
  } else if (framework === 'Few-Shot') {
    feedback.push('Start with 2-3 examples of what you want')
  }

  if (framework === 'Chain-of-Thought' && (promptLower.includes('step') || promptLower.includes('reasoning'))) {
    score += 25
  } else if (framework === 'Chain-of-Thought') {
    feedback.push('Ask for step-by-step reasoning')
  }

  if (framework === 'Generative' && (promptLower.includes('create') || promptLower.includes('generate'))) {
    score += 25
  } else if (framework === 'Generative') {
    feedback.push('Be clear about what you want created')
  }

  if (framework === 'Analytical' && (promptLower.includes('analyze') || promptLower.includes('data'))) {
    score += 25
  } else if (framework === 'Analytical') {
    feedback.push('Include data points and specify what to analyze')
  }

  // Specificity check
  if (prompt.length > 200) {
    score += 25
  } else if (prompt.length > 100) {
    score += 15
  }

  return { score, feedback }
}

