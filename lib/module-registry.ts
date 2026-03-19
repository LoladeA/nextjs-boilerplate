// lib/module-registry.ts
// =============================================================================
// MODULE REGISTRY — The Sentient Home
// =============================================================================
//
// Single source of truth for module slugs, week counts, and ordering.
// Used by:
//   - /api/complete-week     — to know when to advance to the next module
//   - checkWeekAccess()      — to gate week pages against current progress
//   - coaching index pages   — to render progress state per module
//
// To add a module: append to MODULES in order. Do not change existing indices.
// module_number is 1-indexed and must match current_module in the users table.
// =============================================================================

export interface ModuleDefinition {
  module_number: number
  slug:          string
  title:         string
  weeks:         number
}

export const MODULES: ModuleDefinition[] = [
  { module_number: 1, slug: 'foundations',                  title: 'Foundations',                        weeks: 1 },
  { module_number: 2, slug: 'sensory-lighting-dynamics',    title: 'Sensory and Lighting Dynamics',      weeks: 4 },
  { module_number: 3, slug: 'acoustic-balance',             title: 'Acoustic Balance',                   weeks: 3 },
  { module_number: 4, slug: 'colour-psychology',            title: 'Colour Psychology',                  weeks: 3 },
  { module_number: 5, slug: 'spatial-flow-layout',          title: 'Spatial Flow and Layout',            weeks: 4 },
  { module_number: 6, slug: 'biophilic-design',             title: 'Biophilic Design',                   weeks: 4 },
  { module_number: 7, slug: 'air-quality-thermal-comfort',  title: 'Air Quality and Thermal Comfort',    weeks: 3 },
  { module_number: 8, slug: 'ergonomics-physical-alignment',title: 'Ergonomics and Physical Alignment',  weeks: 3 },
  { module_number: 9, slug: 'whole-home-integration',       title: 'Whole Home Integration',             weeks: 6 },
]

export const TOTAL_WEEKS = MODULES.reduce((sum, m) => sum + m.weeks, 0) // 31

// Look up a module by its number (1-indexed)
export const getModule = (moduleNumber: number): ModuleDefinition | undefined =>
  MODULES.find(m => m.module_number === moduleNumber)

// Look up a module by its slug
export const getModuleBySlug = (slug: string): ModuleDefinition | undefined =>
  MODULES.find(m => m.slug === slug)

// Returns true if the given week is the final week of the given module
export const isFinalWeek = (moduleNumber: number, week: number): boolean => {
  const mod = getModule(moduleNumber)
  return !!mod && week >= mod.weeks
}

// Returns the next module number, or null if this is the last module
export const getNextModule = (moduleNumber: number): number | null => {
  const next = moduleNumber + 1
  return next <= MODULES.length ? next : null
}
