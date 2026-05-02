// ==============================
// 🔧 NORMALIZAÇÃO
// ==============================

export const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

// ==============================
// 📊 REGRAS DE DESCONTO
// ==============================

export const getDiscountState = (discount) => {
  const d = toNumber(discount);

  if (d === null) return "NO_DATA";

  if (d < -15) return "ABUSIVE";        // ❌ não aparece
  if (d < 0) return "CONSULT";         // ⚠️ aparece sem preço

  return "OK";                         // ✅ preço normal
};

// ==============================
// 💰 PREÇO
// ==============================

export const hasValidPrice = (price) => {
  const p = toNumber(price);
  return p !== null && p > 0;
};

// ==============================
// 🎯 REGRA FINAL DO SISTEMA
// ==============================

export const shouldShowProduct = (product) => {
  const price = toNumber(product.best_price);
  const discountState = getDiscountState(product.discount);

  return (
    hasValidPrice(price) &&
    discountState !== "ABUSIVE"
  );
};