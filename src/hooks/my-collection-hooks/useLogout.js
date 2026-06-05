import { logout } from "./auth";

import {
  showWarning,
} from "../../utils/alertFeedback";

export function useLogout() {
  return async function handleLogout() {
    try {
      await logout();

      window.location.href = "/auth/login";
    } catch (error) {
      console.error(error);

      showWarning("Erro ao sair da conta.");
    }
  };
}