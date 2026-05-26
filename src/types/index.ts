export type Role = "admin" | "client" | "member";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export type ClientStatus = "prospect" | "actif" | "pause" | "terminé";

export type Prestation =
  | "Site web"
  | "Refonte de site web"
  | "SEO / Référencement"
  | "Campagne Google Ads"
  | "Campagne Meta Ads"
  | "Identité visuelle / Branding"
  | "Community Management"
  | "Email marketing"
  | "Application mobile"
  | "Pack maintenance"
  | "Audit & conseil";

export interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  notes: string | null;
  ga4_property_id: string | null;
  search_console_url: string | null;
  client_status: ClientStatus;
  prestation: Prestation | null;
  prestations: string[] | null;
  presta_start_date: string | null;
  presta_end_date: string | null;
  budget: number | null;
  created_at: string;
  user_id: string | null;
}

export type ProjectStatus = "lead" | "active" | "paused" | "completed" | "cancelled";

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  progress: number; // 0-100
  created_at: string;
  client?: Client;
  milestones?: Milestone[];
}

export type MilestoneStatus = "pending" | "in_progress" | "completed";

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  due_date: string | null;
  completed_at: string | null;
  order: number;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  project_id: string | null;
  client_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  created_at: string;
  project?: Pick<Project, "id" | "name">;
  client?: Pick<Client, "id" | "company_name">;
}

export interface Deliverable {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  file_url: string | null;
  file_size: number | null;
  file_type: string | null;
  uploaded_at: string;
  uploaded_by: string;
}

export interface Message {
  id: string;
  project_id: string | null;
  client_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Pick<Profile, "id" | "full_name" | "role" | "avatar_url">;
}
