import type { DemoCategory } from "./types";

/** Infers business category from niche / search query text */
export function inferCategory(niche: string): DemoCategory {
  const n = niche.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (n.includes("barb") || n.includes("barber")) return "barberia";
  if (n.includes("peluqu") || n.includes("salon") || n.includes("hair") || n.includes("pelo"))
    return "peluqueria";
  if (
    n.includes("restaur") ||
    n.includes("cafeter") ||
    n.includes("cafe") ||
    n.includes("comid") ||
    n.includes("food") ||
    n.includes("pizzer") ||
    n.includes("tapas") ||
    n.includes("burger")
  )
    return "restaurante";
  if (
    n.includes("dental") ||
    n.includes("dent") ||
    n.includes("odont") ||
    n.includes("ortodon")
  )
    return "dentista";
  if (
    n.includes("estetic") ||
    n.includes("beauty") ||
    n.includes("unas") ||
    n.includes("spa") ||
    n.includes("belleza") ||
    n.includes("cosmet")
  )
    return "estetica";
  if (n.includes("gimnasio") || n.includes("gym") || n.includes("fitness") || n.includes("crossfit"))
    return "gimnasio";
  if (n.includes("abogad") || n.includes("legal") || n.includes("notar") || n.includes("despacho"))
    return "abogado";
  if (n.includes("veterin") || n.includes("mascot") || n.includes("pet"))
    return "veterinaria";
  if (
    n.includes("electric") ||
    n.includes("elecric") ||
    (n.includes("instalac") && n.includes("electric"))
  )
    return "taller";
  if (
    n.includes("taller") ||
    n.includes("mecan") ||
    n.includes("auto") ||
    n.includes("car wash") ||
    n.includes("lavado")
  )
    return "taller";
  if (n.includes("hotel") || n.includes("hostal") || n.includes("alojam") || n.includes("bnb"))
    return "hotel";
  if (
    n.includes("clinic") ||
    n.includes("medic") ||
    n.includes("fisio") ||
    n.includes("psicolog") ||
    n.includes("nutri") ||
    n.includes("salud")
  )
    return "clinica";

  return "general";
}
