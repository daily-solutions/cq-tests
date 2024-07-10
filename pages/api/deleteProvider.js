import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const supabase = createServerSupabaseClient({ req, res });
    const { id } = req.body;
    const { data, error } = await supabase
      .from('provider')
      .delete()
      .match({ id });

    if (!error) {
      return res.status(200).json({ data });
    }
  }

  return res.status(500).json({ error: 'failed to delete provider profile' });
}
