import { Progress } from "@/components/ui/progress";

interface ProgressMeterProps {
  unearthed: number;
  limit: number;
  category?: string;
  categoryCount?: number;
}

export default function ProgressMeter({ unearthed, limit, category, categoryCount = 0 }: ProgressMeterProps) {
  const progressPercentage = (unearthed / limit) * 100;
  const remaining = limit - unearthed;

  const title = category 
    ? `Leads Found for '${category}'` 
    : "Daily Discovery Progress";
  
  const unearthedDisplay = category ? categoryCount : unearthed;
  const subtext = category 
    ? `Click "Unearth Leads" to find more in this category.`
    : `${remaining > 0 ? `${remaining} leads remaining today` : 'Come back tomorrow for more!'}`;

  return (
    <div className="w-full space-y-2 p-4 bg-card rounded-lg border">
      <div className="flex justify-between items-baseline">
        <p className="text-sm font-medium text-foreground/80">{title}</p>
        <p className="text-lg font-bold text-primary">
          {unearthedDisplay} / {limit}
        </p>
      </div>
      <Progress value={progressPercentage} className="h-3" />
       <p className="text-sm text-right text-muted-foreground">
        {subtext}
       </p>
    </div>
  );
}

    