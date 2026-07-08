import type { QuartzTransformerPlugin } from "../types"

const openCalloutToggleRegex = /^((?:>\s*)+\[![\w-]+(?:\|[^\]]*)?\])\+(.*)$/gm

export const CollapseCalloutsByDefault: QuartzTransformerPlugin = () => ({
  name: "CollapseCalloutsByDefault",
  textTransform(_ctx, src) {
    return src.replace(openCalloutToggleRegex, "$1-$2")
  },
})
