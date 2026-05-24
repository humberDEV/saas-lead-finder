"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { X, Loader2, MapPin, Check, Shuffle, Sparkles } from "lucide-react";
import CITIES, { CITIES_EN } from "@/lib/cities";
import { usePickerWheel } from "@/components/gacha";

interface MapPickerModalProps {
  onClose: () => void;
  onSelect: (city: string) => void;
}

const DEFAULT_CENTER: L.LatLngExpression = [40.4168, -3.7038];
const DEFAULT_ZOOM = 5;

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "User-Agent": "Huntly/1.0 (https://tryhuntly.com)",
};

function createMarkerIcon(pulse = false) {
  return L.divIcon({
    className: pulse ? "huntly-marker-pulse" : "",
    html: `<div class="huntly-marker-wrap">
      <div class="huntly-marker-ring"></div>
      <div class="huntly-marker-dot"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function formatAddress(addr: Record<string, string>): string {
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.suburb ||
    addr.county ||
    "";
  const country = addr.country || "";
  if (city && country) return `${city}, ${country}`;
  return city || country || "";
}

async function forwardGeocode(
  query: string,
  lang: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { ...NOMINATIM_HEADERS, "Accept-Language": lang } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

function flyToAsync(
  map: L.Map,
  center: L.LatLngExpression,
  zoom: number,
  duration: number
): Promise<void> {
  map.flyTo(center, zoom, { duration, easeLinearity: 0.22 });
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration * 1000 + 80);
  });
}

export default function MapPickerModal({ onClose, onSelect }: MapPickerModalProps) {
  const t = useTranslations("mapPicker");
  const locale = useLocale();
  const lang = locale.startsWith("en") ? "en" : "es";
  const cityPool = locale.startsWith("en") ? CITIES_EN : CITIES;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const teleportingRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [teleporting, setTeleporting] = useState(false);
  const [warpCity, setWarpCity] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [landPulse, setLandPulse] = useState(false);
  const [pendingCity, setPendingCity] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "hint" | "error">("hint");

  const setMarkerAt = useCallback((lat: number, lng: number, pulse = false) => {
    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(createMarkerIcon(pulse));
    } else {
      markerRef.current = L.marker([lat, lng], { icon: createMarkerIcon(pulse) }).addTo(map);
    }
  }, []);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      setPendingCity(null);
      setStatus("hint");

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
          { headers: { ...NOMINATIM_HEADERS, "Accept-Language": lang } }
        );
        if (!res.ok) throw new Error("geocode failed");
        const data = await res.json();
        const result = formatAddress(data.address || {});
        if (result.trim()) {
          setPendingCity(result);
          setStatus("hint");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      } finally {
        setLoading(false);
      }
    },
    [lang]
  );

  const teleportTo = useCallback(
    async (cityLabel: string, lat: number, lng: number) => {
      const map = mapRef.current;
      if (!map || teleportingRef.current) return;

      teleportingRef.current = true;
      setTeleporting(true);
      setWarpCity(cityLabel);
      setFlash(true);
      setLoading(true);
      setStatus("hint");

      try {
        await flyToAsync(map, map.getCenter(), 3, 0.65);
        setFlash(false);
        await flyToAsync(map, [lat, lng], 13, 2.1);
        setMarkerAt(lat, lng, true);
        setPendingCity(cityLabel);
        setLandPulse(true);
        window.setTimeout(() => setLandPulse(false), 1400);
      } finally {
        setFlash(false);
        setTeleporting(false);
        setWarpCity(null);
        setLoading(false);
        teleportingRef.current = false;
      }
    },
    [setMarkerAt]
  );

  const teleportToCity = useCallback(
    async (preferredCity?: string) => {
      if (teleportingRef.current) return;

      let coords: { lat: number; lng: number } | null = null;
      let city = preferredCity ?? "";

      for (let i = 0; i < 4 && !coords; i++) {
        if (!city) {
          city = cityPool[Math.floor(Math.random() * cityPool.length)]!;
        }
        coords = await forwardGeocode(city, lang);
        if (!coords && preferredCity) city = "";
      }

      if (!coords) {
        setStatus("error");
        return;
      }

      await teleportTo(city, coords.lat, coords.lng);
    },
    [cityPool, lang, teleportTo]
  );

  const randomPicker = usePickerWheel({
    pool: cityPool,
    onComplete: (picked) => {
      void teleportToCity(picked);
    },
    format: (c) => c.split(",")[0]?.trim() ?? c,
    sequenceLength: 36,
  });

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (teleportingRef.current) return;
      const map = mapRef.current;
      if (!map) return;

      setMarkerAt(lat, lng, false);
      map.flyTo([lat, lng], Math.max(map.getZoom(), 11), { duration: 0.75, easeLinearity: 0.3 });
      void reverseGeocode(lat, lng);
    },
    [reverseGeocode, setMarkerAt]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    map.on("click", (e) => {
      handleMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    void (async () => {
      try {
        const geo = await fetch("https://ipapi.co/json/");
        const d = await geo.json();
        if (d.latitude && d.longitude && mapRef.current) {
          mapRef.current.setView([d.latitude, d.longitude], 7, { animate: false });
        }
      } catch {
        /* default */
      }
    })();

    const sizeTimer = window.setTimeout(() => map.invalidateSize(), 80);

    return () => {
      window.clearTimeout(sizeTimer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [handleMapClick]);

  const handleConfirm = () => {
    if (!pendingCity) return;
    onSelect(pendingCity);
    onClose();
  };

  const statusText = teleporting
    ? t("teleporting", { city: warpCity ?? "…" })
    : loading
    ? t("detecting")
    : status === "error"
    ? t("noCity")
    : pendingCity
    ? pendingCity
    : t("hint");

  return (
    <>
      <style>{`
        .huntly-marker-wrap {
          position: relative;
          width: 32px;
          height: 32px;
        }
        .huntly-marker-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 14px;
          height: 14px;
          margin: -7px 0 0 -7px;
          border-radius: 50%;
          background: #818cf8;
          border: 3px solid #fff;
          box-shadow: 0 0 12px rgba(99,102,241,0.9);
          z-index: 2;
        }
        .huntly-marker-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 28px;
          height: 28px;
          margin: -14px 0 0 -14px;
          border-radius: 50%;
          border: 2px solid rgba(129,140,248,0.5);
          animation: huntly-ring 2s ease-out infinite;
        }
        .huntly-marker-pulse .huntly-marker-ring {
          animation: huntly-ring-land 0.9s ease-out 3;
        }
        @keyframes huntly-ring {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes huntly-ring-land {
          0% { transform: scale(0.3); opacity: 1; border-color: rgba(167,139,250,0.9); }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .huntly-map-vignette {
          pointer-events: none;
          background: radial-gradient(ellipse 85% 75% at 50% 50%, transparent 40%, rgba(8,8,14,0.55) 100%);
        }
        .huntly-warp-flash {
          animation: huntly-flash 0.55s ease-out forwards;
        }
        @keyframes huntly-flash {
          0% { opacity: 0; }
          25% { opacity: 0.85; }
          100% { opacity: 0; }
        }
        .huntly-land-pulse {
          animation: huntly-land 1.2s ease-out forwards;
        }
        @keyframes huntly-land {
          0% { transform: scale(0.6); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 0.35; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget && !teleporting) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-3xl rounded-2xl overflow-hidden border border-indigo-500/20 bg-neutral-950 shadow-[0_0_80px_rgba(99,102,241,0.18),0_0_120px_rgba(0,0,0,0.9)] flex flex-col"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/80 to-transparent z-20" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b border-white/[0.06]">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/25 to-violet-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Sparkles className="w-4 h-4 text-indigo-300" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {t("title")}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{t("subtitle")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={teleporting}
              className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors shrink-0 disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative mx-4 sm:mx-5 mb-1 rounded-xl overflow-hidden border border-neutral-800/80 ring-1 ring-white/[0.04]">
            <div
              ref={mapContainerRef}
              className="w-full h-[min(50vh,400px)] min-h-[260px] bg-[#08080f] z-0 [&_.leaflet-control-attribution]:!bg-neutral-950/90 [&_.leaflet-control-attribution]:!text-[9px] [&_.leaflet-control-attribution]:!text-slate-600 [&_.leaflet-control-zoom]:!border-neutral-700/80 [&_.leaflet-control-zoom]:!rounded-lg [&_.leaflet-control-zoom]:!overflow-hidden [&_.leaflet-control-zoom_a]:!bg-neutral-900/95 [&_.leaflet-control-zoom_a]:!text-slate-400 [&_.leaflet-control-zoom_a]:!border-neutral-700/60 [&_.leaflet-control-zoom_a:hover]:!bg-indigo-500/20 [&_.leaflet-control-zoom_a:hover]:!text-white"
            />

            <div className="absolute inset-0 huntly-map-vignette z-[400]" />

            <AnimatePresence>
              {flash && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[450] huntly-warp-flash bg-indigo-400/30 mix-blend-screen pointer-events-none"
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {landPulse && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[450] flex items-center justify-center pointer-events-none"
                >
                  <div className="w-32 h-32 rounded-full border-2 border-violet-400/60 huntly-land-pulse" />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {teleporting && warpCity && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] px-4 py-2 rounded-full bg-neutral-950/90 border border-indigo-500/40 backdrop-blur-md shadow-[0_0_24px_rgba(99,102,241,0.35)] pointer-events-none"
                >
                  <p className="text-xs font-semibold text-indigo-200 whitespace-nowrap flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    {t("teleporting", { city: warpCity })}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center gap-2">
              <AnimatePresence>
                {randomPicker.isScanning && randomPicker.wheelLabels.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="px-3 py-2 rounded-xl bg-neutral-950/95 border border-white/10 backdrop-blur-md shadow-lg min-w-[140px] text-center"
                  >
                    <p className="text-xs font-semibold text-white truncate max-w-[160px]">
                      {randomPicker.wheelLabels[randomPicker.wheelIndex]}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={() => randomPicker.roll()}
                disabled={teleporting || loading || randomPicker.isActive}
                whileHover={{ scale: randomPicker.isActive ? 1 : 1.03 }}
                whileTap={{ scale: randomPicker.isActive ? 1 : 0.97 }}
                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border border-white/10 bg-neutral-950/90 text-indigo-200 backdrop-blur-md hover:border-indigo-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shuffle className="w-3 h-3 shrink-0" />
                <span className="max-w-[120px] truncate">{t("random")}</span>
              </motion.button>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-3 flex items-center gap-2 min-h-[44px]">
            <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <p
              className={`text-sm truncate flex items-center gap-2 ${
                teleporting
                  ? "text-indigo-300"
                  : pendingCity
                  ? "text-emerald-400 font-medium"
                  : status === "error"
                  ? "text-amber-400"
                  : "text-slate-500"
              }`}
            >
              {!teleporting && loading && (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-indigo-400" />
              )}
              {statusText}
            </p>
          </div>

          <div className="flex items-center gap-2 px-5 sm:px-6 pb-5 pt-0">
            <button
              type="button"
              onClick={onClose}
              disabled={teleporting}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent hover:border-neutral-800 transition-colors disabled:opacity-40"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!pendingCity || loading || teleporting}
              className="flex-[1.2] inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-white text-black hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,255,255,0.08)]"
            >
              <Check className="w-4 h-4" />
              {t("confirm")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
