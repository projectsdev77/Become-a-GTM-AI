import { useAuth } from '@/context/AuthContext'
import AppNav from '@/components/layout/AppNav'
import MessageThread from '@/components/messages/MessageThread'
import Avatar from '@/components/ui/Avatar'

export default function MessagesPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <main className="mx-auto max-w-[700px] px-4 py-10 sm:px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-text-muted">[ your mentor ]</p>
        <h1 className="mt-2 font-display text-[clamp(28px,4vw,38px)] uppercase tracking-[-0.01em] text-text">Messages</h1>
        <p className="mt-2 text-[14.5px] text-text-muted">
          A direct line to your mentor — ask questions, share context, or request a second look at feedback.
        </p>

        <div className="mt-6 flex items-center gap-3 border-b border-line pb-5">
          <Avatar name={null} size={34} />
          <div>
            <p className="text-[15px] font-bold text-text-bright">Your mentor</p>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-text-muted">Mentor</p>
          </div>
        </div>

        {user && (
          <div className="mt-6">
            <MessageThread studentId={user.id} />
          </div>
        )}
      </main>
    </div>
  )
}
