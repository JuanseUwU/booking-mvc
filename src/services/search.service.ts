import type { FilterState, SearchResult, ServiceKind } from "../models/types";
import { mockSearch } from "./adapters/mock.adapter";
import { esbSearch } from "./adapters/esb.adapter";

const USE_ESB = import.meta.env.VITE_USE_ESB === "true";

export async function searchAll(query: string, filters?: FilterState): Promise<SearchResult[]> {
  const results = USE_ESB ? await esbSearch(query, filters) : await mockSearch(query);
  return applyFilters(results, filters);
}

function priceOf(r: SearchResult): number {
  if (r.kind === "hotel")  return (r.item as any).price;
  if (r.kind === "car")    return (r.item as any).pricePerDay;
  return (r.item as any).price; // flight
}

function applyFilters(results: SearchResult[], f?: FilterState): SearchResult[] {
  if (!f) return results.slice();

  let out = results.slice();

  // tipo
  if (f.kinds?.length) out = out.filter(r => f.kinds.includes(r.kind as ServiceKind));

  // ciudad (hoteles)
  if (f.city) out = out.filter(r => r.kind !== "hotel" || (r.item as any).city?.toLowerCase().includes(f.city!.toLowerCase()));

  // rating mínimo (hoteles)
  if (typeof f.ratingMin === "number")
    out = out.filter(r => r.kind !== "hotel" || ((r.item as any).rating ?? 0) >= (f.ratingMin ?? 0));

  // precio
  if (typeof f.priceMin === "number") out = out.filter(r => priceOf(r) >= (f.priceMin as number));
  if (typeof f.priceMax === "number") out = out.filter(r => priceOf(r) <= (f.priceMax as number));

  // ordenar
  if (f.sort === "price-asc")  out.sort((a,b)=> priceOf(a)-priceOf(b));
  if (f.sort === "price-desc") out.sort((a,b)=> priceOf(b)-priceOf(a));
  if (f.sort === "rating-desc")
    out.sort((a,b)=> ((b.kind==="hotel"? (b.item as any).rating: 0) - (a.kind==="hotel"? (a.item as any).rating: 0)));

  return out;
}
