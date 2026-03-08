import { execSync } from "node:child_process";

function run(cmd, options = {}) {
  execSync(cmd, { stdio: "inherit", ...options });
}

function runCapture(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString("utf8");
}

function escapeCommitMessage(msg) {
  return msg.replaceAll('"', '\\"');
}

function getRebaseConflictedFiles() {
  try {
    const out = runCapture("git diff --name-only --diff-filter=U");
    return out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function resolveKnownRebaseConflicts() {
  const conflicted = getRebaseConflictedFiles();

  if (!conflicted.length) return false;

  const onlyKnownConflict =
    conflicted.length === 1 && conflicted[0] === "src/data/prices.json";

  if (!onlyKnownConflict) {
    console.log("\n❌ Conflitos manuais encontrados:");
    conflicted.forEach((file) => console.log(`- ${file}`));
    console.log(`
Resolva os conflitos, depois rode:

git add .
git rebase --continue

E quando terminar:
git push origin main
`);
    process.exit(1);
  }

  console.log("ℹ️ Conflito detectado em src/data/prices.json. Mantendo a versão remota...");

  run("git checkout --theirs src/data/prices.json");
  run("git add src/data/prices.json");
  run("git rebase --continue");

  return true;
}

const msg = process.argv.slice(2).join(" ").trim() || "update";

try {
  run("git status");
  run("git add -A");

  let createdCommit = true;
  try {
    run(`git commit -m "${escapeCommitMessage(msg)}"`);
  } catch {
    createdCommit = false;
    console.log("ℹ️ Nenhuma mudança nova para commitar localmente.");
  }

  let rebased = false;

  try {
    run("git pull --rebase origin main");
    rebased = true;
  } catch {
    // tenta resolver automaticamente o conflito conhecido do prices.json
    try {
      resolveKnownRebaseConflicts();
      rebased = true;
    } catch {
      rebased = false;
    }
  }

  if (!rebased) {
    process.exit(1);
  }

  run("git push origin main");

  console.log(`
🚀 Publicação enviada para a main!

Fluxo final:
• mudanças locais preservadas
• repositório sincronizado com a main remota
• conflito conhecido de prices.json resolvido automaticamente
• push concluído
• GitHub Actions atualizará preços, fará build e deploy
`);

  if (!createdCommit) {
    console.log("ℹ️ Nenhum commit local novo foi criado neste publish.");
  }
} catch {
  console.error("\n❌ Falhou. Veja o erro acima.");
  process.exit(1);
}