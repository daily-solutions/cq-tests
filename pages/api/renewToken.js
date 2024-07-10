import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { profile, channelName, isOwner } = req.body;

    const { data, error } = await supabase
      .from('provider')
      .select('provider, key')
      .eq('id', profile)
      .single();

    if (error) {
      return res
        .status(500)
        .json({ error: 'failed to fetch provider profile to renew token' });
    }

    const { createToken } = await import(`/utils/providers/${data?.provider}`);
    let returnData = await createToken(channelName, profile, isOwner);
    return res.status(200).json(returnData);
  }

  return res.status(500).json({ error: 'failed to renew token' });
}
