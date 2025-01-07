# IDEA FOR CLI TO CREATE PROJECT

```
npx create-my-app my-new-project
```

…and it will generate a new project folder with your desired files and configurations.

---

## Folder Structure

```
create-my-app/
├── bin/
│   └── index.js          <-- Compiled output of your CLI script
├── package.json
├── src/
│   └── index.ts          <-- Source code for your CLI
├── templates/
│   └── basic/
│       ├── package.json
│       └── README.md
├── tsconfig.json
└── README.md
```

### package.json

Key points:

1. Name your package in the format "create-xxx" (e.g., `"create-my-app"`).
2. Add a `"bin"` field pointing to the compiled cmd file (e.g., `bin/index.js`).
3. Make sure you have scripts to build TypeScript to JavaScript.
4. Once published, NPX recognizes the package name and runs your CLI.

```json
{
  "name": "create-my-app",
  "version": "1.0.0",
  "description": "A scaffolding CLI to create a new custom project",
  "main": "dist/index.js",
  "bin": {
    "create-my-app": "bin/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "tsc && node dist/index.js"
  },
  "keywords": ["cli", "npx", "scaffold", "typescript"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "typescript": "^4.8.0"
  },
  "dependencies": {
    // Add needed runtime dependencies here, e.g., chalk, prompts, etc.
  }
}
```

### tsconfig.json

Configure TypeScript compilation to output to a `dist` folder (or similar). You may customize further, but this is a simple starting point.

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "target": "ES2020",
    "module": "CommonJS",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

### src/index.ts

This is the entry point for your CLI logic. It will:

1. Parse arguments (e.g., the project name).
2. Copy template files or generate files.
3. Print status messages to the console.

Feel free to use any CLI helper libraries (like inquirer, prompts, chalk, commander, yargs, etc.) to enhance your CLI experience.

```ts
#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";

function copyFolderSync(from: string, to: string) {
  fs.mkdirSync(to, { recursive: true });
  const files = fs.readdirSync(from);

  for (const file of files) {
    const current = path.join(from, file);
    const destination = path.join(to, file);
    const stat = fs.statSync(current);

    if (stat.isFile()) {
      fs.copyFileSync(current, destination);
    } else if (stat.isDirectory()) {
      copyFolderSync(current, destination);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const projectName = args[1];

  if (!projectName) {
    console.error(
      "Please provide a project name, e.g., 'npx create-my-app my-new-project'.",
    );
    process.exit(1);
  }

  const projectPath = path.resolve(process.cwd(), projectName);
  const templateDir = path.join(__dirname, "..", "templates", "basic");

  if (fs.existsSync(projectPath)) {
    console.error(
      `Error: Folder "${projectName}" already exists. Choose a different name or remove the existing folder.`,
    );
    process.exit(1);
  }

  console.log(`Creating a new project in ${projectPath}...`);
  copyFolderSync(templateDir, projectPath);

  console.log("Project successfully created!");
  console.log(`\nNext steps:`);
  console.log(`  1) cd ${projectName}`);
  console.log(`  2) npm install (if needed)`);
  console.log(`  3) npm start (or whatever your template suggests)`);
}

main();
```

### bin/index.js

After you run `npm run build` (which runs `tsc`), TypeScript will place compiled output in `dist/index.js`. However, you might prefer to place a copy of the compiled CLI code into `bin/index.js` for clarity. The easiest approach is:

1. Ensure your `tsconfig.json` outputs compiled files to `dist/`.
2. Copy or move the CLI file to `bin/` as part of your build step, or reference it directly from `dist/` in your `bin` field.

For example, if you prefer to keep the `bin` folder separate:

```json
"bin": {
  "create-my-app": "dist/index.js"
}
```

Then the auto-generated `dist/index.js` will be used directly by NPX.  
You won’t need a separate `bin/` folder unless you have special reasons.

### templates/basic Folder

Include the files you want to scaffold. For example, a minimal “package.json” and “README.md”:

• templates/basic/package.json

```json
{
  "name": "my-new-project",
  "version": "1.0.0",
  "scripts": {
    "start": "echo 'Hello from your new project!'"
  }
}
```

• templates/basic/README.md

```md
# My New Project

This is a project scaffolded by [create-my-app](https://www.npmjs.com/package/create-my-app).
```

### README.md

Your project’s README should explain the purpose of the CLI and how to install or use it. For example:

````md
# create-my-app

A CLI tool to scaffold a new TypeScript project with some default structure.

## Usage

```bash
npx create-my-app my-new-project
```
````

This will create a directory named `my-new-project` with a default `package.json`, `README.md`, and any other files you’ve included in your templates.

---

## Publishing

1. Update your `package.json` metadata (version, author, repository, etc.).
2. Run `npm publish --access public` (for a public package).
3. Once published, users can run:
   ```
   npx create-my-app my-new-project
   ```
   …and the CLI will run directly from npm without requiring a local installation.
