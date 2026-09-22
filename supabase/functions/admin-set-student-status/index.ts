// Supabase Edge Function: admin-set-student-status
//
// Admin-only. Suspends or reactivates a student's account. profiles.status
// alone (which admins can already flip directly under RLS — see
// profiles_update/prevent_role_status_change_by_non_admin in
// 20250101000009) is not enough on its own: nothing currently gates a
// student's access to the app on their own status, so setting it without
// also touching auth would just be a cosmetic badge — a suspended student
// could keep using the app on their existing session. Actually blocking
// sign-in needs the Auth admin API (auth.admin.updateUserById with
// ban_duration), which needs the service role, hence the edge function.
//
// Order matters on failure: the ban is applied before profiles.status is
// touched, so a failed ban never leaves a student showing "suspended" in
// the UI while they can still log in. The reverse (banned but the badge
// didn't update) is the safer failure to have — the account is genuinely
// blocked either way, just not yet reflected everywhere.
//
// ban_duration has no literal "forever" value; '876000h' (~100 years) is
// Supabase's own documented idiom for an indefinite ban. 'none' clears it.
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

  let studentId: string | undefined
  let status: string | undefined
  try {
    ;({ studentId, status } = await req.json())
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }
  if (!studentId) return jsonResponse({ error: 'studentId is required' }, 400)
  if (status !== 'active' && status !== 'suspended') {
    return jsonResponse({ error: "status must be 'active' or 'suspended'" }, 400)
  }

  const { data: target } = await admin.from('profiles').select('role').eq('id', studentId).single()
  if (target?.role !== 'student') {
    return jsonResponse({ error: 'not a student' }, 400)
  }

  const { error: banErr } = await admin.auth.admin.updateUserById(studentId, {
    ban_duration: status === 'suspended' ? '876000h' : 'none',
  })
  if (banErr) {
    return jsonResponse({ error: banErr.message }, 500)
  }

  const { error: statusErr } = await admin.from('profiles').update({ status }).eq('id', studentId)
  if (statusErr) {
    return jsonResponse({ error: statusErr.message }, 500)
  }

  return jsonResponse({ ok: true })
})
