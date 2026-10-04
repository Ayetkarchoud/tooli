import { cn } from '@/lib/utils'

// Centered page column with the standard side padding (narrower on phones).
// width: 'wide' (default, lists and dashboards) or 'narrow' (reading pages: notifications, settings…)
export default function Page({ as: Tag = 'main', width = 'wide', className, ...props }) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-6 py-8 max-[560px]:px-4 max-[560px]:py-6',
        width === 'narrow' ? 'max-w-[880px]' : 'max-w-[1200px]',
        className,
      )}
      {...props}
    />
  )
}
