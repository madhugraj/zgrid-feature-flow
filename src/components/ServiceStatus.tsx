import { useEffect, useState } from "react";
import { 
  healthPII, 
  healthTox, 
  healthJail, 
  healthBan, 
  healthPolicy, 
  healthSecrets,
  healthFormat 
} from "@/lib/zgridClient";

type ServiceState = "ok" | "fail" | "...";

export default function ServiceStatus() {
  const [pii, setPii] = useState<ServiceState>("...");
  const [tox, setTox] = useState<ServiceState>("...");
  const [jail, setJail] = useState<ServiceState>("...");
  const [ban, setBan] = useState<ServiceState>("...");
  const [policy, setPolicy] = useState<ServiceState>("...");
  const [secrets, setSecrets] = useState<ServiceState>("...");
  const [format, setFormat] = useState<ServiceState>("...");

  useEffect(() => {
    // Check all service health endpoints
    healthPII().then(() => setPii("ok")).catch(() => setPii("fail"));
    healthTox().then(() => setTox("ok")).catch(() => setTox("fail"));
    healthJail().then(() => setJail("ok")).catch(() => setJail("fail"));
    healthBan().then(() => setBan("ok")).catch(() => setBan("fail"));
    healthPolicy().then(() => setPolicy("ok")).catch(() => setPolicy("fail"));
    healthSecrets().then(() => setSecrets("ok")).catch(() => setSecrets("fail"));
    healthFormat().then(() => setFormat("ok")).catch(() => setFormat("fail"));
  }, []);

  const pill = (label: string, state: ServiceState) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      state === "ok" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
      state === "fail" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" : 
      "bg-muted text-muted-foreground animate-pulse"
    }`}>
      {label} {state === "..." ? "checking" : state}
    </span>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {pill("PII", pii)}
      {pill("Toxicity", tox)}
      {pill("Jailbreak", jail)}
      {pill("Ban/Bias", ban)}
      {pill("Policy", policy)}
      {pill("Secrets", secrets)}
      {pill("Format", format)}
    </div>
  );
}