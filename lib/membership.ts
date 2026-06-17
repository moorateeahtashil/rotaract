// ============================================================
// MEMBERSHIP REQUIREMENTS — dynamic, per-event-type progress
// Shared by the admin attendance view and the prospective /pending page.
//
// Requirements are keyed by the event_type NAME (whatever types the club
// defines in /admin/event-types), plus a separate project-lead requirement.
// ============================================================

export type RequirementConfig = {
  // { "<event_type name>": required_count }
  type_requirements: Record<string, number>;
  required_project_leads: number;
};

export const DEFAULT_REQUIREMENTS: RequirementConfig = {
  type_requirements: {},
  required_project_leads: 0,
};

// Normalize whatever comes back from the DB row into a RequirementConfig.
export function normalizeRequirements(row: any): RequirementConfig {
  if (!row) return { ...DEFAULT_REQUIREMENTS };
  const tr = row.type_requirements && typeof row.type_requirements === "object" ? row.type_requirements : {};
  const cleaned: Record<string, number> = {};
  for (const [k, v] of Object.entries(tr)) {
    const n = Number(v);
    if (k && Number.isFinite(n) && n > 0) cleaned[k] = n;
  }
  return {
    type_requirements: cleaned,
    required_project_leads: Number(row.required_project_leads) || 0,
  };
}

// Whether a project_team role string represents a project lead.
export function isProjectLeadRole(role: string | null | undefined): boolean {
  const r = (role || "").toLowerCase();
  return r.includes("lead") || r.includes("chair") || r.includes("director") || r.includes("manager");
}

export type RequirementProgress = {
  items: { key: string; label: string; have: number; need: number; met: boolean }[];
  allMet: boolean;
};

// attendedByType: { "<event_type name>": count of events attended of that type }
export function computeProgress(
  attendedByType: Record<string, number>,
  projectLeadCount: number,
  config: RequirementConfig
): RequirementProgress {
  const items: RequirementProgress["items"] = [];

  for (const [type, need] of Object.entries(config.type_requirements)) {
    if (need <= 0) continue;
    const have = attendedByType[type] || 0;
    items.push({ key: `type:${type}`, label: type, have, need, met: have >= need });
  }

  if (config.required_project_leads > 0) {
    items.push({
      key: "project_leads",
      label: "Project lead roles",
      have: projectLeadCount,
      need: config.required_project_leads,
      met: projectLeadCount >= config.required_project_leads,
    });
  }

  const allMet = items.length > 0 && items.every((i) => i.met);
  return { items, allMet };
}
