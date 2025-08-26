import { Feature } from '@/types/Feature';

export const mockFeatures: Feature[] = [
  {
    featureCode: "valid_length",
    name: "Valid Length Validator",
    category: "Text Validation",
    description: "Validates that text input meets specified length requirements. Ensures text is within minimum and maximum character limits to prevent truncation issues and maintain data quality.",
    exampleInput: "This is a sample text that needs length validation for proper processing.",
    exampleOutput: "Text validated: 78 characters (within range: 10-100)",
    repoDependency: "guardrails-ai/guardrails",
    referenceLink: "https://hub.guardrailsai.com/validator/guardrails/valid_length",
    tags: ["validation", "text", "length", "quality"],
    standardInputs: ["text", "document"],
    defaultOutputPlaceholder: "validated_text"
  },
  {
    featureCode: "toxicity_free",
    name: "Toxicity Detection",
    category: "Content Safety",
    description: "Detects and filters toxic content from user inputs. Uses advanced ML models to identify hate speech, harassment, threats, and other harmful content to ensure safe user interactions.",
    exampleInput: "You're such an amazing person and I really appreciate your help!",
    exampleOutput: "Content approved: No toxicity detected (confidence: 0.98)",
    repoDependency: "perspective-api/perspective-api-client",
    referenceLink: "https://hub.guardrailsai.com/validator/guardrails/toxicity_free",
    tags: ["safety", "content", "moderation", "ml"],
    standardInputs: ["text", "messages"],
    defaultOutputPlaceholder: "safe_content"
  },
  {
    featureCode: "json_schema",
    name: "JSON Schema Validator",
    category: "Data Validation",
    description: "Validates JSON data against predefined schemas. Ensures data structure integrity, type safety, and compliance with API specifications before processing.",
    exampleInput: '{"name": "John", "age": 30, "email": "john@example.com"}',
    exampleOutput: "Schema validation passed: All fields valid",
    repoDependency: "python-jsonschema/jsonschema",
    referenceLink: "https://hub.guardrailsai.com/validator/guardrails/json_schema",
    tags: ["validation", "json", "schema", "api"],
    standardInputs: ["json", "document"],
    defaultOutputPlaceholder: "validated_json"
  },
  {
    featureCode: "sql_injection",
    name: "SQL Injection Guard",
    category: "Security",
    description: "Prevents SQL injection attacks by analyzing and sanitizing database queries. Detects malicious patterns and ensures query safety before execution.",
    exampleInput: "SELECT * FROM users WHERE id = '1 OR 1=1'",
    exampleOutput: "Security alert: Potential SQL injection detected and blocked",
    repoDependency: "sqlparse/sqlparse",
    referenceLink: "https://hub.guardrailsai.com/validator/guardrails/sql_injection",
    tags: ["security", "sql", "injection", "database"],
    standardInputs: ["sql", "code"],
    defaultOutputPlaceholder: "safe_sql"
  },
  {
    featureCode: "pii_detection",
    name: "PII Data Detection",
    category: "Privacy",
    description: "Identifies and masks personally identifiable information (PII) in text. Protects sensitive data like social security numbers, credit cards, emails, and phone numbers.",
    exampleInput: "My SSN is 123-45-6789 and email is user@domain.com",
    exampleOutput: "PII detected and masked: My SSN is ***-**-**** and email is ***@***.***",
    repoDependency: "microsoft/presidio",
    referenceLink: "https://hub.guardrailsai.com/validator/guardrails/pii_detection",
    tags: ["privacy", "pii", "masking", "gdpr"],
    standardInputs: ["text", "document", "messages"],
    defaultOutputPlaceholder: "anonymized_text"
  },
  {
    featureCode: "code_quality",
    name: "Code Quality Analyzer",
    category: "Code Analysis",
    description: "Analyzes code quality metrics including complexity, maintainability, and best practices. Provides detailed reports and suggestions for improvement.",
    exampleInput: "function calculateTotal(items) { let total = 0; for(let i=0; i<items.length; i++) { total += items[i].price; } return total; }",
    exampleOutput: "Quality score: 7.5/10. Suggestions: Use array methods, add type annotations",
    repoDependency: "pylint-dev/pylint",
    referenceLink: "https://hub.guardrailsai.com/validator/guardrails/code_quality",
    tags: ["code", "quality", "analysis", "linting"],
    standardInputs: ["code"],
    defaultOutputPlaceholder: "quality_report"
  },
  {
    featureCode: "regex_match",
    name: "Regex Pattern Matcher",
    category: "Text Processing",
    description: "Validates text against custom regular expression patterns. Useful for format validation, data extraction, and pattern matching across various text inputs.",
    exampleInput: "Email: contact@company.com, Phone: (555) 123-4567",
    exampleOutput: "Matches found: 1 email, 1 phone number extracted",
    repoDependency: "python/re",
    referenceLink: "https://hub.guardrailsai.com/validator/guardrails/regex_match",
    tags: ["regex", "pattern", "matching", "extraction"],
    standardInputs: ["text", "document"],
    defaultOutputPlaceholder: "extracted_data"
  },
  {
    featureCode: "sentiment_analysis",
    name: "Sentiment Analyzer",
    category: "Text Analysis",
    description: "Analyzes emotional tone and sentiment in text content. Provides positive, negative, or neutral classification with confidence scores for content understanding.",
    exampleInput: "I absolutely love this new feature! It makes everything so much easier.",
    exampleOutput: "Sentiment: Positive (confidence: 0.94), Emotion: Joy (0.87)",
    repoDependency: "huggingface/transformers",
    referenceLink: "https://hub.guardrailsai.com/validator/guardrails/sentiment",
    tags: ["sentiment", "emotion", "analysis", "nlp"],
    standardInputs: ["text", "messages"],
    defaultOutputPlaceholder: "sentiment_score"
  }
];