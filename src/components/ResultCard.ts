import type { SearchResult } from "../models/types";
import { fmtUSD } from "../core/money";

export function ResultCard(r: SearchResult, onAdd: () => void) {
  const card = document.createElement("div");
  card.className = "card shadow-sm h-100";

  // Datos base
  const img =
    r.kind === "hotel" ? (r.item as any).photo
    : r.kind === "car"   ? (r.item as any).photo
    : "/assets/flight.jpg";

  const title =
    r.kind === "hotel" ? (r.item as any).name
    : r.kind === "car"   ? `${(r.item as any).brand} ${(r.item as any).model}`
    : `${(r.item as any).from} → ${(r.item as any).to}`;

  const price =
    r.kind === "hotel" ? (r.item as any).price
    : r.kind === "car"   ? (r.item as any).pricePerDay
    : (r.item as any).price;

  // Badges por tipo
  let badges: string[] = [];
  if (r.kind === "hotel") {
    const h: any = r.item;
    if (h.freeCancellation)  badges.push("Cancelación gratis");
    if (h.breakfastIncluded) badges.push("Desayuno incluido");
    if (typeof h.distanceCenterKm === "number")
      badges.push(`${h.distanceCenterKm} km del centro`);
  } else if (r.kind === "car") {
    const c: any = r.item;
    if (c.unlimitedKm) badges.push("KM ilimitados");
    if (c.automatic)   badges.push("Automático");
  } else if (r.kind === "flight") {
    const f: any = r.item;
    badges.push(f.nonstop ? "Directo" : "Con escalas");
    badges.push(f.airline);
  }

  card.innerHTML = `
    <img src="${img}" class="card-img-top result-thumb" alt="thumb" />
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">${title}</h5>
      <p class="card-text text-muted mb-2">${r.kind.toUpperCase()}</p>
      ${
        badges.length
          ? `<div class="mb-2 d-flex flex-wrap gap-2">
               ${badges.map((b) =>
                 `<span class="badge bg-light text-dark border">${b}</span>`
               ).join("")}
             </div>`
          : ""
      }
      <div class="mt-auto d-flex justify-content-between align-items-center">
        <span class="fw-bold">${fmtUSD(price)}</span>
        <div class="d-flex gap-2">
          ${
            r.kind === "hotel"
              ? `<a href="#/hotel?id=${(r.item as any).id}" class="btn btn-outline-secondary btn-sm">Ver</a>`
              : r.kind === "car"
              ? `<a href="#/car?id=${(r.item as any).id}" class="btn btn-outline-secondary btn-sm">Ver</a>`
              : `<a href="#/flight?id=${(r.item as any).id}" class="btn btn-outline-secondary btn-sm">Ver</a>`
          }
          <button class="btn btn-primary btn-sm">Agregar</button>
        </div>
      </div>
    </div>`;

  // Fallback si no existe la imagen física
  const imgEl = card.querySelector("img") as HTMLImageElement;
  imgEl.onerror = () => {
    imgEl.src =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'>
           <rect width='100%' height='100%' fill='#f1f3f5'/>
           <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
                 font-family='Arial' font-size='20' fill='#6c757d'>Sin imagen</text>
         </svg>`
      );
  };

  card.querySelector("button")!.addEventListener("click", onAdd);
  return card;
}
