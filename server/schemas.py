from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class Category(str, Enum):
    PARK = "park"
    NURSING_ROOM = "nursing_room"
    RESTAURANT = "restaurant"
    MEDICAL = "medical"

class LocalizedString(BaseModel):
    zh: str
    en: str

class Coordinates(BaseModel):
    lat: float
    lng: float

class LocationBase(BaseModel):
    name: LocalizedString
    description: LocalizedString
    category: Category
    coordinates: Coordinates
    address: LocalizedString
    facilities: List[str]

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: str
    averageRating: float
    photoUrl: Optional[str] = None

    class Config:
        from_attributes = True

class SearchParams(BaseModel):
    lat: float
    lng: float
    radius: float
    category: Optional[Category] = None
    stroller_accessible: Optional[bool] = None

class ReviewBase(BaseModel):
    locationId: str
    rating: int
    comment: str

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: str
    userId: str
    userName: str
    createdAt: str

class FavoriteBase(BaseModel):
    locationId: str

class Favorite(FavoriteBase):
    id: str
    userId: str
    createdAt: str

class UserBase(BaseModel):
    email: str
    displayName: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    createdAt: str

class Token(BaseModel):
    access_token: str
    token_type: str
