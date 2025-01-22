import fs from "node:fs";

const packageJsonFiles = [
  "packages/core/package.json",
  "packages/http/package.json",
  "packages/auth/package.json",
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

  // Update publishConfig dependencies
  if (packageJson.publishConfig?.dependencies) {
    Object.keys(packageJson.publishConfig.dependencies).forEach((dep) => {
      if (dep.startsWith("@tigerstack/")) {
        packageJson.publishConfig.dependencies[dep] = version;
      }
    });
  }

  // Update peerDependencies
  if (packageJson.peerDependencies) {
    Object.keys(packageJson.peerDependencies).forEach((dep) => {
      if (dep.startsWith("@tigerstack/")) {
        // For alpha versions, I want exact matching
        packageJson.peerDependencies[dep] = version;
      }
    });
  }

  fs.writeFileSync(file, JSON.stringify(packageJson, null, 2));
};

const rootVersion = getRootVersion();
packageJsonFiles.forEach((file) => updatePackageJson(file, rootVersion));
console.info(`Updated versions in package.json files to ${rootVersion}`);
