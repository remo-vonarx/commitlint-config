# commitlint config

Clean commitlint rules using Gitmoji, made to share 🍕.

---

## Rules

```text
✨ feat(search): filter results by date

Long result lists no longer need paging to find recent items.
```

- **Gitmoji** as the emoji itself. `:sparkles:` is refused.
- **Type** must fit the gitmoji, as listed in [`gitmoji-types.js`](gitmoji-types.js): `🐛 fix:` passes, `🐛 feat:` does not.
- **Summary** max 50 characters, not counting gitmoji, type or scope.
- **Body** max 72 characters in total. Trailers like `Co-authored-by:` do not count.

---

## Setup

Run these in the root of the project that should use the rules.

1. Install the rules and the tools that run them:

   ```bash
   pnpm add -D github:remo-vonarx/commitlint-config#v1.0.0 @commitlint/cli husky gitmoji-cli
   ```

2. Tell commitlint to use the rules, and add the `prepare` and `commit` scripts:

   ```bash
   npm pkg set scripts.prepare=husky scripts.commit="gitmoji -c" 'commitlint.extends[0]=@remo-vonarx/commitlint-config'
   ```

3. Make `pnpm commit` write messages the rules accept (emoji, not `:code:`; type kept lowercase):

   ```bash
   npm pkg set gitmoji.emojiFormat=emoji
   npm pkg set gitmoji.capitalizeTitle=false --json
   ```

4. Turn on the git hook that checks every commit message:

   ```bash
   pnpm prepare
   echo 'commitlint --edit "$1"' > .husky/commit-msg
   ```

5. Commit the changes, which also tests the hook:

   ```bash
   git add package.json pnpm-lock.yaml .husky/commit-msg
   git commit -m "🔧 chore: add commit message rules"
   ```

`pnpm commit` then opens a gitmoji picker; type the type yourself at the start of the title (`feat: …`).

To update, change the tag in `package.json` (`#v1.0.0` → `#v1.1.0`) and run `pnpm install`.

---

## Working on this repo

After cloning: `pnpm install && pnpm hooks`. The pre-commit hook runs all tests (about 10 seconds).

The hooks are set up by `pnpm hooks`, not by a `prepare` script: with `prepare`, pnpm refuses to install this repo as a
git dependency unless every project allowlists it.

---

## Release

1. Bump `version` in `package.json` and commit.
2. `git push && git tag v<version> && git push origin v<version>`.
