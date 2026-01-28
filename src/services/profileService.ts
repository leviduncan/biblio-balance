import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function getAuthHeaders(): HeadersInit {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const profileService = {
  async getProfile(userId: string) {
    const response = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  async updateProfile(userId: string, updates: { username?: string; avatar_url?: string | null }) {
    const response = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        username: updates.username,
        avatarUrl: updates.avatar_url,
      }),
    });

    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    // Validate file
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 2MB.');
    }

    // For now, return a placeholder. In production, implement file upload handling
    console.warn('Avatar upload not yet implemented. Using placeholder.');

    const placeholderUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;

    // Update profile with new avatar URL
    await this.updateProfile(userId, { avatar_url: placeholderUrl });

    return placeholderUrl;
  },

  async deleteAvatar(userId: string) {
    // Clear avatar_url in profile
    await this.updateProfile(userId, { avatar_url: null });
  },
};
