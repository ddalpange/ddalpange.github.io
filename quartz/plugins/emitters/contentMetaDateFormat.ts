import fs from "fs/promises"
import path from "path"
import { FilePath } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"

const contentMetaTimeRegex =
  /(<p\b(?=[^>]*\bclass="[^"]*\bcontent-meta\b[^"]*")[^>]*>[\s\S]*?<time\b[^>]*\bdatetime="([^"]+)"[^>]*>)([\s\S]*?)(<\/time>)/g

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function formatYearMonth(datetime: string, locale: string): string | undefined {
  const date = new Date(datetime)
  if (Number.isNaN(date.getTime())) return undefined

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).format(date)
}

async function collectHtmlFiles(dir: string): Promise<FilePath[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fp = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return collectHtmlFiles(fp)
      }

      return entry.isFile() && entry.name.endsWith(".html") ? ([fp as FilePath] as FilePath[]) : []
    }),
  )

  return files.flat()
}

export const ContentMetaDateFormat: QuartzEmitterPlugin = () => ({
  name: "ContentMetaDateFormat",
  async emit(ctx) {
    const locale = ctx.cfg.configuration.locale ?? "en-US"
    const htmlFiles = await collectHtmlFiles(ctx.argv.output)
    const changedFiles: FilePath[] = []

    for (const outputPath of htmlFiles) {
      const html = await fs.readFile(outputPath, "utf-8")
      let changed = false

      const formatted = html.replace(
        contentMetaTimeRegex,
        (match, open: string, datetime: string, _current: string, close: string) => {
          const yearMonth = formatYearMonth(datetime, locale)
          if (!yearMonth) return match

          changed = true
          return `${open}${escapeHtml(yearMonth)}${close}`
        },
      )

      if (!changed) continue

      await fs.writeFile(outputPath, formatted)
      changedFiles.push(outputPath)
    }

    return changedFiles
  },
})
