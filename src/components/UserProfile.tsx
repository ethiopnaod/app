import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';
import { UserService } from '../services/firebaseService';
import { useLanguage } from '../contexts/LanguageContext';
import { FaUser, FaPhone, FaTelegram, FaEnvelope, FaCalendarAlt, FaCheckCircle, FaShieldAlt, FaBell, FaTrash, FaLock } from 'react-icons/fa';

import { auth, storage, db } from '../firebase/config';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail, updateProfile, deleteUser } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  type Profile = {
    displayName?: string;
    phoneNumber?: string;
    telegramId?: string;
    email?: string;
    createdAt?: any;
    lastLogin?: any;
    settings?: { emailNotifications?: boolean; pushNotifications?: boolean };
    photoURL?: string;
  };
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarEdit, setAvatarEdit] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);
  const [sessions, setSessions] = useState<{ id: string; device?: string; createdAt?: any }[]>([]);
  const [showSecurity, setShowSecurity] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const formatTs = (ts: any) => {
    if (!ts) return 'N/A';
    if (ts instanceof Date) return ts.toLocaleDateString();
    if (typeof ts?.toDate === 'function') return ts.toDate().toLocaleDateString();
    const d = new Date(ts);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  };

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      try {
        const profile = await UserService.getUserProfile();
        if (!mounted) return;
        setDisplayName(profile?.displayName || user.displayName || '');
        setPhoneNumber((profile as Profile)?.phoneNumber || '');
        setTelegramId((profile as Profile)?.telegramId || '');
        setEmail(profile?.email || user.email || '');
        setCreatedAt((profile as Profile)?.createdAt || null);
        setLastLogin((profile as Profile)?.lastLogin || null);
        setEmailNotifications(Boolean((profile as Profile)?.settings?.emailNotifications ?? true));
        setPushNotifications(Boolean((profile as Profile)?.settings?.pushNotifications ?? false));
        const q = query(collection(db, 'user_sessions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const sess = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setSessions(sess);
      } catch {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  if (!user) return <div className="p-4 text-white">{t('notLoggedIn') || 'Not logged in'}</div>;

  // Debounce profile save
  const saveTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const handleSave = () => {
    setSaving(true);
    setStatus(null);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await UserService.updateUserProfile({
          displayName,
          phoneNumber,
          telegramId,
          email,
          settings: { emailNotifications, pushNotifications }
        });
        if (auth.currentUser && displayName && auth.currentUser.displayName !== displayName) {
          await updateProfile(auth.currentUser, { displayName });
        }
        setStatus(t('profileUpdatedSuccessfully') || 'Profile updated successfully!');
      } catch {
        setStatus(t('failedToUpdateProfile') || 'Failed to update profile.');
      } finally {
        setSaving(false);
      }
    }, 1200); // 1.2s debounce
  };

  const processImageToSquare = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Failed to process image')); return; }
          resolve(blob);
        }, 'image/jpeg', 0.9);
      };
      img.onerror = () => reject(new Error('Invalid image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      setUploading(true);
      const blob = await processImageToSquare(file);
      const path = `avatars/${user.uid}.jpg`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, blob, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(ref);
      await UserService.updateUserProfile({ photoURL: url });
      if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: url });
      setStatus('Profile photo updated');
    } catch (err) {
      setStatus('Failed to update photo');
    } finally {
      setUploading(false);
      setAvatarEdit(false);
    }
  };

  const handleChangePassword = async () => {
    setStatus(null);
    try {
      if (!auth.currentUser?.email) throw new Error('No authenticated user');
      if (!currentPassword) {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
        setStatus('Password reset email sent');
        return;
      }
      if (newPassword.length < 6 || newPassword !== confirmPassword) {
        setStatus('Passwords do not match or too short');
        return;
      }
      const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPassword);
      setStatus('Password updated successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (e) {
      setStatus('Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm('Delete your account permanently? This cannot be undone.');
    if (!ok) return;
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');
      await deleteUser(auth.currentUser);
    } catch (e) {
      setStatus('Failed to delete account (recent login required)');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-white px-4 pb-8">
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur">
        {/* Header */}
        <div className="h-28 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 relative">
          <div className="absolute top-3 right-4 text-[10px] text-white/80 font-mono tracking-widest select-none">PROFILE</div>
        </div>
        {/* Body */}
        <div className="px-5 pb-6 -mt-10">
          {/* Avatar + name */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <Avatar userId={user.uid} size={96} />
              <label className="absolute bottom-0 right-0 bg-yellow-400 text-white rounded-full p-2 shadow-lg border-2 border-white/80 opacity-90 group-hover:opacity-100 transition cursor-pointer" title="Change Avatar">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                {uploading ? '⏳' : <FaUser />}
              </label>
            </div>
            <div className="font-bold text-xl text-yellow-200 mt-2 text-center break-all px-2">{displayName || t('user') || 'User'}</div>
            <div className="text-[11px] text-white/70">{t('userId') || 'User ID'}: {user.uid}</div>
          </div>
          {/* Form */}
          <div className="mt-6 grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-xs text-white/70 mb-1 block">{t('emailAddress') || 'Email Address'}</span>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
                <FaEnvelope className="text-yellow-300" />
                <input
                  className="bg-transparent text-white flex-1 outline-none placeholder-white/50"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs text-white/70 mb-1 block">{t('enterYourName') || 'Name'}</span>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
                <FaUser className="text-yellow-300" />
                <input
                  className="bg-transparent text-white flex-1 outline-none placeholder-white/50"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs text-white/70 mb-1 block">{t('enterYourPhoneNumber') || 'Phone Number'}</span>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
                <FaPhone className="text-yellow-300" />
                <input
                  className="bg-transparent text-white flex-1 outline-none placeholder-white/50"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs text-white/70 mb-1 block">{t('enterYourTelegramUsername') || 'Telegram Username'}</span>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
                <FaTelegram className="text-yellow-300" />
                <input
                  className="bg-transparent text-white flex-1 outline-none placeholder-white/50"
                  value={telegramId}
                  onChange={e => setTelegramId(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </label>
          </div>
          {/* Notifications */}
          <div className="mt-6 rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3 text-white/90 font-semibold"><FaBell /> Notifications</div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Email notifications</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotifications} onChange={(e)=>setEmailNotifications(e.target.checked)} />
                <div className="w-11 h-6 bg-white/20 rounded-full peer-checked:bg-emerald-500 relative after:content-[''] after:w-5 after:h-5 after:bg-white after:rounded-full after:absolute after:top-0.5 after:left-0.5 peer-checked:after:translate-x-5 transition"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Push notifications</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushNotifications} onChange={(e)=>{
                  const enable = e.target.checked;
                  if (enable) {
                    if (!('Notification' in window)) { setStatus('Push not supported'); return; }
                    Notification.requestPermission().then((perm)=>{
                      if (perm !== 'granted') { setStatus('Push permission denied'); setPushNotifications(false); }
                      else setPushNotifications(true);
                    });
                  } else { setPushNotifications(false); }
                }} />
                <div className="w-11 h-6 bg-white/20 rounded-full peer-checked:bg-emerald-500 relative after:content-[''] after:w-5 after:h-5 after:bg-white after:rounded-full after:absolute after:top-0.5 after:left-0.5 peer-checked:after:translate-x-5 transition"></div>
              </label>
            </div>
          </div>
          {/* Security */}
          <div className="mt-6 rounded-2xl border border-white/10 p-4">
            <button className="flex items-center justify-between w-full" onClick={()=>setShowSecurity(!showSecurity)}>
              <div className="flex items-center gap-2 text-white/90 font-semibold"><FaShieldAlt /> Security</div>
              <span>{showSecurity ? '−' : '+'}</span>
            </button>
            {showSecurity && (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-2 flex items-center gap-2"><FaLock /> Change Password</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input className="input-modern bg-white/10" placeholder="Current password (or leave blank to reset)" type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} />
                    <input className="input-modern bg-white/10" placeholder="New password" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
                    <input className="input-modern bg-white/10" placeholder="Confirm new password" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
                  </div>
                  <button className="mt-3 btn-modern" onClick={handleChangePassword}>Update Password</button>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Active Sessions</div>
                  {sessions.length === 0 ? (
                    <div className="text-sm text-white/70">No session records.</div>
                  ) : (
                    <ul className="text-sm divide-y divide-white/10">
                      {sessions.slice(0,5).map(s => (
                        <li key={s.id} className="py-2 flex items-center gap-2">
                          <span className="text-white/80">{s.device || 'Unknown device'}</span>
                          <span className="ml-auto text-white/60">{formatTs(s.createdAt)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <div className="flex items-center gap-2 text-xs bg-white/10 rounded-lg px-3 py-2">
              <FaCalendarAlt className="text-yellow-200" />
              <span>Joined:</span>
              <span className="font-mono ml-auto">{formatTs(createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-white/10 rounded-lg px-3 py-2">
              <FaCheckCircle className="text-green-400" />
              <span>Last Login:</span>
              <span className="font-mono ml-auto">{formatTs(lastLogin)}</span>
            </div>
          </div>
          {/* Actions */}
          <button
            className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg active:scale-[0.99] disabled:opacity-60"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t('saving') || 'Saving...' : t('saveChanges') || 'Save Changes'}
          </button>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-green-400">{status}</div>
            <button className="text-red-300 text-sm inline-flex items-center gap-2 hover:text-red-400" onClick={handleDeleteAccount}><FaTrash /> Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
