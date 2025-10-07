import { useEffect, useState } from "react";
import { 
  healthPII, 
  healthTox, 
  healthJail, 
  healthBan, 
  healthPolicy, 
  healthSecrets,
  healthFormat,
  healthGibberish,
  checkProxyDeployment
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
  const [gibberish, setGibberish] = useState<ServiceState>("...");
  const [proxy, setProxy] = useState<ServiceState>("...");
  const [proxyError, setProxyError] = useState<string>("");

  useEffect(() => {
    // Check proxy deployment first
    checkProxyDeployment().then(result => {
      if (result.deployed && !result.error) {
        console.log("✅ Gateway proxy is deployed and working");
        setProxy("ok");
      } else {
        console.error("❌ Gateway proxy issue:", result.error);
        setProxy("fail");
        setProxyError(result.error || "Unknown error");
      }
    });

    // Check all service health endpoints with detailed logging
    const checkService = async (name: string, healthFn: () => Promise<any>, setState: (state: ServiceState) => void) => {
      try {
        console.log(`🔍 Checking ${name} service...`);
        await healthFn();
        console.log(`✅ ${name} service is running`);
        setState("ok");
      } catch (error) {
        console.error(`❌ ${name} service failed:`, error);
        setState("fail");
      }
    };

    checkService("PII", healthPII, setPii);
    checkService("Toxicity", healthTox, setTox);
    checkService("Jailbreak", healthJail, setJail);
    checkService("Ban", healthBan, setBan);
    checkService("Policy", healthPolicy, setPolicy);
    checkService("Secrets", healthSecrets, setSecrets);
    checkService("Format", healthFormat, setFormat);
    checkService("Gibberish", healthGibberish, setGibberish);
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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {pill("Gateway Proxy", proxy)}
        {proxy === "fail" && proxyError && (
          <span className="text-xs text-muted-foreground">({proxyError})</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {pill("PII", pii)}
        {pill("Toxicity", tox)}
        {pill("Jailbreak", jail)}
        {pill("Ban/Bias", ban)}
        {pill("Policy", policy)}
        {pill("Secrets", secrets)}
        {pill("Format", format)}
        {pill("Gibberish", gibberish)}
      </div>
    </div>
  );
}