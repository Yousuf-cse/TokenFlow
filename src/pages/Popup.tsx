import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Leaf, Droplet, Flame } from "lucide-react";
import ExtensionToggle from "@/components/reusable/ExtensionToggle";
import { useEffect, useState } from "react";

export default function Popup() {
  const [todayTokens, setTodayTokens] = useState(0);
  const [_, setAllTokens] = useState<Record<string, number>>({});

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    chrome.storage.local.get(["dailyTokenSavings"], (result) => {
      const saved = result.dailyTokenSavings || {};

      setAllTokens(saved);
      setTodayTokens(saved[today] || 0);
    });
  }, []);

  const handleViewFullAnalysis = async () => {
    const url = chrome.runtime.getURL("index.html#/dashboard");
    chrome.tabs.create({ url });
  };

  return (
    <div className="p-4 w-[380px] h-[500px] flex flex-col justify-between bg-white dark:bg-black text-black dark:text-white">
      <div>
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Leaf className="text-green-500" /> Carbon Snapshot
        </h1>

        <Card className="mb-4">
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Flame className="text-red-500 w-4 h-4" />
                CO₂ Saved
              </span>
              <span className="font-semibold">
                {todayTokens > 0 ? (todayTokens * 0.2).toFixed(2) : "0.0"} g
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Droplet className="text-blue-500 w-4 h-4" />
                Water Saved
              </span>
              <span className="font-semibold">
                {todayTokens > 0 ? (todayTokens * 0.05).toFixed(2) : "0.0"} L
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart className="text-yellow-500 w-4 h-4" />
                Energy Saved
              </span>
              <span className="font-semibold">
                {todayTokens > 0 ? (todayTokens * 0.03).toFixed(2) : "0.0"} Wh
              </span>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          You've saved {todayTokens} tokens today. Keep going green! 🌱
        </p>
      </div>

      <ExtensionToggle />

      <Button
        className="w-full mt-4"
        variant="outline"
        onClick={handleViewFullAnalysis}
      >
        Show Full Analysis
      </Button>
    </div>
  );
}