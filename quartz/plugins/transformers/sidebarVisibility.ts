import type { Root } from "hast"
import type { VFile } from "vfile"
import type { QuartzTransformerPlugin } from "../types"

function isSidebarDisabled(value: unknown): boolean {
  return value === false || value === "false"
}

const rehypeSidebarVisibility = () => {
  return (_tree: Root, file: VFile) => {
    const frontmatter = file.data.frontmatter as Record<string, unknown> | undefined
    if (isSidebarDisabled(frontmatter?.sidebar)) {
      file.data.unlisted = true
    }
  }
}

export const SidebarVisibility: QuartzTransformerPlugin = () => ({
  name: "SidebarVisibility",
  htmlPlugins() {
    return [rehypeSidebarVisibility]
  },
})
