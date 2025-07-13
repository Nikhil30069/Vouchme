
import { useState } from "react";
import { PhoneAuth } from "./PhoneAuth";
import { UserRegistration } from "./UserRegistration";
import { useAuthStore } from "@/stores/authStore";

export const AuthFlow = () => {
  const [step, setStep] = useState<'phone' | 'register'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { setTempPhone } = useAuthStore();

  const handlePhoneVerified = (phone: string) => {
    setPhoneNumber(phone);
    setTempPhone(phone);
    setStep('register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === 'phone' && <PhoneAuth onPhoneVerified={handlePhoneVerified} />}
        {step === 'register' && <UserRegistration phoneNumber={phoneNumber} />}
      </div>
    </div>
  );
};
