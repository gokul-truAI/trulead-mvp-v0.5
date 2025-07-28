import { Progress } from "@/components/ui/progress";

interface ProgressMeterProps {
  unearthed: number;
  limit: number;
}

export default function ProgressMeter({ unearthed, limit }: ProgressMeterProps) {
  const progressPercentage = (unearthed / limit) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-baseline">
        <p className="text-sm font-medium text-foreground/80">Daily Discovery Progress</p>
        <p className="text-lg font-bold text-primary">
          {unearthed} / {limit}
        </p>
      </div>
      <Progress value={progressPercentage} className="h-3" />
       <p className="text-sm text-right text-muted-foreground">{limit - unearthed} leads remaining today</p>
    </div>
  );
}
