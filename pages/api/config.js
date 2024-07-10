import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { uuid } = req.query;

    const supabase = createServerSupabaseClient({ req, res });

    const {
      data: { config },
      error,
    } = await supabase.from('Tests').select('config').eq('uuid', uuid).single();

    if (!error) {
      return res.status(200).json(config);
    }
  }

  return res.status(500).json({ error: 'failed to find the test' });
}
