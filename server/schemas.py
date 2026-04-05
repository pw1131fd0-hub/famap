from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional
from enum import Enum
import re

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
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")
    comment: str = Field(..., min_length=1, max_length=500, description="Comment max 500 characters")

    @field_validator("comment")
    @classmethod
    def sanitize_comment(cls, v: str) -> str:
        # Strip HTML tags to prevent XSS
        clean = re.sub(r"<[^>]*>", "", v)
        return clean.strip()

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
    email: str = Field(..., max_length=255)
    displayName: str = Field(..., min_length=1, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        # Basic email format validation
        if not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid email format")
        return v.lower()

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        return v

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

class EventType(str, Enum):
    BIRTHDAY_PARTY = "birthday_party"
    CLASS = "class"
    WORKSHOP = "workshop"
    PERFORMANCE = "performance"
    ACTIVITY = "activity"
    OTHER = "other"

class EventBase(BaseModel):
    title: LocalizedString
    description: LocalizedString
    eventType: EventType
    startDate: str  # ISO format datetime
    endDate: str    # ISO format datetime
    ageRange: Optional[AgeRange] = None
    capacity: Optional[int] = None
    price: Optional[float] = 0

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: str
    locationId: str
    createdAt: str
    updatedAt: str

    model_config = ConfigDict(from_attributes=True)

class LocationQualityScore(BaseModel):
    """
    Comprehensive quality score for a location based on multiple factors.
    Helps families discover trustworthy and well-maintained venues.
    """
    locationId: str
    overallScore: float  # 0-100
    ratingScore: float  # Based on review ratings
    recencyScore: float  # Higher for recently updated locations
    verificationScore: float  # Based on data verification
    communityTrustScore: float  # Based on review count and consistency
    credibilityScore: float  # Alias for communityTrustScore for API compatibility
    recommendationReason: str  # Why this location is recommended
    trustLevel: str  # "high", "medium", "low"
    reviewCount: int
    lastVerifiedDate: Optional[str] = None
    isVerified: bool = False

class RecommendedLocation(BaseModel):
    """Location with quality score and recommendation reason"""
    location: Location
    qualityScore: LocationQualityScore
    recommendationScore: float  # 0-100
    matchReason: str  # Why recommended for this user
