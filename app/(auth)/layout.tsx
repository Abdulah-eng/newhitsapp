import { getCurrentUser } from "@/lib/utils/auth";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only redirect if user is authenticated AND has a role
  // This prevents redirect loops for users without profiles
  // NOTE: We don't redirect here if there's a redirect param - let the page component handle it
  // This allows authenticated users to access login page with redirect param
  const user = await getCurrentUser();
  
  // Don't redirect authenticated users - let the page components handle redirects
  // This allows login page to check for redirect param and redirect accordingly
  
  return (
    <>
      {children}
      <Footer />
    </>
  );
}

