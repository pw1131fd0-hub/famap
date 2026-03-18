export interface Review {
  id: string;
  locationId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  photos?: string[];
  createdAt: string;
}

export interface ReviewCreateDTO {
  rating: number;
  comment: string;
  photos?: string[];
  userName?: string; // For now without full auth
}
