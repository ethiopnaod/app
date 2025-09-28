#!/usr/bin/env python3

import requests
import json
import uuid
from datetime import datetime

# Chapa configuration from .env
CHAPA_SECRET_KEY = "CHASECK_TEST-aU5e0XB7RDcWW2JsbTq6HxIxhdOcZi3t"
CHAPA_PUBLIC_KEY = "CHAPUBK_TEST-XMAvD7XpBp1pkIlCrz9u6O1QkKA63HVq"
CHAPA_BASE_URL = "https://api.chapa.co/v1"

def test_chapa_connection():
    """Test basic connection to Chapa API"""
    print("="*50)
    print("Testing Chapa API Connection")
    print("="*50)
    
    headers = {
        "Authorization": f"Bearer {CHAPA_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    # Test with a simple payment initialization
    tx_ref = f"test-{uuid.uuid4()}"
    
    payload = {
        "amount": 100,
        "currency": "ETB",
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "tx_ref": tx_ref,
        "callback_url": "https://webhook.site/callback",
        "return_url": "https://example.com/return",
        "customization": {
            "title": "Bingo Game Test",
            "description": "Test payment"
        }
    }
    
    print(f"1. Testing payment initialization...")
    print(f"   TX_REF: {tx_ref}")
    print(f"   Amount: 100 ETB")
    print(f"   URL: {CHAPA_BASE_URL}/transaction/initialize")
    print(f"   Headers: Authorization: Bearer {CHAPA_SECRET_KEY[:20]}...")
    
    try:
        response = requests.post(
            f"{CHAPA_BASE_URL}/transaction/initialize",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"   Response: {json.dumps(result, indent=2)}")
                
                if result.get("status") == "success":
                    print("   ✅ Payment initialization SUCCESSFUL!")
                    return True, result
                else:
                    print(f"   ❌ Payment initialization FAILED: {result.get('message', 'Unknown error')}")
                    return False, result
            except json.JSONDecodeError as e:
                print(f"   ❌ Invalid JSON response: {e}")
                print(f"   Raw response: {response.text}")
                return False, {"error": "Invalid JSON response"}
        else:
            print(f"   ❌ HTTP Error {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error response: {json.dumps(error_data, indent=2)}")
                return False, error_data
            except:
                print(f"   Raw response: {response.text}")
                return False, {"error": f"HTTP {response.status_code}"}
                
    except requests.exceptions.Timeout:
        print("   ❌ Request timeout")
        return False, {"error": "Request timeout"}
    except requests.exceptions.ConnectionError:
        print("   ❌ Connection error")
        return False, {"error": "Connection error"}
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return False, {"error": str(e)}

def test_chapa_verification():
    """Test payment verification endpoint"""
    print("\n" + "="*50)
    print("Testing Chapa Payment Verification")
    print("="*50)
    
    headers = {
        "Authorization": f"Bearer {CHAPA_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    # Test with a dummy transaction reference
    test_tx_ref = "test-verification"
    
    print(f"2. Testing payment verification...")
    print(f"   TX_REF: {test_tx_ref}")
    print(f"   URL: {CHAPA_BASE_URL}/transaction/verify/{test_tx_ref}")
    
    try:
        response = requests.get(
            f"{CHAPA_BASE_URL}/transaction/verify/{test_tx_ref}",
            headers=headers,
            timeout=30
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"   Response: {json.dumps(result, indent=2)}")
                print("   ✅ Verification endpoint accessible!")
                return True, result
            except json.JSONDecodeError as e:
                print(f"   ❌ Invalid JSON response: {e}")
                return False, {"error": "Invalid JSON response"}
        else:
            try:
                error_data = response.json()
                print(f"   Response: {json.dumps(error_data, indent=2)}")
                # 404 is expected for non-existent transaction
                if response.status_code == 404:
                    print("   ✅ Verification endpoint working (404 expected for test TX)")
                    return True, error_data
                else:
                    print(f"   ❌ Verification failed with status {response.status_code}")
                    return False, error_data
            except:
                print(f"   Raw response: {response.text}")
                return False, {"error": f"HTTP {response.status_code}"}
                
    except Exception as e:
        print(f"   ❌ Verification error: {e}")
        return False, {"error": str(e)}

def check_chapa_account():
    """Check Chapa account status"""
    print("\n" + "="*50)
    print("Checking Chapa Account Status")
    print("="*50)
    
    print("Key Analysis:")
    print(f"   Secret Key: {CHAPA_SECRET_KEY}")
    print(f"   Public Key: {CHAPA_PUBLIC_KEY}")
    print(f"   Key Format: {'✅ Valid' if CHAPA_SECRET_KEY.startswith('CHASECK_TEST-') else '❌ Invalid'}")
    print(f"   Environment: {'Test' if 'TEST' in CHAPA_SECRET_KEY else 'Production'}")
    
    return True

def main():
    print("CHAPA PAYMENT SYSTEM DIAGNOSTIC")
    print("="*60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print()
    
    # Check account details
    check_chapa_account()
    
    # Test API connection
    payment_success, payment_result = test_chapa_connection()
    
    # Test verification
    verify_success, verify_result = test_chapa_verification()
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Payment Initialization: {'✅ PASS' if payment_success else '❌ FAIL'}")
    print(f"Payment Verification: {'✅ PASS' if verify_success else '❌ FAIL'}")
    
    if not payment_success:
        print("\nTROUBLESHOOTING STEPS:")
        print("1. Verify your Chapa account is active and approved")
        print("2. Check if your test keys are correct")
        print("3. Ensure your Chapa account can accept test payments")
        print("4. Contact Chapa support if keys are correct but API fails")
        print("5. Check if there are any IP restrictions on your account")
    
    print("\nCHAPA ACCOUNT REQUIREMENTS:")
    print("- Account must be verified with Chapa")
    print("- Business documentation must be approved")
    print("- Account must be in 'Active' status")
    print("- Test keys should work immediately after approval")
    print("- Production keys require additional business verification")
    
    return payment_success and verify_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)