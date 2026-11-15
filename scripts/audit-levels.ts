import { SAMPLE_LEVELS } from '../src/game/data/levels';
import { auditLevelReachability } from '../src/game/data/levelAudit';

let hasIssues = false;
for (const level of SAMPLE_LEVELS) {
  const audit = auditLevelReachability(level);
  if (audit.issues.length > 0) {
    hasIssues = true;
    console.error(`Level ${level.id}: ${audit.issues.join('; ')}`);
  } else {
    console.log(`Level ${level.id}: all ${audit.reachableCellCount}/${audit.totalWalkableCellCount} walkable cells connected; ${level.gifts.length} gifts and exit reachable.`);
  }
}

if (hasIssues) process.exitCode = 1;
