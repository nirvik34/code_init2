from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.models import user_model

router = APIRouter()


class SignupRequest(BaseModel):
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
async def login(req: LoginRequest):
    """Log in with standard username and password."""
    ok = await user_model.verify_user_password(req.username, req.password)
    if not ok:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    print(f"[AUTH] ✅ Password login success for '{req.username}'")
    return {"success": True, "username": req.username}


class FingerprintRequest(BaseModel):
    username: str
    fingerprint: str


class RegisterFingerprintRequest(BaseModel):
    username: str
    fingerprint: str


class VerifyFingerprintRequest(BaseModel):
    username: str
    fingerprint: str


class LoginFingerprintRequest(BaseModel):
    fingerprint: str


@router.post("/signup")
async def signup(req: SignupRequest):
    try:
        user = await user_model.create_user(req.username, req.password)
        return {"success": True, "user": user}
    except ValueError as e:
        if str(e) == "user_exists":
            raise HTTPException(status_code=400, detail="User already exists")
        raise HTTPException(status_code=500, detail="could_not_create_user")


@router.post("/signup/fingerprint")
async def signup_fingerprint(req: FingerprintRequest):
    try:
        await user_model.add_fingerprint(req.username, req.fingerprint)
        return {"success": True}
    except ValueError:
        raise HTTPException(status_code=404, detail="user_not_found")


@router.post("/register/fingerprint")
async def register_with_fingerprint(req: RegisterFingerprintRequest):
    """Create a new user with fingerprint only (no password)."""
    try:
        await user_model.create_user(req.username, None)
    except ValueError:
        raise HTTPException(status_code=400, detail="User already exists")
    await user_model.add_fingerprint(req.username, req.fingerprint)
    print(f"[AUTH] ✅ Registered new user '{req.username}' with fingerprint")
    return {"success": True, "username": req.username}


@router.post("/login/fingerprint")
async def login_with_fingerprint(req: LoginFingerprintRequest):
    """Log in by matching fingerprint across all users."""
    user = await user_model.get_user_by_fingerprint(req.fingerprint)
    if user is None:
        print(f"[AUTH] ❌ Fingerprint login failed — not found")
        raise HTTPException(status_code=401, detail="No account matches this fingerprint")
    print(f"[AUTH] ✅ Fingerprint login success for '{user['username']}'")
    return {"success": True, "username": user["username"]}


@router.post("/verify/fingerprint")
async def verify_fingerprint_route(req: VerifyFingerprintRequest):
    ok = await user_model.verify_fingerprint(req.username, req.fingerprint)
    return {"match": ok}


@router.get("/users")
async def list_users():
    """Debug endpoint: list all registered usernames."""
    from app.db import db, USING_MONGO
    if USING_MONGO:
        import asyncio
        # Access the raw pymongo collection through the DBWrapper
        raw_db = db._raw
        def _list_sync():
            coll = raw_db["users"]
            return [{"username": u.get("username", "?")} for u in coll.find({}, {"_id": 0, "username": 1})]
        users = await asyncio.to_thread(_list_sync)
    else:
        data = db.users._read()
        users = [{"username": u} for u in data.keys()]
    return {"users": users, "storage": "mongodb" if USING_MONGO else "file"}
