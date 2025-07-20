"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"

export default function SmartSuppScript() {
  const pathname = usePathname()

  const isUserOrAdminPage = pathname.startsWith("/user") || pathname.startsWith("/savio")

  if (isUserOrAdminPage) return null

  return (
    <Script id="smartsupp-script" strategy="afterInteractive">
      {`
        var _smartsupp = _smartsupp || {};
        _smartsupp.key = 'a23304329ef45351b36fab3e5aa11ecc71fef523';
        window.smartsupp||(function(d) {
          var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
          s=d.getElementsByTagName('script')[0];c=d.createElement('script');
          c.type='text/javascript';c.charset='utf-8';c.async=true;
          c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
        })(document);
      `}
    </Script>
  )
}
