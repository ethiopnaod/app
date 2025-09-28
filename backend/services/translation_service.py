import json
import os
from typing import Dict, Optional

class TranslationService:
    """Service for handling translations"""
    
    def __init__(self):
        self.translations = {}
        self.current_language = 'en'
        self.supported_languages = ['en', 'am']
        self.load_translations()
    
    def load_translations(self):
        """Load translation files"""
        translations_dir = os.path.join(os.path.dirname(__file__), '..', 'translations')
        
        for lang in self.supported_languages:
            file_path = os.path.join(translations_dir, f'{lang}.json')
            try:
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        self.translations[lang] = json.load(f)
                else:
                    print(f"Translation file not found: {file_path}")
                    self.translations[lang] = {}
            except Exception as e:
                print(f"Error loading translation file {file_path}: {e}")
                self.translations[lang] = {}
    
    def set_language(self, language: str):
        """Set the current language"""
        if language in self.supported_languages:
            self.current_language = language
            return True
        return False
    
    def get_text(self, key: str, language: Optional[str] = None, **kwargs) -> str:
        """Get translated text"""
        if language is None:
            language = self.current_language
        
        if language not in self.translations:
            language = 'en'  # Fallback to English
        
        # Navigate through nested keys using dot notation
        keys = key.split('.')
        text = self.translations.get(language, {})
        
        for k in keys:
            if isinstance(text, dict) and k in text:
                text = text[k]
            else:
                # Fallback to English if key not found
                text = self.translations.get('en', {})
                for k in keys:
                    if isinstance(text, dict) and k in text:
                        text = text[k]
                    else:
                        return key  # Return key if not found in any language
                break
        
        if isinstance(text, str):
            # Format with provided kwargs
            try:
                return text.format(**kwargs)
            except KeyError:
                return text
        
        return key
    
    def get_supported_languages(self) -> Dict[str, str]:
        """Get supported languages with their display names"""
        return {
            'en': 'English',
            'am': 'አማርኛ'
        }
    
    def translate_dict(self, data: Dict, language: Optional[str] = None) -> Dict:
        """Translate all translatable values in a dictionary"""
        if language is None:
            language = self.current_language
        
        result = {}
        for key, value in data.items():
            if isinstance(value, str) and value.startswith('t:'):
                # This is a translation key
                translation_key = value[2:]  # Remove 't:' prefix
                result[key] = self.get_text(translation_key, language)
            elif isinstance(value, dict):
                result[key] = self.translate_dict(value, language)
            elif isinstance(value, list):
                result[key] = [
                    self.translate_dict(item, language) if isinstance(item, dict)
                    else self.get_text(item[2:], language) if isinstance(item, str) and item.startswith('t:')
                    else item
                    for item in value
                ]
            else:
                result[key] = value
        
        return result

# Global translation service instance
translation_service = TranslationService()