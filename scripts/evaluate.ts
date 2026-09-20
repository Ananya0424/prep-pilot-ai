import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { runPrepKitPipeline } from '../src/lib/pipeline';
import { BatchCaseInput, BatchCaseResult, BatchOutputFile } from '../src/types/kit';

function parseArgs() {
  const args = process.argv.slice(2);
  let inputPath = '';
  let outputPath = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      inputPath = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    }
  }

  // Fallback to positional arguments if flags weren't explicitly passed
  if (!inputPath && args[0] && !args[0].startsWith('--')) {
    inputPath = args[0];
  }
  if (!outputPath && args[1] && !args[1].startsWith('--')) {
    outputPath = args[1];
  }

  if (!inputPath || !outputPath) {
    console.error('Usage: npm run evaluate -- --input <cases.json> --output <kits.json>');
    process.exit(1);
  }

  return { inputPath, outputPath };
}

async function main() {
  const { inputPath, outputPath } = parseArgs();

  const absoluteInput = path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
  const absoluteOutput = path.isAbsolute(outputPath) ? outputPath : path.resolve(process.cwd(), outputPath);

  if (!fs.existsSync(absoluteInput)) {
    console.error(`Input file not found: ${absoluteInput}`);
    process.exit(1);
  }

  const rawCases = fs.readFileSync(absoluteInput, 'utf-8');
  let cases: BatchCaseInput[] = [];
  try {
    cases = JSON.parse(rawCases);
  } catch (err) {
    console.error(`Failed to parse input JSON file: ${(err as Error).message}`);
    process.exit(1);
  }

  console.log(`[Batch Evaluation] Starting evaluation on ${cases.length} case(s)...`);
  const results: BatchCaseResult[] = [];

  for (const item of cases) {
    console.log(`\nProcessing case: "${item.id}" (URL: ${item.company_url}, Days: ${item.days})...`);
    try {
      const kit = await runPrepKitPipeline({
        jobDescription: item.jd,
        companyUrl: item.company_url,
        daysAvailable: item.days,
      });

      results.push({
        id: item.id,
        status: 'ok',
        kit,
        error: null,
      });
      console.log(`✔ Case "${item.id}" completed successfully.`);
    } catch (err: any) {
      console.error(`❌ Case "${item.id}" failed:`, err?.message || err);
      results.push({
        id: item.id,
        status: 'failed',
        kit: null,
        error: {
          code: err?.code || 'GENERATION_ERROR',
          message: err?.message || 'Failed to generate prep kit.',
        },
      });
    }
  }

  const outputPayload: BatchOutputFile = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    kits: results,
  };

  // Ensure output directory exists
  const outputDir = path.dirname(absoluteOutput);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(absoluteOutput, JSON.stringify(outputPayload, null, 2), 'utf-8');
  console.log(`\n[Batch Evaluation Complete] Wrote ${results.length} result(s) to ${absoluteOutput}`);
}

main().catch(err => {
  console.error('[Fatal Evaluation Failure]', err);
  process.exit(1);
});
