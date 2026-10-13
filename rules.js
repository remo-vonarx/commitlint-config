import TYPES from '@gitmoji/commit-types'
import gitmojiPlugin from 'commitlint-plugin-gitmoji'
import { gitmojis } from 'gitmojis'

import { GITMOJI_TYPES } from './gitmoji-types.js'

/**
 * This script helps to enforce rules for using the correct gitmoji in commits. Every error message names the violation,
 * the rule behind it, and the concrete ways out.
 */

/** Where people look up the map: in consuming projects the file sits deep in node_modules. */
const MAP = 'https://github.com/remo-vonarx/commitlint-config/blob/main/gitmoji-types.js'

const byCode = new Map(gitmojis.map(gitmoji => [gitmoji.code, gitmoji]))

/** Every gitmoji that carries a given type, for suggesting a way out. */
const carriers = wanted =>
  Object.entries(GITMOJI_TYPES)
    .filter(([, types]) => types.includes(wanted))
    .map(([code]) => byCode.get(code))

const describe = gitmoji => `${gitmoji.emoji} ${gitmoji.description.replace(/\.$/u, '')}`
const bullets = lines => lines.map(line => `      ${line}`).join('\n')
const list = types => types.map(type => `\`${type}:\``).join(' or ')

/** The gitmoji a header opens with. Only the emoji counts: this repo does not accept `:code:` spelling. */
// No gitmoji contains a space, so the trailing one makes the match unambiguous.
const leadingGitmoji = header => gitmojis.find(gitmoji => header.startsWith(`${gitmoji.emoji} `)) ?? null

/** A gitmoji written as `:code:`, so the error can name the emoji to use instead. */
const leadingCode = header => byCode.get(/^(:[\w+-]+:)\s/u.exec(header)?.[1]) ?? null

const upstream = gitmojiPlugin.rules['start-with-gitmoji']

/** U+FE0F, which 19 gitmoji carry (e.g. ♻️) and many keyboards and copy sources drop. */
const withoutSelector = text => text.replaceAll('\uFE0F', '')

export const startWithGitmoji = (parsed) => {
  const [pass] = upstream(parsed)
  // Upstream searches the whole raw message, so `feat: add :sparkles: grid` passes it — the anchor is ours.
  if (pass && leadingGitmoji(parsed.header ?? '')) return [true, 'passed']

  const code = leadingCode(parsed.header ?? '')
  if (code) {
    // Suggest a header that passes as a whole: keep their type if this gitmoji allows it.
    const allowed = GITMOJI_TYPES[code.code] ?? []
    const type = allowed.includes(parsed.type) ? parsed.type : allowed[0] ?? '<type>'
    return [
      false,
      `this repo writes gitmoji as emoji, not as \`${code.code}\` — replace it with ${code.emoji}: \`${code.emoji} ${type}: ${parsed.subject ?? '…'}\`.`,
    ]
  }

  const bare = withoutSelector(parsed.header ?? '')
  const almost = gitmojis.find(gitmoji => bare.startsWith(`${withoutSelector(gitmoji.emoji)} `))
  if (almost) {
    return [
      false,
      `${almost.emoji} looks right, but its invisible variation selector (U+FE0F) differs from gitmoji.dev's, so it does not match byte for byte.\n`
      + `    Pick it from \`pnpm commit\` or copy it from gitmoji.dev — both always match.`,
    ]
  }

  return [
    false,
    `A commit message must open with a gitmoji, then a type, then the summary – for example \`✨ feat: add the binder grid\`.\n`
    + `    - What you wrote does not start with one of the ${gitmojis.length} gitmoji this repo accepts.\n`
    + `    - Every accepted emoji is listed in ${MAP}, next to the type it pairs with. Pick the one whose meaning matches the change.`,
  ]
}

/** The emoji and the type must mean the same thing. */
export const gitmojiTypeMatch = ({ header, type }) => {
  // An unreadable emoji or an out-of-enum type belongs to start-with-gitmoji and
  // type-enum — two errors for one mistake reads as two mistakes.
  if (!header || !type || !TYPES.includes(type)) return [true, 'passed']

  const gitmoji = leadingGitmoji(header)
  if (!gitmoji) return [true, 'passed']

  const allowed = GITMOJI_TYPES[gitmoji.code]
  if (!allowed) {
    return [
      false,
      `${gitmoji.emoji} ${gitmoji.code} is on gitmoji.dev, but ${MAP} gives it no type — @remo-vonarx/commitlint-config has no convention for it yet.\n`
      + `    Add one there, as \`'${gitmoji.code}': ['<type>']\`, choosing from: ${TYPES.join(', ')}.`,
    ]
  }

  if (allowed.includes(type)) return [true, 'passed']

  const options = carriers(type)
  return [
    false,
    `${gitmoji.emoji} means "${gitmoji.description.replace(/\.$/u, '')}", which this repo pairs with ${list(allowed)} — but you wrote \`${type}:\`.\n`
    + `    Change one side so the two agree:\n`
    + `      • keep the emoji, and write \`${gitmoji.emoji} ${allowed[0]}: …\`\n`
    + `      • keep \`${type}:\`, and open with a gitmoji that means it — all ${options.length}:\n`
    + bullets(options.map(describe))
    + `\n    The full map is ${MAP}.`,
  ]
}

/** The 50/72 rule, counted in graphemes rather than UTF-16 code units. */
const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
const count = text => [...segmenter.segment(text)].length

const MAX_SUMMARY = 50
const MAX_BODY = 72

/**
 * The summary after `<emoji> <type>(<scope>): `, as the gitmoji parser splits it. Counting the subject rather than the
 * header keeps the prefix free whatever its width — `:building_construction:`, a scope, or `refactor` cost nothing.
 */
export const subjectMaxGraphemes = ({ subject }) => {
  // No subject means the header did not parse; subject-empty and type-empty say so.
  if (!subject) return [true, 'passed']

  const length = count(subject)
  const over = length - MAX_SUMMARY
  return [
    over <= 0,
    `the summary after the type is ${length} characters, ${over} over the ${MAX_SUMMARY} allowed.\n`
    + `    The emoji, type and scope do not count, so shortening them will not help.\n`
    + `    Cut ${over} character${over === 1 ? '' : 's'} from the summary. Say only what changed; the why belongs in the body, after a blank line.`,
  ]
}

const TRAILER = /^[A-Za-z][\w-]*: /u

/** `git commit -v` appends the diff below this line; git discards everything after it. */
const SCISSORS = /^# -+ >8 -+\r?$/mu

/** The body as prose: no subject, comments, diff, or trailing trailer block (`Co-authored-by: …`). */
const prose = (raw) => {
  const [message] = raw.split(SCISSORS)
  const paragraphs = message
    .split('\n')
    .slice(1) // the subject is subject-max-graphemes' business
    .filter(line => !line.startsWith('#'))
    .join('\n')
    .split(/\n\s*\n/u)
    .map(paragraph => paragraph.split('\n').map(line => line.trim()).filter(Boolean))
    .filter(paragraph => paragraph.length)

  // Like git, only the final paragraph can be trailers — `Note: …` mid-body is prose.
  if (paragraphs.at(-1)?.every(line => TRAILER.test(line))) paragraphs.pop()
  return paragraphs.flat().join(' ')
}

export const bodyMaxGraphemes = ({ raw }) => {
  if (!raw) return [true, 'passed']

  const body = prose(raw)
  if (!body) return [true, 'passed']

  const length = count(body)
  const over = length - MAX_BODY
  return [
    over <= 0,
    `the body is ${length} characters, ${over} over the ${MAX_BODY} allowed.\n`
    + `    - Keep the body to one short sentence, or drop it: a subject alone is a valid commit.\n`
    + `    - If the change genuinely needs more explaining than ${MAX_BODY} characters, it is usually several commits wearing one hat — split it.`,
  ]
}
