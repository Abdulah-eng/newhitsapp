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
  const user = await getCurrentUser();
  
  if (user && user.role) {
    // User is authenticated and has a role, redirect to dashboard
    // Note: redirect() throws a NEXT_REDIRECT error internally, which is expected
    if (user.role === "senior") {
      redirect("/senior/dashboard");
    } else if (user.role === "specialist") {
      redirect("/specialist/dashboard");
    } else if (user.role === "admin") {
      redirect("/admin/dashboard");
    }
  }
  
  return (
    <>
      {children}
      <Footer />
    </>
  );
}

