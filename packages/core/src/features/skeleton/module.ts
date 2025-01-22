import { ConfigurableModule } from "src/stack.ts";
import { SkeletonModuleBase, SkeletonModuleConfig } from "./types.ts";

export class SkeletonModule
  implements ConfigurableModule<SkeletonModuleConfig>
{
  config: SkeletonModuleConfig | null = null;
  instance: SkeletonModuleBase | null = null;

  configure(config: SkeletonModuleConfig): void {
    this.config = config;
    this.instance = new this.config.entry();
  }
  async onBootstrap(): Promise<void> {
    if (this.config === null) throw new Error("Skeleton Module not configured");
    if (this.instance === null)
      throw new Error("Skeleton Module could not be instantiated");

    return this.instance.entry();
  }
}
