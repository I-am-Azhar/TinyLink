"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

type Props = {
  value: string;
};

export function CopyButton({ value }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button type="button" variant="secondary" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

