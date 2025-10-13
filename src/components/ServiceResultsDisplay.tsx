import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Eye, 
  Key, 
  FileText,
  MessageSquare,
  Lock,
  Ban,
  Flame
} from "lucide-react";
import { ParsedGatewayResponse, ServiceResult, getServiceDisplayName } from "@/lib/gatewayResponseParser";

interface ServiceResultsDisplayProps {
  parsed: ParsedGatewayResponse;
  originalText: string;
}

export function ServiceResultsDisplay({ parsed, originalText }: ServiceResultsDisplayProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fixed':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'blocked':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'pii':
        return <Eye className="h-4 w-4" />;
      case 'secrets':
        return <Key className="h-4 w-4" />;
      case 'format':
        return <FileText className="h-4 w-4" />;
      case 'gibberish':
        return <MessageSquare className="h-4 w-4" />;
      case 'jailbreak':
        return <Lock className="h-4 w-4" />;
      case 'policy':
        return <Shield className="h-4 w-4" />;
      case 'ban':
        return <Ban className="h-4 w-4" />;
      case 'toxicity':
        return <Flame className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const renderPIIResult = (result: ServiceResult) => (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-2 block">Redacted Text</label>
        <div className="bg-background p-3 rounded border font-mono text-sm">
          {result.clean_text || result.redacted_text || 'No redaction needed'}
        </div>
      </div>
      
      {result.entities && result.entities.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Detected Entities ({result.entities.length})</label>
          <div className="flex flex-wrap gap-2">
            {result.entities.map((entity, idx) => (
              <Badge key={idx} variant="destructive" className="text-xs">
                {entity.type}: {entity.value} 
                {entity.score && ` (${(entity.score * 100).toFixed(0)}%)`}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {result.reasons && result.reasons.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Detection Details</label>
          <div className="space-y-1">
            {result.reasons.map((reason, idx) => (
              <div key={idx} className="text-xs text-muted-foreground">• {reason}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSecretsResult = (result: ServiceResult) => (
    <div className="space-y-3">
      {result.status === 'blocked' ? (
        <Alert variant="destructive">
          <AlertDescription>
            Secrets detected and blocked. Content cannot be displayed to prevent credential leakage.
          </AlertDescription>
        </Alert>
      ) : result.clean_text ? (
        <div>
          <label className="text-sm font-medium mb-2 block">Masked Text</label>
          <div className="bg-background p-3 rounded border font-mono text-sm">
            {result.clean_text}
          </div>
        </div>
      ) : null}
      
      {result.flagged_secrets && result.flagged_secrets.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Detected Secrets ({result.flagged_secrets.length})</label>
          <div className="space-y-2">
            {result.flagged_secrets.map((secret, idx) => (
              <div key={idx} className="bg-destructive/10 p-2 rounded border border-destructive/20">
                <div className="flex justify-between items-center">
                  <Badge variant="destructive" className="text-xs">
                    {secret.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{secret.severity}</span>
                </div>
                <div className="text-xs mt-1 font-mono">"{secret.snippet}"</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderFormatResult = (result: ServiceResult) => (
    <div className="space-y-3">
      {result.matched_expression && (
        <div>
          <label className="text-sm font-medium mb-2 block">Matched Expression</label>
          <div className="bg-background p-3 rounded border font-mono text-xs">
            {result.matched_expression}
          </div>
        </div>
      )}
      
      {result.extracted_variables && Object.keys(result.extracted_variables).length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Extracted Variables</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(result.extracted_variables).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="font-medium">{key}:</span> <span className="font-mono">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {result.reasons && result.reasons.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {result.reasons.join('; ')}
        </div>
      )}
    </div>
  );

  const renderGibberishResult = (result: ServiceResult) => (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-2 block">Confidence Score</label>
        <div className="space-y-2">
          <Progress value={(result.confidence || 0) * 100} className="h-2" />
          <div className="text-xs text-muted-foreground text-right">
            {((result.confidence || 0) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div className="text-sm">
        <span className="font-medium">Is Gibberish:</span>{' '}
        <Badge variant={result.is_gibberish ? 'destructive' : 'secondary'}>
          {result.is_gibberish ? 'Yes' : 'No'}
        </Badge>
      </div>
      
      {result.flagged_spans && result.flagged_spans.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Flagged Spans</label>
          <div className="space-y-1">
            {result.flagged_spans.map((span, idx) => (
              <div key={idx} className="text-xs bg-destructive/10 p-2 rounded font-mono">
                "{span.text}"
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderJailbreakResult = (result: ServiceResult) => (
    <div className="space-y-3">
      {result.flagged_signatures && result.flagged_signatures.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Matched Patterns ({result.flagged_signatures.length})</label>
          <div className="space-y-2">
            {result.flagged_signatures.map((sig, idx) => (
              <div key={idx} className="bg-destructive/10 p-2 rounded border border-destructive/20">
                <Badge variant="destructive" className="text-xs">
                  Pattern: {sig}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {result.scores && (
        <div>
          <label className="text-sm font-medium mb-2 block">Detection Scores</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(result.scores).map(([key, score]) => (
              <div key={key} className="text-xs">
                <span className="capitalize">{key}:</span>{' '}
                <span className="font-mono">{(score * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {result.reasons && result.reasons.length > 0 && (
        <div className="space-y-1">
          {result.reasons.map((reason, idx) => (
            <div key={idx} className="text-xs text-muted-foreground">• {reason}</div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPolicyResult = (result: ServiceResult) => (
    <div className="space-y-3">
      {result.status === 'error' && (
        <Alert variant="destructive">
          <AlertDescription>
            Policy service is currently unavailable. Gateway may have used fallback logic.
          </AlertDescription>
        </Alert>
      )}
      
      {result.flagged_categories && result.flagged_categories.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Violated Categories</label>
          <div className="flex flex-wrap gap-2">
            {result.flagged_categories.map((cat, idx) => (
              <Badge key={idx} variant="destructive">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {result.reasons && result.reasons.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Violation Details</label>
          <div className="space-y-1">
            {result.reasons.map((reason, idx) => (
              <div key={idx} className="text-xs text-destructive">• {reason}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderBanResult = (result: ServiceResult) => (
    <div className="space-y-3">
      {result.flagged_terms && result.flagged_terms.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Banned Terms ({result.flagged_terms.length})</label>
          <div className="flex flex-wrap gap-2">
            {result.flagged_terms.map((term, idx) => (
              <Badge key={idx} variant="destructive" className="text-xs">
                {term}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {result.reasons && result.reasons.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {result.reasons.join('; ')}
        </div>
      )}
    </div>
  );

  const renderToxicityResult = (result: ServiceResult) => (
    <div className="space-y-3">
      {result.scores && (
        <div>
          <label className="text-sm font-medium mb-2 block">Toxicity Dimensions</label>
          <div className="space-y-2">
            {Object.entries(result.scores).map(([dimension, score]) => (
              <div key={dimension}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize">{dimension.replace('_', ' ')}</span>
                  <span className="font-mono">{(score * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={score * 100} 
                  className={`h-2 ${score > 0.7 ? 'bg-red-200' : score > 0.4 ? 'bg-yellow-200' : 'bg-green-200'}`} 
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {result.flagged_spans && result.flagged_spans.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Flagged Content</label>
          <div className="space-y-2">
            {result.flagged_spans.map((span, idx) => (
              <div key={idx} className="bg-destructive/10 p-2 rounded border border-destructive/20">
                <div className="text-xs font-mono">"{span.text}"</div>
                <div className="text-xs text-muted-foreground mt-1">Type: {span.type}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {result.steps && result.steps.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Detection Steps</label>
          <div className="space-y-1">
            {result.steps.map((step, idx) => (
              <div key={idx} className="text-xs flex items-center gap-2">
                {step.passed ? 
                  <CheckCircle className="h-3 w-3 text-green-600" /> : 
                  <XCircle className="h-3 w-3 text-red-600" />
                }
                <span>{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderServiceResult = (service: string, result: ServiceResult) => {
    switch (service) {
      case 'pii':
        return renderPIIResult(result);
      case 'secrets':
        return renderSecretsResult(result);
      case 'format':
        return renderFormatResult(result);
      case 'gibberish':
        return renderGibberishResult(result);
      case 'jailbreak':
        return renderJailbreakResult(result);
      case 'policy':
        return renderPolicyResult(result);
      case 'ban':
        return renderBanResult(result);
      case 'toxicity':
        return renderToxicityResult(result);
      default:
        return (
          <div className="text-sm text-muted-foreground">
            {result.reasons?.join('; ') || 'No additional details available'}
          </div>
        );
    }
  };

  // Sort services by priority (PII first, then others)
  const servicePriority = ['pii', 'secrets', 'jailbreak', 'policy', 'ban', 'toxicity', 'format', 'gibberish'];
  const sortedServices = Object.entries(parsed.serviceResults).sort(([a], [b]) => {
    const aIndex = servicePriority.indexOf(a);
    const bIndex = servicePriority.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {getStatusIcon(parsed.overallStatus)}
            Overall Status: <Badge 
              variant={
                parsed.overallStatus === 'pass' ? 'secondary' : 
                parsed.overallStatus === 'fixed' ? 'default' : 
                'destructive'
              }
            >
              {parsed.overallStatus.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {parsed.cleanText && parsed.cleanText !== originalText && (
            <div>
              <label className="text-sm font-medium mb-2 block">Sanitized Text</label>
              <div className="bg-background p-3 rounded border font-mono text-sm">
                {parsed.cleanText}
              </div>
            </div>
          )}
          
          {parsed.blockedCategories.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Blocked Categories</label>
              <div className="flex flex-wrap gap-2">
                {parsed.blockedCategories.map((cat, idx) => (
                  <Badge key={idx} variant="destructive">
                    {getServiceDisplayName(cat)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {parsed.reasons.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Summary</label>
              <div className="space-y-1">
                {parsed.reasons.map((reason, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground">• {reason}</div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Service Results */}
      {sortedServices.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Service-Level Results</h4>
          {sortedServices.map(([service, result]) => (
            <Card key={service}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  {getServiceIcon(service)}
                  {getServiceDisplayName(service)}
                  <Badge 
                    variant={
                      result.status === 'pass' ? 'secondary' : 
                      result.status === 'fixed' ? 'default' : 
                      result.status === 'error' ? 'outline' :
                      'destructive'
                    }
                    className="ml-auto"
                  >
                    {getStatusIcon(result.status)}
                    <span className="ml-1">{result.status}</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.status === 'error' ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Service unavailable or encountered an error. Results may be incomplete.
                    </AlertDescription>
                  </Alert>
                ) : result.status === 'pass' ? (
                  <div className="text-sm text-muted-foreground">
                    ✓ No issues detected
                  </div>
                ) : (
                  renderServiceResult(service, result)
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
