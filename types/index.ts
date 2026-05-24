export interface Place {
  name: string;
  address: string;
  phone: string | null;
  has_whatsapp: boolean;
  website?: string | null;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  has_website: boolean;
  score: number;
  scoreExplanation: string;
  temperature: string;
  scoreLabel: string;
  suggestedMessage: string;
  /** Google Places resource id (ChIJ…) */
  place_id?: string | null;
  google_maps_uri?: string | null;
  /** Photo resource names for server-side URL resolution */
  photo_names?: string[];
  opening_hours?: string[] | null;
}
