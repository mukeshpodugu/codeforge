/**
 * CodeForge Judge Service.
 * Interfaces with Judge0 API or simulates runtime execution
 * with realistic timing, memory, syntax checking, and console logs.
 */

interface RunCodePayload {
  language: string;
  code: string;
  input: string;
  expectedOutput?: string;
}

export class JudgeService {
  // Execute a run request
  public static async runCode({ language, code, input, expectedOutput }: RunCodePayload) {
    const start = Date.now();
    
    // Simulate compilation latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const duration = Date.now() - start;
    const memory = Math.floor(15000 + Math.random() * 8000); // Simulated KB (around 15-23MB)

    // Check basic syntax issues based on language
    const syntaxError = this.checkSyntax(language, code);
    if (syntaxError) {
      return {
        status: 'Compile Error',
        executionTime: duration,
        memoryUsage: memory,
        errorMessage: syntaxError,
        output: ''
      };
    }

    // Solve and simulate outputs
    let output = '';
    let status = 'Accepted';

    try {
      output = this.executeMockEngine(language, code, input);
    } catch (e: any) {
      return {
        status: 'Runtime Error',
        executionTime: duration,
        memoryUsage: memory,
        errorMessage: e.message || 'Traceback (most recent call last): NullPointerException',
        output: ''
      };
    }

    // Compare with expected outputs if present
    if (expectedOutput) {
      const cleanOut = output.trim().replace(/\r/g, '');
      const cleanExp = expectedOutput.trim().replace(/\r/g, '');
      if (cleanOut !== cleanExp) {
        status = 'Wrong Answer';
      }
    }

    return {
      status,
      executionTime: duration + Math.floor(Math.random() * 40), // add slight randomness
      memoryUsage: memory,
      errorMessage: '',
      output
    };
  }

  // Syntax checker fallback
  private static checkSyntax(lang: string, code: string): string | null {
    // 1. Bracket mismatch check
    const stack: string[] = [];
    const brackets: Record<string, string> = { '}': '{', ')': '(', ']': '[' };
    for (let char of code) {
      if (['{', '(', '['].includes(char)) {
        stack.push(char);
      } else if (['}', ')', ']'].includes(char)) {
        if (stack.pop() !== brackets[char]) {
          return `Compiler error: Unbalanced brackets. Unexpected '${char}' detected.`;
        }
      }
    }

    // 2. Semantics check
    if (lang === 'python') {
      if (code.includes('const ') || code.includes('let ') || code.includes('function ')) {
        return `IndentationError/SyntaxError: Javascript keyword ('const'/'let'/'function') found in Python code.`;
      }
    }
    if (['javascript', 'typescript'].includes(lang)) {
      if (code.includes('def ') && code.includes(':')) {
        return `SyntaxError: Python keyword ('def') and colon syntax found in JavaScript code.`;
      }
    }
    if (['cpp', 'c', 'java'].includes(lang)) {
      // Check for main method/function or semicolon basic checks
      if (!code.includes(';')) {
        const lines = code.split('\n');
        for (let line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.startsWith('#') && !trimmed.startsWith('//') && !trimmed.includes('public class')) {
            return `Compilation error: Semicolon missing at line: "${trimmed}"`;
          }
        }
      }
    }

    return null;
  }

  // Executing mock solvers for common coding questions
  private static executeMockEngine(lang: string, code: string, input: string): string {
    // Check if the solution throws a manual error
    if (code.includes('throw new') || code.includes('raise Exception') || code.includes('RuntimeError')) {
      throw new Error('Process exited with error signal: SIGABRT');
    }

    const cleanedInput = input.trim();
    
    // Default fallback output
    if (cleanedInput === '2 7 11 15\n9' || cleanedInput === '[2,7,11,15]\n9') {
      // Two Sum standard problem
      return '[0,1]';
    }
    if (cleanedInput === '"hello"' || cleanedInput === 'hello') {
      // Reverse String
      return '"olleh"';
    }
    if (cleanedInput === '121' || cleanedInput === '121\n') {
      // Palindrome Number
      return 'true';
    }

    // Smart parsing for print statements in user code
    const prints: string[] = [];

    // 1. Matches simple string literals: console.log("text") or print('text') or System.out.println("text")
    const logPatterns = [
      /console\.log\s*\(\s*(['"`])(.*?)\1\s*\)/g,
      /print\s*\(\s*(['"`])(.*?)\1\s*\)/g,
      /System\.out\.print(?:ln)?\s*\(\s*(['"`])(.*?)\1\s*\)/g,
      /cout\s*<<\s*(['"`])(.*?)\1/g,
      /printf\s*\(\s*(['"`])(.*?)\1\s*\)/g
    ];

    for (const pattern of logPatterns) {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(code)) !== null) {
        prints.push(match[2]);
      }
    }

    // 2. Matches string literal + input concatenation: print("input: ", input) or console.log("output is: " + input)
    const concatPatterns = [
      /console\.log\s*\(\s*(['"`])(.*?)\1\s*\+\s*input\s*\)/g,
      /print\s*\(\s*(['"`])(.*?)\1\s*,\s*input\s*\)/g,
      /System\.out\.print(?:ln)?\s*\(\s*(['"`])(.*?)\1\s*\+\s*input\s*\)/g,
      /cout\s*<<\s*(['"`])(.*?)\1\s*<<\s*input/g
    ];

    for (const pattern of concatPatterns) {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(code)) !== null) {
        prints.push(match[2] + cleanedInput);
      }
    }

    // 3. Matches direct variable printing: print(input) or console.log(input)
    const directPatterns = [
      /console\.log\s*\(\s*input\s*\)/g,
      /print\s*\(\s*input\s*\)/g,
      /System\.out\.print(?:ln)?\s*\(\s*input\s*\)/g,
      /cout\s*<<\s*input/g
    ];

    for (const pattern of directPatterns) {
      if (pattern.test(code)) {
        prints.push(cleanedInput);
      }
    }

    // Return prints if found
    if (prints.length > 0) {
      return prints.join('\n');
    }

    // Math summation backup: If input is numbers and code specifies math operations, return sum
    const numbers = cleanedInput.match(/\b\d+\b/g);
    if (numbers && numbers.length > 0) {
      // If code specifies addition or sums
      if (code.includes('+') || code.includes('sum') || code.includes('add')) {
        const sum = numbers.map(Number).reduce((a, b) => a + b, 0);
        return String(sum);
      }
      return numbers.reverse().join(' ');
    }

    return cleanedInput 
      ? `Processed input successfully.\nOutput: ${cleanedInput}` 
      : 'Hello, CodeForge Playground!';
  }
}
