import { cn } from '@/lib/utils';

const sizes = { sm: 32, md: 40, lg: 56, xl: 80 } as const;
const fontSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg', xl: 'text-2xl' } as const;

interface AvatarProps {
  name: string;
  size?: keyof typeof sizes;
  image?: string | null;
  className?: string;
}

export function Avatar({ name, size = 'md', image, className }: AvatarProps) {
  const px = sizes[size];
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden shrink-0',
        className
      )}
      style={{ width: px, height: px }}
    >
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center bg-[var(--bg-accent-strong)] text-[var(--text-on-accent)] font-semibold',
            fontSizes[size]
          )}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
