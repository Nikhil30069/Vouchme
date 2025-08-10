import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PhoneAuthProps {
  onPhoneVerified: (phone: string, password: string, isNewUser: boolean) => void;
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
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fullPhoneNumber = countryCode + phoneNumber;

  const handlePhoneLogin = async () => {
    if (!phoneNumber || !password) return;
    setIsLoading(true);

    // Check if user exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", fullPhoneNumber)
      .single();

    onPhoneVerified(fullPhoneNumber, password, !profile);
    setIsLoading(false);
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Welcome to HireEco
        </CardTitle>
        <CardDescription className="text-gray-600">
          Enter your phone number and password to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
          />
        </div>
        <Button 
          onClick={handlePhoneLogin} 
          disabled={!phoneNumber || !password || isLoading}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          {isLoading ? 'Logging in...' : 'Continue'}
        </Button>
      </CardContent>
    </Card>
  );
};