import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

const msg = process.argv.slice(2).join(" ").trim() || "update";

try {
  // status atual
  run("git status");

  // adiciona tudo que mudou
  run("git add -A");

  // commit local antes de sincronizar com remoto
  let createdCommit = true;
  try {
    run(`git commit -m "${msg.replaceAll('"', '\\"')}"`);
  } catch {
    createdCommit = false;
    console.log("ℹ️ Nenhuma mudança nova para commitar localmente.");
  }

  // traz commits remotos sem sobrescrever seu trabalho local
  try {
    run("git pull --rebase origin main");
  } catch {
    console.log(`
❌ O rebase encontrou conflito.
Resolva os conflitos, depois rode:

git add .
git rebase --continue

E quando terminar:
git push origin main
`);
    process.exit(1);
  }

  // envia para o repositório
  run("git push origin main");

  console.log(`
🚀 Publicação enviada para a main!

Fluxo final:
• mudanças locais preservadas
• repositório sincronizado com a main remota
• push concluído
• GitHub Actions atualizará preços, fará build e deploy
`);

  if (!createdCommit) {
    console.log("ℹ️ Nenhum commit local novo foi criado neste publish.");
  }
} catch (e) {
  console.error("\n❌ Falhou. Veja o erro acima.");
  process.exit(1);
}