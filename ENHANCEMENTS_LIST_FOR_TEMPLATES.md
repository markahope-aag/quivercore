# Enhancement List for Template Imports

This document lists all available enhancements that can be used when importing templates into QuiverCore.

---

## 1. Enhancement Techniques (Basic)

These are the four main enhancement techniques that can be applied to prompts:

### 1.1 Verbalized Sampling
- **Description:** Use explicit sampling instructions in the prompt
- **Use Case:** Generate multiple diverse responses with probability estimates
- **Configuration Options:**
  - Distribution Type: `broad_spectrum`, `rarity_hunt`, `balanced_categories`
  - Number of Responses: 3, 5, 7, or custom number
  - Include Probability Reasoning: true/false
  - Anti-Typicality Mode: true/false
  - Custom Constraints: string
  - Rarity Threshold: 0.15, 0.1, or 0.05 (for rarity_hunt)
  - Categories/Dimensions: array of strings (for balanced_categories)

### 1.2 Temperature Control
- **Description:** Adjust randomness/creativity in responses
- **Use Case:** Control the creativity level of AI responses
- **Note:** This is typically handled at the API level, not in prompt text

### 1.3 System Prompting
- **Description:** Use system-level instructions to set behavior
- **Use Case:** Set overall behavior and context for the AI
- **Note:** This is typically handled at the API level, not in prompt text

### 1.4 Token Optimization
- **Description:** Optimize prompt length and token usage
- **Use Case:** Reduce costs and improve response times
- **Note:** This is typically handled automatically by the system

---

## 2. Advanced Enhancements

These are detailed enhancement configurations that can be included in templates:

### 2.1 Role Enhancement
**Type:** `roleEnhancement`

**Options:**
- `enabled`: boolean
- `type`: `'expert'` | `'persona'` | `'perspective'` | `'none'`
- `expertise`: string (for expert type)
- `customRole`: string (for persona type)
- `perspective`: string (for perspective type)
- `authorityLevel`: `'advisory'` | `'consultant'` | `'expert'` | `'master'`
- `experienceYears`: number (optional)
- `contextSetting`: string (optional)

**Example:**
```json
{
  "roleEnhancement": {
    "enabled": true,
    "type": "expert",
    "expertise": "Technical Writing and Software Documentation",
    "authorityLevel": "advisory"
  }
}
```

### 2.2 Format Controller
**Type:** `formatController`

**Options:**
- `enabled`: boolean
- `type`: `'structured'` | `'markdown'` | `'list'` | `'table'` | `'code'` | `'custom'` | `'none'`
- `structuredFormat`: `'json'` | `'yaml'` | `'xml'` (for structured type)
- `customFormat`: string (for custom type)
- `includeExamples`: boolean

**Example:**
```json
{
  "formatController": {
    "enabled": true,
    "type": "markdown"
  }
}
```

### 2.3 Smart Constraints
**Type:** `smartConstraints`

**Sub-constraints:**

#### 2.3.1 Length Constraints
- `length.enabled`: boolean
- `length.min`: number
- `length.max`: number
- `length.unit`: `'words'` | `'characters'`

#### 2.3.2 Tone & Style
- `tone.enabled`: boolean
- `tone.tones`: array of strings
  - Options: `'Professional'`, `'Casual'`, `'Formal'`, `'Friendly'`, `'Technical'`, `'Academic'`, `'Conversational'`, `'Persuasive'`, `'Empathetic'`, `'Authoritative'`

#### 2.3.3 Target Audience
- `audience.enabled`: boolean
- `audience.target`: string
  - Options: `'General Public'`, `'Experts/Specialists'`, `'Beginners'`, `'Executives/Leadership'`, `'Technical Teams'`, `'Students'`, `'Customers'`, `'Stakeholders'`

#### 2.3.4 Content Exclusions
- `exclusions.enabled`: boolean
- `exclusions.items`: array of strings

#### 2.3.5 Must Include
- `requirements.enabled`: boolean
- `requirements.items`: array of strings

#### 2.3.6 Complexity Level
- `complexity.enabled`: boolean
- `complexity.level`: `'simple'` | `'moderate'` | `'advanced'` | `'expert'`

**Example:**
```json
{
  "smartConstraints": {
    "length": {
      "enabled": true,
      "min": 500,
      "max": 2000,
      "unit": "words"
    },
    "tone": {
      "enabled": true,
      "tones": ["Professional", "Technical", "Clear"]
    },
    "audience": {
      "enabled": true,
      "target": "Software developers and technical professionals"
    },
    "requirements": {
      "enabled": true,
      "items": ["Code examples", "Clear explanations", "Step-by-step instructions"]
    },
    "complexity": {
      "enabled": true,
      "level": "advanced"
    }
  }
}
```

### 2.4 Reasoning Scaffold
**Type:** `reasoningScaffold`

**Options:**
- `enabled`: boolean
- `type`: `'analysis'` | `'decision'` | `'problem_solving'` | `'critical_thinking'` | `'creative'` | `'none'`
- `customFramework`: string (optional)
- `showWorking`: boolean

**Example:**
```json
{
  "reasoningScaffold": {
    "enabled": true,
    "type": "analysis",
    "showWorking": true
  }
}
```

### 2.5 Conversation Flow
**Type:** `conversationFlow`

**Options:**
- `type`: `'single'` | `'iterative'` | `'clarifying'` | `'multi_step'` | `'collaborative'`
- `context`: string (optional)
- `allowClarification`: boolean

**Example:**
```json
{
  "conversationFlow": {
    "type": "iterative",
    "allowClarification": true
  }
}
```

---

## 3. Complete Enhancement Configuration Example

Here's a complete example of all enhancements configured together:

```json
{
  "enhancement_technique": "Verbalized Sampling, System Prompting, Token Optimization",
  "vsEnhancement": {
    "enabled": true,
    "numberOfResponses": 5,
    "distributionType": "broad_spectrum",
    "includeProbabilityReasoning": false,
    "antiTypicalityEnabled": true,
    "customConstraints": ""
  },
  "advancedEnhancements": {
    "roleEnhancement": {
      "enabled": true,
      "type": "expert",
      "expertise": "Technical Writing and Software Documentation",
      "authorityLevel": "advisory"
    },
    "formatController": {
      "enabled": true,
      "type": "markdown"
    },
    "smartConstraints": {
      "length": {
        "enabled": true,
        "min": 500,
        "max": 2000,
        "unit": "words"
      },
      "tone": {
        "enabled": true,
        "tones": ["Professional", "Technical"]
      },
      "audience": {
        "enabled": true,
        "target": "Software developers"
      },
      "requirements": {
        "enabled": true,
        "items": ["Code examples", "Clear explanations"]
      },
      "complexity": {
        "enabled": true,
        "level": "advanced"
      }
    },
    "reasoningScaffold": {
      "enabled": false,
      "type": "none",
      "showWorking": false
    },
    "conversationFlow": {
      "type": "single",
      "allowClarification": false
    }
  }
}
```

---

## 4. Enhancement Presets

The system includes several pre-configured enhancement presets that can be used as templates:

### 4.1 Technical Documentation
- Role: Expert in Technical Writing
- Format: Markdown
- Constraints: 500-2000 words, Professional/Technical tone
- Audience: Software developers
- Requirements: Code examples, clear explanations

### 4.2 Creative Writing
- Role: Creative writer persona
- Format: Custom
- Constraints: Flexible length, Creative/Engaging tone
- Reasoning: Creative exploration scaffold

### 4.3 Business Strategy
- Role: Business strategy expert
- Format: Structured (JSON/YAML)
- Constraints: Executive audience, Professional tone
- Reasoning: Decision matrix scaffold

### 4.4 Marketing Content
- Role: Marketing specialist
- Format: Markdown
- Constraints: Persuasive tone, Customer audience
- Requirements: Call-to-action, benefits

### 4.5 Research & Analysis
- Role: Research analyst
- Format: Structured
- Constraints: Academic tone, Expert audience
- Reasoning: Analysis framework scaffold

---

## 5. Usage in Templates

When importing templates, you can include enhancement configurations in the template metadata:

```json
{
  "title": "API Documentation Template",
  "description": "Template for creating API documentation",
  "enhancement_technique": "Verbalized Sampling, System Prompting",
  "variables": {
    "apiName": "The name of the API",
    "endpoint": "The API endpoint"
  },
  "enhancements": {
    "vsEnhancement": { ... },
    "advancedEnhancements": { ... }
  }
}
```

---

## 6. Framework Compatibility

Some enhancements work better with certain frameworks:

- **Role-Based Framework:** Works well with Role Enhancement, System Prompting
- **Few-Shot Framework:** Works well with Format Controller, Token Optimization
- **Chain-of-Thought Framework:** Works well with Reasoning Scaffold, System Prompting
- **Template/Fill-in Framework:** Works well with Format Controller, Smart Constraints
- **Constraint-Based Framework:** Works well with Smart Constraints (may conflict with Verbalized Sampling)
- **Iterative/Multi-Turn Framework:** Works well with Conversation Flow, System Prompting
- **Comparative Framework:** Works well with Reasoning Scaffold, Format Controller
- **Generative Framework:** Works well with Verbalized Sampling, Temperature Control
- **Analytical Framework:** Works well with Reasoning Scaffold, Smart Constraints
- **Transformation Framework:** Works well with Format Controller, Smart Constraints

---

## 7. Quick Reference

### Enhancement Techniques (Comma-separated string)
- `"Verbalized Sampling"`
- `"Temperature Control"`
- `"System Prompting"`
- `"Token Optimization"`

### Advanced Enhancement Types
- `roleEnhancement`
- `formatController`
- `smartConstraints`
- `reasoningScaffold`
- `conversationFlow`

### VS Distribution Types
- `broad_spectrum`
- `rarity_hunt`
- `balanced_categories`

### Role Enhancement Types
- `expert`
- `persona`
- `perspective`
- `none`

### Format Controller Types
- `structured`
- `markdown`
- `list`
- `table`
- `code`
- `custom`
- `none`

### Reasoning Scaffold Types
- `analysis`
- `decision`
- `problem_solving`
- `critical_thinking`
- `creative`
- `none`

### Conversation Flow Types
- `single`
- `iterative`
- `clarifying`
- `multi_step`
- `collaborative`

---

**Last Updated:** 2025-01-17  
**For Use In:** Template imports, prompt builder configuration, API integrations

