import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { schemaValidator } from './runtime.mjs';

export async function validateReport(report, directory, project = process.cwd()) {
  const schema = JSON.parse(await readFile(new URL('../references/review.schema.json', import.meta.url), 'utf8'));
  const validate = await schemaValidator(schema, project);
  const errors = [];
  if (!validate(report)) return { status: 'invalid', errors: validate.errors, exitCode: 2 };
  function unique(items, label) {
    const ids = items.map(item => item.id);
    if (new Set(ids).size !== ids.length) errors.push(`Duplicate ${label} ids.`);
  }
  unique(report.scope, 'surface'); unique(report.evidence, 'evidence'); unique(report.checks, 'check'); unique(report.findings, 'finding');
  const scope = new Set(report.scope.map(s => s.id));
  const inspected = new Set(report.coverage.inspected);
  const missing = new Set(report.coverage.missing);
  for (const id of [...inspected, ...missing]) if (!scope.has(id)) errors.push(`Unknown coverage surface: ${id}`);
  for (const id of scope) if (inspected.has(id) === missing.has(id)) errors.push(`Surface ${id} must be either inspected or missing.`);
  const artifacts = new Map(report.evidence.map(e => [e.id, e]));
  const base = await realpath(directory);
  for (const evidence of report.evidence) {
    if (evidence.surface && !scope.has(evidence.surface)) errors.push(`Unknown artifact surface: ${evidence.surface}`);
    try {
      if (path.isAbsolute(evidence.path)) throw new Error('Evidence paths must be relative.');
      const resolved = await realpath(path.resolve(base, evidence.path));
      if (!resolved.startsWith(base + path.sep)) throw new Error('Evidence must stay inside the report directory.');
      const bytes = await readFile(resolved);
      if (createHash('sha256').update(bytes).digest('hex') !== evidence.sha256) errors.push(`Evidence hash mismatch: ${evidence.id}`);
      if (evidence.kind === 'screenshot') {
        const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
        if (!png && !jpeg) errors.push(`Screenshot ${evidence.id} is not a PNG/JPEG artifact.`);
        if (!evidence.surface) errors.push(`Screenshot ${evidence.id} needs a surface.`);
      }
    } catch (error) { errors.push(`Evidence ${evidence.id}: ${error.message}`); }
  }
  function references(ids, label) {
    for (const id of ids) if (!artifacts.has(id)) errors.push(`${label} references unknown evidence ${id}.`);
  }
  for (const check of report.checks) {
    references(check.evidence, `Check ${check.id}`);
    for (const id of check.surfaces) if (!scope.has(id)) errors.push(`Check ${check.id} references unknown surface ${id}.`);
    if (['pass', 'fail'].includes(check.status) && (!check.surfaces.length || !check.evidence.length)) errors.push(`Executed check ${check.id} needs scope and evidence.`);
    if (check.status === 'pass' && check.surfaces.some(id => !inspected.has(id))) errors.push(`Passing check ${check.id} includes an uninspected surface.`);
  }
  for (const [dimension, assessment] of Object.entries(report.assessment)) {
    references(assessment.evidence, `${dimension} assessment`);
    if (['pass', 'acceptable', 'needs-refinement', 'fail'].includes(assessment.status) && !assessment.evidence.length) errors.push(`${dimension} assessment needs evidence.`);
    if (dimension === 'taste' && assessment.status !== 'unreviewed' && !assessment.evidence.some(id => artifacts.get(id)?.kind === 'screenshot')) errors.push('Taste assessment needs rendered screenshot evidence.');
    if ((dimension === 'taste' && assessment.status !== 'unreviewed') || (dimension === 'coherence' && assessment.status === 'pass')) {
      for (const id of inspected) if (!assessment.evidence.some(ref => artifacts.get(ref)?.kind === 'screenshot' && artifacts.get(ref)?.surface === id)) errors.push(`${dimension} assessment lacks rendered evidence for ${id}.`);
    }
    if (dimension !== 'taste' && assessment.status === 'pass') {
      const required = report.checks.filter(c => c.dimension === dimension && c.required && c.status !== 'not-applicable');
      if (!required.length || required.some(c => c.status !== 'pass')) errors.push(`${dimension} cannot pass without applicable required checks passing.`);
      for (const id of inspected) if (!required.some(c => c.status === 'pass' && c.surfaces.includes(id))) errors.push(`${dimension} required checks do not cover ${id}.`);
    }
  }
  for (const finding of report.findings) {
    references(finding.evidence, `Finding ${finding.id}`);
    if (!inspected.has(finding.surface)) errors.push(`Finding ${finding.id} needs an inspected surface.`);
  }
  if (errors.length) return { status: 'invalid', errors, exitCode: 2 };
  const fail = report.checks.some(c => c.required && c.status === 'fail') || ['correctness', 'coherence'].some(d => report.assessment[d].status === 'fail') || report.findings.some(f => f.severity === 'blocker');
  const partial = missing.size > 0 || report.checks.some(c => c.required && c.status === 'unavailable') || ['correctness', 'coherence'].some(d => report.assessment[d].status === 'unverified') || report.assessment.taste.status === 'unreviewed' || [...inspected].some(id => !report.evidence.some(e => e.kind === 'screenshot' && e.surface === id));
  const findings = report.findings.length > 0 || report.checks.some(c => c.status === 'fail') || report.assessment.taste.status === 'needs-refinement';
  const status = fail ? 'fail' : partial ? 'partial' : findings ? 'findings' : 'pass';
  return { status, errors, scope: [...scope], missing: [...missing], exitCode: status === 'pass' ? 0 : status === 'partial' ? 2 : 1, limitations: ['Validation establishes report consistency and artifact integrity, not aesthetic truth or actual evaluator inspection.'] };
}
