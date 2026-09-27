import { cn } from '@/lib/utils'

// Centered page column with the standard side padding (narrower on phones)
export default function Page({ as: Tag = 'main', className, ...props }) {
  return <Tag className={cn('mx-auto w-full max-w-[1100px] px-6 py-8 max-[560px]:px-4 max-[560px]:py-6', className)} {...props} />
}
