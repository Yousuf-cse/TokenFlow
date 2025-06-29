import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Award,
  Earth,
  Sparkles,
  Share2,
  Diamond,
  Crown,
  Shield,
  Star,
} from "lucide-react";

import CarbonImpact from "../components/customComponents/CarbonImpact";
import FreshWaterImpact from "../components/customComponents/FreshWaterImpact";
import EnergyImpact from "../components/customComponents/EnergyImpact";
import Chart from "@/components/customComponents/Chart";

const getAchievement = (tokens: number) => {
  if (tokens >= 20000)
    return {
      title: "Diamond Eco Warrior",
      icon: Diamond,
      color: "from-cyan-400 to-blue-500",
      badge: "💎",
    };
  if (tokens >= 15000)
    return {
      title: "Platinum Guardian",
      icon: Crown,
      color: "from-gray-300 to-gray-500",
      badge: "👑",
    };
  if (tokens >= 10000)
    return {
      title: "Gold Climate Hero",
      icon: Award,
      color: "from-yellow-400 to-orange-500",
      badge: "🏆",
    };
  if (tokens >= 5000)
    return {
      title: "Silver Protector",
      icon: Shield,
      color: "from-gray-400 to-gray-600",
      badge: "🛡️",
    };
  if (tokens >= 1000)
    return {
      title: "Bronze Saver",
      icon: Star,
      color: "from-amber-600 to-amber-800",
      badge: "⭐",
    };
  return {
    title: "Eco Beginner",
    icon: Sparkles,
    color: "from-green-400 to-emerald-500",
    badge: "🌱",
  };
};

const getNextMilestone = (tokens: number) => {
  const milestones = [
    { threshold: 1000, title: "Bronze Saver" },
    { threshold: 5000, title: "Silver Protector" },
    { threshold: 10000, title: "Gold Climate Hero" },
    { threshold: 15000, title: "Platinum Guardian" },
    { threshold: 20000, title: "Diamond Eco Warrior" },
  ];
  const next = milestones.find((m) => tokens < m.threshold);
  if (!next) return null;
  const previous = milestones[milestones.indexOf(next) - 1] || { threshold: 0 };
  const progressPercent =
    ((tokens - previous.threshold) / (next.threshold - previous.threshold)) * 100;
  return {
    title: next.title,
    tokensLeft: next.threshold - tokens,
    progressPercent: Math.min(100, Math.round(progressPercent)),
  };
};

export default function Dashboard() {
  const [todayTokenSaved, setTodayTokenSaved] = useState(0);
  const [AllTokenSaved, setAllTokenSaved] = useState(0);
  const [dailyTokenData, setDailyTokenData] = useState<{ [date: string]: number }>({});

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    chrome.storage?.local.get(["dailyTokenSavings"], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Storage error:", chrome.runtime.lastError);
        return;
      }

      const data = result.dailyTokenSavings || {};
      setDailyTokenData(data);

      const todaySaved = data[today] || 0;
      const total = Object.values(data).reduce(
        (sum: number, val: any) => sum + (typeof val === "number" ? val : 0),
        0
      );

      setTodayTokenSaved(todaySaved);
      setAllTokenSaved(total);
    });
  }, []);

  const bestDayTokens = Math.max(...Object.values(dailyTokenData), 0);
  const dailyAverage = Math.round(
    Object.values(dailyTokenData).reduce((a, b) => a + b, 0) /
      (Object.keys(dailyTokenData).length || 1)
  );

  const co2SavedGrams = Math.round(AllTokenSaved * 0.09);
  const waterSavedML = Math.round(AllTokenSaved * 0.5);
  const carMilesSaved = Math.round(co2SavedGrams / 404);
  const treesEquivalent = (co2SavedGrams / 21800).toFixed(2);

  const achievement = getAchievement(AllTokenSaved);
  const nextMilestone = getNextMilestone(AllTokenSaved);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-700 via-emerald-600 to-lime-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 border border-white/30">
              <Earth className="w-5 h-5 text-white" />
              <span className="text-white font-medium">TokenFlow</span>
            </div>
            <h1 className="text-5xl font-bold text-white">
              Your Impact on
              <span className="block bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                Planet Earth
              </span>
            </h1>
            <p className="text-lg text-emerald-100">
              Every token you save makes a real difference.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge className={`bg-gradient-to-r ${achievement.color} text-white border-0 px-4 py-2`}>
                <achievement.icon className="w-4 h-4 mr-2" />
                {achievement.title}
              </Badge>
              <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Share2 className="w-4 h-4 mr-2" />
                Share Impact
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 -mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CarbonImpact todayTokenSaved={todayTokenSaved} AllTokenSaved={AllTokenSaved} />
              <FreshWaterImpact todayTokenSaved={todayTokenSaved} AllTokenSaved={AllTokenSaved} />
              <EnergyImpact todayTokenSaved={todayTokenSaved} AllTokenSaved={AllTokenSaved} />
              <Chart todayTokenSaved={todayTokenSaved} AllTokenSaved={AllTokenSaved} />
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* Achievement Card */}
            <Card
              className={`border-0 shadow-xl bg-gradient-to-br ${achievement.color} text-white relative overflow-hidden`}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="absolute top-0 right-0 bg-white/10 w-20 h-20 rounded-bl-full blur-2xl"></div>
                <div className="text-5xl">{achievement.badge}</div>
                <h3 className="font-bold text-xl mb-1 tracking-wide">{achievement.title}</h3>
                <p className="text-white/80 text-sm">{AllTokenSaved.toLocaleString()} tokens saved total!</p>
                {nextMilestone && (
                  <div className="mt-3">
                    <div className="text-xs text-white/70 mb-1">
                      🔥 {nextMilestone.tokensLeft.toLocaleString()} tokens to reach{" "}
                      <strong>{nextMilestone.title}</strong>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-white h-2 rounded-full"
                        style={{ width: `${nextMilestone.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Stats Card */}
            <div className="w-full max-w-sm mx-auto">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Daily Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Today's Tokens Saved</span>
                    <span className="text-lg font-bold text-green-600">{todayTokenSaved}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Daily Average</span>
                    <span className="text-lg font-bold text-blue-600">{dailyAverage}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="text-sm font-medium">Best Day</span>
                    <span className="text-lg font-bold text-amber-600">{bestDayTokens}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium">Total Days</span>
                    <span className="text-lg font-bold text-purple-600">{Object.keys(dailyTokenData).length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Collective Impact */}
        <Card className="shadow-xl mt-6 border-0 bg-gradient-to-br from-emerald-600 to-green-500 text-white overflow-hidden">
          <CardContent className="p-6 space-y-5">
            <div className="text-center">
              <div className="text-4xl">🌍</div>
              <h3 className="text-xl font-bold tracking-wide">Collective Impact</h3>
              <p className="text-white/80 text-sm mt-1">Your token savings ripple across the globe 🌐</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 rounded-xl p-4 text-center space-y-2 shadow-inner backdrop-blur-sm">
                <div className="text-2xl">🚗</div>
                <div className="text-sm font-medium">Car Miles Avoided</div>
                <div className="text-lg font-bold">{(carMilesSaved * 1000).toLocaleString()} mi</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center space-y-2 shadow-inner backdrop-blur-sm">
                <div className="text-2xl">💧</div>
                <div className="text-sm font-medium">Water Saved</div>
                <div className="text-lg font-bold">{(waterSavedML / 1000).toFixed(2)} L</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center space-y-2 shadow-inner backdrop-blur-sm">
                <div className="text-2xl">🌳</div>
                <div className="text-sm font-medium">Trees Equivalent</div>
                <div className="text-lg font-bold">{treesEquivalent}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
