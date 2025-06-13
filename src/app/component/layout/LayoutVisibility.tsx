'use client';

import { usePathname } from 'next/navigation';

interface LayoutVisibilityProps {
  children: React.ReactNode;
}

const HIDDEN_PATHS = ['/admin', '/user'];

export default function LayoutVisibility({ children }: LayoutVisibilityProps) {
  const pathname = usePathname();

  const shouldHideLayout = HIDDEN_PATHS.some(path => pathname.startsWith(path));

  if (shouldHideLayout) {
    return null;
  }

  return <>{children}</>;
}
