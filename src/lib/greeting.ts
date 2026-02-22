/** Returns greeting based on hour: Good morning/afternoon/evening */
export function getTimeBasedGreeting(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/** Full greeting text: "Good morning", "Good afternoon", "Good evening" */
export function getGreetingText(): string {
  const g = getTimeBasedGreeting();
  return g === 'morning' ? 'Good morning' : g === 'afternoon' ? 'Good afternoon' : 'Good evening';
}

export function getActivityGreeting(hasWorkoutToday: boolean, completedWorkoutToday: boolean): string {
  if (completedWorkoutToday) return 'Great job on your workout today';
  const g = getTimeBasedGreeting();
  if (g === 'morning') return "Let's get active";
  if (g === 'afternoon') return hasWorkoutToday ? "Let's get active" : 'Still time for a quick sweat session';
  return hasWorkoutToday ? "It's not too late to fit a workout in" : 'Great evening to reset and recover';
}

/** Extract first name from full name */
export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}
