import { Toaster } from "react-hot-toast";

export default function GlobalToast() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      containerStyle={{
        zIndex: 999999999,
        top: 40,
      }}
      toastOptions={{
        duration: 2500,

        style: {
          background: "#0f0f10",
          color: "#fff",

          border: "1px solid rgba(255,255,255,.08)",

          borderRadius: "18px",

          padding: "16px 20px",

          boxShadow: "0 20px 60px rgba(0,0,0,.45)",

          fontSize: "14px",
          fontWeight: "500",
        },
      }}
    />
  );
}