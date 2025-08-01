
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, PartyPopper } from "lucide-react";

interface UnearthButtonProps {
  onClick: () => void;
  isLoading: boolean;
  isLimitReached: boolean;
  disabled?: boolean;
}

export default function UnearthButton({ onClick, isLoading, isLimitReached, disabled = false }: UnearthButtonProps) {
  const isButtonDisabled = isLoading || isLimitReached || disabled;

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
     if (disabled) {
      return (
        <>
          <Sparkles />
          Select a Request to Unearth Leads
        </>
      )
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
      disabled={isButtonDisabled}
      size="lg"
      className="w-full max-w-sm text-lg py-7 shadow-lg hover:shadow-primary/20 transition-shadow duration-300"
    >
      {getButtonContent()}
    </Button>
  );
}
