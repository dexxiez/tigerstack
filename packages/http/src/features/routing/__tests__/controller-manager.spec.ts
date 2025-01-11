import { describe, it, expect, vi, beforeEach } from "vitest";
import { ControllerManager } from "../controller-manager.ts";
import { RuntimeLogger } from "../../runtime/runtime-logger.ts";
import { Runtime } from "../../runtime/runtime.ts";
import { TestTools, forwardRef } from "@tigerstack/core/di";

describe("ControllerManager", () => {
  let controllerManager: ControllerManager;
  let mockLogger: RuntimeLogger;
  let mockRuntime: Runtime;

  beforeEach(() => {
    // This bit keeps erroring in setup but will come back to it (tm)
    const MockRuntime = TestTools.createMockInjectable<Runtime>(
      "MockRuntime",
      {
        config: {
          port: 3000,
          controllers: [],
        },
      },
      [forwardRef(() => ControllerManager)], // This is the key part!
    );

    const MockLogger = TestTools.createMockInjectable<RuntimeLogger>(
      "MockLogger",
      {
        warning: vi.fn(),
      },
    );

    mockLogger = new MockLogger();
    mockRuntime = new MockRuntime();

    controllerManager = new ControllerManager(mockLogger, mockRuntime);
  });

  it("warns when no controllers are found", () => {
    controllerManager.loadControllers();
    expect(mockLogger.warning).toHaveBeenCalledWith(
      "No Controllers Found. Have you hooked up any?",
    );
  });
});
