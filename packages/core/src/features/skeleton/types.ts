export class SkeletonModuleBase {
  async entry(): Promise<void> {
    throw new Error("Entry not implemented.");
  }
}

export interface SkeletonModuleConfig {
  name: string;
  entry: typeof SkeletonModuleBase;
}
