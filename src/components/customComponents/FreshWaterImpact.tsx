import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Coffee, Users } from "lucide-react";

interface Props {
  todayTokenSaved: number;
  AllTokenSaved: number;
}

function FreshWaterImpact({ todayTokenSaved, AllTokenSaved }: Props) {
  const waterSavedML = Math.round(AllTokenSaved * 0.5); // 5ml per 10 tokens = 0.5ml per token
  const waterSavedL = (waterSavedML / 1000).toFixed(2);
  console.log(todayTokenSaved);

  const coffeeCups = Math.round(waterSavedML / 250); // 250ml per cup
  const peopleServed = Math.round(waterSavedML / 3300); // ~3.3L per person/day
  const bottlesSaved = Math.round(waterSavedML / 500); // 500ml per bottle

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
          <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
            <Droplet className="w-6 h-6 text-blue-700 dark:text-blue-300" />
          </div>
          Fresh Water Saved
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
          {waterSavedL}L
        </div>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4" />
            <span>
              Enough for <strong>{coffeeCups} cups of coffee</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              <strong>{peopleServed} people's</strong> daily drinking water
            </span>
          </div>
        </div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
            🌊 That's equivalent to {bottlesSaved} water bottles saved from AI processing!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default FreshWaterImpact;
