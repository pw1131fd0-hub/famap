from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from enum import Enum

class Category(str, Enum):
    PARK = "park"
    NURSING_ROOM = "nursing_room"
    RESTAURANT = "restaurant"
    MEDICAL = "medical"
    ATTRACTION = "attraction"
    OTHER = "other"

class LocalizedString(BaseModel):
    zh: str
    en: str

class Coordinates(BaseModel):
    lat: float
    lng: float

class OperatingHours(BaseModel):
    monday: Optional[str] = None
    tuesday: Optional[str] = None
    wednesday: Optional[str] = None
    thursday: Optional[str] = None
    friday: Optional[str] = None
    saturday: Optional[str] = None
    sunday: Optional[str] = None

class AgeRange(BaseModel):
    minAge: Optional[int] = None
    maxAge: Optional[int] = None

class PricingInfo(BaseModel):
    isFree: bool = True
    priceRange: Optional[str] = None  # e.g., "100-500 NTD"

class LocationBase(BaseModel):
    name: LocalizedString
    description: LocalizedString
    category: Category
    coordinates: Coordinates
    address: LocalizedString
    facilities: List[str]
    operatingHours: Optional[OperatingHours] = None
    ageRange: Optional[AgeRange] = None
    pricing: Optional[PricingInfo] = None

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: str
    averageRating: float
    photoUrl: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

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

class NursingRoomDetails(BaseModel):
    hasDedicatedNursingRoom: Optional[bool] = None
    isPrivate: Optional[bool] = None
    hasSeating: Optional[bool] = None
    hasChangingTable: Optional[bool] = None
    hasAirConditioning: Optional[bool] = None
    hasWifi: Optional[bool] = None
    hasLockableStall: Optional[bool] = None
    hasRefrigerator: Optional[bool] = None
    hasPowerOutlet: Optional[bool] = None
    hasHandWashing: Optional[bool] = None
    cleanlinessRating: Optional[int] = None
    roomCount: Optional[int] = None
    nursingRoomNotes: Optional[str] = None

class PetPolicy(BaseModel):
    petsAllowed: Optional[bool] = None
    dogsAllowed: Optional[bool] = None
    catsAllowed: Optional[bool] = None
    serviceAnimalsAllowed: Optional[bool] = None
    smallPetsAllowed: Optional[bool] = None
    hasLeashRequirement: Optional[bool] = None
    hasDesignatedPetAreas: Optional[bool] = None
    hasOnSiteVeterinary: Optional[bool] = None
    petRestrictionsDetails: Optional[str] = None
    petPolicyNotes: Optional[str] = None
