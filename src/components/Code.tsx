import { useState } from "react";
import { Button } from "./ui/button";

interface CodeProps {
  code: string;
}

export const Code = ({ code }: CodeProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 900);
  };

  return (
    <div className="relative my-4">
      <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        onClick={handleCopy}
        variant="secondary"
        size="sm"
        className="absolute top-2 right-2 text-xs"
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
};