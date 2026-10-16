const projectOverrides = new Map<string, any>();

export function getProjectOverrides() {
  return Array.from(projectOverrides.values());
}

export function setProjectOverride(value: any) {
  if (!value) return;
  const key = String(value.githubId || value.id || "");
  if (!key) return;
  projectOverrides.set(key, value);
}

export function deleteProjectOverride(id: string) {
  if (!id) return;
  projectOverrides.delete(String(id));
}
