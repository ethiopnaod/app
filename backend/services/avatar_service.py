import random
import hashlib
from typing import Dict, List, Optional

class AvatarService:
    """Service for generating and managing player avatars"""
    
    def __init__(self):
        # Avatar styles and configurations
        self.avatar_styles = [
            'adventurer',
            'adventurer-neutral',
            'avataaars',
            'big-ears',
            'big-ears-neutral',
            'big-smile',
            'bottts',
            'croodles',
            'croodles-neutral',
            'fun-emoji',
            'icons',
            'identicon',
            'initials',
            'lorelei',
            'lorelei-neutral',
            'micah',
            'miniavs',
            'open-peeps',
            'personas',
            'pixel-art',
            'pixel-art-neutral',
            'shapes',
            'thumbs'
        ]
        
        # Color schemes for avatars
        self.color_schemes = [
            ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
            ['#FD79A8', '#FDCB6E', '#6C5CE7', '#A29BFE', '#FD79A8'],
            ['#E17055', '#00B894', '#00CEC9', '#0984E3', '#A29BFE'],
            ['#FF7675', '#74B9FF', '#81ECEC', '#00B894', '#FDCB6E'],
            ['#E84393', '#00CEC9', '#6C5CE7', '#FD79A8', '#FDCB6E']
        ]
        
        # Ethiopian-themed colors
        self.ethiopian_colors = [
            '#228B22',  # Green
            '#FFD700',  # Yellow/Gold
            '#DC143C',  # Red
            '#0066CC',  # Blue
            '#800080'   # Purple
        ]
    
    def generate_avatar_url(self, user_id: str, style: Optional[str] = None) -> str:
        """Generate avatar URL using DiceBear API"""
        if not style:
            style = self._get_consistent_style(user_id)
        
        # Create a consistent seed based on user_id
        seed = self._generate_seed(user_id)
        
        # Generate avatar URL using DiceBear API
        base_url = "https://api.dicebear.com/7.x"
        avatar_url = f"{base_url}/{style}/svg?seed={seed}"
        
        return avatar_url
    
    def generate_local_avatar_data(self, user_id: str) -> Dict:
        """Generate avatar data for local avatar creation"""
        seed = self._generate_seed(user_id)
        random.seed(hash(seed))
        
        avatar_data = {
            'seed': seed,
            'style': self._get_consistent_style(user_id),
            'background_color': self._get_consistent_color(user_id),
            'initials': self._generate_initials(user_id),
            'avatar_type': 'generated',
            'created_at': self._get_timestamp()
        }
        
        return avatar_data
    
    def get_avatar_variants(self, user_id: str, count: int = 5) -> List[Dict]:
        """Get multiple avatar variants for user to choose from"""
        variants = []
        base_seed = self._generate_seed(user_id)
        
        for i in range(count):
            style = random.choice(self.avatar_styles)
            variant_seed = f"{base_seed}_{i}"
            
            variant = {
                'id': i,
                'url': f"https://api.dicebear.com/7.x/{style}/svg?seed={variant_seed}",
                'style': style,
                'seed': variant_seed,
                'background_color': random.choice(self.ethiopian_colors)
            }
            variants.append(variant)
        
        return variants
    
    def create_initials_avatar(self, name: str, user_id: str) -> Dict:
        """Create an initials-based avatar"""
        initials = self._extract_initials(name)
        background_color = self._get_consistent_color(user_id)
        text_color = self._get_contrasting_color(background_color)
        
        avatar_data = {
            'type': 'initials',
            'initials': initials,
            'background_color': background_color,
            'text_color': text_color,
            'font_size': '24px',
            'font_weight': 'bold',
            'border_radius': '50%'
        }
        
        return avatar_data
    
    def generate_svg_avatar(self, user_id: str, name: Optional[str] = None) -> str:
        """Generate SVG avatar content"""
        if name:
            initials = self._extract_initials(name)
        else:
            initials = self._generate_initials(user_id)
        
        background_color = self._get_consistent_color(user_id)
        text_color = self._get_contrasting_color(background_color)
        
        svg_content = f'''
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="{background_color}"/>
            <text x="50" y="50" font-family="Arial, sans-serif" font-size="36" 
                  font-weight="bold" text-anchor="middle" dy="0.35em" 
                  fill="{text_color}">{initials}</text>
        </svg>
        '''
        
        return svg_content.strip()
    
    def get_ethiopian_themed_avatar(self, user_id: str) -> str:
        """Generate Ethiopian-themed avatar"""
        styles = ['adventurer', 'lorelei', 'micah', 'personas']
        style = self._get_consistent_style(user_id, styles)
        seed = self._generate_seed(user_id)
        
        # Add Ethiopian flag colors as background
        background_colors = ['green', 'yellow', 'red']
        bg_color = self._get_consistent_item(user_id, background_colors)
        
        avatar_url = f"https://api.dicebear.com/7.x/{style}/svg?seed={seed}&backgroundColor={bg_color}"
        
        return avatar_url
    
    def _generate_seed(self, user_id: str) -> str:
        """Generate consistent seed for user"""
        return hashlib.md5(user_id.encode()).hexdigest()[:8]
    
    def _get_consistent_style(self, user_id: str, styles: Optional[List[str]] = None) -> str:
        """Get consistent avatar style for user"""
        if not styles:
            styles = self.avatar_styles
        
        seed_int = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
        return styles[seed_int % len(styles)]
    
    def _get_consistent_color(self, user_id: str) -> str:
        """Get consistent color for user"""
        all_colors = []
        for scheme in self.color_schemes:
            all_colors.extend(scheme)
        all_colors.extend(self.ethiopian_colors)
        
        seed_int = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
        return all_colors[seed_int % len(all_colors)]
    
    def _get_consistent_item(self, user_id: str, items: List) -> str:
        """Get consistent item from list for user"""
        seed_int = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
        return items[seed_int % len(items)]
    
    def _generate_initials(self, user_id: str) -> str:
        """Generate initials from user_id"""
        # Create pseudo-random initials based on user_id
        seed_int = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
        first_char = chr(65 + (seed_int % 26))  # A-Z
        second_char = chr(65 + ((seed_int // 26) % 26))  # A-Z
        return f"{first_char}{second_char}"
    
    def _extract_initials(self, name: str) -> str:
        """Extract initials from name"""
        if not name or len(name.strip()) == 0:
            return "??"
        
        words = name.strip().split()
        if len(words) == 1:
            return words[0][:2].upper()
        else:
            return (words[0][0] + words[-1][0]).upper()
    
    def _get_contrasting_color(self, background_color: str) -> str:
        """Get contrasting text color for background"""
        # Simple contrast logic - in production, you might want more sophisticated color analysis
        dark_colors = ['#228B22', '#DC143C', '#800080', '#0066CC']
        if background_color in dark_colors:
            return '#FFFFFF'
        else:
            return '#333333'
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.utcnow().isoformat()

# Global avatar service instance
avatar_service = AvatarService()