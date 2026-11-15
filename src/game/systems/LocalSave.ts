const SAVE_KEY = 'snow-running-save-v1';

export interface LocalSaveData {
  bestScore: number;
  costumes: string[];
  selectedCostume: string;
}

const DEFAULT_SAVE: LocalSaveData = { bestScore: 0, costumes: ['santa-red'], selectedCostume: 'santa-red' };

export function loadSave(): LocalSaveData {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE, costumes: [...DEFAULT_SAVE.costumes] };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_SAVE, costumes: [...DEFAULT_SAVE.costumes] };
    const candidate = parsed as Partial<LocalSaveData>;
    return {
      bestScore: Number.isFinite(candidate.bestScore) ? Math.max(0, Number(candidate.bestScore)) : 0,
      costumes: Array.isArray(candidate.costumes) ? candidate.costumes.filter((item): item is string => typeof item === 'string') : [...DEFAULT_SAVE.costumes],
      selectedCostume: candidate.selectedCostume === 'ded-moroz-blue' ? 'ded-moroz-blue' : 'santa-red',
    };
  } catch {
    return { ...DEFAULT_SAVE, costumes: [...DEFAULT_SAVE.costumes] };
  }
}

export function setSelectedCostume(costume: string): LocalSaveData {
  const current = loadSave();
  const requested = costume === 'ded-moroz-blue' ? 'ded-moroz-blue' : 'santa-red';
  const next = { ...current, selectedCostume: current.costumes.includes(requested) ? requested : current.selectedCostume };
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(next));
  } catch {
    // The selected outfit remains available for this page load if storage is unavailable.
  }
  return next;
}

export function saveRun(score: number): LocalSaveData {
  const current = loadSave();
  const costumes = [...current.costumes];
  if (score >= 800 && !costumes.includes('ded-moroz-blue')) costumes.push('ded-moroz-blue');
  const next = { ...current, bestScore: Math.max(current.bestScore, score), costumes };
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing or a locked storage area should not interrupt a run.
  }
  return next;
}
