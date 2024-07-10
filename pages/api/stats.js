import { supabase } from 'utils/supabaseClient';

export default async function handler(req, res) {
  const { client_id, test_id } = req.query;

  // Create a row for each item in the batch...
  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('debug')
      .insert({
        client_id,
        test_id,
        data: JSON.stringify({ test: 'test' }),
      })
      .select();

    if (!error) {
      return res.status(200).json({ data });
    }
  }

  return res.status(500).json({ error: 'failed to store stats' });
}
