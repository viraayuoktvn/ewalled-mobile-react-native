import { useEffect } from "react";
import { useRouter } from "expo-router";

const SignOut: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke halaman login
    router.replace("/login");
  }, [router]); // Menambahkan router sebagai dependency untuk best practice

  return null;
};

export default SignOut;