import {
  CheckCircle,
  Clock,
  Phone,
  ThumbsUp,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type Lead = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  score: number;
  status: string;
  notes: string | null;
  website: string | null;
  hasWebsite: boolean;
  hasWhatsapp: boolean;
  rating: number;
  reviewCount: number;
  suggestedMessage: string | null;
  temperature: string | null;
  scoreLabel: string | null;
  createdAt: string;
};

export const STATUSES = [
  "PENDIENTE",
  "CONTACTADO",
  "INTERESADO",
  "CERRADO",
  "DESCARTADO",
] as const;

export type Status = (typeof STATUSES)[number];

const LEGACY_STATUS_MAP: Record<string, Status> = {
  EN_CONTACTO: "CONTACTADO",
};

export function normalizeStatus(status: string): Status {
  if (LEGACY_STATUS_MAP[status]) return LEGACY_STATUS_MAP[status];
  if ((STATUSES as readonly string[]).includes(status)) return status as Status;
  return "PENDIENTE";
}

export const ACTIVE_STATUSES: Status[] = [
  "PENDIENTE",
  "CONTACTADO",
  "INTERESADO",
  "CERRADO",
];

export const STATUS_LABEL_KEYS: Record<Status, string> = {
  PENDIENTE: "labelPending",
  CONTACTADO: "labelContacted",
  INTERESADO: "labelInterested",
  CERRADO: "labelClosed",
  DESCARTADO: "labelDiscarded",
};

export const STATUS_COLUMN_KEYS: Record<Status, string> = {
  PENDIENTE: "columnPending",
  CONTACTADO: "columnContacted",
  INTERESADO: "columnInterested",
  CERRADO: "columnAccepted",
  DESCARTADO: "labelDiscarded",
};

export const STATUS_EMPTY_KEYS: Partial<Record<Status, string>> = {
  PENDIENTE: "emptyPending",
  CONTACTADO: "emptyContacted",
  INTERESADO: "emptyInterested",
  CERRADO: "emptyAccepted",
};

export const STATUS_VISUAL: Record<
  Status,
  {
    color: string;
    border: string;
    bg: string;
    ring: string;
    Icon: LucideIcon;
  }
> = {
  PENDIENTE: {
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
    Icon: Clock,
  },
  CONTACTADO: {
    color: "text-indigo-400",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/10",
    ring: "ring-indigo-500/20",
    Icon: Phone,
  },
  INTERESADO: {
    color: "text-sky-400",
    border: "border-sky-500/30",
    bg: "bg-sky-500/10",
    ring: "ring-sky-500/20",
    Icon: ThumbsUp,
  },
  CERRADO: {
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
    Icon: CheckCircle,
  },
  DESCARTADO: {
    color: "text-zinc-500",
    border: "border-zinc-700/80",
    bg: "bg-zinc-800/50",
    ring: "ring-zinc-600/30",
    Icon: XCircle,
  },
};

export function getNextActiveStatus(status: Status): Status | null {
  const idx = ACTIVE_STATUSES.indexOf(status);
  if (idx < 0 || idx >= ACTIVE_STATUSES.length - 1) return null;
  return ACTIVE_STATUSES[idx + 1];
}

export function scoreBadgeClass(temperature: string | null): string {
  if (temperature === "🟢") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
  if (temperature === "🟡") return "bg-amber-500/15 text-amber-400 border-amber-500/25";
  if (temperature === "🟠") return "bg-orange-500/15 text-orange-400 border-orange-500/25";
  return "bg-red-500/15 text-red-400 border-red-500/25";
}
