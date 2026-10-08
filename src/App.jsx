import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FileText,
  FlaskConical,
  HeartPulse,
  Layers3,
  LayoutGrid,
  Package,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Trash2,
  X,
} from "lucide-react";
import {
  buildLabelPages,
  formatPrice,
  loadCategories,
  STORAGE_KEY,
} from "./data";
import Label from "./components/Label";
import CatalogDialog from "./components/CatalogDialog";
import Modal from "./components/Modal";
import "./App.css";

const ALL_CATEGORIES = null;
const categoryIcons = {
  수액제제: Syringe,
  검사: FlaskConical,
  치료재료: Package,
};
const categoryTones = { 수액제제: "purple", 검사: "blue", 치료재료: "amber" };
const today = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  timeZone: "Asia/Seoul",
}).format(new Date());

export default function App() {
  const [store, setStore] = useState(loadCategories);
  const [selectedIds, setSelectedIds] = useState([]);
  const [manageMode, setManageMode] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState("");
  const searchRef = useRef(null);
  const categories = store.categories;
  const entries = Object.entries(categories);
  const allItems = entries.flatMap(([category, items]) =>
    items.map((item) => ({ ...item, category })),
  );
  const itemById = new Map(allItems.map((item) => [item.id, item]));
  const selectedItems = selectedIds
    .map((id) => itemById.get(id))
    .filter(Boolean);
  const selectedSet = new Set(selectedIds);
  const totalPrice = selectedItems.reduce(
    (total, item) => total + item.price,
    0,
  );
  const labelPages = buildLabelPages(selectedItems);
  const currentPreview = Math.min(
    previewIndex,
    Math.max(labelPages.length - 1, 0),
  );
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
  const visibleEntries = entries
    .filter(
      ([category]) =>
        activeCategory === ALL_CATEGORIES || category === activeCategory,
    )
    .map(([category, items]) => [
      category,
      items.filter((item) =>
        `${item.name} ${category}`
          .toLocaleLowerCase("ko-KR")
          .includes(normalizedQuery),
      ),
    ])
    .filter(([, items]) => items.length || (!normalizedQuery && manageMode));
  const visibleCount = visibleEntries.reduce(
    (total, [, items]) => total + items.length,
    0,
  );

  useEffect(() => {
    function handleKey(event) {
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !dialog &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dialog]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function saveCategories(nextCategories, message) {
    let warning = "";
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCategories));
    } catch {
      warning =
        "브라우저에 저장하지 못했습니다. 현재 화면의 변경은 적용되지만 새로고침하면 사라질 수 있습니다.";
    }
    setStore({ categories: nextCategories, warning });
    setNotice(message);
  }

  function toggleItem(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function saveDialog(values) {
    const nextCategories = { ...categories };
    if (dialog.type === "category") {
      Object.defineProperty(nextCategories, values.name, {
        value: [],
        enumerable: true,
        configurable: true,
        writable: true,
      });
      setActiveCategory(values.name);
    } else if (dialog.type === "delete-category") {
      const removed = new Set(
        categories[dialog.category].map((item) => item.id),
      );
      delete nextCategories[dialog.category];
      setSelectedIds((ids) => ids.filter((id) => !removed.has(id)));
      if (activeCategory === dialog.category) setActiveCategory(ALL_CATEGORIES);
    } else if (dialog.type === "delete-item") {
      nextCategories[dialog.category] = categories[dialog.category].filter(
        (item) => item.id !== dialog.item.id,
      );
      setSelectedIds((ids) => ids.filter((id) => id !== dialog.item.id));
    } else if (dialog.type === "edit") {
      nextCategories[dialog.category] = categories[dialog.category].filter(
        (item) => item.id !== dialog.item.id,
      );
      const edited = {
        id: dialog.item.id,
        name: values.name,
        price: values.price,
      };
      if (values.category === dialog.category)
        nextCategories[values.category] = categories[values.category].map(
          (item) => (item.id === edited.id ? edited : item),
        );
      else
        nextCategories[values.category] = [
          ...nextCategories[values.category],
          edited,
        ];
    } else {
      let id = 1;
      while (itemById.has(id)) id += 1;
      nextCategories[values.category] = [
        ...categories[values.category],
        { id, name: values.name, price: values.price },
      ];
    }
    const message = dialog.type.startsWith("delete")
      ? "삭제했습니다."
      : dialog.type === "edit"
        ? "변경 사항을 저장했습니다."
        : dialog.type === "category"
          ? "새 분류를 추가했습니다."
          : "새 항목을 추가했습니다.";
    saveCategories(nextCategories, message);
    setDialog(null);
  }

  function switchMode(value) {
    setManageMode(value);
    setQuery("");
    setActiveCategory(ALL_CATEGORIES);
  }

  return (
    <>
      <div className="app-shell screen-only">
        <aside className="sidebar" aria-label="주 메뉴">
          <a className="brand" href="#main-content">
            <span className="brand-icon">
              <Stethoscope size={24} strokeWidth={1.8} />
            </span>
            <span>
              비급여 데스크<small>더 간편한 진료 안내</small>
            </span>
          </a>
          <div className="sidebar-section-label">WORKSPACE</div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${!manageMode ? "active" : ""}`}
              aria-label="비급여 안내"
              onClick={() => switchMode(false)}
              aria-current={!manageMode ? "page" : undefined}
            >
              <LayoutGrid size={19} />
              <span>비급여 안내</span>
              {!manageMode ? <span className="nav-dot" /> : null}
            </button>
            <button
              className={`nav-item ${manageMode ? "active" : ""}`}
              aria-label="항목 관리"
              onClick={() => switchMode(true)}
              aria-current={manageMode ? "page" : undefined}
            >
              <Settings2 size={19} />
              <span>항목 관리</span>
              {manageMode ? <span className="nav-dot" /> : null}
            </button>
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-tip">
              <span className="tip-icon">
                <Printer size={19} />
              </span>
              <strong>작은 라벨, 간편한 안내</strong>
              <p>
                50 × 30 mm 라벨에
                <br />
                진료 내역을 깔끔하게 출력하세요.
              </p>
              <button onClick={() => setDialog({ type: "help" })}>
                출력 설정 안내 <ArrowRight size={14} />
              </button>
            </div>
            <div className="local-storage-note">
              <ShieldCheck size={15} />
              <span>항목은 이 브라우저에 저장됩니다</span>
            </div>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              <span>병원 업무</span>
              <ChevronRight size={14} />
              <strong>{manageMode ? "항목 관리" : "비급여 안내"}</strong>
            </div>
            <div className="topbar-end">
              <time>{today}</time>
              <span className="desk-avatar">
                <HeartPulse size={19} />
              </span>
              <span className="desk-name">진료 데스크</span>
            </div>
          </header>
          <main className="main-content" id="main-content">
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  <span />
                  NON-COVERED CARE
                </div>
                <h1>
                  {manageMode ? "항목 관리" : "비급여 안내"}
                  <span className="heading-dot">.</span>
                </h1>
                <p>
                  {manageMode
                    ? "진료 항목과 금액을 관리하세요. 변경 사항은 자동으로 저장됩니다."
                    : "진료 항목을 선택하고, 안내 라벨을 바로 출력하세요."}
                </p>
              </div>
              <div className="heading-actions">
                {manageMode ? (
                  <button
                    className="button button-secondary"
                    onClick={() => switchMode(false)}
                  >
                    <ChevronLeft size={16} />
                    안내 화면으로
                  </button>
                ) : (
                  <span className="label-size-badge">
                    <Printer size={15} />
                    라벨 출력<span>50 × 30 mm</span>
                  </span>
                )}
              </div>
            </div>
            {store.warning ? (
              <div className="storage-warning" role="alert">
                <CircleHelp size={18} />
                {store.warning}
              </div>
            ) : null}
            <div className="overview-grid">
              <div className="overview-card">
                <span className="stat-icon purple">
                  <ClipboardList size={21} />
                </span>
                <div>
                  <span className="stat-label">등록된 진료 항목</span>
                  <strong>
                    {allItems.length}
                    <small>개</small>
                  </strong>
                </div>
                <span className="stat-caption">{entries.length}개 분류</span>
              </div>
              <div className="overview-card">
                <span className="stat-icon blue">
                  <Check size={22} />
                </span>
                <div>
                  <span className="stat-label">선택한 항목</span>
                  <strong>
                    {selectedItems.length}
                    <small>개</small>
                  </strong>
                </div>
                <span className="stat-caption">
                  {selectedItems.length ? "선택 완료" : "항목을 선택해 주세요"}
                </span>
              </div>
              <div className="overview-card">
                <span className="stat-icon amber">
                  <Layers3 size={21} />
                </span>
                <div>
                  <span className="stat-label">출력할 라벨</span>
                  <strong>
                    {labelPages.length}
                    <small>장</small>
                  </strong>
                </div>
                <span className="stat-caption">한 장에 2줄씩</span>
              </div>
            </div>
            <div className={`content-grid ${manageMode ? "manage-grid" : ""}`}>
              <section
                className="catalog-panel panel"
                aria-labelledby="catalog-title"
              >
                <div className="panel-heading">
                  <div>
                    <h2 id="catalog-title">
                      {manageMode ? "등록 항목" : "진료 항목"}
                      <span className="count-badge">{allItems.length}</span>
                    </h2>
                    <p>
                      {manageMode
                        ? "항목을 추가하거나 이름과 금액을 수정할 수 있어요."
                        : "안내할 항목을 눌러 선택해 주세요."}
                    </p>
                  </div>
                  {manageMode ? (
                    <div className="catalog-actions">
                      <button
                        className="button button-secondary button-small"
                        onClick={() => setDialog({ type: "category" })}
                      >
                        <Plus size={15} />
                        분류 추가
                      </button>
                      <button
                        className="button button-primary button-small"
                        disabled={!entries.length}
                        onClick={() =>
                          setDialog({
                            type: "item",
                            category:
                              activeCategory === ALL_CATEGORIES
                                ? undefined
                                : activeCategory,
                          })
                        }
                      >
                        <Plus size={15} />
                        항목 추가
                      </button>
                    </div>
                  ) : (
                    <span className="quiet-icon">
                      <ClipboardList size={21} />
                    </span>
                  )}
                </div>
                <div className="catalog-tools">
                  <div className="search-field">
                    <Search size={19} />
                    <input
                      ref={searchRef}
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="항목 이름으로 검색하세요"
                      aria-label="진료 항목 검색"
                    />
                    {query ? (
                      <button
                        className="icon-button"
                        aria-label="검색어 지우기"
                        onClick={() => {
                          setQuery("");
                          searchRef.current?.focus();
                        }}
                      >
                        <X size={16} />
                      </button>
                    ) : (
                      <kbd>/</kbd>
                    )}
                  </div>
                  <div className="category-filters" aria-label="분류 필터">
                    <button
                      className={`filter-chip ${activeCategory === ALL_CATEGORIES ? "active" : ""}`}
                      onClick={() => setActiveCategory(ALL_CATEGORIES)}
                      aria-pressed={activeCategory === ALL_CATEGORIES}
                    >
                      전체<span>{allItems.length}</span>
                    </button>
                    {entries.map(([category, items]) => (
                      <button
                        key={category}
                        className={`filter-chip ${activeCategory === category ? "active" : ""}`}
                        onClick={() => setActiveCategory(category)}
                        aria-pressed={activeCategory === category}
                      >
                        {category}
                        <span>{items.length}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="catalog-body">
                  {visibleEntries.length ? (
                    visibleEntries.map(([category, items]) => {
                      const Icon = Object.hasOwn(categoryIcons, category)
                        ? categoryIcons[category]
                        : FileText;
                      const tone = Object.hasOwn(categoryTones, category)
                        ? categoryTones[category]
                        : "purple";
                      const groupSelected = items.filter((item) =>
                        selectedSet.has(item.id),
                      ).length;
                      return (
                        <section
                          className="category-section"
                          key={category}
                          aria-label={category}
                        >
                          <div className="category-heading">
                            <div>
                              <span className={`category-icon ${tone}`}>
                                <Icon size={16} />
                              </span>
                              <h3>{category}</h3>
                              <span className="category-count">
                                {items.length}
                              </span>
                            </div>
                            {manageMode ? (
                              <div className="category-controls">
                                <button
                                  className="text-button"
                                  onClick={() =>
                                    setDialog({ type: "item", category })
                                  }
                                >
                                  <Plus size={14} />
                                  항목 추가
                                </button>
                                <button
                                  className="icon-button delete-button"
                                  aria-label={`${category} 분류 삭제`}
                                  onClick={() =>
                                    setDialog({
                                      type: "delete-category",
                                      category,
                                    })
                                  }
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            ) : (
                              <span className="category-selection">
                                {groupSelected ? `${groupSelected}개 선택` : ""}
                              </span>
                            )}
                          </div>
                          <div className="items-grid">
                            {items.map((item) =>
                              manageMode ? (
                                <div
                                  className="item-card management-card"
                                  key={item.id}
                                >
                                  <div className="item-details">
                                    <span className="item-name">
                                      {item.name}
                                    </span>
                                    <span className="item-price">
                                      {formatPrice(item.price)}
                                      <small>원</small>
                                    </span>
                                  </div>
                                  <div className="item-actions">
                                    <button
                                      className="icon-button"
                                      aria-label={`${item.name} 수정`}
                                      onClick={() =>
                                        setDialog({
                                          type: "edit",
                                          category,
                                          item,
                                        })
                                      }
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      className="icon-button delete-button"
                                      aria-label={`${item.name} 삭제`}
                                      onClick={() =>
                                        setDialog({
                                          type: "delete-item",
                                          category,
                                          item,
                                        })
                                      }
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  className={`item-card ${selectedSet.has(item.id) ? "selected" : ""}`}
                                  key={item.id}
                                  aria-pressed={selectedSet.has(item.id)}
                                  onClick={() => toggleItem(item.id)}
                                >
                                  <span className="item-details">
                                    <span className="item-name">
                                      {item.name}
                                    </span>
                                    <span className="item-price">
                                      {formatPrice(item.price)}
                                      <small>원</small>
                                    </span>
                                  </span>
                                  <span
                                    className="selection-check"
                                    aria-hidden="true"
                                  >
                                    {selectedSet.has(item.id) ? (
                                      <Check size={14} strokeWidth={3} />
                                    ) : (
                                      <Plus size={15} />
                                    )}
                                  </span>
                                </button>
                              ),
                            )}
                          </div>
                          {!items.length ? (
                            <div className="empty-category">
                              등록된 항목이 없습니다. 위의 ‘항목 추가’로
                              시작하세요.
                            </div>
                          ) : null}
                        </section>
                      );
                    })
                  ) : (
                    <div className="catalog-empty">
                      <Search size={29} />
                      <h3>
                        {entries.length
                          ? "검색 결과가 없습니다"
                          : "등록된 분류가 없습니다"}
                      </h3>
                      <p>
                        {entries.length
                          ? "다른 검색어를 입력하거나 분류를 변경해 주세요."
                          : "항목 관리에서 새 분류와 진료 항목을 추가해 주세요."}
                      </p>
                      <button
                        className="button button-secondary button-small"
                        onClick={() => {
                          if (!entries.length) {
                            switchMode(true);
                            setDialog({ type: "category" });
                          } else {
                            setQuery("");
                            setActiveCategory(ALL_CATEGORIES);
                          }
                        }}
                      >
                        {entries.length ? "필터 초기화" : "분류 추가"}
                      </button>
                    </div>
                  )}
                </div>
                <footer className="catalog-footer">
                  <span>
                    <ShieldCheck size={14} />
                    비급여 항목은 건강보험이 적용되지 않는 비용입니다.
                  </span>
                  <span>{visibleCount}개 항목</span>
                </footer>
              </section>
              {!manageMode ? (
                <aside
                  className="selection-column"
                  aria-label="선택 내역과 라벨 출력"
                >
                  <section
                    className="selection-panel panel"
                    id="selection-summary"
                  >
                    <div className="panel-heading">
                      <h2>
                        선택 내역
                        <span className="count-badge">
                          {selectedItems.length}
                        </span>
                      </h2>
                      <button
                        className="text-button reset-button"
                        disabled={!selectedItems.length}
                        onClick={() => {
                          setSelectedIds([]);
                          setPreviewIndex(0);
                        }}
                      >
                        <RotateCcw size={13} />
                        초기화
                      </button>
                    </div>
                    {selectedItems.length ? (
                      <ol className="selected-list">
                        {selectedItems.map((item, index) => (
                          <li key={item.id}>
                            <span className="selection-number">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <div className="selected-item-description">
                              <strong>{item.name}</strong>
                              <small>{item.category}</small>
                            </div>
                            <span className="selected-item-price">
                              {formatPrice(item.price)}
                              <small>원</small>
                            </span>
                            <button
                              className="icon-button remove-button"
                              aria-label={`${item.name} 선택 해제`}
                              onClick={() => toggleItem(item.id)}
                            >
                              <X size={15} />
                            </button>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div className="selection-empty">
                        <span>
                          <ClipboardList size={28} strokeWidth={1.5} />
                        </span>
                        <strong>아직 선택한 항목이 없어요</strong>
                        <p>
                          왼쪽에서 진료 항목을 선택하면
                          <br />
                          금액과 라벨을 확인할 수 있어요.
                        </p>
                      </div>
                    )}
                    <div className="total-block">
                      <div>
                        <span>총 안내 금액</span>
                        <small>
                          선택한 {selectedItems.length}개 항목의 합계
                        </small>
                      </div>
                      <strong>
                        {formatPrice(totalPrice)}
                        <small>원</small>
                      </strong>
                    </div>
                    <div className="print-action">
                      <button
                        className="button button-primary print-button"
                        disabled={!selectedItems.length}
                        onClick={() => window.print()}
                      >
                        <Printer size={18} />
                        {labelPages.length
                          ? `라벨 ${labelPages.length}장 출력`
                          : "라벨 출력"}
                        <ArrowRight size={17} />
                      </button>
                      <p>50 × 30 mm · 한 장에 2줄 · 자동 분할</p>
                    </div>
                  </section>
                  <section
                    className="preview-panel panel"
                    aria-labelledby="preview-title"
                  >
                    <div className="panel-heading">
                      <h2 id="preview-title">
                        <FileText size={17} />
                        라벨 미리보기
                      </h2>
                      <span className="preview-size">50 × 30 mm</span>
                    </div>
                    <div
                      className={`preview-stage ${!labelPages.length ? "empty-preview-stage" : ""}`}
                    >
                      <div className="dimension-width">
                        <span>50 mm</span>
                      </div>
                      {labelPages.length ? (
                        <Label
                          rows={labelPages[currentPreview]}
                          pageNumber={currentPreview + 1}
                          pageCount={labelPages.length}
                          totalPrice={totalPrice}
                        />
                      ) : (
                        <div className="placeholder-label">
                          <span className="placeholder-title">
                            비급여 진료 내역
                          </span>
                          <span className="placeholder-line" />
                          <span className="placeholder-line short" />
                          <div>
                            <span>전체 합계</span>
                            <span>— 원</span>
                          </div>
                        </div>
                      )}
                      <span className="dimension-height">30 mm</span>
                    </div>
                    <div className="preview-pagination">
                      <button
                        className="icon-button"
                        aria-label="이전 라벨"
                        disabled={!labelPages.length || currentPreview === 0}
                        onClick={() => setPreviewIndex(currentPreview - 1)}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span>
                        {labelPages.length ? (
                          <>
                            <strong>{currentPreview + 1}</strong> /{" "}
                            {labelPages.length}장
                          </>
                        ) : (
                          "항목을 선택하면 표시됩니다"
                        )}
                      </span>
                      <button
                        className="icon-button"
                        aria-label="다음 라벨"
                        disabled={
                          !labelPages.length ||
                          currentPreview === labelPages.length - 1
                        }
                        onClick={() => setPreviewIndex(currentPreview + 1)}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                    <div className="preview-note">
                      <Sparkles size={14} />
                      <span>항목이 많아도 라벨을 자동으로 나눠드려요.</span>
                    </div>
                  </section>
                  <button
                    className="print-help"
                    onClick={() => setDialog({ type: "help" })}
                  >
                    <CircleHelp size={15} />
                    처음 출력하시나요? 설정을 확인해 주세요
                    <ChevronRight size={14} />
                  </button>
                </aside>
              ) : null}
            </div>
            <footer className="workspace-footer">
              <span>간편한 선택, 정확한 안내.</span>
              <span>비급여 데스크</span>
            </footer>
          </main>
        </div>
        {!manageMode && selectedItems.length ? (
          <div className="mobile-print-bar">
            <a href="#selection-summary" className="mobile-selection-summary">
              <span>
                {selectedItems.length}개 선택 <ChevronRight size={12} />
              </span>
              <strong>
                {formatPrice(totalPrice)}
                <small>원</small>
              </strong>
            </a>
            <button
              className="button button-primary"
              onClick={() => window.print()}
            >
              <Printer size={17} />
              라벨 {labelPages.length}장 출력
            </button>
          </div>
        ) : null}
        {notice ? (
          <div className="toast" role="status">
            <Check size={17} />
            {notice}
          </div>
        ) : null}
        {dialog?.type === "help" ? (
          <Modal title="라벨 출력 설정" onClose={() => setDialog(null)}>
            <p className="help-intro">
              라벨 프린터와 브라우저의 용지 설정을 맞추면 실제 크기로 출력할 수
              있어요.
            </p>
            <ol className="help-steps">
              <li>
                <span>1</span>
                <div>
                  <strong>라벨 프린터 선택</strong>
                  <p>인쇄 창의 대상에서 사용할 라벨 프린터를 선택하세요.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>용지 크기: 가로 50 × 세로 30 mm</strong>
                  <p>프린터 드라이버에서도 같은 용지 크기를 설정하세요.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>배율 100% · 여백 없음</strong>
                  <p>페이지 맞춤을 해제하고 머리글과 바닥글을 끄세요.</p>
                </div>
              </li>
              <li>
                <span>4</span>
                <div>
                  <strong>라벨을 확인한 뒤 출력</strong>
                  <p>
                    기본적으로 항목 2개가 한 장에 들어갑니다. 긴 이름은 이어지는
                    줄로 나누며, 각 라벨에 전체 합계와 페이지 번호를 표시합니다.
                  </p>
                </div>
              </li>
            </ol>
            <div className="modal-actions">
              <button
                className="button button-primary"
                onClick={() => setDialog(null)}
              >
                확인했어요
              </button>
            </div>
          </Modal>
        ) : dialog ? (
          <CatalogDialog
            key={`${dialog.type}-${dialog.item?.id ?? dialog.category ?? ""}`}
            dialog={dialog}
            categories={categories}
            onSave={saveDialog}
            onClose={() => setDialog(null)}
          />
        ) : null}
      </div>
      <div className="print-area" aria-hidden="true">
        {labelPages.map((rows, index) => (
          <Label
            key={index}
            rows={rows}
            pageNumber={index + 1}
            pageCount={labelPages.length}
            totalPrice={totalPrice}
          />
        ))}
      </div>
    </>
  );
}
