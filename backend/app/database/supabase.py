from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError("Supabase credentials are not set in environment variables.")
    
    # We use the SERVICE_ROLE_KEY for the backend to bypass RLS for administrative actions, 
    # or you could use ANON_KEY if RLS is fully configured. 
    # For now, following typical FastAPI + Supabase backend patterns.
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

supabase = get_supabase_client()
