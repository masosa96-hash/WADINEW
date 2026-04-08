import sys
import os
try:
    from fastapi import FastAPI
    from pydantic import BaseModel
    import requests
    from engines.pipeline import process_message
    print("All imports successful!")
except Exception as e:
    print(f"Import failed: {e}")
    sys.exit(1)
