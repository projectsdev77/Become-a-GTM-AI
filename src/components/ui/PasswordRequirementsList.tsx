import { PASSWORD_REQUIREMENTS } from '@/lib/passwordPolicy'
import { CheckIcon } from '@/components/ui/icons'

export default function PasswordRequirementsList({ password }: { password: string }) {
  return (
    <ul className="mt-3 flex flex-col gap-[7px]">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const met = req.test(password)
        return (
          <li key={req.id} className={`flex items-center gap-2.5 text-[12.5px] ${met ? 'text-text-body' : 'text-text-muted'}`}>
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                met ? 'bg-pass text-white' : 'border border-line-strong'
              }`}
            >
              {met && <CheckIcon className="h-2.5 w-2.5" />}
            </span>
            {req.label}
          </li>
        )
      })}
    </ul>
  )
}
