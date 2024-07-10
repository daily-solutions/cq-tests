import { supabase } from 'utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { user_id, testConfig } = req.body;

    const { data, error } = await supabase
      .from('Tests')
      .insert({
        provider: testConfig.provider,
        config: testConfig,
        user_id,
      })
      .select();

    if (!error) {
      return res.status(200).json({ data });
    }
  }

  return res.status(500).json({ error: 'failed to insert tests' });
}
