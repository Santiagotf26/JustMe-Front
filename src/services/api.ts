/**
 * Simulate API calls with delays
 */
export async function mockApiCall<T>(data: T, delayMs: number = 800): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), delayMs));
}

export async function mockApiError(message: string, delayMs: number = 600): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delayMs));
}

/**
 * Simulate a search with loading
 */
export async function searchProfessionals<T>(
  allProfessionals: T[],
  filterFn: (pro: T) => boolean,
  delayMs: number = 1200
): Promise<T[]> {
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return allProfessionals.filter(filterFn);
}
