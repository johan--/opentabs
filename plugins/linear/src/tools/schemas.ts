import { z } from 'zod';

// --- Shared output schemas ---

export const issueSchema = z.object({
  id: z.string().describe('Issue UUID'),
  identifier: z.string().describe('Human-readable issue identifier (e.g. ENG-123)'),
  title: z.string().describe('Issue title'),
  description: z.string().describe('Issue description in markdown'),
  priority: z.number().describe('Priority (0=none, 1=urgent, 2=high, 3=medium, 4=low)'),
  priority_label: z.string().describe('Human-readable priority label'),
  state_name: z.string().describe('Current workflow state name'),
  state_type: z.string().describe('Workflow state type (triage, backlog, unstarted, started, completed, canceled)'),
  assignee_name: z.string().describe('Assignee display name, or empty if unassigned'),
  team_key: z.string().describe('Team key/identifier'),
  team_name: z.string().describe('Team name'),
  label_names: z.array(z.string()).describe('List of label names applied to this issue'),
  project_name: z.string().describe('Project name, or empty if not in a project'),
  cycle_number: z.number().describe('Cycle number, or 0 if not in a cycle'),
  due_date: z.string().describe('Due date (YYYY-MM-DD), or empty if none'),
  estimate: z.number().describe('Estimate points, or 0 if none'),
  url: z.string().describe('URL to the issue in Linear'),
  created_at: z.string().describe('ISO 8601 creation timestamp'),
  updated_at: z.string().describe('ISO 8601 last update timestamp'),
});

export const commentSchema = z.object({
  id: z.string().describe('Comment UUID'),
  body: z.string().describe('Comment body in markdown'),
  user_name: z.string().describe('Author display name'),
  created_at: z.string().describe('ISO 8601 creation timestamp'),
  updated_at: z.string().describe('ISO 8601 last update timestamp'),
  edited_at: z.string().describe('ISO 8601 edited timestamp, or empty if not edited'),
});

export const projectSchema = z.object({
  id: z.string().describe('Project UUID'),
  name: z.string().describe('Project name'),
  description: z.string().describe('Project description'),
  state: z.string().describe('Project status name'),
  lead_name: z.string().describe('Project lead display name, or empty if none'),
  target_date: z.string().describe('Target completion date (YYYY-MM-DD), or empty'),
  start_date: z.string().describe('Start date (YYYY-MM-DD), or empty'),
  url: z.string().describe('URL to the project in Linear'),
  created_at: z.string().describe('ISO 8601 creation timestamp'),
  updated_at: z.string().describe('ISO 8601 last update timestamp'),
});

export const teamSchema = z.object({
  id: z.string().describe('Team UUID'),
  key: z.string().describe('Team key used as issue identifier prefix'),
  name: z.string().describe('Team name'),
  description: z.string().describe('Team description'),
});

export const workflowStateSchema = z.object({
  id: z.string().describe('Workflow state UUID'),
  name: z.string().describe('State name (e.g. Todo, In Progress, Done)'),
  type: z.string().describe('State type (triage, backlog, unstarted, started, completed, canceled)'),
  color: z.string().describe('State color hex code'),
  position: z.number().describe('Sort position within the workflow'),
});

export const labelSchema = z.object({
  id: z.string().describe('Label UUID'),
  name: z.string().describe('Label name'),
  color: z.string().describe('Label color hex code'),
  description: z.string().describe('Label description'),
  is_group: z.boolean().describe('Whether this is a group label (parent)'),
  parent_name: z.string().describe('Parent group label name, or empty if top-level'),
});

export const userSchema = z.object({
  id: z.string().describe('User UUID'),
  name: z.string().describe('User display name'),
  email: z.string().describe('User email address'),
  display_name: z.string().describe('User display name'),
  active: z.boolean().describe('Whether the user is active'),
  admin: z.boolean().describe('Whether the user is an admin'),
});

export const cycleSchema = z.object({
  id: z.string().describe('Cycle UUID'),
  number: z.number().describe('Cycle number'),
  name: z.string().describe('Cycle name, or empty'),
  starts_at: z.string().describe('ISO 8601 cycle start date'),
  ends_at: z.string().describe('ISO 8601 cycle end date'),
  is_active: z.boolean().describe('Whether this is the currently active cycle'),
  completed_at: z.string().describe('ISO 8601 completion timestamp, or empty'),
});

export const paginationSchema = z.object({
  has_next_page: z.boolean().describe('Whether there are more results after this page'),
  end_cursor: z.string().describe('Cursor for fetching the next page, or empty'),
});

// --- Defensive mappers ---

interface RawIssue {
  id?: string;
  identifier?: string;
  title?: string;
  description?: string;
  priority?: number;
  priorityLabel?: string;
  state?: { name?: string; type?: string };
  assignee?: { name?: string; displayName?: string };
  team?: { key?: string; name?: string };
  labels?: { nodes?: Array<{ name?: string }> };
  project?: { name?: string };
  cycle?: { number?: number };
  dueDate?: string;
  estimate?: number;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const mapIssue = (i: RawIssue | undefined) => ({
  id: i?.id ?? '',
  identifier: i?.identifier ?? '',
  title: i?.title ?? '',
  description: i?.description ?? '',
  priority: i?.priority ?? 0,
  priority_label: i?.priorityLabel ?? '',
  state_name: i?.state?.name ?? '',
  state_type: i?.state?.type ?? '',
  assignee_name: i?.assignee?.displayName ?? i?.assignee?.name ?? '',
  team_key: i?.team?.key ?? '',
  team_name: i?.team?.name ?? '',
  label_names: (i?.labels?.nodes ?? []).map(l => l?.name ?? '').filter(Boolean),
  project_name: i?.project?.name ?? '',
  cycle_number: i?.cycle?.number ?? 0,
  due_date: i?.dueDate ?? '',
  estimate: i?.estimate ?? 0,
  url: i?.url ?? '',
  created_at: i?.createdAt ?? '',
  updated_at: i?.updatedAt ?? '',
});

interface RawComment {
  id?: string;
  body?: string;
  user?: { name?: string; displayName?: string };
  createdAt?: string;
  updatedAt?: string;
  editedAt?: string;
}

export const mapComment = (c: RawComment | undefined) => ({
  id: c?.id ?? '',
  body: c?.body ?? '',
  user_name: c?.user?.displayName ?? c?.user?.name ?? '',
  created_at: c?.createdAt ?? '',
  updated_at: c?.updatedAt ?? '',
  edited_at: c?.editedAt ?? '',
});

interface RawProject {
  id?: string;
  name?: string;
  description?: string;
  status?: { name?: string };
  lead?: { name?: string; displayName?: string };
  targetDate?: string;
  startDate?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const mapProject = (p: RawProject | undefined) => ({
  id: p?.id ?? '',
  name: p?.name ?? '',
  description: p?.description ?? '',
  state: p?.status?.name ?? '',
  lead_name: p?.lead?.displayName ?? p?.lead?.name ?? '',
  target_date: p?.targetDate ?? '',
  start_date: p?.startDate ?? '',
  url: p?.url ?? '',
  created_at: p?.createdAt ?? '',
  updated_at: p?.updatedAt ?? '',
});

interface RawTeam {
  id?: string;
  key?: string;
  name?: string;
  description?: string;
}

export const mapTeam = (t: RawTeam | undefined) => ({
  id: t?.id ?? '',
  key: t?.key ?? '',
  name: t?.name ?? '',
  description: t?.description ?? '',
});

interface RawWorkflowState {
  id?: string;
  name?: string;
  type?: string;
  color?: string;
  position?: number;
}

export const mapWorkflowState = (s: RawWorkflowState | undefined) => ({
  id: s?.id ?? '',
  name: s?.name ?? '',
  type: s?.type ?? '',
  color: s?.color ?? '',
  position: s?.position ?? 0,
});

interface RawLabel {
  id?: string;
  name?: string;
  color?: string;
  description?: string;
  isGroup?: boolean;
  parent?: { name?: string };
}

export const mapLabel = (l: RawLabel | undefined) => ({
  id: l?.id ?? '',
  name: l?.name ?? '',
  color: l?.color ?? '',
  description: l?.description ?? '',
  is_group: l?.isGroup ?? false,
  parent_name: l?.parent?.name ?? '',
});

interface RawUser {
  id?: string;
  name?: string;
  email?: string;
  displayName?: string;
  active?: boolean;
  admin?: boolean;
}

export const mapUser = (u: RawUser | undefined) => ({
  id: u?.id ?? '',
  name: u?.name ?? '',
  email: u?.email ?? '',
  display_name: u?.displayName ?? u?.name ?? '',
  active: u?.active ?? false,
  admin: u?.admin ?? false,
});

interface RawCycle {
  id?: string;
  number?: number;
  name?: string;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
  completedAt?: string;
}

export const mapCycle = (c: RawCycle | undefined) => ({
  id: c?.id ?? '',
  number: c?.number ?? 0,
  name: c?.name ?? '',
  starts_at: c?.startsAt ?? '',
  ends_at: c?.endsAt ?? '',
  is_active: c?.isActive ?? false,
  completed_at: c?.completedAt ?? '',
});
