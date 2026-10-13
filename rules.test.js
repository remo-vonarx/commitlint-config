import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { describe, it } from 'node:test'

import TYPES from '@gitmoji/commit-types'
import gitmojiConfig from 'commitlint-config-gitmoji'
import { gitmojis } from 'gitmojis'

import { GITMOJI_TYPES } from './gitmoji-types.js'
import { gitmojiTypeMatch, startWithGitmoji } from './rules.js'

/**
 * Runs each message through the real `commitlint` binary with this package's index.js, so the config, the gitmoji parser
 * and our rules are tested together — the same path a project's commit-msg hook takes.
 */
const lint = message => new Promise((resolve) => {
  const child = execFile('node_modules/.bin/commitlint', ['--config', 'index.js'], (error, stdout) => {
    // Each failure line ends with its rule name in brackets.
    resolve(error ? [...stdout.matchAll(/\[([\w-]+)\]$/gmu)].map(([, rule]) => rule) : [])
  })
  child.stdin.end(message)
})

const a = n => 'a'.repeat(n)
const long = 'x'.repeat(60)

const cases = [
  // [label, message, rules expected to fail]
  ['unicode gitmoji', '✨ feat: add the binder grid', []],
  ['code gitmoji is refused', ':sparkles: feat: add the binder grid', ['start-with-gitmoji']],
  ['scope', '✨ feat(binder): add the binder grid', []],
  ['emoji with variation selector', '♻️ refactor: tidy binder', []],

  ['emoji without variation selector', '♻ refactor: tidy binder', ['start-with-gitmoji']],
  ['gitmoji not at the start', 'feat: add :sparkles: grid', ['start-with-gitmoji', 'subject-empty', 'type-empty']],
  ['no gitmoji', 'feat: add grid', ['start-with-gitmoji', 'subject-empty', 'type-empty']],
  ['emoji and type disagree', '🐛 feat: add grid', ['gitmoji-type-match']],
  ['code with any type is refused once', ':bug: feat: add grid', ['start-with-gitmoji']],
  ['emoji not on gitmoji.dev', '🃏 feat: add grid', ['start-with-gitmoji']],
  ['code not on gitmoji.dev', ':joker: feat: add grid', ['start-with-gitmoji']],
  ['breaking change keeps the pairing', '✨ feat(binder)!: drop the old grid', []],
  ['capitalised type (gitmoji-cli default)', '✨ Feat: add grid', ['type-enum', 'type-case']],

  ['50-char summary', `✨ feat: ${a(50)}`, []],
  ['51-char summary', `✨ feat: ${a(51)}`, ['subject-max-graphemes']],
  ['50-char summary behind the longest type', `🏗️ refactor: ${a(50)}`, []],
  ['50-char summary behind a scope', `✨ feat(binder): ${a(50)}`, []],
  ['emoji in the summary counts once', `✨ feat: ${a(49)}🃏`, []],

  ['short body', '✨ feat: add grid\n\nShort body here.', []],
  ['body over 72', `✨ feat: add grid\n\n${long}\n${long}`, ['body-max-graphemes']],
  ['trailers do not count', '✨ feat: add grid\n\nShort body.\n\nCo-authored-by: A <a@b.c>\nRefs: #12', []],
  ['trailer-looking prose mid-body counts', `✨ feat: add grid\n\nNote: ${long}\n\n${long}`, ['body-max-graphemes']],
  ['comments do not count', `✨ feat: add grid\n\n# ${long}\n# ${long}`, []],
  ['git commit -v diff does not count',
    `✨ feat: add grid\n\nShort body.\n# ------------------------ >8 ------------------------\n# Do not modify.\ndiff --git a/x b/x\n+${long}${long}`,
    []],
]

describe('commitlint', { concurrency: true }, () => {
  for (const [label, message, expected] of cases) {
    it(label, async () => {
      assert.deepEqual((await lint(message)).sort(), [...expected].sort())
    })
  }
})

describe('gitmoji-types.js', () => {
  const codes = gitmojis.map(gitmoji => gitmoji.code)

  it('maps every gitmoji on gitmoji.dev, and nothing else', () => {
    assert.deepEqual(Object.keys(GITMOJI_TYPES).sort(), [...codes].sort())
  })

  it('uses only conventional-commit types', () => {
    for (const [code, types] of Object.entries(GITMOJI_TYPES)) {
      assert.ok(types.length, `${code} has no type`)
      for (const type of types) assert.ok(TYPES.includes(type), `${code}: unknown type ${type}`)
    }
  })

  it('gives every type at least one gitmoji', () => {
    const carried = new Set(Object.values(GITMOJI_TYPES).flat())
    assert.deepEqual(TYPES.filter(type => !carried.has(type)), [])
  })
})

/**
 * Every gitmoji × every type × both spellings (1776 headers), parsed with the gitmoji header pattern commitlint uses, so
 * the hook accepts exactly the emoji pairings gitmoji-types.js allows, and no `:code:` at all. Rules are called directly:
 * the CLI would take minutes.
 */
describe('gitmoji ↔ type pairing', () => {
  const { headerPattern } = gitmojiConfig.parserPreset.parserOpts
  const parse = (header) => {
    const { type = null, subject = null } = headerPattern.exec(header)?.groups ?? {}
    return { raw: header, header, type, subject }
  }
  const passes = (parsed) => {
    const start = startWithGitmoji(parsed)[0]
    const pair = gitmojiTypeMatch(parsed)[0]
    return start && pair && TYPES.includes(parsed.type)
  }

  for (const gitmoji of gitmojis) {
    it(`${gitmoji.emoji} ${gitmoji.code} pairs only with ${GITMOJI_TYPES[gitmoji.code]?.join(', ')}`, () => {
      const wrong = TYPES.flatMap((type) => {
        const allowed = GITMOJI_TYPES[gitmoji.code].includes(type)
        return [[gitmoji.emoji, allowed], [gitmoji.code, false]]
          .map(([lead, expected]) => [`${lead} ${type}: add the binder grid`, expected])
          .filter(([header, expected]) => passes(parse(header)) !== expected)
          .map(([header]) => header)
      })
      assert.deepEqual(wrong, [])
    })
  }
})
