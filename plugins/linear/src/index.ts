import { isLinearAuthenticated, waitForLinearAuth } from './linear-api.js';
import { createComment } from './tools/create-comment.js';
import { createIssue } from './tools/create-issue.js';
import { deleteIssue } from './tools/delete-issue.js';
import { getIssue } from './tools/get-issue.js';
import { getProject } from './tools/get-project.js';
import { getViewer } from './tools/get-viewer.js';
import { listComments } from './tools/list-comments.js';
import { listCycles } from './tools/list-cycles.js';
import { listLabels } from './tools/list-labels.js';
import { listProjects } from './tools/list-projects.js';
import { listTeams } from './tools/list-teams.js';
import { listUsers } from './tools/list-users.js';
import { listWorkflowStates } from './tools/list-workflow-states.js';
import { searchIssues } from './tools/search-issues.js';
import { updateIssue } from './tools/update-issue.js';
import { OpenTabsPlugin } from '@opentabs-dev/plugin-sdk';
import type { ToolDefinition } from '@opentabs-dev/plugin-sdk';

class LinearPlugin extends OpenTabsPlugin {
  readonly name = 'linear';
  readonly description = 'OpenTabs plugin for Linear';
  override readonly displayName = 'Linear';
  readonly urlPatterns = ['*://linear.app/*'];
  readonly tools: ToolDefinition[] = [
    searchIssues,
    getIssue,
    createIssue,
    updateIssue,
    deleteIssue,
    createComment,
    listComments,
    listProjects,
    getProject,
    listTeams,
    listWorkflowStates,
    listLabels,
    getViewer,
    listUsers,
    listCycles,
  ];

  async isReady(): Promise<boolean> {
    if (isLinearAuthenticated()) return true;
    return waitForLinearAuth();
  }
}

export default new LinearPlugin();
