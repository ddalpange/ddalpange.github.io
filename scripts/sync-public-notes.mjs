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
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!pair) continue
    const key = pair[1]
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

function destinationForNote(vaultRoot, notePath, frontmatter) {
  if (
    toBool(frontmatter.home) ||
    toBool(frontmatter["publish-home"]) ||
    toBool(frontmatter["dg-home"])
  ) {
    return "index.md"
  }
  if (frontmatter.slug) return slugToRelativePath(frontmatter.slug)
  return path.relative(vaultRoot, notePath)
}

function titleForNote(relativePath, frontmatter) {
  return frontmatter.title || path.basename(relativePath, path.extname(relativePath))
}

function normalizeMarkdownAssetLinks(markdown) {
  return markdown.replace(/(!?\[[^\]]*\]\()<?\/?assets\//g, "$1/assets/")
}

function cleanMarkdown(markdown) {
  return normalizeMarkdownAssetLinks(markdown)
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
  for (const ref of collectAssetReferences(cleaned)) assetReferences.add(ref)

  publishedNotes.push({
    input: notePath,
    outputRelative,
    outputPath,
    title: titleForNote(outputRelative, data),
    home: outputRelative === "index.md",
    content: cleaned,
  })
})

if (!dryRun) {
  fs.rmSync(contentRoot, { recursive: true, force: true })
  fs.mkdirSync(contentRoot, { recursive: true })
}

for (const note of publishedNotes) {
  if (!dryRun) copyFile(note.input, note.outputPath)
  if (!dryRun) fs.writeFileSync(note.outputPath, note.content)
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
