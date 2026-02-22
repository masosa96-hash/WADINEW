import { supabase } from "../supabase";

export interface UserCognitiveProfile {
  user_id: string;
  stack_complexity_score: number;
  milestone_length_score: number;
  risk_tolerance_score: number;
  scope_bias_score: number;
  profile_version: number;
  updated_at: string;
}

const SCORE_RANGE = { MIN: -5, MAX: 5 };
const MIN_REPETITIONS = 3;
const DECAY_FACTOR = 0.95; // Profiles tend to 0 over time to prevent rigidity

/**
 * Log a specific field edit in a project structure
 */
export async function logProjectEdit(
  userId: string,
  projectId: string,
  field: string,
  oldVal: any,
  newVal: any
) {
  const oldLen = JSON.stringify(oldVal).length;
  const newLen = JSON.stringify(newVal).length;
  
  let editDirection = "OVERWRITE";
  if (newLen > oldLen * 1.5) editDirection = "EXPAND";
  if (newLen < oldLen * 0.5) editDirection = "DELETE_HEAVY";

  const diffSummary = `${editDirection}: Changed ${field} from length ${oldLen} to ${newLen}`;
  console.log(`[DASHBOARD_SIGNAL] event=PROJECT_EDIT user_id=${userId} project_id=${projectId} field=${field} direction=${editDirection}`);

  const { error } = await supabase
    .from("project_edits")
    .insert([{
      user_id: userId,
      project_id: projectId,
      field,
      original_value: typeof oldVal === 'string' ? oldVal : JSON.stringify(oldVal),
      edited_value: typeof newVal === 'string' ? newVal : JSON.stringify(newVal),
      diff_summary: diffSummary
    }] as any);

  if (error) console.error("[COGNITIVE] Error logging edit:", error.message);
}

/**
 * Heuristics-based profile update
 * Analyzes last edits and adjusts scores if a pattern repeats
 */
export async function updateCognitiveProfile(userId: string) {
  try {
    // 1. Fetch recent edits for this user to detect patterns
    const { data: recentEdits, error: editsErr } = await (supabase as any)
      .from("project_edits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (editsErr || !recentEdits) return;

    // 2. Fetch current profile
    const { data: profile, error: profErr } = await (supabase as any)
      .from("user_cognitive_profile_current")
      .select("*")
      .eq("user_id", userId)
      .single();

    let currentProfile: UserCognitiveProfile;
    
    if (profErr || !profile) {
      // Initialize if not exists
      const { data: newProf, error: initErr } = await (supabase as any)
        .from("user_cognitive_profile_current")
        .insert([{ user_id: userId }] as any)
        .select()
        .single();
        
      if (initErr) return;
      currentProfile = newProf as UserCognitiveProfile;
    } else {
      currentProfile = profile as UserCognitiveProfile;
    }

    // 3. Apply Heuristics
    const updates: Partial<UserCognitiveProfile> = {};

    // Pattern A: Stack Complexity
    const stackEdits = (recentEdits as any[]).filter(e => e.field === 'recommended_stack');
    if (stackEdits.length >= MIN_REPETITIONS) {
       const reducesComplexity = stackEdits.slice(0, MIN_REPETITIONS).every(e => e.edited_value.length < e.original_value.length);
       const addsComplexity = stackEdits.slice(0, MIN_REPETITIONS).every(e => e.edited_value.length > e.original_value.length);
       
       if (reducesComplexity) updates.stack_complexity_score = Math.max(SCORE_RANGE.MIN, currentProfile.stack_complexity_score - 1);
       if (addsComplexity) updates.stack_complexity_score = Math.min(SCORE_RANGE.MAX, currentProfile.stack_complexity_score + 1);
    }

    // Pattern B: Milestone Length
    const milestoneEdits = (recentEdits as any[]).filter(e => e.field === 'milestones');
    if (milestoneEdits.length >= MIN_REPETITIONS) {
      const getCount = (val: string) => { try { return JSON.parse(val).length; } catch { return 0; } };
      const reducesMilestones = milestoneEdits.slice(0, MIN_REPETITIONS).every(e => getCount(e.edited_value) < getCount(e.original_value));
      const addsMilestones = milestoneEdits.slice(0, MIN_REPETITIONS).every(e => getCount(e.edited_value) > getCount(e.original_value));

      if (reducesMilestones) updates.milestone_length_score = Math.max(SCORE_RANGE.MIN, currentProfile.milestone_length_score - 1);
      if (addsMilestones) updates.milestone_length_score = Math.min(SCORE_RANGE.MAX, currentProfile.milestone_length_score + 1);
    }

    if (Object.keys(updates).length > 0) {
      const nextVersion = currentProfile.profile_version + 1;
      
      // Update profile
      await (supabase as any)
        .from("user_cognitive_profile_current")
        .update({ 
          ...updates, 
          profile_version: nextVersion,
          updated_at: new Date().toISOString() 
        })
        .eq("user_id", userId);
        
      // Save snapshot to history
      await (supabase as any)
        .from("user_cognitive_profile_history")
        .insert([{
          user_id: userId,
          profile_snapshot: { ...currentProfile, ...updates },
          profile_version: nextVersion
        }]);

      console.log(`[COGNITIVE] Profile updated & snapshot saved for user ${userId}`, updates);
    }

  } catch (err) {
    console.error("[COGNITIVE] Update failed:", err);
  }
}

/**
 * PHASE 4: Score Decay
 * Gradually normalizes profiles towards 0 to maintain flexibility.
 */
export async function applyProfileDecay(userId: string) {
  try {
    const { data: profile } = await (supabase as any)
      .from("user_cognitive_profile_current")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!profile) return;

    const p = profile as UserCognitiveProfile;
    const updates = {
      stack_complexity_score: Math.round(p.stack_complexity_score * DECAY_FACTOR * 10) / 10,
      milestone_length_score: Math.round(p.milestone_length_score * DECAY_FACTOR * 10) / 10,
      risk_tolerance_score: Math.round(p.risk_tolerance_score * DECAY_FACTOR * 10) / 10,
      scope_bias_score: Math.round(p.scope_bias_score * DECAY_FACTOR * 10) / 10,
      updated_at: new Date().toISOString()
    };

    await (supabase as any)
      .from("user_cognitive_profile_current")
      .update(updates)
      .eq("user_id", userId);

  } catch (e) {
    console.error("[COGNITIVE] Decay failed:", e);
  }
}

/**
 * Returns a natural language summary of the user cognitive profile for prompt injection
 */
export async function getCognitiveProfileSummary(userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from("user_cognitive_profile_current")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!profile) return "";

  const tendencies: string[] = [];
  const p = profile as UserCognitiveProfile;

  if (p.stack_complexity_score < 0) tendencies.push("Prefers lean MVP stacks, avoids over-engineering.");
  if (p.stack_complexity_score > 0) tendencies.push("Values robust, scalable infrastructure.");
  
  if (p.milestone_length_score < 0) tendencies.push("Favors short, high-impact milestone lists.");
  if (p.milestone_length_score > 0) tendencies.push("Prefers granular and detailed project roadmaps.");
  
  if (p.risk_tolerance_score < 0) tendencies.push("Extremely risk-averse; prioritizes validation before any development.");
  if (p.scope_bias_score < 0) tendencies.push("Strong bias towards minimal scope to accelerate time-to-market.");

  if (tendencies.length === 0) return "";

  return `User patterns and tendencies observed from previous project edits:\n- ${tendencies.join("\n- ")}`;
}

/**
 * PHASE 2/4: Global Meta-Analysis Job
 * Refined with atomicity and analytics.
 */
export async function runGlobalMetaAnalysis() {
  const analysisId = Math.random().toString(36).substring(7);
  console.log(`[COGNITIVE] Starting global analysis ${analysisId}...`);

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: edits, error } = await (supabase as any)
      .from("project_edits")
      .select("field, original_value, edited_value, project_id")
      .gt("created_at", thirtyDaysAgo.toISOString());

    if (error || !edits) return;

    const stats: Record<string, { total: number, reductions: number }> = {
      milestones: { total: 0, reductions: 0 },
      recommended_stack: { total: 0, reductions: 0 }
    };

    const getCount = (val: string) => { try { return JSON.parse(val).length; } catch { return 0; } };

    for (const edit of edits as any[]) {
      if (edit.field === 'milestones') {
        stats.milestones.total++;
        if (getCount(edit.edited_value) < getCount(edit.original_value)) stats.milestones.reductions++;
      }
      if (edit.field === 'recommended_stack') {
        stats.recommended_stack.total++;
        if (edit.edited_value.length < edit.original_value.length) stats.recommended_stack.reductions++;
      }
    }

    const uniqueProjects = new Set((edits as any[]).map(e => e.project_id)).size;
    const avgEditsPerProject = uniqueProjects > 0 ? edits.length / uniqueProjects : 0;

    // Upsert patterns if frequency > threshold (60%)
    for (const [field, data] of Object.entries(stats)) {
      if (data.total < 10) continue; 

      const frequency = data.reductions / data.total;
      const patternName = `REDUCE_${field.toUpperCase()}`;

      if (frequency > 0.6 || frequency < 0.2) {
        await (supabase as any)
          .from("global_patterns")
          .upsert({
            pattern: patternName,
            frequency,
            confidence_score: Math.min(1.0, data.total / 100),
            sample_size: data.total,
            last_updated: new Date().toISOString()
          }, { onConflict: 'pattern' });
      }
    }

    // Record Analytics
    await (supabase as any)
      .from("adaptive_analytics")
      .upsert({
        date: new Date().toISOString().split('T')[0],
        avg_edits_per_project: avgEditsPerProject,
        sample_size: edits.length,
        created_at: new Date().toISOString()
      }, { onConflict: 'date' });

    console.log(`[COGNITIVE] Global meta-analysis ${analysisId} completed.`);
  } catch (err) {
    console.error(`[COGNITIVE] Global analysis ${analysisId} failed:`, err);
  }
}

/**
 * Returns dynamic instructions for the base prompt based on global patterns
 */
export async function getGlobalPromptAdjustments(): Promise<string> {
  const { data: patterns } = await (supabase as any)
    .from("global_patterns")
    .select("*")
    .gt("frequency", 0.6)
    .gt("confidence_score", 0.3);

  if (!patterns || patterns.length === 0) return "";

  const adjustments: string[] = [];
  for (const p of patterns as any[]) {
    if (p.pattern === 'REDUCE_MILESTONES') {
      adjustments.push("Default to a leaner milestone list (3-4 items) unless complexity strictly requires more, as most users prefer smaller scopes.");
    }
    if (p.pattern === 'REDUCE_RECOMMENDED_STACK') {
      adjustments.push("Prefer minimalist technology stacks over complex infrastructure by default.");
    }
  }

  if (adjustments.length === 0) return "";

  return `\nGLOBAL PRODUCT PATTERNS (V${patterns.length}):\n- ${adjustments.join("\n- ")}`;
}
