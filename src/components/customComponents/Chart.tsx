import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface Props {
  todayTokenSaved: number;
  AllTokenSaved: number;
}

function Chart({ todayTokenSaved }: Props) {
  // Generate 30-day projection using today’s token savings
  const generateProjectionData = () => {
    const data = [];
    let cumulativeTokens = 0;

    for (let i = 1; i <= 30; i++) {
      const variation = 0.8 + Math.random() * 0.4; // ±20% variation
      const dailyTokens = Math.round(todayTokenSaved * variation);
      cumulativeTokens += dailyTokens;

      data.push({
        day: i,
        dailyTokens,
        cumulativeTokens,
        isCheckpoint: i === 7 || i === 14 || i === 21 || i === 30,
        checkpointLabel:
          i === 7 ? "Week 1" : i === 14 ? "Week 2" : i === 21 ? "Week 3" : i === 30 ? "Month" : null,
      });
    }

    return data;
  };

  const projectionData = generateProjectionData();
  const checkpoints = projectionData.filter((d) => d.isCheckpoint);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          30-Day Token Savings Projection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis
              dataKey="day"
              className="text-muted-foreground"
              fontSize={12}
              tickFormatter={(value) => `Day ${value}`}
            />
            <YAxis
              className="text-muted-foreground"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value, name) => {
                if (name === "cumulativeTokens") {
                  const co2Saved = Math.round(Number(value) * 0.09);
                  return [`${value.toLocaleString()} total tokens`, `${co2Saved}g CO₂ prevented`];
                }
                return [`${value} tokens`, "Daily Savings"];
              }}
              labelFormatter={(day) => `Day ${day} Projection`}
            />

            <Area
              type="monotone"
              dataKey="cumulativeTokens"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#cumulativeGradient)"
              strokeWidth={3}
            />

            {checkpoints.map((checkpoint) => (
              <ReferenceLine
                key={checkpoint.day}
                x={checkpoint.day}
                stroke="#ef4444"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default Chart;
