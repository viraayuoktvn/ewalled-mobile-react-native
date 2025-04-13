import { useEffect } from "react";
import { useRouter } from "expo-router";
import { logoutUser } from "@/services/api";

const SignOut: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const signOut = async () => {
      await logoutUser(); 
      router.replace("/login"); 
    };

    signOut();
  }, [router]);

  return null;
};

export default SignOut;