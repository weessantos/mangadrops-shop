import { supabaseClient } from "../../lib/supabase";

export function getLoyaltyLevel(loyalty) {
  if (!loyalty?.loyalty_enabled) {
    return 0;
  }

  return Math.min(8, 1 + Math.floor(loyalty.loyalty_login_days / 5));
}

export async function registerDailyLogin(userId, accountCreatedAt) {
  const today = new Date().toISOString().split("T")[0];

  const { data: loyalty } = await supabaseClient
    .from("user_loyalty")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // Primeiro acesso da vida
  if (!loyalty) {
    await supabaseClient.from("user_loyalty").insert({
      user_id: userId,
      account_created_at: accountCreatedAt,

      login_days: 1,

      loyalty_enabled: false,
      loyalty_login_days: 0,

      last_login_date: today,
    });

    return;
  }

  // Já contabilizou hoje
  if (loyalty.last_login_date === today) {
    return;
  }

  const nextLoginDays = loyalty.login_days + 1;

  const updateData = {
    login_days: nextLoginDays,
    last_login_date: today,
    updated_at: new Date().toISOString(),
  };

  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const accountAgeDays = Math.floor(
    (Date.now() - new Date(loyalty.account_created_at).getTime()) / MS_PER_DAY,
  );

  // Ativa fidelidade
  if (!loyalty.loyalty_enabled && accountAgeDays >= 30 && nextLoginDays >= 5) {
    updateData.loyalty_enabled = true;
    updateData.loyalty_start_date = today;
  }

  // Já possui fidelidade ativa
  else if (loyalty.loyalty_enabled) {
    updateData.loyalty_login_days = loyalty.loyalty_login_days + 1;
  }

  await supabaseClient
    .from("user_loyalty")
    .update(updateData)
    .eq("user_id", userId);
}
