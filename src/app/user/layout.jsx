"use client"
import { usePathname } from "next/navigation";
import FooterPage from "@/components/Footer";
import UserSidebar from "@/components/UserSidebar";
import { useEffect, useState } from "react";

const UserLayout = ({children}) => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Don't show sidebar on login, signup, register, verify-email, verify-otp, or user selection pages
  if (pathname === '/user/login' || pathname === '/user/signup' || pathname === '/user/register' || pathname === '/user/verify-email' || pathname === '/user/verify-otp' || pathname === '/user') {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <FooterPage />
      </div>
    );
  }

  // Don't render sidebar until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="grid grid-cols-12 flex-1">
          <div className="col-span-2 bg-gray-200"></div>
          <div className="col-span-10 bg-gray-100 overflow-y-auto">{children}</div>
        </div>
        <FooterPage />
      </div>
    );
  }

  return (
   <div className="flex flex-col min-h-screen">
    <div className="grid grid-cols-12 flex-1">
      <div className="col-span-2">
        <UserSidebar />
      </div>
      <div className="col-span-10 bg-gray-100 overflow-y-auto">{children}</div>
      
    </div>
    <FooterPage />
   </div>
  )
}

export default UserLayout;