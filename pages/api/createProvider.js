import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const supabase = createServerSupabaseClient({ req, res });
    const { user_id, provider, name, config } = req.body;

    const { encryptKeys } = await import(`/utils/providers/${provider}`);
    let keyConfig = encryptKeys(config);

    const { data, error } = await supabase
      .from('provider')
      .insert({
        provider: provider,
        name: name,
        key: keyConfig,
        user_id,
      })
      .select();

    if (!error) {
      return res.status(200).json({ data });
    }
  }

  return res.status(500).json({ error: 'failed to insert provider' });
}
