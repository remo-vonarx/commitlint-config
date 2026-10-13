import {
  bodyMaxGraphemes,
  gitmojiTypeMatch,
  startWithGitmoji,
  subjectMaxGraphemes,
} from './rules.js'

/**
 * Gitmoji commit rules, shared across projects. `start-with-gitmoji` is commitlint-plugin-gitmoji's only rule and is
 * re-declared here, not merged: commitlint files every inline plugin object under the same `local` key, so a second
 * entry in `plugins` would silently displace the first.
 */
export default {
  extends: ['gitmoji'],
  plugins: [
    {
      rules: {
        'start-with-gitmoji': startWithGitmoji,
        'gitmoji-type-match': gitmojiTypeMatch,
        'subject-max-graphemes': subjectMaxGraphemes,
        'body-max-graphemes': bodyMaxGraphemes,
      },
    },
  ],
  rules: {
    'gitmoji-type-match': [2, 'always'],
    'subject-max-graphemes': [2, 'always'],
    'body-max-graphemes': [2, 'always'],

    // Off: subject-max-graphemes owns length. The inherited 100 disagrees about
    // the limit and the unit, so one mistake was reported twice with two numbers.
    'header-max-length': [0],
  },
}
