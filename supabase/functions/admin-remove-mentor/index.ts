// Supabase Edge Function: admin-remove-mentor
//
// Admin-only. "Removing" a mentor used to mean the admin_remove_mentor SQL
// function alone: reassign their active students, then set profiles.status
// = 'suspended'. That left the auth.users row (and its email) in place
// forever, which silently broke re-inviting the same person later —
// auth.admin.inviteUserByEmail refuses an email that's already registered,
// with no UI clue that the "existing" account was one an admin had already
// removed. Deleting the auth user is the actual fix, and that needs the
// service role (auth.admin.deleteUser), hence the edge function.
//
// Runs the existing reassignment RPC first, as the calling admin (so its
// own is_admin() check applies normally), then deletes the auth user as
// service role. profiles.id -> auth.users(id) is on delete cascade, so the
// profile disappears with it, along with everything that itself cascades
// from a profile deletion (20250101000016): mentor_assignments rows,
// messages they sent, email_log. Submissions they reviewed keep their own
// record — only the reviewed_by pointer is nulled, per that same migration.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, handlePreflight } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req)
  if (preflight) return preflight

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return jsonResponse({ error: 'missing Authorization header' }, 401)
  }

  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const {
    data: { user: caller },
    error: callerErr,
  } = await callerClient.auth.getUser()
  if (callerErr || !caller) {
    return jsonResponse({ error: 'not authenticated' }, 401)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: callerProfile } = await admin.from('profiles').select('role').eq('id', caller.id).single()
  if (callerProfile?.role !== 'admin') {
    return jsonResponse({ error: 'admin only' }, 403)
  }

  let mentorId: string | undefined
  try {
    ;({ mentorId } = await req.json())
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }
  if (!mentorId) return jsonResponse({ error: 'mentorId is required' }, 400)

  // Runs through the caller's own client so admin_remove_mentor's is_admin()
  // check (which reads auth.uid()) sees the actual admin, not the service role.
  const { error: reassignErr } = await callerClient.rpc('admin_remove_mentor', { p_mentor_id: mentorId })
  if (reassignErr) {
    return jsonResponse({ error: reassignErr.message }, 400)
  }

  const { error: deleteErr } = await admin.auth.admin.deleteUser(mentorId)
  if (deleteErr) {
    return jsonResponse({ error: deleteErr.message }, 500)
  }

  return jsonResponse({ ok: true })
})
