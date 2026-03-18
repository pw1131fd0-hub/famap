export interface Favorite {
  id: string;
  userId: string;
  locationId: string;
  createdAt: string;
}

export interface FavoriteCreateDTO {
  userId: string;
  locationId: string;
}
