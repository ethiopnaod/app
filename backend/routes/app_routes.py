
from flask import Blueprint, request, jsonify, Response
from services.translation_service import translation_service
from services.avatar_service import avatar_service
from database.firebase import firebase_manager

app_bp = Blueprint('app', __name__, url_prefix='/api')

# Update user email route (must be after app_bp is defined)
@app_bp.route('/user/update-email', methods=['POST'])
def update_user_email():
    """Update a user's email address in the database."""
    data = request.get_json()
    user_id = data.get('user_id')
    email = data.get('email')
    if not user_id or not email:
        return jsonify({'error': 'user_id and email are required'}), 400
    try:
        # Update user profile document
        user_ref = firebase_manager.db.collection('users').document(user_id)
        user_ref.set({'email': email}, merge=True)
        return jsonify({'status': 'success', 'message': 'Email updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Translation routes
@app_bp.route('/translations/<language>', methods=['GET'])
def get_translations(language):
    """Get all translations for a specific language"""
    try:
        if language not in translation_service.supported_languages:
            return jsonify({
                "status": "error",
                "message": f"Language '{language}' not supported",
                "supported_languages": list(translation_service.supported_languages)
            }), 400
        
        translations = translation_service.translations.get(language, {})
        
        return jsonify({
            "status": "success",
            "language": language,
            "translations": translations
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to get translations",
            "error": str(e)
        }), 500

@app_bp.route('/translations/text/<language>', methods=['POST'])
def get_translated_text(language):
    """Get specific translated text"""
    try:
        data = request.get_json()
        if not data or 'key' not in data:
            return jsonify({
                "status": "error",
                "message": "Translation key is required"
            }), 400
        
        key = data['key']
        params = data.get('params', {})
        
        text = translation_service.get_text(key, language, **params)
        
        return jsonify({
            "status": "success",
            "key": key,
            "language": language,
            "text": text
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to get translated text",
            "error": str(e)
        }), 500

@app_bp.route('/languages', methods=['GET'])
def get_supported_languages():
    """Get supported languages"""
    try:
        languages = translation_service.get_supported_languages()
        
        return jsonify({
            "status": "success",
            "languages": languages,
            "current_language": translation_service.current_language
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to get languages",
            "error": str(e)
        }), 500

@app_bp.route('/language', methods=['POST'])
def set_language():
    """Set current language"""
    try:
        data = request.get_json()
        if not data or 'language' not in data:
            return jsonify({
                "status": "error",
                "message": "Language is required"
            }), 400
        
        language = data['language']
        success = translation_service.set_language(language)
        
        if success:
            return jsonify({
                "status": "success",
                "message": "Language updated successfully",
                "current_language": translation_service.current_language
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": f"Language '{language}' not supported",
                "supported_languages": list(translation_service.supported_languages)
            }), 400
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to set language",
            "error": str(e)
        }), 500

# Avatar routes
@app_bp.route('/avatar/generate/<user_id>', methods=['GET'])
def generate_avatar(user_id):
    """Generate avatar for user"""
    try:
        style = request.args.get('style')
        avatar_url = avatar_service.generate_avatar_url(user_id, style)
        
        return jsonify({
            "status": "success",
            "user_id": user_id,
            "avatar_url": avatar_url,
            "style": style or "auto"
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to generate avatar",
            "error": str(e)
        }), 500

@app_bp.route('/avatar/variants/<user_id>', methods=['GET'])
def get_avatar_variants(user_id):
    """Get avatar variants for user to choose from"""
    try:
        count = int(request.args.get('count', 5))
        variants = avatar_service.get_avatar_variants(user_id, count)
        
        return jsonify({
            "status": "success",
            "user_id": user_id,
            "variants": variants,
            "count": len(variants)
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to get avatar variants",
            "error": str(e)
        }), 500

@app_bp.route('/avatar/svg/<user_id>', methods=['GET'])
def get_svg_avatar(user_id):
    """Get SVG avatar for user"""
    try:
        name = request.args.get('name')
        svg_content = avatar_service.generate_svg_avatar(user_id, name)
        
        return Response(svg_content, mimetype='image/svg+xml')
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to generate SVG avatar",
            "error": str(e)
        }), 500

@app_bp.route('/avatar/initials', methods=['POST'])
def create_initials_avatar():
    """Create initials-based avatar"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'user_id' not in data:
            return jsonify({
                "status": "error",
                "message": "Name and user_id are required"
            }), 400
        
        name = data['name']
        user_id = data['user_id']
        
        avatar_data = avatar_service.create_initials_avatar(name, user_id)
        
        return jsonify({
            "status": "success",
            "avatar_data": avatar_data
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to create initials avatar",
            "error": str(e)
        }), 500

@app_bp.route('/avatar/ethiopian/<user_id>', methods=['GET'])
def get_ethiopian_avatar(user_id):
    """Get Ethiopian-themed avatar"""
    try:
        avatar_url = avatar_service.get_ethiopian_themed_avatar(user_id)
        
        return jsonify({
            "status": "success",
            "user_id": user_id,
            "avatar_url": avatar_url,
            "theme": "ethiopian"
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to generate Ethiopian avatar",
            "error": str(e)
        }), 500

# App configuration routes
@app_bp.route('/config', methods=['GET'])
def get_app_config():
    """Get app configuration including supported features"""
    try:
        config = {
            "features": {
                "multilingual": True,
                "avatars": True,
                "payments": True,
                "telegram": True,
                "firebase": firebase_manager.is_initialized()
            },
            "languages": translation_service.get_supported_languages(),
            "current_language": translation_service.current_language,
            "avatar_styles": avatar_service.avatar_styles[:10],  # Show first 10
            "payment_methods": ["chapa"],
            "version": "2.0.0"
        }
        
        return jsonify({
            "status": "success",
            "config": config
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to get app config",
            "error": str(e)
        }), 500

# Localized content routes
@app_bp.route('/content/<language>', methods=['GET'])
def get_localized_content(language):
    """Get localized content for UI"""
    try:
        content_type = request.args.get('type', 'all')
        
        if language not in translation_service.supported_languages:
            language = 'en'  # Fallback to English
        
        if content_type == 'navigation':
            content = translation_service.translations.get(language, {}).get('navigation', {})
        elif content_type == 'game':
            content = translation_service.translations.get(language, {}).get('game', {})
        elif content_type == 'wallet':
            content = translation_service.translations.get(language, {}).get('wallet', {})
        elif content_type == 'auth':
            content = translation_service.translations.get(language, {}).get('auth', {})
        else:
            content = translation_service.translations.get(language, {})
        
        return jsonify({
            "status": "success",
            "language": language,
            "type": content_type,
            "content": content
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to get localized content",
            "error": str(e)
        }), 500