import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
import { Camera, Settings, Edit2, Grid, BookOpen, Lock, Unlock, ArrowLeft, Globe, Users, UserX } from 'lucide-react';
import EditProfileForm from '../components/profile/EditProfileForm';
import ProfileView from '../components/profile/ProfileView';

interface PrivacySettings {
  profileVisibility: 'public' | 'contacts' | 'private';
  showLastSeen: boolean;
  showStatus: boolean;
}

interface ProfileData {
  displayName: string;
  photoURL: string;
  bio: string;
  privacy: PrivacySettings;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
}

export default function ProfilePage() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canView, setCanView] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    privacy: {
      profileVisibility: 'public',
      showLastSeen: true,
      showStatus: true
    } as PrivacySettings
  });

  const isOwnProfile = !userId || userId === currentUser?.uid;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const targetUserId = userId || currentUser?.uid;
        const userDoc = await getDoc(doc(db, 'users', targetUserId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as ProfileData;
          setProfileData(userData);
          setEditForm({
            displayName: userData.displayName,
            bio: userData.bio || '',
            privacy: userData.privacy || {
              profileVisibility: 'public',
              showLastSeen: true,
              showStatus: true
            }
          });

          // Verifica permessi di visualizzazione
          if (isOwnProfile) {
            setCanView(true);
          } else {
            switch (userData.privacy?.profileVisibility) {
              case 'public':
                setCanView(true);
                break;
              case 'contacts':
                // Verifica se l'utente corrente è nei contatti
                const contactDoc = await getDoc(
                  doc(db, `users/${targetUserId}/contacts/${currentUser?.uid}`)
                );
                setCanView(contactDoc.exists());
                break;
              case 'private':
                setCanView(false);
                break;
              default:
                setCanView(true);
            }
          }
        }
      } catch (error) {
        console.error('Errore nel caricamento del profilo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, currentUser, isOwnProfile]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: editForm.displayName,
        bio: editForm.bio,
        privacy: editForm.privacy
      });

      setProfileData(prev => ({
        ...prev!,
        displayName: editForm.displayName,
        bio: editForm.bio,
        privacy: editForm.privacy
      }));

      setIsEditing(false);
    } catch (error) {
      console.error('Errore nel salvataggio del profilo:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="theme-text">Caricamento...</div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen theme-bg flex flex-col items-center justify-center p-4">
        <Lock className="w-16 h-16 theme-text mb-4" />
        <h2 className="text-xl font-bold theme-text mb-2">Profilo Privato</h2>
        <p className="theme-text text-center">
          Questo profilo è privato. Solo i contatti autorizzati possono visualizzarlo.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg">
      {/* Header con pulsanti di navigazione e modifica */}
      <div className="theme-bg-primary p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:theme-bg-secondary">
          <ArrowLeft className="w-5 h-5 theme-text" />
        </button>
        <h1 className="text-xl font-bold theme-text">
          {isOwnProfile ? 'Il tuo profilo' : profileData?.displayName}
        </h1>
        {isOwnProfile && (
          <button onClick={() => setIsEditing(!isEditing)} className="theme-text">
            {isEditing ? <Check className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Contenuto del profilo */}
      <div className="pt-16 px-4">
        {isEditing ? (
          <EditProfileForm
            form={editForm}
            setForm={setEditForm}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <ProfileView
            profileData={profileData!}
            isOwnProfile={isOwnProfile}
            privacy={profileData?.privacy!}
          />
        )}
      </div>
    </div>
  );
}