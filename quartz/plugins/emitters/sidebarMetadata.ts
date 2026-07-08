import fs from "fs/promises"
import { FilePath, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { ProcessedContent } from "../vfile"

type ContentIndexEntry = {
  sidebar?: boolean | string
  [key: string]: unknown
}

function isSidebarValue(value: unknown): value is boolean | string {
  return value === false || value === "false" || value === true || value === "true"
}

function getSidebarMetadata(content: ProcessedContent[]): Map<string, boolean | string> {
  const metadata = new Map<string, boolean | string>()

  for (const [, file] of content) {
    const slug = file.data.slug
    if (typeof slug !== "string") continue

    const frontmatter = file.data.frontmatter as Record<string, unknown> | undefined
    const sidebar = frontmatter?.sidebar
    if (isSidebarValue(sidebar)) {
      metadata.set(slug, sidebar)
    }
  }

  return metadata
}

export const SidebarMetadata: QuartzEmitterPlugin = () => ({
  name: "SidebarMetadata",
  async emit(ctx, content) {
    const metadata = getSidebarMetadata(content)
    if (metadata.size === 0) return []

    const fp = joinSegments(ctx.argv.output, "static", "contentIndex.json") as FilePath
    let raw: string

    try {
      raw = await fs.readFile(fp, "utf-8")
    } catch {
      return []
    }

    const contentIndex = JSON.parse(raw) as Record<string, ContentIndexEntry>
    let changed = false

    for (const [slug, sidebar] of metadata) {
      const entry = contentIndex[slug]
      if (!entry) continue

      entry.sidebar = sidebar
      changed = true
    }

    if (!changed) return []

    await fs.writeFile(fp, JSON.stringify(contentIndex))
    return [fp]
  },
})
