import { supabase } from 'utils/supabaseClient';

export default async function handler(req, res) {
  const { user_id } = req.query;
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('Tests')
      .select()
      .filter('user_id', 'eq', user_id)
      .order('created_at', { ascending: false });

    if (!error) {
      return res.status(200).json({ data });
    }
  }

  return res.status(500).json({ error: 'failed to get tests' });
}
