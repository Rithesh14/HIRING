import { VM } from 'vm2';
import Docker from 'dockerode';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

const docker = new Docker();

interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage?: number;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
}

interface TestCase {
  input: any;
  expectedOutput: any;
  description?: string;
}

interface CodeExecutionOptions {
  language: string;
  code: string;
  testCases: TestCase[];
  timeLimit?: number;
  memoryLimit?: string;
}

export class CodeExecutionService {
  private static readonly SUPPORTED_LANGUAGES = ['javascript', 'python', 'java', 'cpp'];
  private static readonly DEFAULT_TIME_LIMIT = 30000; // 30 seconds
  private static readonly DEFAULT_MEMORY_LIMIT = '128m';

  static async executeCode(options: CodeExecutionOptions): Promise<ExecutionResult> {
    const { language, code, testCases, timeLimit = this.DEFAULT_TIME_LIMIT, memoryLimit = this.DEFAULT_MEMORY_LIMIT } = options;

    if (!this.SUPPORTED_LANGUAGES.includes(language)) {
      throw new AppError(`Unsupported language: ${language}`, 400);
    }

    const startTime = Date.now();

    try {
      if (process.env.DOCKER_ENABLED === 'true') {
        return await this.executeInDocker(language, code, testCases, timeLimit, memoryLimit);
      } else {
        return await this.executeInVM(language, code, testCases, timeLimit);
      }
    } catch (error) {
      logger.error('Code execution failed:', error);
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime: Date.now() - startTime,
        status: 'ERROR'
      };
    }
  }

  private static async executeInVM(
    language: string, 
    code: string, 
    testCases: TestCase[], 
    timeLimit: number
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    if (language !== 'javascript') {
      throw new AppError('VM execution only supports JavaScript', 400);
    }

    try {
      const vm = new VM({
        timeout: timeLimit,
        sandbox: {
          console: {
            log: (...args: any[]) => args.join(' '),
            error: (...args: any[]) => args.join(' ')
          }
        }
      });

      const results: any[] = [];
      let allPassed = true;

      for (const testCase of testCases) {
        try {
          // Create a wrapper function that includes the test case
          const wrappedCode = `
            ${code}
            
            // Execute the main function with test input
            const result = (function() {
              ${this.generateTestRunner(testCase.input)}
            })();
            
            result;
          `;

          const result = vm.run(wrappedCode);
          const passed = this.compareResults(result, testCase.expectedOutput);
          
          results.push({
            input: testCase.input,
            output: result,
            expected: testCase.expectedOutput,
            passed,
            description: testCase.description
          });

          if (!passed) allPassed = false;
        } catch (error) {
          results.push({
            input: testCase.input,
            output: null,
            expected: testCase.expectedOutput,
            passed: false,
            error: error instanceof Error ? error.message : 'Runtime error',
            description: testCase.description
          });
          allPassed = false;
        }
      }

      return {
        output: JSON.stringify(results, null, 2),
        executionTime: Date.now() - startTime,
        status: allPassed ? 'SUCCESS' : 'ERROR'
      };
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'VM execution failed',
        executionTime: Date.now() - startTime,
        status: 'ERROR'
      };
    }
  }

  private static async executeInDocker(
    language: string,
    code: string,
    testCases: TestCase[],
    timeLimit: number,
    memoryLimit: string
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      const image = this.getDockerImage(language);
      const command = this.getExecutionCommand(language, code, testCases);

      const container = await docker.createContainer({
        Image: image,
        Cmd: command,
        WorkingDir: '/app',
        HostConfig: {
          Memory: this.parseMemoryLimit(memoryLimit),
          CpuQuota: 50000, // 50% CPU
          NetworkMode: 'none', // No network access
          ReadonlyRootfs: true,
          Tmpfs: {
            '/tmp': 'rw,noexec,nosuid,size=100m'
          }
        },
        AttachStdout: true,
        AttachStderr: true
      });

      await container.start();

      // Set timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Execution timeout')), timeLimit);
      });

      const executionPromise = container.wait();

      try {
        await Promise.race([executionPromise, timeoutPromise]);
      } catch (error) {
        await container.kill();
        throw error;
      }

      const logs = await container.logs({
        stdout: true,
        stderr: true
      });

      const output = logs.toString();
      await container.remove();

      return {
        output,
        executionTime: Date.now() - startTime,
        status: 'SUCCESS'
      };
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Docker execution failed',
        executionTime: Date.now() - startTime,
        status: error instanceof Error && error.message.includes('timeout') ? 'TIMEOUT' : 'ERROR'
      };
    }
  }

  private static getDockerImage(language: string): string {
    const images = {
      javascript: 'node:18-alpine',
      python: 'python:3.11-alpine',
      java: 'openjdk:17-alpine',
      cpp: 'gcc:latest'
    };
    return images[language as keyof typeof images];
  }

  private static getExecutionCommand(language: string, code: string, testCases: TestCase[]): string[] {
    switch (language) {
      case 'javascript':
        return ['node', '-e', this.wrapJavaScriptCode(code, testCases)];
      case 'python':
        return ['python', '-c', this.wrapPythonCode(code, testCases)];
      case 'java':
        return ['sh', '-c', this.wrapJavaCode(code, testCases)];
      case 'cpp':
        return ['sh', '-c', this.wrapCppCode(code, testCases)];
      default:
        throw new AppError(`Unsupported language: ${language}`, 400);
    }
  }

  private static wrapJavaScriptCode(code: string, testCases: TestCase[]): string {
    return `
      ${code}
      
      const testCases = ${JSON.stringify(testCases)};
      const results = [];
      
      for (const testCase of testCases) {
        try {
          ${this.generateTestRunner('testCase.input')}
          const result = runTest();
          results.push({
            input: testCase.input,
            output: result,
            expected: testCase.expectedOutput,
            passed: JSON.stringify(result) === JSON.stringify(testCase.expectedOutput)
          });
        } catch (error) {
          results.push({
            input: testCase.input,
            output: null,
            expected: testCase.expectedOutput,
            passed: false,
            error: error.message
          });
        }
      }
      
      console.log(JSON.stringify(results, null, 2));
    `;
  }

  private static wrapPythonCode(code: string, testCases: TestCase[]): string {
    return `
import json
import sys

${code}

test_cases = ${JSON.stringify(testCases)}
results = []

for test_case in test_cases:
    try:
        # This would need to be customized based on the function signature
        result = solution(test_case['input'])
        results.append({
            'input': test_case['input'],
            'output': result,
            'expected': test_case['expectedOutput'],
            'passed': result == test_case['expectedOutput']
        })
    except Exception as e:
        results.append({
            'input': test_case['input'],
            'output': None,
            'expected': test_case['expectedOutput'],
            'passed': False,
            'error': str(e)
        })

print(json.dumps(results, indent=2))
    `;
  }

  private static wrapJavaCode(code: string, testCases: TestCase[]): string {
    return `
echo '${code}' > Solution.java && 
javac Solution.java && 
java Solution
    `;
  }

  private static wrapCppCode(code: string, testCases: TestCase[]): string {
    return `
echo '${code}' > solution.cpp && 
g++ -o solution solution.cpp && 
./solution
    `;
  }

  private static generateTestRunner(input: string): string {
    return `
      function runTest() {
        const input = ${typeof input === 'string' ? `"${input}"` : JSON.stringify(input)};
        // This assumes the main function is available in scope
        // You might need to customize this based on the problem
        if (typeof twoSum === 'function') return twoSum(...(Array.isArray(input) ? input : [input]));
        if (typeof solution === 'function') return solution(...(Array.isArray(input) ? input : [input]));
        if (typeof main === 'function') return main(...(Array.isArray(input) ? input : [input]));
        throw new Error('No main function found');
      }
    `;
  }

  private static compareResults(actual: any, expected: any): boolean {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

  private static parseMemoryLimit(limit: string): number {
    const match = limit.match(/^(\d+)([kmg]?)$/i);
    if (!match) return 128 * 1024 * 1024; // Default 128MB

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'k': return value * 1024;
      case 'm': return value * 1024 * 1024;
      case 'g': return value * 1024 * 1024 * 1024;
      default: return value;
    }
  }
}