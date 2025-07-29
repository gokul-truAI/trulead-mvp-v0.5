import { Progress } from "@/components/ui/progress";

interface ProgressMeterProps {
  unearthed: number;
  limit: number;
  category?: string;
  categoryCount?: number;
}

export default function ProgressMeter({ unearthed, limit, category, categoryCount }: ProgressMeterProps) {
  const progressPercentage = (unearthed / limit) * 100;
  const remaining = limit - unearthed;

  const title = category 
    ? `Discovery Progress for '${category}'` 
    : "Daily Discovery Progress";
  
  const unearthedDisplay = category ? categoryCount : unearthed;

  return (
    <div className="w-full space-y-2 p-4 bg-card rounded-lg border">
      <div className="flex justify-between items-baseline">
        <p className="text-sm font-medium text-foreground/80">{title}</p>
        <p className="text-lg font-bold text-primary">
          {unearthedDisplay} / {category ? `${unearthed} total` : limit}
        </p>
      </div>
      <Progress value={progressPercentage} className="h-3" />
       <p className="text-sm text-right text-muted-foreground">
        {remaining > 0 ? `${remaining} leads remaining today` : 'Come back tomorrow for more!'}
       </p>
    </div>
  );
}
