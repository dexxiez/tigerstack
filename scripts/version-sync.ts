import fs from "node:fs";

const packageJsonFiles = [
  "packages/core/package.json",
  "packages/http/package.json",
];

const getRootVersion = (): string => {
  const rootPackageJson = JSON.parse(
    fs.readFileSync("package.json", { encoding: "utf-8" }),
  );
  return rootPackageJson.version;
};

const updatePackageJson = (file: string, version: string) => {
  const packageJson = JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
  packageJson.version = version;

  // If pnpm publish config IN packages contains any dependencies start start with "@tigerstack/", update them too
  if (packageJson.publishConfig?.dependencies) {
    Object.keys(packageJson.publishConfig.dependencies).forEach(
      (dependency) => {
        if (dependency.startsWith("@tigerstack/")) {
          packageJson.publishConfig.dependencies[dependency] = version;
        }
      },
    );
  }

  fs.writeFileSync(file, JSON.stringify(packageJson, null, 2));
};

const rootVersion = getRootVersion();
packageJsonFiles.forEach((file) => updatePackageJson(file, rootVersion));
console.info(`Updated versions in package.json files to ${rootVersion}`);
