import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLabelPages,
  initialCategories,
  loadCategories,
  splitLabelName,
  validateCategories,
} from "./data.js";

test("zero, odd, even and full selections produce at most two rows per label", () => {
  const items = Object.values(initialCategories).flat();
  for (const count of [0, 1, 2, 3, 5, 16]) {
    const pages = buildLabelPages(items.slice(0, count));
    assert.equal(pages.length, Math.ceil(count / 2));
    assert.ok(pages.every((page) => page.length > 0 && page.length <= 2));
    assert.deepEqual(
      pages.flat().map((row) => row.price),
      items.slice(0, count).map((item) => item.price),
    );
  }
});

test("long Korean names continue without losing text or charging twice", () => {
  const name = "아주긴비급여진료항목이름".repeat(6);
  const pages = buildLabelPages([{ id: 1, name, price: 100000 }]);
  const rows = pages.flat();
  assert.equal(rows.map((row) => row.name).join(""), name);
  assert.ok(rows.slice(1).every((row) => row.continued));
  assert.equal(rows.filter((row) => row.price !== null).length, 1);
  assert.equal(rows.at(-1).price, 100000);
  assert.ok(pages.every((page) => page.length <= 2));
  assert.deepEqual(splitLabelName("독감 PCR"), ["독감 PCR"]);
  const spacedName = "이름 중간의 공백을 유지하는 아주 긴 진료 항목입니다 "
    .repeat(4)
    .trim();
  assert.equal(splitLabelName(spacedName).join(""), spacedName);
  assert.ok(splitLabelName("M".repeat(100)).every((part) => part.length <= 18));
});

test("old storage schema remains compatible, including zero-priced items and empty categories", () => {
  const categories = {
    ...initialCategories,
    새분류: [{ id: 17, name: "무료 안내", price: 0 }],
    빈분류: [],
  };
  assert.equal(validateCategories(categories), true);
  assert.deepEqual(
    loadCategories({ getItem: () => JSON.stringify(categories) }),
    { categories, warning: "" },
  );
  assert.deepEqual(loadCategories({ getItem: () => "{}" }).categories, {});
});

test("invalid or unavailable storage falls back without overwriting the saved value", () => {
  for (const value of [
    "broken",
    "null",
    "[]",
    '{"검사":[{"id":1,"name":"검사","price":-1}]}',
  ]) {
    const result = loadCategories({ getItem: () => value });
    assert.deepEqual(result.categories, initialCategories);
    assert.ok(result.warning);
  }
  assert.ok(
    loadCategories({
      getItem: () => {
        throw new Error("Unavailable");
      },
    }).warning,
  );
  assert.equal(
    validateCategories({
      검사: [
        { id: 1, name: "A", price: 1 },
        { id: 1, name: "B", price: 2 },
      ],
    }),
    false,
  );
});
