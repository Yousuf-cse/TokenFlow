import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Lightbulb, Home } from "lucide-react";

interface Props {
  todayTokenSaved: number;
  AllTokenSaved: number;
}

function EnergyImpact({ todayTokenSaved, AllTokenSaved }: Props) {
  const energySavedWh = Math.round(AllTokenSaved * 0.0003); // ~0.3Wh per 1000 tokens = 0.0003 Wh per token
  const phonesCharged = Math.round(energySavedWh / 15); // 15Wh per phone charge
  const lightbulbHours = Math.round(energySavedWh / 9); // 9W LED bulb
  const homePowerHours = Math.round(energySavedWh / 1000); // 1kWh = 1000Wh
  console.log(todayTokenSaved);
  return (
    <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-yellow-800 dark:text-yellow-200">
          <div className="p-2 bg-yellow-200 dark:bg-yellow-800 rounded-lg">
            <Zap className="w-6 h-6 text-yellow-700 dark:text-yellow-300" />
          </div>
          Energy Consumption Reduced
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {energySavedWh.toLocaleString()} Wh
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Total Energy Saved
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              <Lightbulb className="w-6 h-6" />
              {lightbulbHours}h
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              LED Bulb Runtime
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              <Home className="w-6 h-6" />
              {phonesCharged}×
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Phone Charges
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium text-center">
            ⚡ Your token savings prevent enough energy waste to power a small home for {homePowerHours} hours!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default EnergyImpact;
