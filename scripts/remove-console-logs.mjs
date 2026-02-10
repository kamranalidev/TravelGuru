import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const TARGET_DIRS = ["src", "another_dashboard/src"];
const SUPPORTED_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const STRIP_COMMENTS = process.argv.includes("--comments");

function isConsoleCall(expr) {
  if (!ts.isCallExpression(expr)) return false;

  const callTarget = expr.expression;

  if (
    ts.isPropertyAccessExpression(callTarget) &&
    ts.isIdentifier(callTarget.expression) &&
    callTarget.expression.text === "console"
  ) {
    return true;
  }

  if (
    ts.isElementAccessExpression(callTarget) &&
    ts.isIdentifier(callTarget.expression) &&
    callTarget.expression.text === "console" &&
    ts.isStringLiteral(callTarget.argumentExpression)
  ) {
    return true;
  }

  return false;
}

function getScriptKind(filePath) {
  const ext = path.extname(filePath);
  if (ext === ".tsx") return ts.ScriptKind.TSX;
  if (ext === ".jsx") return ts.ScriptKind.JSX;
  if (ext === ".ts") return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
}

function collectFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
      continue;
    }

    if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function stripCommentsFromText(text, filePath) {
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    false,
    getScriptKind(filePath),
    text
  );

  let nextPos = 0;
  let output = "";
  let removed = 0;

  let token = scanner.scan();
  while (token !== ts.SyntaxKind.EndOfFileToken) {
    if (
      token === ts.SyntaxKind.SingleLineCommentTrivia ||
      token === ts.SyntaxKind.MultiLineCommentTrivia
    ) {
      output += text.slice(nextPos, scanner.getTokenPos());
      nextPos = scanner.getTextPos();
      removed += 1;
    }

    token = scanner.scan();
  }

  output += text.slice(nextPos);
  return { text: output, removed };
}

function transformFile(filePath) {
  const sourceText = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath)
  );

  let removedLogsInFile = 0;
  const voidZero = ts.factory.createVoidZero();

  const transformer = (context) => {
    const visit = (node) => {
      if (ts.isExpressionStatement(node) && isConsoleCall(node.expression)) {
        removedLogsInFile += 1;
        const parent = node.parent;

        if (
          ts.isSourceFile(parent) ||
          ts.isBlock(parent) ||
          ts.isModuleBlock(parent) ||
          ts.isCaseClause(parent) ||
          ts.isDefaultClause(parent)
        ) {
          return undefined;
        }

        return ts.factory.createEmptyStatement();
      }

      if (ts.isCallExpression(node) && isConsoleCall(node)) {
        removedLogsInFile += 1;
        return voidZero;
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (node) => ts.visitNode(node, visit);
  };

  const result = ts.transform(sourceFile, [transformer]);
  const transformed = result.transformed[0];

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });

  let nextText = removedLogsInFile > 0 ? printer.printFile(transformed) : sourceText;
  result.dispose();

  let removedCommentsInFile = 0;
  if (STRIP_COMMENTS) {
    const commentsResult = stripCommentsFromText(nextText, filePath);
    nextText = commentsResult.text;
    removedCommentsInFile = commentsResult.removed;
  }

  const changed = nextText !== sourceText;
  if (changed) {
    fs.writeFileSync(filePath, nextText, "utf8");
  }

  return { removedLogsInFile, removedCommentsInFile, changed };
}

const files = TARGET_DIRS.flatMap((dir) => collectFiles(path.join(ROOT, dir)));
let totalRemovedLogs = 0;
let totalRemovedComments = 0;
let touchedFiles = 0;

for (const filePath of files) {
  const { removedLogsInFile, removedCommentsInFile, changed } = transformFile(filePath);
  totalRemovedLogs += removedLogsInFile;
  totalRemovedComments += removedCommentsInFile;
  if (changed) touchedFiles += 1;
}

if (STRIP_COMMENTS) {
  console.log(
    `Removed ${totalRemovedLogs} console statement(s) and ${totalRemovedComments} comment(s) from ${touchedFiles} file(s).`
  );
} else {
  console.log(
    `Removed ${totalRemovedLogs} console statement(s) from ${touchedFiles} file(s).`
  );
}
