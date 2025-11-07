import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

export function UserAvatar({ 
  avatarUrl, 
  username, 
  email, 
  size = 'md',
  className 
}: UserAvatarProps) {
  // Get initials from username or email
  const getInitials = () => {
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={avatarUrl || undefined} alt={username || email || 'User'} />
      <AvatarFallback className="bg-gradient-hero text-white font-semibold">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
