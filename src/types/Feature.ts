export interface Feature {
  featureCode: string; // unique identifier
  name: string;
  category: string;
  description: string; // long description
  exampleInput: string; // long example
  exampleOutput: string; // long example
  repoDependency: string;
  referenceLink: string; // URL
  tags: string[];
  standardInputs: string[]; // e.g., ["text","messages","code","document","json","sql"]
  defaultOutputPlaceholder: string; // e.g., "cleaned_text","validated_json","safe_sql","guarded_reply","evaluation_report"
}

export interface CartItem {
  feature: Feature;
  quantity: number;
  id: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
}