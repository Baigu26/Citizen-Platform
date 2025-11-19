// This file contains functions to find similar issues
// We use multiple algorithms for better matching

/**
 * Normalize text for better comparison
 * Removes common words, punctuation, and standardizes spacing
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
}

/**
 * Calculate word-based similarity (Jaccard similarity)
 * Better for detecting similar content regardless of word order
 */
function calculateWordSimilarity(str1: string, str2: string): number {
  const words1 = new Set(normalizeText(str1).split(' ').filter(w => w.length > 2))
  const words2 = new Set(normalizeText(str2).split(' ').filter(w => w.length > 2))

  if (words1.size === 0 || words2.size === 0) return 0

  // Calculate intersection and union
  const intersection = new Set([...words1].filter(w => words2.has(w)))
  const union = new Set([...words1, ...words2])

  // Jaccard similarity = intersection / union
  return intersection.size / union.size
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 * This uses Levenshtein distance algorithm
 */
function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  // Convert to lowercase for better matching
  const s1 = normalizeText(str1)
  const s2 = normalizeText(str2)

  // If strings are identical, return perfect score
  if (s1 === s2) return 1

  // If either string is empty, return 0
  if (s1.length === 0 || s2.length === 0) return 0

  // Calculate Levenshtein distance
  const matrix: number[][] = []

  // Initialize matrix
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j
  }

  // Fill in the matrix
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1,     // deletion
          matrix[i - 1][j - 1] + 1  // substitution
        )
      }
    }
  }

  const distance = matrix[s2.length][s1.length]
  const maxLength = Math.max(s1.length, s2.length)
  
  // Return similarity score (0-1)
  return 1 - distance / maxLength
}

/**
 * Calculate combined similarity using multiple algorithms
 * This gives us the best of both worlds
 */
function calculateSimilarity(str1: string, str2: string): number {
  // Get both similarity scores
  const wordSimilarity = calculateWordSimilarity(str1, str2)
  const levenshteinSimilarity = calculateLevenshteinSimilarity(str1, str2)

  // Weight word similarity more heavily (70%) as it handles word order better
  // Levenshtein is good for typos and small differences (30%)
  const combined = (wordSimilarity * 0.7) + (levenshteinSimilarity * 0.3)
  
  // Debug logging
  if (combined > 0.3) { // Only log if there's some similarity
    console.log(`Similarity between "${str1}" and "${str2}":`, {
      word: (wordSimilarity * 100).toFixed(1) + '%',
      char: (levenshteinSimilarity * 100).toFixed(1) + '%',
      combined: (combined * 100).toFixed(1) + '%'
    })
  }
  
  return combined
}

/**
 * Check if two issues are potentially duplicates
 * Returns true if they're very similar (>65% match)
 */
export function areSimilarIssues(title1: string, title2: string): boolean {
  const similarity = calculateSimilarity(title1, title2)
  return similarity > 0.65 // 65% similarity threshold (lowered from 70% due to improved algorithm)
}

/**
 * Find all similar issues from a list
 * Returns array of issues that match the query
 */
export function findSimilarIssues<T extends { title: string; id: string }>(
  query: string,
  issues: T[],
  threshold: number = 0.5 // 50% similarity for suggestions (lowered from 60%)
): T[] {
  if (!query.trim() || issues.length === 0) return []

  // Calculate similarity for each issue
  const withScores = issues.map(issue => ({
    issue,
    score: calculateSimilarity(query, issue.title)
  }))

  // Filter by threshold and sort by score (highest first)
  return withScores
    .filter(item => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Return top 5 matches
    .map(item => item.issue)
}

/**
 * Extract keywords from a title for better matching
 * Removes common words and keeps important terms
 */
export function extractKeywords(title: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'should', 'could', 'can', 'may', 'might', 'must', 'shall'
  ])

  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 2 && !commonWords.has(word)) // Remove short and common words
}