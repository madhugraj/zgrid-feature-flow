import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { validateContent, checkProxyDeployment, getServiceConfig } from "@/lib/zgridClient";
import { parseGatewayResponse, getServiceDisplayName, getStatusColor, formatReasons } from "@/lib/gatewayResponseParser";
import { toast } from "@/hooks/use-toast";

export default function GatewayDebugPanel() {
  const [testText, setTestText] = useState("Test my email john@example.com and my phone 555-1234");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [proxyStatus, setProxyStatus] = useState<any>(null);
  const [checkingProxy, setCheckingProxy] = useState(false);

  const testDirect = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log("🧪 Testing DIRECT fetch to gateway...");
      const config = getServiceConfig();
      console.log("Gateway config:", config);
      
      const response = await validateContent(testText, {
        check_pii: true,
        check_toxicity: true,
        check_jailbreak: true,
      });
      
      setResult({ method: "direct", success: true, data: response });
      toast({
        title: "Direct Test Successful",
        description: "Gateway responded via direct fetch",
      });
    } catch (error) {
      console.error("Direct test failed:", error);
      setResult({ 
        method: "direct", 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
      toast({
        title: "Direct Test Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkProxy = async () => {
    setCheckingProxy(true);
    setProxyStatus(null);
    
    try {
      console.log("🔍 Checking proxy deployment status...");
      const status = await checkProxyDeployment();
      setProxyStatus(status);
      
      if (status.deployed && !status.error) {
        toast({
          title: "Proxy is Deployed",
          description: "Gateway proxy function is working correctly",
        });
      } else {
        toast({
          title: "Proxy Issue Detected",
          description: status.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Proxy check failed:", error);
      setProxyStatus({ 
        deployed: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
      toast({
        title: "Proxy Check Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setCheckingProxy(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gateway Debug Panel</CardTitle>
        <CardDescription>
          Test gateway connectivity and proxy deployment status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="test" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="test">Test Gateway</TabsTrigger>
            <TabsTrigger value="proxy">Proxy Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-text">Test Text</Label>
              <Textarea
                id="test-text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text to test..."
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={testDirect} disabled={loading}>
                {loading ? "Testing..." : "Test Gateway"}
              </Button>
            </div>

            {result && (
              <Card className={result.success ? "border-green-500" : "border-red-500"}>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {result.method === "direct" ? "Direct Fetch" : "Proxy Fetch"} - 
                    {result.success ? " ✅ Success" : " ❌ Failed"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.success && result.data && (() => {
                    const parsed = parseGatewayResponse(result.data);
                    
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Overall Status:</span>
                          <Badge variant={parsed.overallStatus === 'pass' ? 'default' : 'destructive'}>
                            {parsed.overallStatus.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {parsed.cleanText && (
                          <div>
                            <span className="font-semibold text-sm">Clean Text:</span>
                            <p className="mt-1 p-2 bg-muted rounded text-xs">{parsed.cleanText}</p>
                          </div>
                        )}
                        
                        {parsed.blockedCategories.length > 0 && (
                          <div>
                            <span className="font-semibold text-sm">Blocked Categories:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {parsed.blockedCategories.map((cat, idx) => (
                                <Badge key={idx} variant="destructive" className="text-xs">{cat}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {Object.keys(parsed.serviceResults).length > 0 && (
                          <div>
                            <span className="font-semibold text-sm">Service Results:</span>
                            <ScrollArea className="h-48 mt-2">
                              <div className="space-y-2">
                                {Object.entries(parsed.serviceResults).map(([service, serviceResult]) => (
                                  <div key={service} className="p-2 border rounded text-xs">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium">{getServiceDisplayName(service)}</span>
                                      <Badge 
                                        variant={serviceResult.status === 'pass' ? 'default' : 'destructive'}
                                        className="text-xs"
                                      >
                                        {serviceResult.status}
                                      </Badge>
                                    </div>
                                    {serviceResult.reasons && serviceResult.reasons.length > 0 && (
                                      <p className="text-xs text-muted-foreground">
                                        {formatReasons(serviceResult.reasons)}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                        
                        <details className="cursor-pointer">
                          <summary className="font-semibold text-sm">Full Response (JSON)</summary>
                          <pre className="text-xs overflow-auto max-h-48 bg-muted p-2 rounded mt-2">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      </>
                    );
                  })()}
                  
                  {!result.success && (
                    <pre className="text-xs overflow-auto max-h-64 bg-muted p-2 rounded">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="proxy" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Check if the gateway-proxy Supabase function is deployed and accessible.
              </p>
              
              <Button onClick={checkProxy} disabled={checkingProxy}>
                {checkingProxy ? "Checking..." : "Check Proxy Deployment"}
              </Button>
            </div>

            {proxyStatus && (
              <Card className={proxyStatus.deployed && !proxyStatus.error ? "border-green-500" : "border-red-500"}>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Proxy Status: {proxyStatus.deployed ? "✅ Deployed" : "❌ Not Deployed"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {proxyStatus.error ? (
                    <div className="space-y-2">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {proxyStatus.error}
                      </p>
                      <a 
                        href="https://supabase.com/dashboard/project/bgczwmnqxmxusfwapqcn/functions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View Supabase Functions Dashboard →
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Gateway proxy is working correctly
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto bg-muted p-2 rounded">
                  {JSON.stringify(getServiceConfig(), null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
