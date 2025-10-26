# Low-Level Security Protection

This document outlines the low-level security measures implemented to protect against sophisticated attacks.

## Vulnerabilities Addressed

### 1. ReDoS (Regular Expression Denial of Service)
**Attack:** Malicious regex patterns cause catastrophic backtracking, consuming CPU.
**Protection:** 
- Regex input sanitization with length limits
- Escaped special characters
- Safe regex patterns only

### 2. JSON Bomb Attack
**Attack:** Deeply nested or large JSON payloads cause memory exhaustion.
**Protection:**
- JSON size limits (1MB max)
- Complexity validation (max depth: 10)
- Array length limits (1000 items max)

### 3. Memory Exhaustion
**Attack:** Large arrays or strings consume all available memory.
**Protection:**
- Array bounds validation (max 100 items per trade)
- String length limits (10,000 chars max)
- Content-Length header validation

### 4. Unicode Normalization Attack
**Attack:** Homograph attacks using similar-looking Unicode characters.
**Protection:**
- NFC normalization
- Zero-width character removal
- Null byte sanitization
- Printable character validation

### 5. Timing Attacks
**Attack:** Response time differences reveal sensitive information.
**Protection:**
- Constant-time string comparison using `timingSafeEqual`
- No early returns in crypto operations
- Consistent error messages

### 6. HTTP Parameter Pollution
**Attack:** Duplicate query parameters bypass validation.
**Protection:**
- Single parameter enforcement
- Duplicate parameter rejection
- Parameter validation

### 7. Integer Overflow
**Attack:** Large numbers cause overflow and unexpected behavior.
**Protection:**
- Safe integer parsing with bounds checking
- MIN_SAFE_INTEGER and MAX_SAFE_INTEGER limits
- NaN and Infinity validation

### 8. Prototype Pollution
**Attack:** Manipulating `__proto__` to inject properties.
**Protection:**
- Safe deep cloning that skips prototype properties
- Property key validation
- No dynamic property access from user input

## Security Functions

### `sanitizeRegexInput(input: string)`
Escapes special regex characters and limits length to prevent ReDoS.

### `safeJsonParse<T>(json: string, maxSize?: number)`
Parses JSON with size and complexity validation.

### `constantTimeCompare(a: string, b: string)`
Compares strings in constant time to prevent timing attacks.

### `normalizeUnicode(input: string)`
Normalizes Unicode and removes dangerous characters.

### `safeParseInt(value, min?, max?)`
Safely parses integers with bounds checking.

### `getSingleParam(url: URL, param: string)`
Gets a single query parameter, rejecting duplicates.

### `validateArrayBounds<T>(arr: T[], maxLength?)`
Validates array length to prevent memory exhaustion.

### `safeDeepClone<T>(obj: T)`
Deep clones objects while preventing prototype pollution.

## Best Practices

1. **Always validate input sizes** before processing
2. **Use safe parsing functions** instead of native JSON.parse
3. **Normalize Unicode** for all user-generated text
4. **Validate array bounds** before iteration
5. **Use constant-time comparisons** for sensitive data
6. **Sanitize regex inputs** before using in patterns
7. **Check for duplicate parameters** in query strings
8. **Validate numeric bounds** to prevent overflow

## Testing

Run security tests:
\`\`\`bash
npm run test:security
\`\`\`

## Monitoring

Monitor for attack attempts:
- Check logs for "JSON payload too large" errors
- Watch for "Multiple values detected" warnings
- Monitor CPU usage for ReDoS attempts
- Track memory usage for JSON bomb attacks
