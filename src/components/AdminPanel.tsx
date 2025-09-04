import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  addPIIEntities, 
  getPIIEntities, 
  clearPIIEntities,
  addJailbreakRules,
  getJailbreakRules,
  clearJailbreakRules,
  addPolicyRules,
  getPolicyRules,
  clearPolicyRules,
  addBanRules,
  getBanRules,
  clearBanRules,
  addSecretsSignatures,
  getSecretsSignatures,
  clearSecretsSignatures,
  addFormatExpressions,
  getFormatExpressions,
  clearFormatExpressions
} from "@/lib/zgridClient";

export default function AdminPanel() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // PII State
  const [piiEntities, setPiiEntities] = useState("");
  const [piiPlaceholders, setPiiPlaceholders] = useState("");
  const [piiThresholds, setPiiThresholds] = useState("");
  
  // Jailbreak State
  const [jailbreakRules, setJailbreakRules] = useState("");
  const [jailbreakTexts, setJailbreakTexts] = useState("");
  
  // Policy State
  const [policyRules, setPolicyRules] = useState("");
  const [policyCategories, setPolicyCategories] = useState("");
  
  // Ban State
  const [banRules, setBanRules] = useState("");
  const [banAllowList, setBanAllowList] = useState("");
  
  // Secrets State
  const [secretsSignatures, setSecretsSignatures] = useState("");
  
  // Format State
  const [formatExpressions, setFormatExpressions] = useState("");

  const handleAddPII = async () => {
    setLoading(true);
    try {
      const config: any = {};
      
      if (piiEntities.trim()) {
        config.custom_entities = JSON.parse(piiEntities);
      }
      if (piiPlaceholders.trim()) {
        config.custom_placeholders = JSON.parse(piiPlaceholders);
      }
      if (piiThresholds.trim()) {
        config.custom_thresholds = JSON.parse(piiThresholds);
      }
      
      await addPIIEntities(config);
      toast({ title: "Success", description: "PII configuration added successfully" });
    } catch (error) {
      toast({ title: "Error", description: `Failed to add PII configuration: ${error}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddJailbreak = async () => {
    setLoading(true);
    try {
      const config: any = {};
      
      if (jailbreakRules.trim()) {
        config.custom_rules = JSON.parse(jailbreakRules);
      }
      if (jailbreakTexts.trim()) {
        config.custom_similarity_texts = { texts: JSON.parse(jailbreakTexts) };
      }
      
      await addJailbreakRules(config);
      toast({ title: "Success", description: "Jailbreak rules added successfully" });
    } catch (error) {
      toast({ title: "Error", description: `Failed to add jailbreak rules: ${error}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPolicy = async () => {
    setLoading(true);
    try {
      const config: any = {};
      
      if (policyRules.trim()) {
        config.custom_policies = JSON.parse(policyRules);
      }
      if (policyCategories.trim()) {
        config.custom_categories = JSON.parse(policyCategories);
      }
      
      await addPolicyRules(config);
      toast({ title: "Success", description: "Policy rules added successfully" });
    } catch (error) {
      toast({ title: "Error", description: `Failed to add policy rules: ${error}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBan = async () => {
    setLoading(true);
    try {
      const config: any = {};
      
      if (banRules.trim()) {
        config.custom_bans = JSON.parse(banRules);
      }
      if (banAllowList.trim()) {
        config.custom_allow = JSON.parse(banAllowList);
      }
      
      await addBanRules(config);
      toast({ title: "Success", description: "Ban rules added successfully" });
    } catch (error) {
      toast({ title: "Error", description: `Failed to add ban rules: ${error}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSecrets = async () => {
    setLoading(true);
    try {
      const config: any = {};
      
      if (secretsSignatures.trim()) {
        config.custom_signatures = JSON.parse(secretsSignatures);
      }
      
      await addSecretsSignatures(config);
      toast({ title: "Success", description: "Secrets signatures added successfully" });
    } catch (error) {
      toast({ title: "Error", description: `Failed to add secrets signatures: ${error}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFormat = async () => {
    setLoading(true);
    try {
      const config: any = {};
      
      if (formatExpressions.trim()) {
        config.custom_expressions = JSON.parse(formatExpressions);
      }
      
      await addFormatExpressions(config);
      toast({ title: "Success", description: "Format expressions added successfully" });
    } catch (error) {
      toast({ title: "Error", description: `Failed to add format expressions: ${error}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClearService = async (service: string, clearFunction: () => Promise<any>) => {
    setLoading(true);
    try {
      await clearFunction();
      toast({ title: "Success", description: `${service} configuration cleared successfully` });
    } catch (error) {
      toast({ title: "Error", description: `Failed to clear ${service} configuration: ${error}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">zGrid Admin Panel</h1>
          <p className="text-lg text-muted-foreground">
            Configure custom rules and settings for all zGrid services.
          </p>
        </div>

        <Tabs defaultValue="pii" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pii">PII</TabsTrigger>
            <TabsTrigger value="jailbreak">Jailbreak</TabsTrigger>
            <TabsTrigger value="policy">Policy</TabsTrigger>
            <TabsTrigger value="ban">Ban/Bias</TabsTrigger>
            <TabsTrigger value="secrets">Secrets</TabsTrigger>
            <TabsTrigger value="format">Format</TabsTrigger>
          </TabsList>

          <TabsContent value="pii" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PII Protection Configuration</CardTitle>
                <CardDescription>
                  Add custom entities, placeholders, and thresholds for PII detection.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pii-entities">Custom Entities (JSON)</Label>
                  <Textarea
                    id="pii-entities"
                    placeholder='[{"type": "EMPLOYEE_ID", "pattern": "\\\\bEMP\\\\d{6}\\\\b", "description": "Employee ID format"}]'
                    value={piiEntities}
                    onChange={(e) => setPiiEntities(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pii-placeholders">Custom Placeholders (JSON)</Label>
                  <Textarea
                    id="pii-placeholders"
                    placeholder='[{"entity_type": "EMPLOYEE_ID", "placeholder": "[EMP_ID]"}]'
                    value={piiPlaceholders}
                    onChange={(e) => setPiiPlaceholders(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pii-thresholds">Custom Thresholds (JSON)</Label>
                  <Textarea
                    id="pii-thresholds"
                    placeholder='[{"entity_type": "EMPLOYEE_ID", "threshold": 0.8}]'
                    value={piiThresholds}
                    onChange={(e) => setPiiThresholds(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddPII} disabled={loading}>
                    Add Configuration
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleClearService("PII", clearPIIEntities)}
                    disabled={loading}
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jailbreak" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Jailbreak Detection Configuration</CardTitle>
                <CardDescription>
                  Add custom patterns and similarity texts for jailbreak detection.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jailbreak-rules">Custom Rules (JSON)</Label>
                  <Textarea
                    id="jailbreak-rules"
                    placeholder='[{"id": "COMPANY_SECRETS", "pattern": "\\\\b(ignore|disregard)\\\\s+(company|internal)\\\\b", "flags": "i"}]'
                    value={jailbreakRules}
                    onChange={(e) => setJailbreakRules(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jailbreak-texts">Similarity Texts (JSON Array)</Label>
                  <Textarea
                    id="jailbreak-texts"
                    placeholder='["ignore all company policies", "disregard internal guidelines"]'
                    value={jailbreakTexts}
                    onChange={(e) => setJailbreakTexts(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddJailbreak} disabled={loading}>
                    Add Configuration
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleClearService("Jailbreak", clearJailbreakRules)}
                    disabled={loading}
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Moderation Configuration</CardTitle>
                <CardDescription>
                  Add custom policies and categories for content moderation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="policy-rules">Custom Policies (JSON)</Label>
                  <Textarea
                    id="policy-rules"
                    placeholder='[{"category": "COMPANY_SECRETS", "keywords": ["confidential", "proprietary"], "severity": "HIGH"}]'
                    value={policyRules}
                    onChange={(e) => setPolicyRules(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy-categories">Custom Categories (JSON)</Label>
                  <Textarea
                    id="policy-categories"
                    placeholder='[{"name": "CompanyPolicy", "description": "Internal company policy violations"}]'
                    value={policyCategories}
                    onChange={(e) => setPolicyCategories(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddPolicy} disabled={loading}>
                    Add Configuration
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleClearService("Policy", clearPolicyRules)}
                    disabled={loading}
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ban" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ban/Bias & Brand Safety Configuration</CardTitle>
                <CardDescription>
                  Add custom ban terms and allowed terms for content filtering.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ban-rules">Custom Ban Terms (JSON)</Label>
                  <Textarea
                    id="ban-rules"
                    placeholder='[{"pattern": "competitorxyz", "type": "literal", "category": "COMPETITOR", "severity": 4}]'
                    value={banRules}
                    onChange={(e) => setBanRules(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ban-allow">Allowed Terms (JSON Array)</Label>
                  <Textarea
                    id="ban-allow"
                    placeholder='["our company discussion", "legitimate business"]'
                    value={banAllowList}
                    onChange={(e) => setBanAllowList(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddBan} disabled={loading}>
                    Add Configuration
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleClearService("Ban", clearBanRules)}
                    disabled={loading}
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="secrets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Secrets Detection Configuration</CardTitle>
                <CardDescription>
                  Add custom regex patterns for detecting secrets and credentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secrets-signatures">Custom Signatures (JSON)</Label>
                  <Textarea
                    id="secrets-signatures"
                    placeholder='[{"id": "CUSTOM_API_KEY", "category": "INTERNAL", "type": "regex", "pattern": "\\\\bck_[A-Za-z0-9]{32}\\\\b", "severity": 4}]'
                    value={secretsSignatures}
                    onChange={(e) => setSecretsSignatures(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddSecrets} disabled={loading}>
                    Add Configuration
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleClearService("Secrets", clearSecretsSignatures)}
                    disabled={loading}
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="format" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Format Validation Configuration</CardTitle>
                <CardDescription>
                  Add custom Cucumber expressions for format validation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="format-expressions">Custom Expressions (JSON Array)</Label>
                  <Textarea
                    id="format-expressions"
                    placeholder='["Email {email}, phone {phone}", "Name: {word}, Age: {int}"]'
                    value={formatExpressions}
                    onChange={(e) => setFormatExpressions(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddFormat} disabled={loading}>
                    Add Configuration
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleClearService("Format", clearFormatExpressions)}
                    disabled={loading}
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}