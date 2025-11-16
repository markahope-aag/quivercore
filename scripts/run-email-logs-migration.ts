import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runMigration() {
  console.log('Running email logs migration...')

  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250116_create_email_logs.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql })

    if (error) {
      console.error('Migration failed:', error)
      process.exit(1)
    }

    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

runMigration()
