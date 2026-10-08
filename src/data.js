export const initialCategories = {
  수액제제: [
    { id: 1, name: "해열제", price: 30000 },
    { id: 2, name: "비타민 영양제(소)", price: 35000 },
    { id: 3, name: "비타민 영양제(대)", price: 40000 },
    { id: 4, name: "아미노산+비타민 영양제", price: 50000 },
    { id: 5, name: "아미노산+디팹티벤", price: 70000 },
    { id: 6, name: "마이어스 칵테일", price: 80000 },
    { id: 7, name: "복합영양제 (위너프페리)", price: 100000 },
    { id: 8, name: "페라미플루", price: 80000 },
  ],
  검사: [
    { id: 9, name: "독감, 코로나", price: 40000 },
    { id: 10, name: "독감", price: 30000 },
    { id: 11, name: "코로나", price: 20000 },
    { id: 12, name: "호흡기바이러스 3종", price: 40000 },
    { id: 13, name: "독감 PCR", price: 60000 },
    { id: 14, name: "호흡기바이러스 PCR", price: 100000 },
  ],
  치료재료: [
    { id: 15, name: "도지플로", price: 4000 },
    { id: 16, name: "밴드골드 수액고정 반창고", price: 1000 },
  ],
};

export const STORAGE_KEY = "nonpay-categories";
export const formatPrice = (price) => price.toLocaleString("ko-KR");

export function validateCategories(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const ids = new Set();
  return Object.entries(value).every(([category, items]) => {
    if (!category.trim() || !Array.isArray(items)) return false;
    return items.every((item) => {
      if (
        !item ||
        !Number.isSafeInteger(item.id) ||
        ids.has(item.id) ||
        typeof item.name !== "string" ||
        !item.name.trim() ||
        !Number.isSafeInteger(item.price) ||
        item.price < 0
      )
        return false;
      ids.add(item.id);
      return true;
    });
  });
}

export function loadCategories(storage) {
  try {
    const saved = (storage ?? globalThis.localStorage).getItem(STORAGE_KEY);
    if (!saved) return { categories: initialCategories, warning: "" };
    const parsed = JSON.parse(saved);
    if (!validateCategories(parsed))
      throw new Error("Invalid saved categories");
    return { categories: parsed, warning: "" };
  } catch {
    return {
      categories: initialCategories,
      warning:
        "저장된 항목을 불러오지 못했습니다. 기본 목록을 표시합니다. 항목을 수정하면 현재 목록으로 저장됩니다.",
    };
  }
}

// One row holds up to two visual lines. Long names continue without clipping.
export function splitLabelName(name) {
  const parts = [];
  let part = "";
  let width = 0;
  for (const character of name.trim()) {
    const characterWidth =
      character.codePointAt(0) < 128
        ? "MW@#%&".includes(character)
          ? 1
          : 0.65
        : character.codePointAt(0) > 0xffff
          ? 1.5
          : 1;
    if (width + characterWidth > 18) {
      parts.push(part);
      part = "";
      width = 0;
    }
    part += character;
    width += characterWidth;
  }
  if (part.length) parts.push(part);
  return parts;
}

export function buildLabelPages(items) {
  const rows = items.flatMap((item) => {
    const parts = splitLabelName(item.name);
    return parts.map((name, index) => ({
      key: `${item.id}-${index}`,
      name,
      continued: index > 0,
      price: index === parts.length - 1 ? item.price : null,
    }));
  });
  const pages = [];
  for (let index = 0; index < rows.length; index += 2)
    pages.push(rows.slice(index, index + 2));
  return pages;
}
