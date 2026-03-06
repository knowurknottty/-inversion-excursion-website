# TOOLS.md - Research Swarm Local Notes

## Your Custom Team Deployments

### Active Swarm Configurations

**Default Spawn Settings:**
- Timeout: 900s (15 min) for research tasks
- Model: kimi-coding/k2p5 (high reasoning)
- Agent: main (isolated sessions)

---

## QUICK DEPLOYMENT TEMPLATES

### Template: WYRD 10-Word Batch
```javascript
const batchName = "batch-001";
const words = ["consciousness", "freedom", "power", "knowledge", "truth", 
               "reality", "identity", "time", "money", "authority"];

words.forEach(word => {
  sessions_spawn({
    agentId: "main",
    task: `Create complete WYRD entry for "${word}". ` +
          `Include: surface reading, PIE root excavation, semantic shift, ` +
          `liberation angle, reclaiming strategy. ` +
          `Save to /entries/${word}.md`,
    label: `WYRD-${batchName}-${word}`,
    runTimeoutSeconds: 900
  });
});
```

### Template: IE Chapter Sprint
```javascript
// Deploy team for Chapter 8
const chapterNum = "8";
const sections = ["opening", "dungeons", "keys", "integration", "closing"];

sections.forEach(section => {
  sessions_spawn({
    agentId: "main", 
    task: `Write Chapter ${chapterNum} section: ${section}. ` +
          `Follow voice in SOUL.md. Include mudra references. ` +
          `Save to /chapter-${chapterNum}-${section}.md`,
    label: `IE-ch${chapterNum}-${section}`,
    runTimeoutSeconds: 1200
  });
});
```

### Template: Market Research Multi-Segment
```javascript
const segments = [
  "biohackers", "revolutionaries", "sovereigns", 
  "conspiracy", "mainstream", "spiritual", "tech"
];

segments.forEach(seg => {
  sessions_spawn({
    agentId: "main",
    task: `Research ${seg} market segment for SynSync/Inversion. ` +
          `Find: key influencers, pain points, language, price sensitivity, ` +
          `distribution channels. Create profile.`,
    label: `MR-segment-${seg}`,
    runTimeoutSeconds: 1800
  });
});
```

---

## MONITORING COMMANDS

```bash
# Check active swarms
subagents(action: "list", recentMinutes: 60)

# Check specific team
sessions_list(kinds: ["subagent"], activeMinutes: 30)

# Get results from completed agent
sessions_history(sessionKey: "WYRD-batch-001-consciousness", limit: 100)

# Kill stuck agent
subagents(action: "kill", target: "WYRD-batch-001-stuck")

# Send steer message to running agent
sessions_send(sessionKey: "...", message: "Focus on liberation angle more")
```

---

## PROJECT-SPECIFIC NOTES

### Inversion Excursion
- Chapter 8 needed
- All 7 dungeons complete
- Need appendix integration

### SynSync Pro
- Frequency protocols validated
- Need UX flow design
- Localization plan pending

### WYRD
- 10 entries created in Sprint 1
- Database schema complete
- Need 100+ more entries

### Teams Status
- [x] Research Swarm Skill created
- [ ] First full 10-agent deployment
- [ ] Results synthesis workflow
- [ ] Git commit automation

---

## PERFORMANCE LOG

| Date | Agents | Task | Time | Result |
|------|--------|------|------|--------|
| 2026-03-06 | 10 | WYRD entries | 30 min | 10 entries |

---

## CUSTOM AGENT PROMPTS

When spawning, append these to tasks for consistency:

**For WYRD agents:**
"Follow format in /entries/authority.md. Include WYRD code, confidence level."

**For IE agents:**
"Read SOUL.md first. Maintain guardian-type chuunibyou voice."

**For Research agents:**
"Use kimi_search for verification. Cite sources. Flag speculative claims."

**For Translation agents:**
"Preserve liberation angle meaning over literal translation."

---

## SCALING NOTES

- Current limit: 8 concurrent subagents
- Plan: Stagger deployments for 10+ agent teams
- Queue pattern: Spawn 8, wait for 2 to finish, spawn 2 more

---

*Remember: The swarm is an extension of your consciousness. Deploy wisely.*
