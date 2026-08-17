import pytest
from datetime import timedelta
from main import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM
from jose import jwt

def test_password_hashing():
    raw_password = "SecurePassword2026!"
    hashed = get_password_hash(raw_password)
    assert hashed != raw_password
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_token_generation():
    username = "ci_cd_test_user"
    token = create_access_token(data={"sub": username}, expires_delta=timedelta(minutes=10))
    assert token is not None
    
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload.get("sub") == username
    assert "exp" in payload

def test_metrics_instrumentation():
    from main import app
    from fastapi.testclient import TestClient
    client = TestClient(app)
    
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    
    metrics_response = client.get("/metrics")
    assert metrics_response.status_code == 200
    assert "http_requests_total" in metrics_response.text or "python_gc" in metrics_response.text
