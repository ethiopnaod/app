import React, { useEffect, useState } from 'react';

interface AvatarProps {
  userId: string;
  style?: string;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ userId, style, size = 64, className }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/avatar/generate/${userId}${style ? `?style=${style}` : ''}`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Bad response')))
      .then(data => {
        if (data && data.status === 'success' && data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        } else {
          throw new Error('Invalid avatar response');
        }
      })
      .catch(() => {
        const fallbackStyle = style || 'adventurer';
        const url = `https://api.dicebear.com/7.x/${fallbackStyle}/svg?seed=${encodeURIComponent(userId)}&backgroundType=gradientLinear&radius=50`;
        setAvatarUrl(url);
      })
      .finally(() => setLoading(false));
  }, [userId, style]);

  if (loading) return <div className={`rounded-full bg-white/20 border border-white/30 animate-pulse ${className}`} style={{ width: size, height: size }} />;

  return (
    <img
      src={avatarUrl || ''}
      alt="Player Avatar"
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      onError={() => setError('Failed to load avatar')}
    />
  );
};

export default Avatar;
