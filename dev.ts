import * as path from "path";
import { statSync } from "fs";
import { watch } from "chokidar";
import { $ } from "bun";

const PORT = 8017;
const PROJECT_ROOT = "./";
const PUBLIC = path.resolve(PROJECT_ROOT, "docs");
const DIST = path.resolve(PROJECT_ROOT, "dist");
const isSPA = true;

const buildOnly = process.argv.includes("--build");

async function prebuild() {
  console.time("prebuild");
  const config = JSON.parse(await Bun.file("package.json").text());
  await Bun.write(
    "src/version.ts",
    `export const version = '${config.version}'`,
  );
  console.log(config.version);

  await $`rm -rf ${PUBLIC}`;
  await $`mkdir ${PUBLIC}`;
  await $`cp ./demo/static/* ${PUBLIC}`;
  // design sources (Amadine etc.) stay out of the published site;
  // nothrow because Bun's shell errors on globs with no matches
  await $`rm -f ${PUBLIC}/*.amdc`.nothrow();

  await $`rm -rf ${DIST}`;
  await $`mkdir ${DIST}`;
  console.timeEnd("prebuild");

  await build();
}

// Bun.build throws on failure, so build errors propagate to the caller
async function build() {
  console.time("build");

  try {
    await $`bun tsc --declaration --emitDeclarationOnly --outDir dist`;
  } catch (e: any) {
    console.error("tsc declaration build failed:");
    console.error(e.stdout?.toString() ?? e);
    if (buildOnly) process.exit(1);
  }
  await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: DIST,
    sourcemap: "linked",
    format: "esm",
    external: ["tosijs", "@angular/core"],
  });

  await Bun.build({
    entrypoints: ["./demo/src/main.ts"],
    outdir: PUBLIC,
    target: "browser",
    minify: true,
  });

  console.timeEnd("build");
}

if (!buildOnly) {
  // keep the watcher alive when a rebuild fails
  watch("./src").on("change", () => build().catch(console.error));
  watch("./demo").on("change", () => prebuild().catch(console.error));
}

await prebuild();

if (buildOnly) {
  process.exit(0);
}

function serveFromDir(config: {
  directory: string;
  path: string;
}): Response | null {
  let basePath = path.join(config.directory, config.path);
  const suffixes = ["", ".html", "index.html"];

  for (const suffix of suffixes) {
    try {
      const pathWithSuffix = path.join(basePath, suffix);
      const stat = statSync(pathWithSuffix);
      if (stat && stat.isFile()) {
        return new Response(Bun.file(pathWithSuffix));
      }
    } catch (err) {}
  }

  return null;
}

const server = Bun.serve({
  port: PORT,
  fetch(request) {
    let reqPath = new URL(request.url).pathname;
    console.log(request.method, reqPath);
    if (reqPath === "/") reqPath = "/index.html";

    const buildResponse = serveFromDir({
      directory: PUBLIC,
      path: reqPath,
    });
    if (buildResponse) return buildResponse;

    if (isSPA) {
      const spaResponse = serveFromDir({
        directory: PUBLIC,
        path: "/index.html",
      });
      if (spaResponse) return spaResponse;
    }
    return new Response("File not found", {
      status: 404,
    });
  },
});

console.log(`Listening on http://localhost:${PORT}`);
