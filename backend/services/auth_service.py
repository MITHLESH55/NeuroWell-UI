import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "neuro-well-secret-key-12345")
ALGORITHM = "HS256"

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Verify a password against a hashed version."""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception:
            return False

    @staticmethod
    def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=7)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
