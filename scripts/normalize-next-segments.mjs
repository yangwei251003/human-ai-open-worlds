import { constants } from "node:fs";
import { copyFile, readdir, readFile, stat } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

const outDirectory = resolve(process.argv[2] ?? "out");

async function listDirectories(rootDirectory) {
  const matches = [];
  const entries = await readdir(rootDirectory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const absolutePath = join(rootDirectory, entry.name);
    if (entry.name.startsWith("__next.")) matches.push(absolutePath);
    matches.push(...(await listDirectories(absolutePath)));
  }

  return matches;
}

async function listFiles(rootDirectory) {
  const files = [];
  const entries = await readdir(rootDirectory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const absolutePath = join(rootDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(absolutePath)));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function filesAreEqual(leftPath, rightPath) {
  const [leftStat, rightStat] = await Promise.all([stat(leftPath), stat(rightPath)]);
  if (leftStat.size !== rightStat.size) return false;

  const [leftContents, rightContents] = await Promise.all([
    readFile(leftPath),
    readFile(rightPath),
  ]);
  return leftContents.equals(rightContents);
}

async function destinationExists(destinationPath) {
  try {
    await stat(destinationPath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function copyWithoutOverwritingDifferentContent(sourcePath, destinationPath) {
  if (await destinationExists(destinationPath)) {
    return (await filesAreEqual(sourcePath, destinationPath)) ? "unchanged" : "conflict";
  }

  try {
    await copyFile(sourcePath, destinationPath, constants.COPYFILE_EXCL);
    return "copied";
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    return (await filesAreEqual(sourcePath, destinationPath)) ? "unchanged" : "conflict";
  }
}

async function main() {
  if (!(await destinationExists(outDirectory))) {
    throw new Error(`Static export directory does not exist: ${outDirectory}`);
  }

  const nextDirectories = await listDirectories(outDirectory);
  let copied = 0;
  let unchanged = 0;
  const conflicts = [];

  for (const nextDirectory of nextDirectories) {
    const directoryName = basename(nextDirectory);
    const parentDirectory = dirname(nextDirectory);
    const files = await listFiles(nextDirectory);

    for (const sourcePath of files) {
      const relativeSegments = relative(nextDirectory, sourcePath).split(sep);
      const flattenedName = `${directoryName}.${relativeSegments.join(".")}`;
      const destinationPath = join(parentDirectory, flattenedName);
      const result = await copyWithoutOverwritingDifferentContent(sourcePath, destinationPath);

      if (result === "copied") copied += 1;
      if (result === "unchanged") unchanged += 1;
      if (result === "conflict") conflicts.push({ sourcePath, destinationPath });
    }
  }

  console.log(
    `[fix-next-static-rsc] scanned=${nextDirectories.length} copied=${copied} unchanged=${unchanged} conflicts=${conflicts.length}`,
  );

  if (conflicts.length > 0) {
    const details = conflicts
      .map(({ sourcePath, destinationPath }) => `- ${destinationPath}\n  source: ${sourcePath}`)
      .join("\n");
    throw new Error(`Refusing to overwrite different RSC content:\n${details}`);
  }
}

main().catch((error) => {
  console.error(`[fix-next-static-rsc] ${error.message}`);
  process.exitCode = 1;
});
