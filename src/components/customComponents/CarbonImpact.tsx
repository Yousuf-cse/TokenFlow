import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Car, TreePine } from "lucide-react";

interface Props {
  todayTokenSaved: number;
  AllTokenSaved: number;
}

function CarbonImpact({ todayTokenSaved, AllTokenSaved }: Props) {
  const co2SavedGrams = Math.round(AllTokenSaved * 0.09); // 0.09g CO2 per token
  const carMilesSaved = Math.round(co2SavedGrams / 404); // 404g CO2/mile
  const treesEquivalent = (co2SavedGrams / 21800).toFixed(2); // 21.8kg CO2/year/tree
  console.log(todayTokenSaved);
  return (
    <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-green-800 dark:text-green-200">
          <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
            <Leaf className="w-6 h-6 text-green-700 dark:text-green-300" />
          </div>
          Carbon Emissions Saved
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-green-700 dark:text-green-300">
          {co2SavedGrams.toLocaleString()}g CO₂
        </div>
        <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            <span>
              Equivalent to driving <strong>{carMilesSaved} miles</strong> less
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4" />
            <span>
              <strong>{treesEquivalent} trees</strong> worth of CO₂ absorption
            </span>
          </div>
        </div>
        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
          <p className="text-xs text-green-800 dark:text-green-200 font-medium">
            💡 That's like taking a car off the road for{" "}
            {Math.round(carMilesSaved / 25)} days of average driving!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default CarbonImpact;
