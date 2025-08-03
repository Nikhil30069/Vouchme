import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Target, 
  Zap, 
  Award,
  ArrowUp,
  Users,
  MessageSquare,
  Coins,
  TrendingDown,
  Calendar
} from "lucide-react";
import { useReferralStore } from "@/stores/referralStore";
import { User } from "@/stores/authStore";

interface StrengthScoreProps {
  user: User;
  className?: string;
}

interface ScoreHistory {
  month: string;
  score: number;
}

export const StrengthScore = ({ user, className = "" }: StrengthScoreProps) => {
  const { calculateStrengthScore, referralRequests } = useReferralStore();
  const [strengthScore, setStrengthScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  // Mock score history data - in real app, this would come from database
  const [scoreHistory] = useState<ScoreHistory[]>([
    { month: 'Jan', score: 0 },
    { month: 'Feb', score: 0 },
    { month: 'Mar', score: 0 },
    { month: 'Apr', score: 0 },
    { month: 'May', score: 0 },
    { month: 'Jun', score: 0 },
  ]);

  useEffect(() => {
    const fetchStrengthScore = async () => {
      setIsLoading(true);
      const score = await calculateStrengthScore(user.id);
      setStrengthScore(score);
      setIsLoading(false);
      setAnimationKey(prev => prev + 1);
    };

    fetchStrengthScore();
  }, [user.id, calculateStrengthScore]);

  // Calculate metrics
  const pendingRequests = referralRequests.filter(
    req => req.seeker_id === user.id && req.status === 'pending'
  ).length;
  
  const scoredRequests = referralRequests.filter(
    req => req.seeker_id === user.id && req.status === 'scored'
  ).length;

  const totalRequests = pendingRequests + scoredRequests;

  // Get score level and color
  const getScoreLevel = (score: number) => {
    if (score >= 8.5) return { level: "Elite", color: "text-purple-600", bgColor: "bg-purple-100", icon: Trophy };
    if (score >= 7.5) return { level: "Excellent", color: "text-green-600", bgColor: "bg-green-100", icon: Star };
    if (score >= 6.5) return { level: "Good", color: "text-blue-600", bgColor: "bg-blue-100", icon: TrendingUp };
    if (score >= 5.5) return { level: "Average", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Target };
    return { level: "Developing", color: "text-orange-600", bgColor: "bg-orange-100", icon: Zap };
  };

  const scoreInfo = getScoreLevel(strengthScore);
  const IconComponent = scoreInfo.icon;

  // Get motivational message
  const getMotivationalMessage = (score: number, totalRequests: number) => {
    if (totalRequests === 0) {
      return "Start your journey! Send referral requests to get your first score.";
    }
    if (score >= 8.5) {
      return "Outstanding! You're among the top performers. Keep up the excellence!";
    }
    if (score >= 7.5) {
      return "Excellent work! You're showing great potential. A few more scores could push you to elite!";
    }
    if (score >= 6.5) {
      return "Good progress! You're on the right track. More referrals will boost your score!";
    }
    if (score >= 5.5) {
      return "You're building momentum! Each new score helps improve your profile.";
    }
    return "Every journey starts with a single step! More referral requests will help you grow.";
  };

  const motivationalMessage = getMotivationalMessage(strengthScore, totalRequests);

  // Calculate trend
  const recentScores = scoreHistory.slice(-3);
  const trend = recentScores.length > 1 
    ? recentScores[recentScores.length - 1].score - recentScores[0].score 
    : 0;

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-50"></div>
      <CardContent className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Strength Score</h3>
              <p className="text-sm text-gray-600">Your professional reputation value</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-600" />
              ) : (
                <Target className="w-4 h-4 text-gray-600" />
              )}
              <span className={`text-sm font-medium ${
                trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)} this month
              </span>
            </div>
          </div>
        </div>

        {/* Main Score Display - Fintech Style */}
        <div className="text-center mb-6">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
            </div>
          ) : (
            <div 
              key={animationKey}
              className="relative w-32 h-32 mx-auto mb-4"
            >
              {/* Outer ring with gradient */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  {/* Inner circle with score */}
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {strengthScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">/ 10</div>
                  </div>
                </div>
              </div>
              
              {/* Floating coins around the circle */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                <Star className="w-3 h-3 text-white" />
              </div>
              <div className="absolute top-1/2 -left-3 w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
          
          {/* Progress bar */}
          <div className="max-w-xs mx-auto">
            <Progress 
              value={strengthScore * 10} 
              className="h-3 mb-2"
            />
            <p className="text-xs text-gray-500">Progress to next level</p>
          </div>
        </div>

        {/* Stats Grid - Wallet Style */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm opacity-90">Total Requests</p>
                <p className="text-2xl font-bold">{totalRequests}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs opacity-75">Referral requests sent</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm opacity-90">Completed</p>
                <p className="text-2xl font-bold">{scoredRequests}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs opacity-75">Reviews received</p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Score Trend (Last 6 Months)</h4>
          <div className="flex items-end justify-between h-20 px-2">
            {scoreHistory.map((item, index) => (
              <div key={item.month} className="flex flex-col items-center space-y-1">
                <div 
                  className="w-8 bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-sm transition-all duration-300"
                  style={{ height: `${(item.score / 10) * 60}px` }}
                ></div>
                <span className="text-xs text-gray-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-6">
          <div className="flex items-start space-x-3">
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">
              {motivationalMessage}
            </p>
          </div>
        </div>



        {/* Improvement Tips */}
        {strengthScore < 8.5 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              💡 Tips to improve your score:
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Send referral requests to experienced professionals in your field</li>
              <li>• Ensure your profile is complete and up-to-date</li>
              <li>• Follow up with referrers to encourage scoring</li>
              <li>• Focus on roles where you have relevant experience</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 