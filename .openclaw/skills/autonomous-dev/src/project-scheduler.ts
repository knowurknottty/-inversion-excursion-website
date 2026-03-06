/**
 * project-scheduler.ts
 * Selects and prioritizes projects for autonomous work sessions.
 */

import { computeSessionBudget, CreativityTier } from './creativity-scaler';

export interface Project {
  id: string;
  name: string;
  path: string;
  description: string;
  type: 'knowledge-base' | 'neurotechnology' | 'standard';
  priority: number; // 0.0 - 1.0
  knowledgeBasePriority?: number;
  researchDriven: boolean;
  autoStartExperimental: boolean;
  lastWorkedAt: string | null;
  status: 'active' | 'paused' | 'blocked';
}

export interface ScheduledTask {
  project: Project;
  budget: ReturnType<typeof computeSessionBudget>;
  taskType: 'kb' | 'research' | 'creative' | 'maintenance';
  estimatedMinutes: number;
  branchName?: string;
}

export class ProjectScheduler {
  private projects: Project[];

  constructor(projects: Project[]) {
    this.projects = projects;
  }

  /**
   * Select projects to work on based on downtime and priorities
   */
  schedule(
    downtimeMinutes: number,
    maxProjects: number = 3
): ScheduledTask[] {
    const available = this.projects.filter(p => p.status === 'active');

    // Sort by priority and recency (lower lastWorkedAt = higher priority)
    const sorted = available.sort((a, b) => {
      const priorityDiff = b.priority - a.priority;
      if (priorityDiff !== 0) return priorityDiff;

      // If no last worked time, treat as oldest
      const aTime = a.lastWorkedAt ? new Date(a.lastWorkedAt).getTime() : 0;
      const bTime = b.lastWorkedAt ? new Date(b.lastWorkedAt).getTime() : 0;
      return aTime - bTime;
    });

    const selected = sorted.slice(0, maxProjects);
    const tasks: ScheduledTask[] = [];

    for (const project of selected) {
      const projectType = this.getProjectType(project);
      const budget = computeSessionBudget(downtimeMinutes, projectType);

      // Determine task type based on project needs and tier
      const taskType = this.selectTaskType(project, budget.tier);
      const estimatedMinutes = this.getTaskMinutes(taskType, budget);

      // Generate branch name if creative work
      const branchName = taskType === 'creative'
        ? this.generateBranchName(project, budget.tier)
        : undefined;

      tasks.push({
        project,
        budget,
        taskType,
        estimatedMinutes,
        branchName
      });
    }

    return tasks;
  }

  private getProjectType(project: Project): 'kb-heavy' | 'research' | 'standard' {
    if (project.type === 'knowledge-base') return 'kb-heavy';
    if (project.researchDriven) return 'research';
    return 'standard';
  }

  private selectTaskType(
    project: Project,
    tier: CreativityTier
  ): 'kb' | 'research' | 'creative' | 'maintenance' {
    // Tier 1: maintenance only
    if (tier === 1) return 'maintenance';

    // Research-driven projects prioritize research at higher tiers
    if (project.researchDriven && tier >= 3) return 'research';

    // KB projects prioritize KB work
    if (project.type === 'knowledge-base') return 'kb';

    // Standard projects: creative at tier 3+, maintenance otherwise
    if (tier >= 3) return 'creative';

    return 'maintenance';
  }

  private getTaskMinutes(
    taskType: string,
    budget: ReturnType<typeof computeSessionBudget>
  ): number {
    switch (taskType) {
      case 'kb': return budget.kbMinutes;
      case 'research': return budget.researchMinutes;
      case 'creative': return budget.creativeMinutes;
      default: return Math.floor(budget.totalMinutes * 0.3);
    }
  }

  private generateBranchName(project: Project, tier: CreativityTier): string {
    const slug = project.name.toLowerCase().replace(/\s+/g, '-');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    if (tier >= 4) {
      return `wip/auto-${date}-${slug}`;
    }

    return `feature/auto-${date}-${slug}`;
  }

  /**
   * Update project last worked timestamp
   */
  markWorked(projectId: string): void {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      project.lastWorkedAt = new Date().toISOString();
    }
  }

  /**
   * Get project by ID
   */
  getProject(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  /**
   * Add or update project
   */
  upsertProject(project: Project): void {
    const existing = this.projects.findIndex(p => p.id === project.id);
    if (existing >= 0) {
      this.projects[existing] = project;
    } else {
      this.projects.push(project);
    }
  }
}

/**
 * Load projects from PROJECTS.md
 */
export function loadProjectsFromMarkdown(content: string): Project[] {
  const projects: Project[] = [];
  const lines = content.split('\n');
  let currentProject: Partial<Project> = {};

  for (const line of lines) {
    // Match project header: ## project-name
    const headerMatch = line.match(/^##\s+(\S+)/);
    if (headerMatch) {
      if (currentProject.id) {
        projects.push(currentProject as Project);
      }
      currentProject = {
        id: headerMatch[1],
        name: headerMatch[1],
        status: 'active'
      };
      continue;
    }

    // Match properties
    const propMatch = line.match(/^-\s+(\w+):\s*(.+)$/);
    if (propMatch && currentProject.id) {
      const [, key, value] = propMatch;

      switch (key) {
        case 'path':
          currentProject.path = value;
          break;
        case 'description':
          currentProject.description = value;
          break;
        case 'type':
          currentProject.type = value as Project['type'];
          break;
        case 'priority':
          currentProject.priority = parseFloat(value);
          break;
        case 'knowledgeBase.priority':
          currentProject.knowledgeBasePriority = parseFloat(value);
          break;
        case 'researchDriven':
          currentProject.researchDriven = value === 'true';
          break;
        case 'autoStartExperimental':
          currentProject.autoStartExperimental = value === 'true';
          break;
        case 'lastWorkedAt':
          currentProject.lastWorkedAt = value === '~' ? null : value;
          break;
      }
    }
  }

  // Push last project
  if (currentProject.id) {
    projects.push(currentProject as Project);
  }

  return projects;
}
