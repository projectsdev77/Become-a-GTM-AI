interface DbErrorLike {
  message?: string
  code?: string
}

// Postgres error codes worth a specific, human message. See
// https://www.postgresql.org/docs/current/errcodes-appendix.html
const CODE_MESSAGES: Record<string, string> = {
  '22P02': "That value isn't in a format this field accepts — double-check it and try again.",
  '22003': "That number is too large for this field.",
  '23502': 'A required field is missing.',
  '23505': 'That already exists — try a different value.',
  '23503': 'That references something that no longer exists.',
  '22001': "That's too long for this field — try shortening it.",
  '23514': "That value isn't allowed for this field.",
}

/**
 * Never show a raw Postgres/PostgREST error straight to a user — messages
 * like `invalid input syntax for type integer: "2.2"` name internal column
 * types and are meaningless outside the database. Translate known error
 * codes to plain language; anything unrecognized falls back to a generic
 * message rather than leaking the raw string.
 */
export function friendlyDbError(
  error: DbErrorLike | string | null | undefined,
  fallback = 'Something went wrong saving this. Please try again.',
): string {
  if (!error) return fallback
  const err = typeof error === 'string' ? { message: error } : error
  if (err.code && CODE_MESSAGES[err.code]) return CODE_MESSAGES[err.code]
  return fallback
}
