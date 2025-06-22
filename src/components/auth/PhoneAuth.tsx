
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PhoneAuthProps {
  onPhoneVerified: (phone: string) => void;
}

const countryCodes = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
];

export const PhoneAuth = ({ onPhoneVerified }: PhoneAuthProps) => {
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fullPhoneNumber = countryCode + phoneNumber;

  const handleSendOTP = async () => {
    if (!phoneNumber) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhoneNumber,
      });

      if (error) {
        if (error.message.includes('phone_provider_disabled') || error.message.includes('Unsupported phone provider')) {
          toast({
            title: "SMS Provider Not Configured",
            description: "Please configure an SMS provider in your Supabase dashboard under Authentication > Providers > Phone to enable phone authentication.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${fullPhoneNumber}`,
        });
        setStep('otp');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhoneNumber,
        token: otp,
        type: 'sms'
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Phone number verified successfully!",
        });
        onPhoneVerified(fullPhoneNumber);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    }
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
            : `We've sent a verification code to ${fullPhoneNumber}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'phone' ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-32 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="h-12 flex-1"
                />
              </div>
              <p className="text-xs text-gray-500">
                Full number: {fullPhoneNumber}
              </p>
            </div>
            <Button 
              onClick={handleSendOTP} 
              disabled={!phoneNumber || isLoading}
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
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="h-12 text-center text-lg tracking-wider"
                maxLength={6}
              />
            </div>
            <Button 
              onClick={handleVerifyOTP} 
              disabled={!otp || otp.length !== 6 || isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setStep('phone');
                setOtp('');
              }}
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
