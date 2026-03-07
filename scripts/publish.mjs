import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

const msg = process.argv.slice(2).join(" ").trim() || "update";

try {
  // status atual
  run("git status");

  // 1) atualiza preços antes de publicar
  run("npm run update-prices");

  // 2) build local para validar
  run("npm run build");

  // 3) adiciona tudo
  run("git add .");

  // 4) commit (sem falhar se não houver mudanças)
  try {
    run(`git commit -m "${msg.replaceAll('"', '\\"')}"`);
  } catch {
    console.log("ℹ️ Nenhuma mudança para commitar.");
  }

  // 5) push para a main
  run("git push origin main");

  console.log(`
🚀 Publicação enviada para a main com preços atualizados!

Fluxo final:
• preços atualizados
• build validado localmente
• commit enviado
• GitHub Actions fará o deploy automático
`);
} catch (e) {
  console.error("\n❌ Falhou. Veja o erro acima.");
  process.exit(1);
}