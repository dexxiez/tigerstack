import { core } from "./core.js";

describe("default test", () => {
  it("should return core", () => {
    const x = core();
    expect(x).toBe("core");
  });
});
