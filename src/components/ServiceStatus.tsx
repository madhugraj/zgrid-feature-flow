import { useEffect, useState } from "react";
import { healthPII, healthTox } from "@/lib/zgridClient";

export default function ServiceStatus() {
  const [pii,setPii] = useState<"ok"|"fail"|"...">("...");
  const [tox,setTox] = useState<"ok"|"fail"|"...">("...");

  useEffect(() => {
    healthPII().then(()=>setPii("ok")).catch(()=>setPii("fail"));
    healthTox().then(()=>setTox("ok")).catch(()=>setTox("fail"));
  }, []);

  const pill = (label:string, state:typeof pii) => (
    <span className={`px-2 py-1 rounded-full text-xs ${
      state==="ok" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
      state==="fail" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" : 
      "bg-muted text-muted-foreground"
    }`}>{label} {state}</span>
  );

  return (
    <div className="flex gap-2">
      {pill("PII", pii)} {pill("Toxicity", tox)}
    </div>
  );
}