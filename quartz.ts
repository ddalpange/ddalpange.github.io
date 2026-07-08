import * as ExternalPlugin from "./.quartz/plugins"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

const shouldShowInSidebar: NonNullable<ExternalPlugin.ExplorerOptions["filterFn"]> = (node) =>
  node.slugSegment !== "tags" && node.data?.sidebar !== false && node.data?.sidebar !== "false"

ExternalPlugin.Explorer({
  filterFn: shouldShowInSidebar,
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
