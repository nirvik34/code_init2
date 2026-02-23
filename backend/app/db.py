import os
import asyncio
from typing import Any
from pathlib import Path

MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017"
MONGO_DB = os.getenv("MONGO_DB", "samaan")


class FileUsersCollection:
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self.path.write_text("{}")

    def _read(self):
        import json
        try:
            return json.loads(self.path.read_text())
        except Exception:
            return {}

    def _write(self, data):
        import json
        self.path.write_text(json.dumps(data, indent=2))

    async def find_one(self, query: dict):
        return await asyncio.to_thread(self._find_one_sync, query)

    def _find_one_sync(self, query: dict):
        users = self._read()
        for uname, doc in users.items():
            match = True
            for k, v in query.items():
                key_val = uname if k == "username" else doc.get(k)
                if key_val != v:
                    match = False
                    break
            if match:
                doc_copy = dict(doc)
                doc_copy["username"] = uname
                return doc_copy
        return None

    async def insert_one(self, doc: dict):
        return await asyncio.to_thread(self._insert_one_sync, doc)

    def _insert_one_sync(self, doc: dict):
        users = self._read()
        users[doc["username"]] = {k: v for k, v in doc.items() if k != "username"}
        self._write(users)
        class Res:
            pass
        r = Res()
        r.inserted_id = doc["username"]
        return r

    async def update_one(self, query: dict, update: dict):
        return await asyncio.to_thread(self._update_one_sync, query, update)

    def _update_one_sync(self, query: dict, update: dict):
        users = self._read()
        username = query.get("username") or None
        if username is None:
            class Res:
                pass
            r = Res()
            r.matched_count = 0
            return r
        if username not in users:
            class Res:
                pass
            r = Res()
            r.matched_count = 0
            return r
        setobj = update.get("$set", {})
        users[username].update(setobj)
        self._write(users)
        class Res:
            pass
        r = Res()
        r.matched_count = 1
        return r


USING_MONGO = False

try:
    import pymongo

    print(f"[DB] Connecting to MongoDB: {MONGO_URI[:50]}...")
    client = pymongo.MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
    )
    client.admin.command("ping")
    _raw_db = client[MONGO_DB]
    print(f"[DB] ✅  MongoDB connected — database: '{MONGO_DB}'")

    class AsyncCollection:
        def __init__(self, coll: pymongo.collection.Collection):
            self._coll = coll

        async def find_one(self, *args, **kwargs) -> Any:
            return await asyncio.to_thread(self._coll.find_one, *args, **kwargs)

        async def insert_one(self, *args, **kwargs) -> Any:
            return await asyncio.to_thread(self._coll.insert_one, *args, **kwargs)

        async def update_one(self, *args, **kwargs) -> Any:
            return await asyncio.to_thread(self._coll.update_one, *args, **kwargs)

    class DBWrapper:
        def __init__(self, raw_db):
            self._raw = raw_db

        def __getattr__(self, item: str) -> AsyncCollection:
            coll = self._raw[item]
            return AsyncCollection(coll)

    db = DBWrapper(_raw_db)
    USING_MONGO = True

except Exception as _e:
    print(f"[DB] ❌  MongoDB unavailable ({_e.__class__.__name__}: {str(_e)[:150]})")
    print("[DB] ⚠️   Falling back to local file storage (backend/app/data/users.json)")
    data_dir = Path(__file__).resolve().parent / "data"
    users_file = data_dir / "users.json"
    file_coll = FileUsersCollection(users_file)

    class FileDB:
        def __init__(self, users_coll):
            self.users = users_coll

    db = FileDB(file_coll)
    USING_MONGO = False
