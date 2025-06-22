
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Shield } from "lucide-react";

interface PhoneAuthProps {
  onPhoneVerified: (phone: string) => void;
}

export const PhoneAuth = ({ onPhoneVerified }: PhoneAuthProps) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone) return;
    
    setIsLoading(true);
    // Simulate OTP sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStep('otp');
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp) return;
    
    setIsLoading(true);
    // Simulate OTP verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    onPhoneVerified(phone);
    setIsLoading(false);
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          {step === 'phone' ? (
            <Phone className="w-8 h-8 text-blue-600" />
          ) : (
            <Shield className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {step === 'phone' ? 'Welcome to HireEco' : 'Verify Your Number'}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {step === 'phone' 
            ? 'Enter your phone number to get started' 
            : `We've sent a verification code to ${phone}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'phone' ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12"
              />
            </div>
            <Button 
              onClick={handleSendOTP} 
              disabled={!phone || isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Verification Code</label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-12 text-center text-lg tracking-wider"
                maxLength={6}
              />
            </div>
            <Button 
              onClick={handleVerifyOTP} 
              disabled={!otp || isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setStep('phone')}
              className="w-full"
            >
              Change Phone Number
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
