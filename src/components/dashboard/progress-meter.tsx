import { Progress } from "@/components/ui/progress";

interface ProgressMeterProps {
  unearthed: number;
  limit: number;
}

export default function ProgressMeter({ unearthed, limit }: ProgressMeterProps) {
  const progressPercentage = (unearthed / limit) * 100;
  const remaining = limit - unearthed;

  return (
    <div className="w-full space-y-2 p-4 bg-card rounded-lg border">
      <div className="flex justify-between items-baseline">
        <p className="text-sm font-medium text-foreground/80">Daily Discovery Progress</p>
        <p className="text-lg font-bold text-primary">
          {unearthed} / {limit}
        </p>
      </div>
      <Progress value={progressPercentage} className="h-3" />
       <p className="text-sm text-right text-muted-foreground">
        {remaining > 0 ? `${remaining} leads remaining today` : 'Come back tomorrow for more!'}
       </p>
    </div>
  );
}
