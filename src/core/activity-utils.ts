import type { ActivityConfig, RepoButtonConfig } from '../types/index.js';

/**
 * Injects the repo button into an ActivityConfig if showRepoButton is enabled.
 *
 * Discord RPC supports max 2 buttons per activity. This function:
 * - Does nothing if showRepoButton is false
 * - Does nothing if the activity already has 2 buttons (no room)
 * - Does nothing if the repo URL is already in the button list (dedup)
 * - Otherwise appends the repo button to fill the remaining slot(s)
 */
export function injectRepoButton(
  activity: ActivityConfig,
  repoConfig: RepoButtonConfig | null,
): ActivityConfig {
  if (!repoConfig || !repoConfig.showRepoButton) return activity;

  const existingButtons = activity.buttons ?? [];

  // Max 2 buttons — no room
  if (existingButtons.length >= 2) return activity;

  // Dedup: don't add if the repo URL already exists in a button
  if (existingButtons.some((b) => b.url === repoConfig.repoUrl)) return activity;

  return {
    ...activity,
    buttons: [...existingButtons, { label: repoConfig.repoButtonLabel, url: repoConfig.repoUrl }],
  };
}
