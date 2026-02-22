# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker

# # PostgreSQL connection (local dev, SSL disabled)
# DATABASE_URL = "postgresql://postgres:rnr027310@localhost:5432/myapp_db"

# engine = create_engine(
#     DATABASE_URL,
#     connect_args={"sslmode": "disable"}  # ⚡ avoids TLS / wallet errors
# )

# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# import os
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base
# from dotenv import load_dotenv

# # Load .env for local development
# load_dotenv()

# DATABASE_URL = os.getenv("DATABASE_URL")

# if not DATABASE_URL:
#     raise ValueError("DATABASE_URL is not set. Make sure you configured it locally or on Render.")

# # Convert Render's postgres:// to postgresql:// for SQLAlchemy
# if DATABASE_URL.startswith("postgres://"):
#     DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# # Decide SSL mode: disable for localhost, require for production (Render)
# if "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL:
#     engine = create_engine(DATABASE_URL, connect_args={"sslmode": "disable"})
# else:
#     engine = create_engine(DATABASE_URL, connect_args={"sslmode": "require"})

# # SQLAlchemy session and base
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# import os
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base
# from dotenv import load_dotenv

# # Load .env locally
# load_dotenv()

# DATABASE_URL = os.getenv("DATABASE_URL")

# if not DATABASE_URL:
#     raise ValueError(
#         "DATABASE_URL is not set. "
#         "For local development, check your .env. "
#         "On Render, check Environment Variables for your MobileApp service."
#     )

# # SQLAlchemy expects postgresql:// instead of postgres://
# if DATABASE_URL.startswith("postgres://"):
#     DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# # Decide SSL mode:
# # - localhost: disable SSL
# # - anything else (Render DB): require SSL
# if "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL:
#     engine = create_engine(DATABASE_URL, connect_args={"sslmode": "disable"})
# else:
#     engine = create_engine(DATABASE_URL, connect_args={"sslmode": "require"})

# # SQLAlchemy session
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# Latest
# import os
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base
# from dotenv import load_dotenv

# load_dotenv()

# import os
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base

# DATABASE_URL = os.environ.get("DATABASE_URL")

# if not DATABASE_URL:
#     raise ValueError("DATABASE_URL is not set!")

# # Replace old postgres:// if necessary
# if DATABASE_URL.startswith("postgres://"):
#     DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# # Always require SSL on Render
# engine = create_engine(DATABASE_URL, connect_args={"sslmode": "require"})

# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# In app/main.py
