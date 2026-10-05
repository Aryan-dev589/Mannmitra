import { supabase } from './supabaseClient';

const API_BASE_URL = 'https://mannmitra-api-nfwj.onrender.com';

export const authenticatedFetch = async (path, options = {}) => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error('Please sign in again to continue.');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
};
