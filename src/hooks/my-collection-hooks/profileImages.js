/**
 * ==========================================================
 * profileImages
 * ==========================================================
 *
 * RESPONSABILIDADES:
 *
 * - Atualizar avatar do usuário.
 * - Atualizar banner do usuário.
 *
 * Não possui responsabilidade visual.
 *
 * Apenas executa operações relacionadas
 * às imagens do perfil.
 *
 * ==========================================================
 */

import { supabaseClient } from "../../lib/supabase";

/**
 * Atualiza o avatar do usuário logado.
 */
export async function updateAvatar(avatarUrl) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabaseClient
    .from("user_profiles")
    .update({
      avatar_url: avatarUrl,
    })
    .eq("id", user.id);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Atualiza o banner do usuário logado.
 *
 */
export async function updateBanner(bannerUrl) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabaseClient
    .from("user_profiles")
    .update({
      banner_url: bannerUrl,
    })
    .eq("id", user.id);

  if (error) {
    throw error;
  }

  return true;
}