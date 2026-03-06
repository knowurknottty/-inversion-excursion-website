#!/usr/bin/env node
/**
 * WYRD SWARM DEPLOYMENT SCRIPT
 * 
 * Usage: node deploy-wyrd-swarm.js [batch-name] [word1] [word2] ...
 * Example: node deploy-wyrd-swarm.js batch-002 consciousness freedom power knowledge truth
 */

const BATCH_NAME = process.argv[2] || "demo-001";
const WORDS = process.argv.slice(3).length 
  ? process.argv.slice(3) 
  : ["consciousness", "freedom", "power", "knowledge", "truth"];

console.log(`🐝 Deploying WYRD Swarm: ${BATCH_NAME}`);
console.log(`📋 Words to process: ${WORDS.join(", ")}`);
console.log(`🔢 Total agents: ${WORDS.length}`);
console.log(`⏱️  Estimated time: 15-30 minutes\n`);

// Generate spawn commands
const commands = WORDS.map((word, index) => {
  const label = `WYRD-${BATCH_NAME}-${word}`;
  const task = `Create complete WYRD etymology entry for the word "${word}".

REQUIRED SECTIONS:
1. **Surface Reading** - Common meaning, associations, emotional response
2. **Root Excavation** - Trace through: English → Middle English → Old French → Latin → PIE
3. **Semantic Shift** - What changed from original to modern usage
4. **Related Forms** - Cognates, derivatives
5. **The Liberation Angle** - Hidden structure, power dynamics, inversion insight  
6. **Reclaiming Strategy** - How to use this knowledge

OUTPUT:
- Save to: /entries/${word}.md
- Format: Follow /entries/authority.md template
- Include: WYRD code (format: ${word.substring(0,3).toUpperCase()}-001)
- Confidence: High/Medium/Speculative

Use kimi_search to verify etymological claims. Cite sources.`;

  return {
    label,
    word,
    spawnCommand: `sessions_spawn({
      agentId: "main",
      task: ${JSON.stringify(task)},
      label: "${label}",
      runTimeoutSeconds: 900
    })`
  };
});

// Output summary
console.log("=".repeat(60));
console.log("SPAWN COMMANDS (execute in OpenClaw):");
console.log("=".repeat(60) + "\n");

commands.forEach((cmd, i) => {
  console.log(`// Agent ${i + 1}: ${cmd.word}`);
  console.log(cmd.spawnCommand);
  console.log();
});

// Monitoring commands
console.log("=".repeat(60));
console.log("MONITORING COMMANDS:");
console.log("=".repeat(60) + "\n");

console.log("// Check all active agents");
console.log(`subagents(action: "list", recentMinutes: 30);`);
console.log();

console.log("// Check specific batch");
console.log(`sessions_list(kinds: ["subagent"], activeMinutes: 30);`);
console.log();

commands.forEach(cmd => {
  console.log(`// Get results for ${cmd.word}`);
  console.log(`sessions_history(sessionKey: "${cmd.label}", limit: 100);`);
  console.log();
});

// Git commit helper
console.log("=".repeat(60));
console.log("POST-SWARM GIT COMMIT:");
console.log("=".repeat(60) + "\n");

console.log(`exec({
  command: "cd /root/.openclaw/workspace/wyrd-consolidated && \\"
          "git add entries/ && \\"
          "git commit -m 'WYRD ${BATCH_NAME}: Add ${WORDS.length} entries' && \\"
          "git push"
});`);

console.log("\n" + "=".repeat(60));
console.log("SWARM DEPLOYMENT READY");
console.log("=".repeat(60));
console.log(`\nNext steps:`);
console.log(`1. Copy spawn commands above into OpenClaw`);
console.log(`2. Wait 15-30 minutes`);
console.log(`3. Run monitoring commands to collect results`);
console.log(`4. Git commit when all complete`);
console.log(`\n🚀 Swarm speedup: ${WORDS.length}x faster than sequential`);
