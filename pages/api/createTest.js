import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { profile, config } = req.body;
    const supabaseServerClient = createServerSupabaseClient({ req, res });

    const {
      data: { user },
    } = await supabaseServerClient.auth.getUser();

    if (profile) {
      const { createRoom } = await import(`utils/providers/${config.provider}`);

      const { error, ...rest } = await createRoom(profile, config);

      const { data: providerInsertData, error: providerInsertError } =
        await supabase
          .from('Tests')
          .insert({
            provider: config.provider,
            config: {
              ...config,
              ...rest,
            },
            user_id: user?.id ?? 'fe5c46cc-22d7-4461-abb8-f52178475012',
          })
          .select('uuid');

      if (!error || !providerInsertError) {
        return res.status(200).json({ uuid: providerInsertData[0]['uuid'] });
      }
    } else {
      const { data: insertData, error: insertError } = await supabase
        .from('Tests')
        .insert({
          provider: config.provider,
          config,
          user_id: user?.id ?? 'fe5c46cc-22d7-4461-abb8-f52178475012',
        })
        .select('uuid');

      if (!insertError) {
        return res.status(200).json({ uuid: insertData[0]['uuid'] });
      }
    }
  }

  return res.status(500).json({ error: 'failed to create test' });
}
