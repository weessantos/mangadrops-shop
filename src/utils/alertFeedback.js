import toast from "react-hot-toast";

export function showError(message) {
  toast.error(message);
}

export function showSuccess(message) {
  toast.success(message);
}

export function showWarning(message) {
  toast(message, {
    icon: "⚠️",
  });
}
export function getAuthErrorMessage(error) {
  switch (error?.message) {
    case "Invalid login credentials":
      return "Email ou senha inválidos.";

    case "Email not confirmed":
      return "Confirme seu email antes de entrar.";

    case "User already registered":
      return "Este email já possui uma conta.";

    default:
      return "Ocorreu um erro inesperado.";
  }
}