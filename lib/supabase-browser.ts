import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// This creates a standardized client that matches your package.json
export const supabaseBrowser = createClientComponentClient()
