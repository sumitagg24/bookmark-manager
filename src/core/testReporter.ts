/**
 * Test Reporter - Generate comprehensive test reports
 */

export interface TestResult {
  testId: string;
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  stackTrace?: string;
  screenshot?: string;
}

export interface TestResults {
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage: number;
  failures: TestResult[];
  timestamp: Date;
}

export interface CoverageReport {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface TrendReport {
  passRateOverTime: DataPoint[];
  coverageOverTime: DataPoint[];
  performanceOverTime: DataPoint[];
  flakyTests: FlakyTest[];
}

export interface DataPoint {
  timestamp: Date;
  value: number;
}

export interface FlakyTest {
  testId: string;
  testName: string;
  failureRate: number;
  lastFailure: Date;
}

export interface CIReport {
  format: 'junit' | 'github' | 'gitlab';
  content: string;
}

export class TestReporter {
  /**
   * Generate HTML report
   */
  generateHTML(results: TestResults): string {
    const failureDetails = results.failures
      .map(
        (failure) => `
      <div class="failure">
        <h4>${failure.testName}</h4>
        <p>${failure.error}</p>
        ${failure.stackTrace ? `<pre>${failure.stackTrace}</pre>` : ''}
        ${failure.screenshot ? `<img src="${failure.screenshot}" alt="Screenshot" />` : ''}
      </div>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .passed { color: green; }
          .failed { color: red; }
          .failure { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
          pre { background: #f0f0f0; padding: 10px; overflow-x: auto; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <h1>Test Report</h1>
        <div class="summary">
          <p><strong>Passed:</strong> <span class="passed">${results.passed}</span></p>
          <p><strong>Failed:</strong> <span class="failed">${results.failed}</span></p>
          <p><strong>Skipped:</strong> ${results.skipped}</p>
          <p><strong>Duration:</strong> ${results.duration}ms</p>
          <p><strong>Coverage:</strong> ${results.coverage}%</p>
          <p><strong>Timestamp:</strong> ${results.timestamp.toISOString()}</p>
        </div>
        ${failureDetails ? `<h2>Failures</h2>${failureDetails}` : ''}
      </body>
      </html>
    `;
  }

  /**
   * Generate coverage report
   */
  generateCoverage(coverage: CoverageReport): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Coverage Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f5f5f5; }
          .high { color: green; }
          .medium { color: orange; }
          .low { color: red; }
        </style>
      </head>
      <body>
        <h1>Coverage Report</h1>
        <table>
          <tr>
            <th>Metric</th>
            <th>Coverage</th>
          </tr>
          <tr>
            <td>Statements</td>
            <td class="${coverage.statements >= 80 ? 'high' : coverage.statements >= 60 ? 'medium' : 'low'}">
              ${coverage.statements}%
            </td>
          </tr>
          <tr>
            <td>Branches</td>
            <td class="${coverage.branches >= 80 ? 'high' : coverage.branches >= 60 ? 'medium' : 'low'}">
              ${coverage.branches}%
            </td>
          </tr>
          <tr>
            <td>Functions</td>
            <td class="${coverage.functions >= 80 ? 'high' : coverage.functions >= 60 ? 'medium' : 'low'}">
              ${coverage.functions}%
            </td>
          </tr>
          <tr>
            <td>Lines</td>
            <td class="${coverage.lines >= 80 ? 'high' : coverage.lines >= 60 ? 'medium' : 'low'}">
              ${coverage.lines}%
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Generate trend report
   */
  generateTrends(history: TestResult[]): TrendReport {
    const passRateOverTime: DataPoint[] = [];
    const coverageOverTime: DataPoint[] = [];
    const performanceOverTime: DataPoint[] = [];
    const flakyTests: FlakyTest[] = [];

    // Group by date
    const byDate = new Map<string, TestResult[]>();
    history.forEach((result) => {
      const date = new Date(result.duration).toDateString();
      if (!byDate.has(date)) {
        byDate.set(date, []);
      }
      byDate.get(date)!.push(result);
    });

    // Calculate trends
    byDate.forEach((results, dateStr) => {
      const date = new Date(dateStr);
      const passed = results.filter((r) => r.passed).length;
      const passRate = (passed / results.length) * 100;

      passRateOverTime.push({
        timestamp: date,
        value: passRate,
      });

      const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      performanceOverTime.push({
        timestamp: date,
        value: avgDuration,
      });
    });

    return {
      passRateOverTime,
      coverageOverTime,
      performanceOverTime,
      flakyTests,
    };
  }

  /**
   * Export to CI/CD format
   */
  exportForCI(results: TestResults, format: 'junit' | 'github' | 'gitlab' = 'junit'): CIReport {
    if (format === 'junit') {
      return {
        format: 'junit',
        content: this.generateJUnitXML(results),
      };
    } else if (format === 'github') {
      return {
        format: 'github',
        content: this.generateGitHubFormat(results),
      };
    } else {
      return {
        format: 'gitlab',
        content: this.generateGitLabFormat(results),
      };
    }
  }

  private generateJUnitXML(results: TestResults): string {
    const testcases = results.failures
      .map(
        (failure) => `
      <testcase name="${failure.testName}" time="${failure.duration / 1000}">
        ${failure.error ? `<failure message="${failure.error}">${failure.stackTrace}</failure>` : ''}
      </testcase>
    `
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
      <testsuite name="Test Results" tests="${results.passed + results.failed}" failures="${results.failed}" skipped="${results.skipped}" time="${results.duration / 1000}">
        ${testcases}
      </testsuite>
    `;
  }

  private generateGitHubFormat(results: TestResults): string {
    const summary = `
## Test Results

- ✅ Passed: ${results.passed}
- ❌ Failed: ${results.failed}
- ⏭️ Skipped: ${results.skipped}
- ⏱️ Duration: ${results.duration}ms
- 📊 Coverage: ${results.coverage}%
    `;

    const failures = results.failures
      .map((f) => `- **${f.testName}**: ${f.error}`)
      .join('\n');

    return summary + (failures ? `\n\n### Failures\n${failures}` : '');
  }

  private generateGitLabFormat(results: TestResults): string {
    return JSON.stringify({
      summary: {
        passed: results.passed,
        failed: results.failed,
        skipped: results.skipped,
        duration: results.duration,
        coverage: results.coverage,
      },
      failures: results.failures.map((f) => ({
        name: f.testName,
        error: f.error,
        stackTrace: f.stackTrace,
      })),
    });
  }
}

export const testReporter = new TestReporter();
