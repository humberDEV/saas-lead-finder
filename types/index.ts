export interface Place {
  name: string;
  address: string;
  phone: string | null;
  has_whatsapp: boolean;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  has_website: boolean;
  score: number;
  scoreExplanation: string;
  temperature: string;
  scoreLabel: string;
  suggestedMessage: string;
}
