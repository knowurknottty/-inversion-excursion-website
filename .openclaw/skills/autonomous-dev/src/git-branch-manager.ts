/**
 * git-branch-manager.ts
 * Manages git operations for autonomous development.
 */

import { execSync } from 'child_process';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface GitConfig {
  workspaceRoot: string;
  remoteName: string;
  allowPush: boolean;
  protectedBranches: string[];
}

export interface WorkLogEntry {
  timestamp: string;
  project: string;
  branch: string;
  commits: number;
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
  notes: string;
}

export class GitBranchManager {
  private config: GitConfig;

  constructor(config: GitConfig) {
    this.config = config;
  }

  /**
   * Create and checkout a new branch
   */
  createBranch(projectPath: string, branchName: string): void {
    const fullPath = join(this.config.workspaceRoot, projectPath);

    // Ensure we're on a safe starting point
    this.execGit('checkout main || checkout master', fullPath);
    this.execGit('pull', fullPath);

    // Create and checkout new branch
    this.execGit(`checkout -b ${branchName}`, fullPath);

    console.log(`[GitManager] Created branch: ${branchName}`);
  }

  /**
   * Commit changes with auto-generated message
   */
  commit(
    projectPath: string,
    message: string,
    details?: string
  ): string {
    const fullPath = join(this.config.workspaceRoot, projectPath);

    // Stage all changes
    this.execGit('add -A', fullPath);

    // Check if there are changes to commit
    const status = this.execGit('status --porcelain', fullPath);
    if (!status.trim()) {
      console.log('[GitManager] No changes to commit');
      return '';
    }

    // Build commit message
    let fullMessage = message;
    if (details) {
      fullMessage += `\n\n${details}`;
    }

    // Commit
    this.execGit(`commit -m "${fullMessage.replace(/"/g, '\\"')}"`, fullPath);

    // Get commit hash
    const hash = this.execGit('rev-parse --short HEAD', fullPath).trim();

    console.log(`[GitManager] Committed: ${hash} - ${message.split('\n')[0]}`);

    return hash;
  }

  /**
   * Push branch to remote (if allowed)
   */
  push(projectPath: string, branchName?: string): void {
    if (!this.config.allowPush) {
      console.log('[GitManager] Push disabled — local commits only');
      return;
    }

    const fullPath = join(this.config.workspaceRoot, projectPath);
    const branch = branchName || this.getCurrentBranch(fullPath);

    // Safety check: never push protected branches
    if (this.config.protectedBranches.includes(branch)) {
      throw new Error(`Cannot push protected branch: ${branch}`);
    }

    this.execGit(`push ${this.config.remoteName} ${branch}`, fullPath);
    console.log(`[GitManager] Pushed: ${branch}`);
  }

  /**
   * Get current branch name
   */
  private getCurrentBranch(projectPath: string): string {
    return this.execGit('rev-parse --abbrev-ref HEAD', projectPath).trim();
  }

  /**
   * Check if branch exists
   */
  branchExists(projectPath: string, branchName: string): boolean {
    const fullPath = join(this.config.workspaceRoot, projectPath);
    try {
      this.execGit(`rev-parse --verify ${branchName}`, fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get diff stats for logging
   */
  getDiffStats(projectPath: string): {
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
  } {
    const fullPath = join(this.config.workspaceRoot, projectPath);

    try {
      const stats = this.execGit('diff --stat HEAD', fullPath);
      const lines = stats.split('\n');
      const lastLine = lines[lines.length - 2] || '';

      const match = lastLine.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);

      if (match) {
        return {
          filesChanged: parseInt(match[1]) || 0,
          linesAdded: parseInt(match[2]) || 0,
          linesDeleted: parseInt(match[3]) || 0
        };
      }
    } catch {
      // No changes or error
    }

    return { filesChanged: 0, linesAdded: 0, linesDeleted: 0 };
  }

  /**
   * Log work to overnight_work_log.json
   */
  logWork(entry: WorkLogEntry): void {
    const logPath = join(this.config.workspaceRoot, '.openclaw/memory/overnight_work_log.json');

    // Ensure directory exists
    const dir = join(this.config.workspaceRoot, '.openclaw/memory');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Read existing log or create new
    let log: { version: string; logs: WorkLogEntry[] } = { version: '1.0', logs: [] };
    if (existsSync(logPath)) {
      try {
        log = JSON.parse(require('fs').readFileSync(logPath, 'utf-8'));
      } catch {
        // Corrupted log, start fresh
      }
    }

    log.logs.push(entry);

    // Keep only last 1000 entries
    if (log.logs.length > 1000) {
      log.logs = log.logs.slice(-1000);
    }

    writeFileSync(logPath, JSON.stringify(log, null, 2));
  }

  /**
   * Update autonomous_state.json
   */
  updateState(state: {
    activeTasks: Array<{
      id: string;
      project: string;
      status: string;
      progress: number;
      deliverables: string[];
      checkpoint: string;
    }>;
    pendingReviews: string[];
    blockedTasks: string[];
  }): void {
    const statePath = join(this.config.workspaceRoot, '.openclaw/memory/autonomous_state.json');

    const dir = join(this.config.workspaceRoot, '.openclaw/memory');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const fullState = {
      version: '1.0',
      last_updated: new Date().toISOString(),
      ...state
    };

    writeFileSync(statePath, JSON.stringify(fullState, null, 2));
  }

  /**
   * Execute git command safely
   */
  private execGit(command: string, cwd: string): string {
    const fullCommand = `git ${command}`;

    try {
      return execSync(fullCommand, {
        cwd,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (error: any) {
      // Some commands "fail" for valid reasons (e.g., no changes)
      if (error.stdout) return error.stdout;
      if (error.stderr && !error.stderr.includes('fatal')) {
        return error.stderr;
      }
      throw new Error(`Git command failed: ${fullCommand}\n${error.stderr || error.message}`);
    }
  }

  /**
   * Sandboxed execution wrapper
   */
  static sandboxed(
    operation: () => void,
    onError: (error: Error) => void
  ): void {
    try {
      operation();
    } catch (error) {
      onError(error as Error);
    }
  }
}

/**
 * Default configuration
 */
export const defaultGitConfig: GitConfig = {
  workspaceRoot: '/root/.openclaw/workspace',
  remoteName: 'origin',
  allowPush: false, // Never push without explicit user confirmation
  protectedBranches: ['main', 'master', 'production', 'release']
};
