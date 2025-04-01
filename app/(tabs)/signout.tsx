import { useEffect } from "react";
import { useRouter } from "expo-router";

const SignOut: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]); 

  return null;
};

export default SignOut;