"""
Database abstraction layer for KissanMitra.

Uses Supabase (PostgreSQL) when SUPABASE_URL and SUPABASE_KEY are set.
Falls back to local JSON files otherwise (development only).
"""

import os
import json
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Try to import supabase; if not installed, force JSON fallback
# ---------------------------------------------------------------------------
try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False

# ---------------------------------------------------------------------------
# Module-level state
# ---------------------------------------------------------------------------
_supabase: "Client | None" = None
_use_supabase = False

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

USERS_FILE = os.path.join(DATA_DIR, "users.json")
EQUIPMENT_FILE = os.path.join(DATA_DIR, "equipment.json")
WASTE_FILE = os.path.join(DATA_DIR, "waste_listings.json")
BOOKINGS_FILE = os.path.join(DATA_DIR, "bookings.json")
COMMUNITY_FILE = os.path.join(DATA_DIR, "community_posts.json")


def init_db():
    """Initialize the database connection. Call once at startup."""
    global _supabase, _use_supabase

    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_KEY", "").strip()

    if HAS_SUPABASE and url and key:
        try:
            _supabase = create_client(url, key)
            # Quick connectivity check
            _supabase.table("users").select("id").limit(1).execute()
            _use_supabase = True
            logger.info("Database: connected to Supabase PostgreSQL")
            return
        except Exception as e:
            logger.warning(f"Supabase connection failed ({e}), falling back to JSON files")

    _use_supabase = False
    logger.info("Database: using local JSON files (set SUPABASE_URL & SUPABASE_KEY for production)")


# ---------------------------------------------------------------------------
# JSON helpers (unchanged from original app.py)
# ---------------------------------------------------------------------------
def _load_json(filepath):
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def _save_json(filepath, data):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)


# ===================================================================
# USERS
# ===================================================================
def get_user_by_email(email: str) -> dict | None:
    if _use_supabase:
        resp = _supabase.table("users").select("*").eq("email", email).execute()
        rows = resp.data
        return rows[0] if rows else None
    else:
        users = _load_json(USERS_FILE)
        for u in users:
            if u["email"] == email:
                return u
        return None


def create_user(user: dict) -> dict:
    """Insert a new user record. `user` must contain all fields."""
    if _use_supabase:
        resp = _supabase.table("users").insert(user).execute()
        return resp.data[0]
    else:
        users = _load_json(USERS_FILE)
        users.append(user)
        _save_json(USERS_FILE, users)
        return user


# ===================================================================
# EQUIPMENT
# ===================================================================
def get_equipment(type_filter="", location="", min_price=0, max_price=999999) -> list:
    if _use_supabase:
        q = _supabase.table("equipment").select("*")
        if type_filter:
            q = q.eq("type", type_filter)
        if location:
            q = q.ilike("location", f"%{location}%")
        if min_price > 0:
            q = q.gte("daily_rate", min_price)
        if max_price < 999999:
            q = q.lte("daily_rate", max_price)
        return q.execute().data
    else:
        equipment = _load_json(EQUIPMENT_FILE)
        filtered = equipment
        if type_filter:
            filtered = [e for e in filtered if e.get("type") == type_filter]
        if location:
            filtered = [e for e in filtered if location.lower() in e.get("location", "").lower()]
        if min_price > 0:
            filtered = [e for e in filtered if e.get("daily_rate", 0) >= min_price]
        if max_price < 999999:
            filtered = [e for e in filtered if e.get("daily_rate", 0) <= max_price]
        return filtered


def add_equipment(item: dict) -> dict:
    if _use_supabase:
        resp = _supabase.table("equipment").insert(item).execute()
        return resp.data[0]
    else:
        equipment = _load_json(EQUIPMENT_FILE)
        equipment.append(item)
        _save_json(EQUIPMENT_FILE, equipment)
        return item


def get_equipment_by_id(equipment_id: str) -> dict | None:
    if _use_supabase:
        resp = _supabase.table("equipment").select("*").eq("id", equipment_id).execute()
        rows = resp.data
        return rows[0] if rows else None
    else:
        equipment = _load_json(EQUIPMENT_FILE)
        for e in equipment:
            if e["id"] == equipment_id:
                return e
        return None


def init_equipment_data(default_equipment: list):
    """Seed equipment if the table/file is empty."""
    if _use_supabase:
        resp = _supabase.table("equipment").select("id").limit(1).execute()
        if not resp.data:
            _supabase.table("equipment").insert(default_equipment).execute()
            logger.info("Seeded default equipment data into Supabase")
    else:
        equipment = _load_json(EQUIPMENT_FILE)
        if not equipment:
            _save_json(EQUIPMENT_FILE, default_equipment)


# ===================================================================
# BOOKINGS
# ===================================================================
def get_bookings(owner="", renter="") -> list:
    if _use_supabase:
        q = _supabase.table("bookings").select("*")
        if owner:
            q = q.eq("equipment_owner", owner)
        if renter:
            q = q.eq("renter_name", renter)
        rows = q.order("created_at", desc=True).execute().data
        return rows
    else:
        bookings = _load_json(BOOKINGS_FILE)
        if owner:
            bookings = [b for b in bookings if b.get("equipment_owner", "") == owner]
        if renter:
            bookings = [b for b in bookings if b.get("renter_name", "") == renter]
        bookings.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return bookings


def create_booking(booking: dict) -> dict:
    if _use_supabase:
        resp = _supabase.table("bookings").insert(booking).execute()
        return resp.data[0]
    else:
        bookings = _load_json(BOOKINGS_FILE)
        bookings.append(booking)
        _save_json(BOOKINGS_FILE, bookings)
        return booking


def update_booking(booking_id: str, updates: dict) -> dict | None:
    if _use_supabase:
        resp = _supabase.table("bookings").update(updates).eq("id", booking_id).execute()
        return resp.data[0] if resp.data else None
    else:
        bookings = _load_json(BOOKINGS_FILE)
        for b in bookings:
            if b["id"] == booking_id:
                b.update(updates)
                _save_json(BOOKINGS_FILE, bookings)
                return b
        return None


# ===================================================================
# WASTE LISTINGS
# ===================================================================
def get_waste_listings() -> list:
    if _use_supabase:
        return _supabase.table("waste_listings").select("*").execute().data
    else:
        return _load_json(WASTE_FILE)


def add_waste_listing(listing: dict) -> dict:
    if _use_supabase:
        resp = _supabase.table("waste_listings").insert(listing).execute()
        return resp.data[0]
    else:
        waste = _load_json(WASTE_FILE)
        waste.append(listing)
        _save_json(WASTE_FILE, waste)
        return listing


def delete_waste_listing(listing_id: str):
    if _use_supabase:
        _supabase.table("waste_listings").delete().eq("id", listing_id).execute()
    else:
        waste = _load_json(WASTE_FILE)
        waste = [w for w in waste if w["id"] != listing_id]
        _save_json(WASTE_FILE, waste)


def init_waste_data(default_waste: list):
    """Seed waste listings if the table/file is empty."""
    if _use_supabase:
        resp = _supabase.table("waste_listings").select("id").limit(1).execute()
        if not resp.data:
            _supabase.table("waste_listings").insert(default_waste).execute()
            logger.info("Seeded default waste data into Supabase")
    else:
        waste = _load_json(WASTE_FILE)
        if not waste:
            _save_json(WASTE_FILE, default_waste)


# ===================================================================
# COMMUNITY POSTS
# ===================================================================
def get_community_posts() -> list:
    if _use_supabase:
        posts = _supabase.table("community_posts").select("*").order("created_at", desc=True).execute().data
        # Ensure answers field is always a list
        for p in posts:
            if p.get("answers") is None:
                p["answers"] = []
        return posts
    else:
        posts = _load_json(COMMUNITY_FILE)
        posts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return posts


def create_community_post(post: dict) -> dict:
    if _use_supabase:
        resp = _supabase.table("community_posts").insert(post).execute()
        return resp.data[0]
    else:
        posts = _load_json(COMMUNITY_FILE)
        posts.append(post)
        _save_json(COMMUNITY_FILE, posts)
        return post


def get_community_post_by_id(post_id: str) -> dict | None:
    if _use_supabase:
        resp = _supabase.table("community_posts").select("*").eq("id", post_id).execute()
        return resp.data[0] if resp.data else None
    else:
        posts = _load_json(COMMUNITY_FILE)
        for p in posts:
            if p["id"] == post_id:
                return p
        return None


def update_community_post(post_id: str, updates: dict) -> dict | None:
    if _use_supabase:
        resp = _supabase.table("community_posts").update(updates).eq("id", post_id).execute()
        return resp.data[0] if resp.data else None
    else:
        posts = _load_json(COMMUNITY_FILE)
        for p in posts:
            if p["id"] == post_id:
                p.update(updates)
                _save_json(COMMUNITY_FILE, posts)
                return p
        return None


def delete_community_post(post_id: str):
    if _use_supabase:
        _supabase.table("community_posts").delete().eq("id", post_id).execute()
    else:
        posts = _load_json(COMMUNITY_FILE)
        posts = [p for p in posts if p["id"] != post_id]
        _save_json(COMMUNITY_FILE, posts)
