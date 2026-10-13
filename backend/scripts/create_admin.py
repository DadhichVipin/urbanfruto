"""Manage admin users. This is the only way admins are created.

Run inside the backend container on the server:

    docker compose exec backend python scripts/create_admin.py you@urbanfruto.com   # create, or reset password
    docker compose exec backend python scripts/create_admin.py --list
    docker compose exec backend python scripts/create_admin.py --delete old@urbanfruto.com

The password is asked for interactively (never passed on the command line, so it
doesn't end up in shell history). Resetting a password logs that admin out everywhere.
"""
import argparse
import getpass
import os
import sys
import uuid
from datetime import datetime, timezone

import bcrypt
from pymongo import MongoClient

MIN_PASSWORD_LENGTH = 12


def ask_password() -> str | None:
    password = getpass.getpass(f"New password (min {MIN_PASSWORD_LENGTH} chars): ")
    if len(password) < MIN_PASSWORD_LENGTH:
        print(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.", file=sys.stderr)
        return None
    if password.lower() == password or password.upper() == password or not any(c.isdigit() for c in password):
        print("Use upper- and lower-case letters and at least one number.", file=sys.stderr)
        return None
    if getpass.getpass("Repeat password: ") != password:
        print("Passwords do not match.", file=sys.stderr)
        return None
    return password


def main() -> int:
    parser = argparse.ArgumentParser(description="Create, reset, list or delete admin users.")
    parser.add_argument("email", nargs="?")
    parser.add_argument("--name", default="Urban Fruto Admin")
    parser.add_argument("--list", action="store_true", help="list admin users")
    parser.add_argument("--delete", action="store_true", help="delete the given admin")
    args = parser.parse_args()

    db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]

    if args.list:
        for a in db.admins.find({}, {"_id": 0, "email": 1, "name": 1, "created_at": 1, "last_login_at": 1}):
            print(f"{a['email']:<36} created {a.get('created_at', '-')[:10]}  last login {a.get('last_login_at', 'never')[:16]}")
        return 0

    if not args.email or "@" not in args.email:
        parser.error("give an admin email address")
    email = args.email.lower().strip()

    if args.delete:
        if db.admins.count_documents({}) <= 1 and db.admins.find_one({"email": email}):
            print("Refusing to delete the last admin. Create another one first.", file=sys.stderr)
            return 1
        deleted = db.admins.delete_one({"email": email}).deleted_count
        print(f"Deleted {email}." if deleted else f"No admin {email}.")
        return 0 if deleted else 1

    password = ask_password()
    if not password:
        return 1
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()

    if db.admins.find_one({"email": email}):
        db.admins.update_one(
            {"email": email},
            {"$set": {"password_hash": password_hash, "name": args.name}, "$inc": {"token_version": 1}},
        )
        print(f"Password updated for {email}. Existing sessions are logged out.")
    else:
        db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "name": args.name,
            "password_hash": password_hash,
            "token_version": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        print(f"Admin {email} created.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
