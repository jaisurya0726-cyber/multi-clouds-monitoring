/**
 * Multi-Cloud Monitoring Platform - Type Definitions
 */

export type CloudProvider = 'aws' | 'azure' | 'gcp';

export type ConnectionType = 'iam_role' | 'service_principal' | 'service_account_json';

export interface CloudAccount {
  id: string;
  name: string;
  provider: CloudProvider;
  connectionType: ConnectionType;
  status: 'connected' | 'error' | 'pending';
  credentials: {
    roleArn?: string;
    externalId?: string;
    tenantId?: string;
    clientId?: string;
    projectId?: string;
    clientEmail?: string;
    hasKeyJson?: boolean;
    secretKeyMasked?: string;
  };
  region: string;
  createdAt: string;
}

export interface MetricDataPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
  dbLatency: number;
  costRate: number;
}

export interface CloudResource {
  id: string;
  name: string;
  provider: CloudProvider;
  type: 'vm' | 'database' | 'k8s_cluster' | 'object_storage';
  status: 'running' | 'terminated' | 'warning' | 'critical';
  region: string;
  accountId: string;
  size: string;
  ipAddress: string;
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    networkRate: number; // MB/s
    dbConnections?: number;
    k8sNodesOnline?: number;
    k8sNodesTotal?: number;
  };
}

export interface MonitoringLog {
  id: string;
  timestamp: string;
  provider: CloudProvider;
  service: string;
  resourceId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  component: string;
  payload: string;
}

export interface TraceSpan {
  id: string;
  name: string;
  serviceName: string;
  parentSpanId?: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: 'ok' | 'error';
  attributes: Record<string, string | number | boolean>;
}

export interface TraceFlow {
  traceId: string;
  rootServiceName: string;
  totalDurationMs: number;
  timestamp: string;
  status: 'ok' | 'error';
  spans: TraceSpan[];
}

export interface AlertRule {
  id: string;
  name: string;
  provider: CloudProvider | 'all';
  resourceType: 'vm' | 'database' | 'k8s_cluster' | 'all';
  metric: 'cpu' | 'memory' | 'disk_util' | 'network_spike' | 'cost_spike';
  operator: 'gt' | 'lt' | 'eq';
  threshold: number;
  evaluationWindowMin: number;
  severity: 'info' | 'warning' | 'critical';
  notificationChannels: {
    email: boolean;
    slack: boolean;
    teams: boolean;
    webhook: boolean;
  };
  isActive: boolean;
}

export interface ActiveIncident {
  id: string;
  ruleId: string;
  name: string;
  resourceId: string;
  resourceName: string;
  provider: CloudProvider;
  metricName: string;
  currentValue: number;
  thresholdValue: number;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  aiRecommendation?: string;
}

export interface CostMetric {
  provider: CloudProvider;
  service: string;
  amount: number;
  month: string;
  project: string;
  department: string;
  region: string;
}

export interface RightsizingRecommendation {
  id: string;
  resourceId: string;
  resourceName: string;
  provider: CloudProvider;
  resourceType: string;
  currentConfiguration: string;
  recommendedConfiguration: string;
  estimatedMonthlySavings: number;
  reasoning: string;
  confidenceRating: 'high' | 'medium' | 'low';
}

export interface SecurityPostureCheck {
  id: string;
  provider: CloudProvider | 'all';
  category: 'IAM' | 'Network' | 'Data Storage' | 'Encryption' | 'Logging';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  complianceStandards: ('ISO 27001' | 'SOC 2' | 'GDPR' | 'HIPAA')[];
  status: 'passed' | 'failed' | 'warning';
  resourceId: string;
}

export interface UserSession {
  username: string;
  email: string;
  role: 'super_admin' | 'cloud_admin' | 'operator' | 'viewer';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  username: string;
  role: string;
  action: string;
  status: 'success' | 'failure';
  details: string;
  ipAddress: string;
}
