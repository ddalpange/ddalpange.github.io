# ddalpange.github.io

Quartz site for selected public notes from the private Obsidian vault.

## Publishing

Mark a note public with frontmatter:

```md
---
publish: true
title: My public note
---
```

Use `home: true` on one published note to make it the site homepage.

Then sync public notes into this site:

```sh
npm run sync:notes
npm run build
```

Only notes with `publish: true` are copied into `content/`. Referenced files under the vault `assets/` directory are copied selectively.
