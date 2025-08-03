import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { FaGoogle } from "react-icons/fa";

export const Login = () => {
  const handleOAuthLogin = async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error("Error logging in with OAuth:", error);
    }
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome</CardTitle>
        <CardDescription className="text-gray-600">
          Sign in to continue to your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => handleOAuthLogin('google')} 
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          <FaGoogle className="mr-2 h-5 w-5" />
          Login with Google
        </Button>
      </CardContent>
    </Card>
  );
}; 