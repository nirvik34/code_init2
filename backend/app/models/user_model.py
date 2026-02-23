from typing import Optional

from passlib.hash import bcrypt
from app.db import db


async def create_user(username: str, password: Optional[str]) -> dict:
    existing = await db.users.find_one({"username": username})
    if existing:
        raise ValueError("user_exists")
    hashed = None
    if password is not None:
        hashed = bcrypt.hash(password)
    doc = {"username": username, "password": hashed, "fingerprint": None}
    await db.users.insert_one(doc)
    return {"username": username}


async def get_user(username: str) -> Optional[dict]:
    return await db.users.find_one({"username": username})


async def verify_user_password(username: str, password: str) -> bool:
    user = await get_user(username)
    if not user:
        return False
    stored = user.get("password")
    if stored is None:
        return False
    try:
        return bcrypt.verify(password, stored)
    except Exception:
        return False


async def add_fingerprint(username: str, fingerprint_data: str):
    res = await db.users.update_one({"username": username}, {"$set": {"fingerprint": fingerprint_data}})
    if res.matched_count == 0:
        raise ValueError("no_user")


async def verify_fingerprint(username: str, fingerprint_data: str) -> bool:
    user = await get_user(username)
    if not user:
        return False
    stored = user.get("fingerprint")
    if stored is None:
        return False
    return stored == fingerprint_data


async def get_user_by_fingerprint(fingerprint_data: str) -> Optional[dict]:
    """Find a user whose stored fingerprint matches the given value."""
    return await db.users.find_one({"fingerprint": fingerprint_data})
