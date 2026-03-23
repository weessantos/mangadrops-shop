import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 🔥 importante: usar service role
);

async function run() {
  // 🔥 pega sua API local
  const res = await fetch("http://localhost:3000/api/series/full");
  const data = await res.json();

  for (const series of data) {
    for (const volume of series.volumes || []) {
      const { id, best_price, discount } = volume;

      // 🔥 ignora se não tiver preço
      if (best_price == null && discount == null) continue;

      const { error } = await supabase
        .from("volumes")
        .update({
          best_price,
          discount,
        })
        .eq("id", id);

      if (error) {
        console.error("Erro ao atualizar:", id, error);
      } else {
        console.log("OK:", id);
      }
    }
  }

  console.log("Finalizado 🚀");
}

run();