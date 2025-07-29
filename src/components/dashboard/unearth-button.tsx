import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, PartyPopper } from "lucide-react";

interface UnearthButtonProps {
  onClick: () => void;
  isLoading: boolean;
  isLimitReached: boolean;
}

export default function UnearthButton({ onClick, isLoading, isLimitReached }: UnearthButtonProps) {
  const isDisabled = isLoading || isLimitReached;

  const getButtonContent = () => {
    if (isLimitReached) {
      return (
        <>
          <PartyPopper />
          Daily Discovery Complete!
        </>
      );
    }
    if (isLoading) {
      return (
        <>
          <Loader2 className="animate-spin" />
          Unearthing...
        </>
      );
    }
    return (
      <>
        <Sparkles />
        Unearth Leads
      </>
    );
  };

  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      size="lg"
      className="w-full max-w-sm text-lg py-7 shadow-lg hover:shadow-primary/20 transition-shadow duration-300"
    >
      {getButtonContent()}
    </Button>
  );
}
