import { useState } from "react";
import { PhoneAuth } from "./PhoneAuth";
import { UserRegistration } from "./UserRegistration";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AuthFlow = () => {
  const [step, setStep] = useState<'phone' | 'register'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const { setTempPhone, login } = useAuthStore();
  const { toast } = useToast();

  const handlePhoneVerified = async (phone: string, pwd: string, newUser: boolean) => {
    setPhoneNumber(phone);
    setPassword(pwd);
    setTempPhone(phone);
    setIsNewUser(newUser);

    if (newUser) {
      setStep('register');
    } else {
      // Existing user: check password
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", phone)
        .eq("password", pwd)
        .single();

      if (profile && !error) {
        login(profile);
        toast({ title: "Success", description: "Logged in successfully!" });
      } else {
        toast({ title: "Error", description: "Invalid phone or password", variant: "destructive" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === 'phone' && <PhoneAuth onPhoneVerified={handlePhoneVerified} />}
        {step === 'register' && <UserRegistration phoneNumber={phoneNumber} password={password} />}
      </div>
    </div>
  );
};