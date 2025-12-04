// Utility to parse and normalize freeform ingredient input from users.
// Exported for use on both frontend and backend.

export const STOP_WORDS = new Set([
  "and",
  "und",
  "mit",
  "with",
  "some",
  "a",
  "an",
  "the",
  "of",
  "to",
  "for",
  "in",
  "on",
  "by",
])

function singularize(word: string) {
  if (word.length <= 3) return word
  if (word.endsWith("ies")) return word.slice(0, -3) + "y" // e.g., berries -> berry
  if (word.endsWith("es")) return word.slice(0, -2)
  if (word.endsWith("s")) return word.slice(0, -1)
  return word
}

// Basic Levenshtein distance implementation
export function levenshtein(a: string, b: string) {
  const al = a.length
  const bl = b.length
  if (al === 0) return bl
  if (bl === 0) return al
  const matrix: number[][] = Array.from({ length: al + 1 }, (_, i) => Array(bl + 1).fill(0))
  for (let i = 0; i <= al; i++) matrix[i][0] = i
  for (let j = 0; j <= bl; j++) matrix[0][j] = j

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }
  return matrix[al][bl]
}

export function parseIngredientInput(raw: string): string[] {
  if (!raw) return []

  // Lowercase
  let s = raw.toLowerCase()

  // Normalize connectors to commas
  s = s.replace(/\band\b|\bund\b|&/g, ",")
  s = s.replace(/[;|]/g, ",")

  // Collapse whitespace and trim
  s = s.replace(/\s+/g, " ").trim()

  // Split on commas or newlines
  let parts = s.split(/,|\n/).map((p) => p.trim()).filter(Boolean)

  // If there are no commas at all and only one part, fallback to splitting on spaces
  if (parts.length === 1) {
    const maybe = parts[0]
    // if it contains spaces and isn't a single token, split
    if (maybe.includes(" ")) {
      parts = maybe.split(/\s+/).map((p) => p.trim()).filter(Boolean)
    }
  }

  const normalized: string[] = []
  for (let part of parts) {
    // remove punctuation except internal hyphens
    part = part.replace(/[\(\)\[\]"'`:\.#\$%\^&\*_=+<>?\/\\]/g, " ")
    part = part.replace(/[^\w\-\s]/g, " ")
    part = part.replace(/\s+/g, " ").trim()
    if (!part) continue

    // remove leading numbers (e.g. '2 eggs' -> 'eggs')
    part = part.replace(/^\d+\s*/, "")

    // remove stopwords tokens
    const tokens = part.split(/\s+/).filter((t) => t && !STOP_WORDS.has(t))
    if (tokens.length === 0) continue

    // take last token as the main noun (e.g., 'fresh cherry tomatoes' -> 'tomatoes')
    let main = tokens[tokens.length - 1]

    // singularize lightly
    main = singularize(main)

    if (!normalized.includes(main)) normalized.push(main)
  }

  return normalized
}

export default parseIngredientInput
