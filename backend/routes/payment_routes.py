from flask import Blueprint, request, jsonify, g
from functools import wraps
from firebase_admin import auth as firebase_auth
from database.firebase import firebase_manager

payment_bp = Blueprint('payment', __name__, url_prefix='/api')

def require_auth(f):
    """Authentication decorator"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401
        id_token = auth_header.split('Bearer ')[-1]
        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
            g.user = decoded_token
        except Exception as e:
            return jsonify({'error': f'Invalid or expired token: {str(e)}'}), 401
        return f(*args, **kwargs)
    return decorated

@payment_bp.route('/wallet/deposit', methods=['POST'])
@require_auth
def wallet_deposit():
    """Deposit endpoint for wallet"""
    try:
        data = request.get_json()
        amount = data.get('amount')
        email = data.get('email')
        first_name = data.get('first_name')
        last_name = data.get('last_name', 'Player')
        phone = data.get('phone')
        user_id = g.user['uid']

        # Basic validation
        missing = [field for field in ['amount', 'email', 'first_name', 'phone', 'user_id'] if not locals()[field]]
        if missing:
            return jsonify({'error': f'Missing fields: {missing}'}), 400

        db = firebase_manager.get_db()
        if not db:
            return jsonify({'error': 'Firestore DB not initialized'}), 500

        transaction_ref = db.collection('transactions').document()
        transaction = {
            'user_id': user_id,
            'amount': amount,
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'phone': phone,
            'status': 'pending',
            'tx_ref': transaction_ref.id,
            'created_at': firebase_manager.get_timestamp()
        }
        transaction_ref.set(transaction)

        # Return success response
        return jsonify({'status': 'success', 'transaction': transaction}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/payment/verify-and-update', methods=['POST'])
@require_auth
def verify_and_update_payment():
    """Verify Chapa payment and update wallet after redirect"""
    try:
        data = request.get_json()
        tx_ref = data.get('tx_ref')
        if not tx_ref:
            return jsonify({'error': 'Missing transaction reference'}), 400

        from config.settings import get_config
        config = get_config()
        chapa_service = ChapaService(config)
        verification_result = chapa_service.verify_payment(tx_ref)

        if verification_result.get('status') == 'success':
            payment_data = verification_result.get('data', {})
            amount = payment_data.get('amount', 0)
            user_id = payment_data.get('metadata', {}).get('user_id') or payment_data.get('userId')
            if user_id and amount > 0:
                db = firebase_manager.get_db()
                if db is None:
                    return jsonify({'error': 'Firestore DB not initialized'}), 500
                user_ref = db.collection('users').document(user_id)
                transaction_ref = db.collection('transactions').document()
                user_doc = user_ref.get()
                if user_doc and user_doc.exists:
                    user_data = user_doc.to_dict() or {}
                    current_balance = user_data.get('wallet_balance', 0)
                    new_balance = current_balance + amount
                    batch = db.batch()
                    batch.update(user_ref, {
                        'wallet_balance': new_balance,
                        'last_updated': firebase_manager.get_timestamp()
                    })
                    batch.set(transaction_ref, {
                        'user_id': user_id,
                        'type': 'deposit',
                        'amount': amount,
                        'currency': 'ETB',
                        'tx_ref': tx_ref,
                        'status': 'completed',
                        'created_at': firebase_manager.get_timestamp(),
                        'payment_method': 'chapa',
                        'description': 'Wallet deposit via Chapa'
                    })
                    batch.commit()
                    return jsonify({'status': 'success', 'message': 'Wallet updated', 'new_balance': new_balance}), 200
                else:
                    return jsonify({'error': 'User not found'}), 404
            else:
                return jsonify({'error': 'Invalid payment data'}), 400
        else:
            return jsonify({'error': 'Payment verification failed'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/payment-callback', methods=['POST', 'GET'])
def payment_callback():
    """Handle Chapa payment callback"""
    try:
        if request.method == 'GET':
            return jsonify({"message": "Payment callback endpoint is working"}), 200
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400
        tx_ref = data.get('tx_ref')
        if not tx_ref:
            return jsonify({"error": "Missing transaction reference"}), 400

        from config.settings import get_config
        config = get_config()
        chapa_service = ChapaService(config)
        verification_result = chapa_service.verify_payment(tx_ref)

        if verification_result.get('status') == 'success':
            payment_data = verification_result.get('data', {})
            amount = payment_data.get('amount', 0)
            user_id = payment_data.get('metadata', {}).get('user_id')
            if user_id and amount > 0:
                db = firebase_manager.get_db()
                if db is None:
                    return jsonify({'error': 'Firestore DB not initialized'}), 500
                user_ref = db.collection('users').document(user_id)
                transaction_ref = db.collection('transactions').document()
                user_doc = user_ref.get()
                if user_doc and user_doc.exists:
                    user_data = user_doc.to_dict() or {}
                    current_balance = user_data.get('wallet_balance', 0)
                    new_balance = current_balance + amount
                    batch = db.batch()
                    batch.update(user_ref, {
                        'wallet_balance': new_balance,
                        'last_updated': firebase_manager.get_timestamp()
                    })
                    batch.set(transaction_ref, {
                        'user_id': user_id,
                        'type': 'deposit',
                        'amount': amount,
                        'currency': 'ETB',
                        'tx_ref': tx_ref,
                        'status': 'completed',
                        'created_at': firebase_manager.get_timestamp(),
                        'payment_method': 'chapa',
                        'description': 'Wallet deposit via Chapa'
                    })
                    batch.commit()
                    return jsonify({
                        "status": "success",
                        "message": "Payment processed successfully"
                    }), 200
                else:
                    return jsonify({"error": "User not found"}), 404
            else:
                return jsonify({"error": "Invalid payment data"}), 400
        else:
            return jsonify({
                "status": "error",
                "message": "Payment verification failed"
            }), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@payment_bp.route('/payment/verify/<tx_ref>', methods=['GET'])
@require_auth
def verify_payment(tx_ref):
    """Verify a payment transaction"""
    try:
        if not tx_ref:
            return jsonify({"error": "Missing transaction reference"}), 400

        from config.settings import get_config
        config = get_config()
        chapa_service = ChapaService(config)
        result = chapa_service.verify_payment(tx_ref)

        if result.get('status') == 'success':
            return jsonify({
                "status": "success",
                "message": "Payment verified successfully",
                "data": result.get('data', {})
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": result.get('message', 'Payment verification failed'),
                "error": result.get('error')
            }), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Payment verification failed",
            "error": str(e)
        }), 500

@payment_bp.route('/payment/history', methods=['GET'])
@require_auth
def get_payment_history():
    """Get payment history for the current user"""
    try:
        user_id = g.user['uid']
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        db = firebase_manager.get_db()
        if db is None:
            return jsonify({'error': 'Firestore DB not initialized'}), 500
        transactions_ref = db.collection('transactions')
        query = transactions_ref.where('user_id', '==', user_id)\
                               .order_by('created_at', direction='DESCENDING')\
                               .limit(limit)
        transactions = []
        for i, doc in enumerate(query.stream()):
            if i < offset:
                continue
            transaction_data = doc.to_dict() or {}
            transaction_data['id'] = doc.id
            transactions.append(transaction_data)
            if len(transactions) >= limit:
                break
        return jsonify({
            "status": "success",
            "data": {
                "transactions": transactions,
                "total": len(transactions),
                "limit": limit,
                "offset": offset
            }
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch payment history",
            "error": str(e)
        }), 500
