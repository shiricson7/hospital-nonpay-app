import { useState } from "react";
import Modal from "./Modal";
import { formatPrice } from "../data";

export default function CatalogDialog({ dialog, categories, onSave, onClose }) {
  const [name, setName] = useState(dialog.item?.name || "");
  const [price, setPrice] = useState(dialog.item?.price ?? "");
  const [category, setCategory] = useState(
    dialog.category || Object.keys(categories)[0] || "",
  );
  const [error, setError] = useState("");
  const isCategory = dialog.type === "category";
  const isDelete =
    dialog.type === "delete-item" || dialog.type === "delete-category";
  const title = {
    item: "새 항목 추가",
    edit: "항목 수정",
    category: "새 분류 추가",
    "delete-item": "항목 삭제",
    "delete-category": "분류 삭제",
  }[dialog.type];

  function submit(event) {
    event.preventDefault();
    if (isDelete) {
      onSave();
      return;
    }
    if (!name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (isCategory) {
      if (Object.hasOwn(categories, name.trim())) {
        setError("이미 있는 분류 이름입니다.");
        return;
      }
      onSave({ name: name.trim() });
      return;
    }
    const amount = Number(price);
    if (
      price === "" ||
      !Number.isSafeInteger(amount) ||
      amount < 0 ||
      amount > 999999999
    ) {
      setError("금액은 0원부터 999,999,999원까지 정수로 입력해 주세요.");
      return;
    }
    if (!Object.hasOwn(categories, category)) {
      setError("분류를 선택해 주세요.");
      return;
    }
    onSave({ name: name.trim(), price: amount, category });
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit}>
        {isDelete ? (
          <div className="delete-description">
            <p>
              <strong>“{dialog.item?.name || dialog.category}”</strong>
              {dialog.type === "delete-category"
                ? " 분류를 삭제할까요?"
                : " 항목을 삭제할까요?"}
            </p>
            <p>
              {dialog.type === "delete-category"
                ? `이 분류의 항목 ${categories[dialog.category].length}개도 함께 삭제됩니다.`
                : `${formatPrice(dialog.item.price)}원 · ${dialog.category}`}
            </p>
            <p className="muted">삭제한 항목은 선택 목록에서도 제외됩니다.</p>
          </div>
        ) : (
          <div className="form-fields">
            {!isCategory ? (
              <label>
                분류
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                >
                  {Object.keys(categories).map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              {isCategory ? "분류 이름" : "항목 이름"}
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={isCategory ? "예: 예방접종" : "예: 비타민 영양제"}
                maxLength={100}
                required
              />
            </label>
            {!isCategory ? (
              <label>
                금액 <span className="muted">(원)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="0"
                  min="0"
                  max="999999999"
                  step="1"
                  required
                />
              </label>
            ) : null}
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            className={`button ${isDelete ? "button-danger" : "button-primary"}`}
          >
            {isDelete
              ? "삭제"
              : dialog.type === "edit"
                ? "변경 사항 저장"
                : "추가"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
