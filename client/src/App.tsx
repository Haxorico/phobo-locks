import { useState, useEffect } from "react";
import "./ttt.css"; //TODO: Replace with proper file and filename
const API = "http://localhost:3001/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  name: string;
  price: number;
  timeInMinutes: number;
  bufferMinutes: number;
};

type Slot = {
  start: string;
  end: string;
  available: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toUTCString().slice(17, 22);
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [slots, setSlotsData] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);

  // Fetch products on mount
  useEffect(() => {
    fetch(`${API}/products`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProductsError(true))
      .finally(() => setProductsLoading(false));
  }, []);

  // Fetch slots when product + date are selected
  useEffect(() => {
    if (!selectedProduct || !selectedDate) return;

    setSlotsData([]);
    setSelectedSlotIdx(null);
    setSlotsLoading(true);
    const dateStr = selectedDate.toISOString().split("T")[0];
    fetch(`${API}/schedule?productName=${selectedProduct.name}&date=${dateStr}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: Slot[]) => setSlotsData(data))
      .catch(() => setSlotsData([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedProduct, selectedDate]);

  // ── Calendar helpers ──────────────────────────────────────────────────────

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
  }

  function buildCalendarDays() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const totalDays = new Date(Date.UTC(calYear, calMonth + 1, 0)).getUTCDate();
    let startDow = new Date(Date.UTC(calYear, calMonth, 1)).getUTCDay();
    startDow = startDow === 0 ? 6 : startDow - 1;

    const blanks = Array.from({ length: startDow }, (_, i) => ({
      key: `b${i}`,
      blank: true,
    }));
    const days = Array.from({ length: totalDays }, (_, i) => {
      const d = i + 1;
      const date = new Date(Date.UTC(calYear, calMonth, d));
      return {
        key: `d${d}`,
        blank: false,
        day: d,
        date,
        isPast: date < today,
        isToday: date.getTime() === today.getTime(),
        isSelected: !!selectedDate && date.getTime() === selectedDate.getTime(),
      };
    });

    return [...blanks, ...days];
  }

  function handleDayClick(date: Date, isPast: boolean) {
    if (isPast) return;
    setSelectedDate(date);
    setSelectedSlotIdx(null);
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const selectedSlot = selectedSlotIdx !== null ? slots[selectedSlotIdx] : null;
  const showConfirmBar =
    !!selectedProduct && !!selectedDate && selectedSlot !== null;

  // ── Booking Heelpers ─────────────────────────────────────────────────────────
  const confirmClickHandler = () => {
    if (!selectedProduct || !selectedDate || !selectedSlot) return;

    fetch(`${API}/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selectedProduct,
        selectedDate,
        selectedSlot,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        // handle successful response data
      })
      .catch((error) => {
        // handle error
      })
      .finally(() => {
        // cleanup or loading state false
      });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <header className="loco-header">
        <span style={{ fontSize: 20, color: "#e05a2b" }}>🔐</span>
        <span className="loco-logo">
          PHOBO LO<span>C</span>O
        </span>
        <span className="loco-tagline">Locksmith Services</span>
      </header>

      <div className="loco-body">
        {/* ── Step 1: Service ── */}
        <div className="step-card">
          <div className="step-header">
            <span className="step-num">01</span>
            <span className="step-title">Select service</span>
          </div>
          <div className="step-body">
            {productsLoading && <div className="loading-state">loading...</div>}
            {productsError && (
              <div className="error-msg">could not load services</div>
            )}
            {!productsLoading &&
              !productsError &&
              products.map((p) => (
                <div
                  key={p.name}
                  className={`service-item ${selectedProduct?.name === p.name ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedProduct(p);
                    setSelectedDate(null);
                    setSelectedSlotIdx(null);
                    setSlotsData([]);
                  }}
                >
                  <div className="service-name">{p.name}</div>
                  <div className="service-meta">
                    <span>⏱ {p.timeInMinutes}min</span>
                    <span>$ {p.price}</span>
                    {p.bufferMinutes > 0 && (
                      <span>+{p.bufferMinutes}min buffer</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ── Step 2: Date ── */}
        <div className={`step-card ${!selectedProduct ? "inactive" : ""}`}>
          <div className="step-header">
            <span className="step-num">02</span>
            <span className="step-title">Select date</span>
          </div>
          <div className="step-body">
            <div className="cal-nav">
              <button
                className="cal-nav-btn"
                onClick={prevMonth}
                aria-label="previous month"
              >
                ‹
              </button>
              <span className="cal-month">
                {MONTHS[calMonth]} {calYear}
              </span>
              <button
                className="cal-nav-btn"
                onClick={nextMonth}
                aria-label="next month"
              >
                ›
              </button>
            </div>
            <div className="cal-grid">
              {DAYS.map((d) => (
                <div key={d} className="cal-label">
                  {d}
                </div>
              ))}
              {buildCalendarDays().map((cell) => {
                if (cell.blank)
                  return <div key={cell.key} className="cal-day empty" />;
                const { key, day, date, isPast, isToday, isSelected } =
                  cell as ReturnType<typeof buildCalendarDays>[number] & {
                    day: number;
                    date: Date;
                    isPast: boolean;
                    isToday: boolean;
                    isSelected: boolean;
                  };
                return (
                  <div
                    key={key}
                    className={`cal-day ${isPast ? "past" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => handleDayClick(date, isPast)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Step 3: Time slot ── */}
        <div className={`step-card ${!selectedDate ? "inactive" : ""}`}>
          <div className="step-header">
            <span className="step-num">03</span>
            <span className="step-title">Select time</span>
          </div>
          <div className="step-body">
            {!selectedDate && (
              <div className="empty-state">pick a date first</div>
            )}
            {selectedDate && slotsLoading && (
              <div className="loading-state">fetching slots...</div>
            )}
            {selectedDate && !slotsLoading && slots.length === 0 && (
              <div className="empty-state">no slots available</div>
            )}
            {selectedDate && !slotsLoading && slots.length > 0 && (
              <div className="slots-grid">
                {slots.map((slot, i) => (
                  <div
                    key={slot.start}
                    className={`slot-item ${!slot.available ? "taken" : ""} ${selectedSlotIdx === i ? "selected" : ""}`}
                    onClick={() => {
                      if (slot.available) setSelectedSlotIdx(i);
                    }}
                  >
                    <div className="slot-time">{fmtTime(slot.start)}</div>
                    <div className="slot-window">→ {fmtTime(slot.end)}</div>
                    {!slot.available && (
                      <div className="slot-badge">booked</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Confirm bar ── */}
        {showConfirmBar && selectedSlot && (
          <div className="confirm-bar">
            <div className="confirm-summary">
              <div className="confirm-field">
                <span className="confirm-label">Service</span>
                <span className="confirm-value">{selectedProduct!.name}</span>
              </div>
              <div className="confirm-field">
                <span className="confirm-label">Date</span>
                <span className="confirm-value">{fmtDate(selectedDate!)}</span>
              </div>
              <div className="confirm-field">
                <span className="confirm-label">Time</span>
                <span className="confirm-value">
                  {fmtTime(selectedSlot.start)}
                </span>
              </div>
              <div className="confirm-field">
                <span className="confirm-label">Window</span>
                <span className="confirm-value">
                  {fmtTime(selectedSlot.start)} – {fmtTime(selectedSlot.end)}
                </span>
              </div>
            </div>
            <button className="confirm-btn" onClick={confirmClickHandler}>
              confirm booking →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
