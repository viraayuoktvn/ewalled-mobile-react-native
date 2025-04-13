import { useEffect } from "react";
import { useRouter } from "expo-router";
import { logoutUser } from "@/services/api";

const SignOut: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const signOut = async () => {
      const success = await logoutUser();
      if (success) {
        router.replace("/login");
      } else {
        console.log("Logout failed. Staying on the page.");
      }
    };

    signOut();
  }, [router]);

  return null;
};

export default SignOut;