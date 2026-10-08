import { formatPrice } from "../data";

export default function Label({ rows, pageNumber, pageCount, totalPrice }) {
  return (
    <article
      className="label-sheet"
      aria-label={`라벨 ${pageNumber} / ${pageCount}`}
    >
      <header className="label-heading">
        <strong>비급여 진료 내역</strong>
        <span>
          {pageNumber} / {pageCount}
        </span>
      </header>
      <div className="label-rows">
        {rows.map((row) => (
          <div className="label-row" key={row.key}>
            <span className="label-item-name">
              {row.continued ? (
                <span className="label-continuation">↳ </span>
              ) : null}
              {row.name}
            </span>
            {row.price !== null ? (
              <strong
                className={`label-item-price${String(row.price).length > 9 ? " label-small-price" : ""}`}
              >
                {formatPrice(row.price)}원
              </strong>
            ) : null}
          </div>
        ))}
      </div>
      <footer className="label-total">
        <span>전체 합계</span>
        <strong
          className={String(totalPrice).length > 9 ? "label-small-price" : ""}
        >
          {formatPrice(totalPrice)}원
        </strong>
      </footer>
    </article>
  );
}
