import { Globe, Users, Lock } from 'lucide-react';
import { PrivacySettings } from '../../pages/ProfilePage';

interface ProfileViewProps {
  profileData: {
    displayName: string;
    photoURL: string;
    bio: string;
    stats: {
      posts: number;
      followers: number;
      following: number;
    };
  };
  isOwnProfile: boolean;
  privacy: PrivacySettings;
}

export default function ProfileView({ profileData, isOwnProfile, privacy }: ProfileViewProps) {
  const PrivacyIcon = {
    public: Globe,
    contacts: Users,
    private: Lock
  }[privacy.profileVisibility];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <img
          src={profileData.photoURL}
          alt={profileData.displayName}
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-bold theme-text">{profileData.displayName}</h2>
          {isOwnProfile && (
            <div className="flex items-center space-x-2 theme-text opacity-70">
              <PrivacyIcon className="w-4 h-4" />
              <span className="text-sm">
                {privacy.profileVisibility === 'public' && 'Profilo Pubblico'}
                {privacy.profileVisibility === 'contacts' && 'Solo Contatti'}
                {privacy.profileVisibility === 'private' && 'Profilo Privato'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-around">
        <div className="text-center">
          <div className="text-xl font-bold theme-text">{profileData.stats.posts}</div>
          <div className="text-sm theme-text opacity-70">Post</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold theme-text">{profileData.stats.followers}</div>
          <div className="text-sm theme-text opacity-70">Follower</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold theme-text">{profileData.stats.following}</div>
          <div className="text-sm theme-text opacity-70">Seguiti</div>
        </div>
      </div>

      {profileData.bio && (
        <div className="theme-text whitespace-pre-wrap">{profileData.bio}</div>
      )}
    </div>
  );
} 