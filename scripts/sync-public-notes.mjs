#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const mediaExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".heic",
  ".heif",
  ".avif",
  ".mov",
  ".mp4",
  ".m4v",
  ".webm",
  ".avi",
  ".mkv",
  ".pdf",
])

const ignoredDirectoryNames = new Set([
  ".git",
  ".obsidian",
  ".trash",
  "node_modules",
  "content",
  "public",
  ".quartz-cache",
])

function parseArgs(argv) {
  const args = new Map()
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith("--")) continue
    const key = arg.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith("--")) {
      args.set(key, true)
    } else {
      args.set(key, next)
      i += 1
    }
  }
  return args
}

function toBool(value) {
  if (typeof value === "boolean") return value
  if (typeof value !== "string") return false
  return ["true", "yes", "1", "on"].includes(value.trim().toLowerCase())
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { data: {}, body: markdown, raw: "" }

  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([^\s:#][^:\r\n]*):\s*(.*)$/u)
    if (!pair) continue
    const key = pair[1].trim()
    let value = pair[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (["true", "false"].includes(value.toLowerCase())) {
      data[key] = value.toLowerCase() === "true"
    } else {
      data[key] = value
    }
  }

  return {
    data,
    body: markdown.slice(match[0].length),
    raw: match[0],
    frontmatter: match[1],
  }
}

function walkFiles(dir, visitor) {
  for (const name of fs.readdirSync(dir)) {
    if (ignoredDirectoryNames.has(name)) continue
    const filePath = path.join(dir, name)
    const stat = fs.lstatSync(filePath)
    if (stat.isDirectory()) {
      walkFiles(filePath, visitor)
    } else if (stat.isFile()) {
      visitor(filePath)
    }
  }
}

function ensureInsideRoot(root, target) {
  const relative = path.relative(root, target)
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes root: ${target}`)
  }
}

function slugToRelativePath(slug) {
  const clean = String(slug).trim().replace(/^\/+/, "").replace(/\/+$/, "")

  if (!clean) return "index.md"
  return clean.endsWith(".md") ? clean : `${clean}.md`
}

function isFolderIndexNote(vaultRoot, notePath) {
  const relative = path.relative(vaultRoot, notePath)
  const noteName = path.basename(notePath, path.extname(notePath))
  const folderName = path.basename(path.dirname(notePath))

  if (noteName !== folderName) return null
  const folder = path.dirname(relative)
  return folder === "." ? "index.md" : path.join(folder, "index.md")
}

function destinationForNote(vaultRoot, notePath, frontmatter) {
  if (
    toBool(frontmatter.home) ||
    toBool(frontmatter["publish-home"]) ||
    toBool(frontmatter["dg-home"])
  ) {
    return "index.md"
  }
  if (frontmatter.slug) return slugToRelativePath(frontmatter.slug)
  const folderIndex = isFolderIndexNote(vaultRoot, notePath)
  if (folderIndex) return folderIndex
  return path.relative(vaultRoot, notePath)
}

function titleForNote(relativePath, frontmatter) {
  return frontmatter.title || path.basename(relativePath, path.extname(relativePath))
}

function normalizeMarkdownAssetLinks(markdown) {
  return markdown.replace(/(!?\[[^\]]*\]\()<?\/?assets\//g, "$1/assets/")
}

function hasFrontmatterKey(lines, key) {
  return lines.some((line) =>
    line.match(new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:`)),
  )
}

function normalizeFrontmatterDates(markdown) {
  const { data, body, raw, frontmatter } = parseFrontmatter(markdown)
  if (!raw) return markdown

  const dateValue = data["작성일"] || data.date
  if (!dateValue) return markdown

  const value = String(dateValue).trim()
  if (!value) return markdown

  const lines = frontmatter.split(/\r?\n/)
  const additions = []
  for (const key of ["created", "published", "modified"]) {
    if (!hasFrontmatterKey(lines, key)) additions.push(`${key}: ${value}`)
  }
  if (additions.length === 0) return markdown

  const insertAfterKey = ["작성일", "date"].find((key) => hasFrontmatterKey(lines, key))
  const insertIndex = insertAfterKey
    ? lines.findIndex((line) =>
        line.match(new RegExp(`^${insertAfterKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:`)),
      )
    : lines.length - 1

  lines.splice(insertIndex + 1, 0, ...additions)
  return ["---", ...lines, "---", body].join("\n")
}

function cleanMarkdown(markdown) {
  return normalizeMarkdownAssetLinks(normalizeFrontmatterDates(markdown))
}

function stripFencedCodeBlocks(markdown) {
  return markdown.replace(/(^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\2(?=\n|$)/g, "$1")
}

function stripLinkTarget(rawTarget) {
  let target = rawTarget.trim()
  if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1)
  target = target.split(/\s+["'][^"']*["']\s*$/)[0]
  return decodeURI(target)
}

function assetPathFromTarget(vaultRoot, rawTarget) {
  const target = stripLinkTarget(rawTarget)
  if (/^(https?:|mailto:|data:|#)/i.test(target)) return null

  const withoutHash = target.split("#")[0]
  const normalized = withoutHash.replace(/^\/+/, "")
  const ext = path.extname(normalized).toLowerCase()
  if (!mediaExtensions.has(ext)) return null

  if (normalized.startsWith("assets/")) return normalized
  return path.join("assets", path.basename(normalized))
}

function collectAssetReferences(markdown) {
  const refs = new Set()

  for (const match of markdown.matchAll(/!\[\[([^\]|#^]+)(?:[#^][^\]|]*)?(?:\|[^\]]*)?\]\]/g)) {
    const target = assetPathFromTarget("", match[1])
    if (target) refs.add(target)
  }

  for (const match of markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = assetPathFromTarget("", match[1])
    if (target) refs.add(target)
  }

  for (const match of markdown.matchAll(
    /<(?:img|video|source)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
  )) {
    const target = assetPathFromTarget("", match[1])
    if (target) refs.add(target)
  }

  return refs
}

function copyFile(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.copyFileSync(source, destination)
}

function writePublishedIndex(contentRoot, publishedNotes) {
  const lines = ["---", "title: ddalpange", "---", "", "# ddalpange", ""]

  if (publishedNotes.length === 0) {
    lines.push("아직 공개로 표시된 노트가 없습니다.", "")
  } else {
    lines.push("공개 노트 목록입니다.", "")
    for (const note of publishedNotes.toSorted((a, b) => a.title.localeCompare(b.title))) {
      const href = note.outputRelative.replace(/\.md$/, "")
      lines.push(`- [${note.title}](${href})`)
    }
    lines.push("")
  }

  fs.writeFileSync(path.join(contentRoot, "index.md"), lines.join("\n"))
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/")
}

function linkFrom(fromRelative, toRelative) {
  const fromDir = path.dirname(fromRelative)
  return toPosixPath(path.relative(fromDir, toRelative)).replace(/\.md$/, "")
}

function markdownLink(title, href) {
  return `[${title.replace(/]/g, "\\]")}](<${href.replace(/>/g, "%3E")}>)`
}

function buildTechBlogPostList(rootNote, publishedNotes) {
  const posts = publishedNotes
    .filter((note) => toPosixPath(note.outputRelative).startsWith("기술 블로그/Posts/"))
    .toSorted((a, b) => {
      const dateA = String(a.frontmatter["작성일"] || a.frontmatter.published || "")
      const dateB = String(b.frontmatter["작성일"] || b.frontmatter.published || "")
      return dateB.localeCompare(dateA) || a.title.localeCompare(b.title)
    })

  if (posts.length === 0) return ""

  const lines = ["## Posts", ""]
  for (const post of posts) {
    const date = post.frontmatter["작성일"] || post.frontmatter.published
    const href = linkFrom(rootNote.outputRelative, post.outputRelative)
    const prefix = date ? `${date} · ` : ""
    lines.push(`- ${prefix}${markdownLink(post.title, href)}`)
  }
  return lines.join("\n")
}

function expandGeneratedEmbeds(note, publishedNotes) {
  if (toPosixPath(note.outputRelative) !== "기술 블로그/index.md") return note.content

  const postList = buildTechBlogPostList(note, publishedNotes)
  let inserted = false
  let content = note.content.replace(/^\s*!\[\[[^\]]+\.base\]\]\s*$/gmu, () => {
    if (inserted || !postList) return ""
    inserted = true
    return postList
  })

  if (!inserted && postList) {
    content = `${content.trimEnd()}\n\n${postList}\n`
  }

  return content.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n"
}

const args = parseArgs(process.argv.slice(2))
const siteRoot = path.resolve(args.get("site") || process.env.QUARTZ_SITE || process.cwd())
const vaultRoot = path.resolve(
  args.get("vault") ||
    process.env.OBSIDIAN_VAULT ||
    path.join(siteRoot, "..", "obsidian-vault", "기본"),
)
const contentRoot = path.join(siteRoot, "content")
const dryRun = args.has("dry-run")

if (!fs.existsSync(vaultRoot)) {
  throw new Error(`Vault path does not exist: ${vaultRoot}`)
}

const publishedNotes = []
const missingAssets = []
const assetReferences = new Set()

walkFiles(vaultRoot, (notePath) => {
  if (path.extname(notePath).toLowerCase() !== ".md") return

  const original = fs.readFileSync(notePath, "utf8")
  const { data } = parseFrontmatter(original)
  if (!toBool(data.publish) && !toBool(data["dg-publish"])) return
  if (toBool(data.draft)) return

  const outputRelative = destinationForNote(vaultRoot, notePath, data)
  const outputPath = path.join(contentRoot, outputRelative)
  ensureInsideRoot(contentRoot, outputPath)

  const cleaned = cleanMarkdown(original)
  for (const ref of collectAssetReferences(stripFencedCodeBlocks(cleaned))) {
    assetReferences.add(ref)
  }

  publishedNotes.push({
    input: notePath,
    outputRelative,
    outputPath,
    title: titleForNote(outputRelative, data),
    frontmatter: data,
    home: outputRelative === "index.md",
    content: cleaned,
  })
})

if (!dryRun) {
  fs.rmSync(contentRoot, { recursive: true, force: true })
  fs.mkdirSync(contentRoot, { recursive: true })
}

for (const note of publishedNotes) {
  if (!dryRun) {
    fs.mkdirSync(path.dirname(note.outputPath), { recursive: true })
    fs.writeFileSync(note.outputPath, expandGeneratedEmbeds(note, publishedNotes))
  }
}

if (!publishedNotes.some((note) => note.home)) {
  if (!dryRun) writePublishedIndex(contentRoot, publishedNotes)
}

for (const ref of assetReferences) {
  const source = path.join(vaultRoot, ref)
  const destination = path.join(contentRoot, ref)
  ensureInsideRoot(contentRoot, destination)
  if (!fs.existsSync(source)) {
    missingAssets.push(ref)
    continue
  }
  if (!dryRun) copyFile(source, destination)
}

console.log(
  JSON.stringify(
    {
      vaultRoot,
      siteRoot,
      publishedNotes: publishedNotes.length,
      copiedAssets: assetReferences.size - missingAssets.length,
      missingAssets,
      dryRun,
    },
    null,
    2,
  ),
)

if (missingAssets.length > 0) {
  process.exitCode = 1
}
