import { useNavigate } from 'react-router-dom';

interface ClickableAvatarProps {
  photoURL: string;
  userId: string;
  displayName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  status?: 'online' | 'offline';
  className?: string;
}

export default function ClickableAvatar({
  photoURL,
  userId,
  displayName,
  size = 'md',
  showStatus = false,
  status,
  className = ''
}: ClickableAvatarProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <img
        src={photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`}
        alt={displayName}
        className={`rounded-full object-cover ${
          size === "sm" ? "w-8 h-8" : 
          size === "md" ? "w-10 h-10" : 
          "w-12 h-12"
        }`}
      />
      {showStatus && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
          status === 'online' ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      )}
    </div>
  );
} 