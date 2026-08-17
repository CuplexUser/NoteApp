// Shared column list for returning a user's public profile fields.
export const USER_PUBLIC_FIELDS = `id, email, name, created_at, (avatar_data IS NOT NULL) AS has_avatar, avatar_updated_at`;
