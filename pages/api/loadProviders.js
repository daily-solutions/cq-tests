import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const supabase = createServerSupabaseClient({ req, res });
    const { data, error } = await supabase
      .from('provider')
      .select('id, name, provider, created_at')
      .order('created_at', { ascending: false });

    if (!error) {
      return res.status(200).json({ data });
    }
  }

  return res.status(500).json({ error: 'failed to get provider profiles' });
}
