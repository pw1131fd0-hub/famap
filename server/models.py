from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, ARRAY
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    display_name = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Location(Base):
    __tablename__ = "locations"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name_zh = Column(Text)
    name_en = Column(Text)
    description_zh = Column(Text)
    description_en = Column(Text)
    category = Column(String(50))
    geom = Column(Geometry('POINT', srid=4326))
    address_zh = Column(Text)
    address_en = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    facilities = relationship("Facility", back_populates="location")
    reviews = relationship("Review", back_populates="location")
    favorites = relationship("Favorite", back_populates="location")
    events = relationship("Event", back_populates="location")

class Facility(Base):
    __tablename__ = "facilities"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id = Column(String, ForeignKey("locations.id"))
    type = Column(String(50))
    count = Column(Integer, default=1)

    location = relationship("Location", back_populates="facilities")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id = Column(String, ForeignKey("locations.id"))
    user_id = Column(String, ForeignKey("users.id"))
    rating = Column(Integer)
    comment = Column(Text)
    photos = Column(ARRAY(Text), default=[])
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    location = relationship("Location", back_populates="reviews")
    user = relationship("User")

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    location_id = Column(String, ForeignKey("locations.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    location = relationship("Location", back_populates="favorites")

class Event(Base):
    __tablename__ = "events"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id = Column(String, ForeignKey("locations.id"))
    title_zh = Column(Text)
    title_en = Column(Text)
    description_zh = Column(Text)
    description_en = Column(Text)
    event_type = Column(String(50))  # e.g., 'birthday_party', 'class', 'workshop', 'performance', 'activity'
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    ageRange_min = Column(Integer)
    ageRange_max = Column(Integer)
    capacity = Column(Integer)
    price = Column(Float, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    location = relationship("Location", back_populates="events")
