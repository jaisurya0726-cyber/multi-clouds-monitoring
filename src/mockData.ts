/**
 * Multi-Cloud Monitoring Platform - Realistic Seed Data
 */

import {
  CloudAccount,
  CloudResource,
  MetricDataPoint,
  MonitoringLog,
  TraceFlow,
  AlertRule,
  ActiveIncident,
  CostMetric,
  RightsizingRecommendation,
  SecurityPostureCheck,
  AuditLogEntry
} from './types';

// Connected Cloud Accounts
export const initialAccounts: CloudAccount[] = [
  {
    id: 'acc-aws-prod',
    name: 'AWS Production Account',
    provider: 'aws',
    connectionType: 'iam_role',
    status: 'connected',
    credentials: {
      roleArn: 'arn:aws:iam::123456789012:role/CloudObserveAuditRole',
      externalId: 'co-ext-prod-827f8u'
    },
    region: 'us-east-1',
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'acc-gcp-data',
    name: 'GCP Big Data Project',
    provider: 'gcp',
    connectionType: 'service_account_json',
    status: 'connected',
    credentials: {
      projectId: 'gcp-core-analytics-prod',
      clientEmail: 'sa-observability@gcp-core-analytics-prod.iam.gserviceaccount.com',
      hasKeyJson: true
    },
    region: 'us-central1',
    createdAt: '2026-02-10T12:30:00Z'
  },
  {
    id: 'acc-azure-sales',
    name: 'Azure Regional Enterprise Sales',
    provider: 'azure',
    connectionType: 'service_principal',
    status: 'connected',
    credentials: {
      tenantId: 'd647e3a9-bf02-4afc-a434-7a38914c67a5',
      clientId: '8cb385b0-13ad-42ca-8b01-e23f03baff8c',
      secretKeyMasked: '••••••••••••••••••••••••••••••••'
    },
    region: 'westeurope',
    createdAt: '2026-03-01T15:45:00Z'
  },
  {
    id: 'acc-aws-dev',
    name: 'AWS Staging & Dev Environment',
    provider: 'aws',
    connectionType: 'iam_role',
    status: 'error',
    credentials: {
      roleArn: 'arn:aws:iam::987654321099:role/StagingAdminRole',
      externalId: 'co-ext-dev-wrong2'
    },
    region: 'us-west-2',
    createdAt: '2026-04-20T09:15:00Z'
  }
];

// Global Cloud Resources List
export const initialResources: CloudResource[] = [
  // AWS Resources
  {
    id: 'res-aws-vm-1',
    name: 'aws-prod-k8s-node-1',
    provider: 'aws',
    type: 'vm',
    status: 'running',
    region: 'us-east-1',
    accountId: 'acc-aws-prod',
    size: 't3.xlarge',
    ipAddress: '10.0.1.45',
    metrics: { cpu: 48, memory: 72, disk: 34, networkRate: 45.2 }
  },
  {
    id: 'res-aws-vm-2',
    name: 'aws-prod-checkout-microservice',
    provider: 'aws',
    type: 'vm',
    status: 'critical',
    region: 'us-east-1',
    accountId: 'acc-aws-prod',
    size: 'm5.large',
    ipAddress: '10.0.1.89',
    metrics: { cpu: 98, memory: 94, disk: 89, networkRate: 152.4 }
  },
  {
    id: 'res-aws-db',
    name: 'aws-prod-postgres-aurora',
    provider: 'aws',
    type: 'database',
    status: 'warning',
    region: 'us-east-1',
    accountId: 'acc-aws-prod',
    size: 'db.r6g.2xlarge',
    ipAddress: '10.0.4.120',
    metrics: { cpu: 82, memory: 86, disk: 61, networkRate: 204.5, dbConnections: 954 }
  },
  {
    id: 'res-aws-k8s',
    name: 'AWS EKS production-cluster',
    provider: 'aws',
    type: 'k8s_cluster',
    status: 'running',
    region: 'us-east-1',
    accountId: 'acc-aws-prod',
    size: '3 Masters, 12 Workers',
    ipAddress: 'eks.us-east-1.amazonaws.com',
    metrics: { cpu: 55, memory: 61, disk: 40, networkRate: 350.0, k8sNodesOnline: 15, k8sNodesTotal: 15 }
  },
  {
    id: 'res-aws-s3-1',
    name: 'aws-prod-billing-statements-s3',
    provider: 'aws',
    type: 'object_storage',
    status: 'running',
    region: 'us-east-1',
    accountId: 'acc-aws-prod',
    size: '22.4 TB',
    ipAddress: 's3://aws-prod-billing-statements-s3',
    metrics: { cpu: 0, memory: 0, disk: 0, networkRate: 14.8 }
  },

  // GCP Resources
  {
    id: 'res-gcp-k8s',
    name: 'GCloud GKE analytics-cluster',
    provider: 'gcp',
    type: 'k8s_cluster',
    status: 'running',
    region: 'us-central1',
    accountId: 'acc-gcp-data',
    size: '5 Cores, GKE Autopilot',
    ipAddress: '35.224.12.87',
    metrics: { cpu: 32, memory: 45, disk: 22, networkRate: 480.2, k8sNodesOnline: 18, k8sNodesTotal: 18 }
  },
  {
    id: 'res-gcp-spanner',
    name: 'gcp-spanner-customer-graph',
    provider: 'gcp',
    type: 'database',
    status: 'running',
    region: 'us-central1',
    accountId: 'acc-gcp-data',
    size: '3 Node Multi-Region',
    ipAddress: 'global.spanner.googleapis.com',
    metrics: { cpu: 28, memory: 40, disk: 15, networkRate: 110.1, dbConnections: 2450 }
  },
  {
    id: 'res-gcp-bucket',
    name: 'gcp-uncompressed-raw-pipeline-bucket',
    provider: 'gcp',
    type: 'object_storage',
    status: 'warning',
    region: 'us-central1',
    accountId: 'acc-gcp-data',
    size: '480.5 TB',
    ipAddress: 'gs://gcp-uncompressed-raw-pipeline-bucket',
    metrics: { cpu: 0, memory: 0, disk: 0, networkRate: 590.2 }
  },
  {
    id: 'res-gcp-vm-bigdata',
    name: 'gcp-hadoop-master-node',
    provider: 'gcp',
    type: 'vm',
    status: 'running',
    region: 'us-central1',
    accountId: 'acc-gcp-data',
    size: 'n2-standard-16',
    ipAddress: '10.128.0.12',
    metrics: { cpu: 67, memory: 88, disk: 72, networkRate: 450.8 }
  },

  // Azure Resources
  {
    id: 'res-azure-vm-1',
    name: 'azure-sales-gateway-vm',
    provider: 'azure',
    type: 'vm',
    status: 'running',
    region: 'westeurope',
    accountId: 'acc-azure-sales',
    size: 'Standard_D4s_v5',
    ipAddress: '52.174.98.243',
    metrics: { cpu: 24, memory: 39, disk: 18, networkRate: 28.6 }
  },
  {
    id: 'res-azure-vm-2',
    name: 'azure-sales-reports-worker',
    provider: 'azure',
    type: 'vm',
    status: 'terminated',
    region: 'westeurope',
    accountId: 'acc-azure-sales',
    size: 'Standard_D2s_v5',
    ipAddress: '52.174.98.5',
    metrics: { cpu: 0, memory: 0, disk: 0, networkRate: 0.0 }
  },
  {
    id: 'res-azure-cosmos',
    name: 'azure-sales-crm-cosmos-db',
    provider: 'azure',
    type: 'database',
    status: 'running',
    region: 'westeurope',
    accountId: 'acc-azure-sales',
    size: 'Autoscale max 5000 RU/s',
    ipAddress: 'crm-sales.documents.azure.com',
    metrics: { cpu: 41, memory: 52, disk: 45, networkRate: 98.4, dbConnections: 812 }
  }
];

// Historical Metric Data Points (24 hours in 2-hour increments)
export const initialHistoryMetrics: Record<string, MetricDataPoint[]> = {
  all: [
    { timestamp: '10:00 AM', cpu: 42, memory: 55, disk: 30, networkIn: 120, networkOut: 154, dbLatency: 12.4, costRate: 15.4 },
    { timestamp: '12:00 PM', cpu: 51, memory: 59, disk: 32, networkIn: 165, networkOut: 198, dbLatency: 14.8, costRate: 15.4 },
    { timestamp: '02:00 PM', cpu: 75, memory: 78, disk: 35, networkIn: 240, networkOut: 320, dbLatency: 22.1, costRate: 15.8 },
    { timestamp: '04:00 PM', cpu: 68, memory: 71, disk: 36, networkIn: 210, networkOut: 285, dbLatency: 18.2, costRate: 15.8 },
    { timestamp: '06:00 PM', cpu: 62, memory: 67, disk: 36, networkIn: 180, networkOut: 248, dbLatency: 15.1, costRate: 15.8 },
    { timestamp: '08:00 PM', cpu: 89, memory: 84, disk: 38, networkIn: 395, networkOut: 480, dbLatency: 35.4, costRate: 17.2 },
    { timestamp: '10:00 PM', cpu: 94, memory: 91, disk: 41, networkIn: 450, networkOut: 520, dbLatency: 42.8, costRate: 17.5 },
    { timestamp: '12:00 AM', cpu: 61, memory: 68, disk: 42, networkIn: 215, networkOut: 240, dbLatency: 19.5, costRate: 16.0 },
    { timestamp: '02:00 AM', cpu: 32, memory: 50, disk: 42, networkIn: 85, networkOut: 110, dbLatency: 9.8, costRate: 14.8 },
    { timestamp: '04:00 AM', cpu: 28, memory: 48, disk: 42, networkIn: 55, networkOut: 72, dbLatency: 8.1, costRate: 14.8 },
    { timestamp: '06:00 AM', cpu: 31, memory: 48, disk: 42, networkIn: 68, networkOut: 85, dbLatency: 8.6, costRate: 14.8 },
    { timestamp: '08:00 AM', cpu: 45, memory: 56, disk: 43, networkIn: 142, networkOut: 175, dbLatency: 11.2, costRate: 15.4 }
  ],
  aws: [
    { timestamp: '10:00 AM', cpu: 45, memory: 60, disk: 34, networkIn: 55, networkOut: 65, dbLatency: 18.1, costRate: 7.2 },
    { timestamp: '12:00 PM', cpu: 55, memory: 64, disk: 34, networkIn: 78, networkOut: 90, dbLatency: 20.3, costRate: 7.2 },
    { timestamp: '02:00 PM', cpu: 80, memory: 82, disk: 35, networkIn: 112, networkOut: 145, dbLatency: 28.5, costRate: 7.4 },
    { timestamp: '04:00 PM', cpu: 75, memory: 78, disk: 36, networkIn: 98, networkOut: 130, dbLatency: 25.1, costRate: 7.4 },
    { timestamp: '06:00 PM', cpu: 64, memory: 73, disk: 36, networkIn: 82, networkOut: 110, dbLatency: 21.0, costRate: 7.4 },
    { timestamp: '08:00 PM', cpu: 92, memory: 88, disk: 39, networkIn: 175, networkOut: 215, dbLatency: 45.4, costRate: 8.1 },
    { timestamp: '10:00 PM', cpu: 98, memory: 96, disk: 42, networkIn: 210, networkOut: 245, dbLatency: 52.1, costRate: 8.3 },
    { timestamp: '12:00 AM', cpu: 65, memory: 75, disk: 42, networkIn: 105, networkOut: 120, dbLatency: 24.8, costRate: 7.5 },
    { timestamp: '02:00 AM', cpu: 35, memory: 55, disk: 42, networkIn: 42, networkOut: 48, dbLatency: 15.1, costRate: 6.9 },
    { timestamp: '04:00 AM', cpu: 28, memory: 52, disk: 42, networkIn: 25, networkOut: 30, dbLatency: 12.0, costRate: 6.9 },
    { timestamp: '06:00 AM', cpu: 32, memory: 52, disk: 42, networkIn: 30, networkOut: 38, dbLatency: 13.5, costRate: 6.9 },
    { timestamp: '08:00 AM', cpu: 48, memory: 61, disk: 43, networkIn: 65, networkOut: 75, dbLatency: 16.4, costRate: 7.2 }
  ],
  gcp: [
    { timestamp: '10:00 AM', cpu: 35, memory: 48, disk: 22, networkIn: 45, networkOut: 62, dbLatency: 8.2, costRate: 4.8 },
    { timestamp: '12:00 PM', cpu: 42, memory: 50, disk: 25, networkIn: 58, networkOut: 75, dbLatency: 9.4, costRate: 4.8 },
    { timestamp: '02:00 PM', cpu: 62, memory: 65, disk: 30, networkIn: 88, networkOut: 120, dbLatency: 14.5, costRate: 5.0 },
    { timestamp: '04:00 PM', cpu: 56, memory: 60, disk: 32, networkIn: 75, networkOut: 105, dbLatency: 12.1, costRate: 5.0 },
    { timestamp: '06:00 PM', cpu: 51, memory: 58, disk: 32, networkIn: 66, networkOut: 90, dbLatency: 10.4, costRate: 5.0 },
    { timestamp: '08:00 PM', cpu: 75, memory: 72, disk: 34, networkIn: 135, networkOut: 180, dbLatency: 22.1, costRate: 5.5 },
    { timestamp: '10:00 PM', cpu: 82, memory: 78, disk: 36, networkIn: 150, networkOut: 204, dbLatency: 28.5, costRate: 5.6 },
    { timestamp: '12:00 AM', cpu: 48, memory: 55, disk: 36, networkIn: 72, networkOut: 95, dbLatency: 12.0, costRate: 5.2 },
    { timestamp: '02:00 AM', cpu: 25, memory: 40, disk: 36, networkIn: 28, networkOut: 42, dbLatency: 6.1, costRate: 4.6 },
    { timestamp: '04:00 AM', cpu: 22, memory: 38, disk: 36, networkIn: 18, networkOut: 28, dbLatency: 5.0, costRate: 4.6 },
    { timestamp: '06:00 AM', cpu: 25, memory: 38, disk: 36, networkIn: 22, networkOut: 32, dbLatency: 5.2, costRate: 4.6 },
    { timestamp: '08:00 AM', cpu: 32, memory: 46, disk: 38, networkIn: 48, networkOut: 65, dbLatency: 7.4, costRate: 4.8 }
  ],
  azure: [
    { timestamp: '10:00 AM', cpu: 46, memory: 57, disk: 34, networkIn: 20, networkOut: 27, dbLatency: 11.0, costRate: 3.4 },
    { timestamp: '12:00 PM', cpu: 56, memory: 63, disk: 37, networkIn: 29, networkOut: 33, dbLatency: 14.7, costRate: 3.4 },
    { timestamp: '02:00 PM', cpu: 83, memory: 87, disk: 40, networkIn: 40, networkOut: 55, dbLatency: 23.3, costRate: 3.4 },
    { timestamp: '04:00 PM', cpu: 73, memory: 75, disk: 40, networkIn: 37, networkOut: 50, dbLatency: 17.4, costRate: 3.4 },
    { timestamp: '06:00 PM', cpu: 71, memory: 70, disk: 40, networkIn: 32, networkOut: 48, dbLatency: 13.9, costRate: 3.4 },
    { timestamp: '08:00 PM', cpu: 98, memory: 92, disk: 41, networkIn: 85, networkOut: 85, dbLatency: 38.6, costRate: 3.6 },
    { timestamp: '10:00 PM', cpu: 100, memory: 99, disk: 45, networkIn: 90, networkOut: 71, dbLatency: 47.9, costRate: 3.6 },
    { timestamp: '12:00 AM', cpu: 70, memory: 74, disk: 48, networkIn: 38, networkOut: 25, dbLatency: 21.7, costRate: 3.3 },
    { timestamp: '02:00 AM', cpu: 36, memory: 55, disk: 48, networkIn: 15, networkOut: 20, dbLatency: 8.3, costRate: 3.3 },
    { timestamp: '04:00 AM', cpu: 34, memory: 54, disk: 48, networkIn: 12, networkOut: 14, dbLatency: 7.3, costRate: 3.3 },
    { timestamp: '06:00 AM', cpu: 36, memory: 54, disk: 48, networkIn: 16, networkOut: 15, dbLatency: 7.1, costRate: 3.3 },
    { timestamp: '08:00 AM', cpu: 55, memory: 61, disk: 48, networkIn: 29, networkOut: 35, dbLatency: 9.8, costRate: 3.4 }
  ]
};

// Observability Logs Seed
export const initialLogs: MonitoringLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-13T08:25:12Z',
    provider: 'aws',
    service: 'EC2',
    resourceId: 'res-aws-vm-2',
    level: 'error',
    message: 'Out of Memory (OOM) killer invoked. Process node (PID 14205) sacrificed.',
    component: 'kernel',
    payload: `{"kernel_timestamp": 48291.5540, "message": "Out of memory: Killed process 14205 (node) total-vm:4589212kB, anon-rss:1980832kB, file-rss:408kB, shmem-rss:0kB", "oom_score_adj": 0}`
  },
  {
    id: 'log-2',
    timestamp: '2026-06-13T08:24:45Z',
    provider: 'aws',
    service: 'AuroraRDS',
    resourceId: 'res-aws-db',
    level: 'warning',
    message: 'DB Connections high: 954/1000 configurations reached. Imminent queue block.',
    component: 'connection_pooler',
    payload: `{"max_connections": 1000, "active_connections": 954, "idle_connections": 12, "waiting_clients": 45}`
  },
  {
    id: 'log-3',
    timestamp: '2026-06-13T08:24:10Z',
    provider: 'aws',
    service: 'EC2',
    resourceId: 'res-aws-vm-2',
    level: 'warning',
    message: 'CPU consumption breached threshold 90% (Current: 98%). Throttling active.',
    component: 'kubelet',
    payload: `{"cpu_shares": 1024, "usage_percent": 98.2, "system_load_1m": 4.12, "system_load_5m": 3.82}`
  },
  {
    id: 'log-4',
    timestamp: '2026-06-13T08:23:01Z',
    provider: 'azure',
    service: 'StorageAccount',
    resourceId: 'res-azure-cosmos',
    level: 'info',
    message: 'Replication completed for West Europe cluster to North Europe secondary.',
    component: 'cosmos_engine',
    payload: `{"replication_lag_ms": 11, "copied_partitions": 128, "throughput_ru": 812}`
  },
  {
    id: 'log-5',
    timestamp: '2026-06-13T08:22:15Z',
    provider: 'gcp',
    service: 'CloudStorage',
    resourceId: 'res-gcp-bucket',
    level: 'warning',
    message: 'Storage Bucket data size growing faster than forecasting: daily ingest spike 4.8 TB.',
    component: 'ingest_controller',
    payload: `{"ingest_source": "gcp-hadoop-analytics-node", "bytes_written_today": 5277655813324, "growth_multiplier": 2.1}`
  },
  {
    id: 'log-6',
    timestamp: '2026-06-13T08:20:00Z',
    provider: 'gcp',
    service: 'CloudSpanner',
    resourceId: 'res-gcp-spanner',
    level: 'info',
    message: 'Query optimization executed: index idx_customer_email successfully mapped.',
    component: 'query_planner',
    payload: `{"scanned_rows": 41202, "returned_rows": 1, "duration_us": 1205}`
  },
  {
    id: 'log-7',
    timestamp: '2026-06-13T08:18:44Z',
    provider: 'aws',
    service: 'EKS',
    resourceId: 'res-aws-k8s',
    level: 'info',
    message: 'HorizontalPodAutoscaler scaled replica set app-checkout-service to 8 nodes.',
    component: 'hpa_controller',
    payload: `{"target_metric": "cpu", "current_avg_pct": 82, "desired_replicas": 8, "current_replicas": 5}`
  },
  {
    id: 'log-8',
    timestamp: '2026-06-13T08:15:30Z',
    provider: 'azure',
    service: 'VirtualMachine',
    resourceId: 'res-azure-vm-2',
    level: 'error',
    message: 'VM stopped unexpectedly: Hypervisor reported emergency hardware reallocation failed.',
    component: 'azure_agent',
    payload: `{"reason": "HostEmergencyStop", "reallocate_retry": false, "code": "HRESULT:0x80004005"}`
  }
];

// OpenTelemetry Distributed Traces
export const initialTraces: TraceFlow[] = [
  {
    traceId: 'tr-checkout-001a4e',
    rootServiceName: 'sales-gateway-api',
    totalDurationMs: 482,
    timestamp: '2026-06-13T08:24:50Z',
    status: 'error',
    spans: [
      {
        id: 'span-root',
        name: 'POST /v2/checkout',
        serviceName: 'gateway-api',
        startTime: '0ms',
        endTime: '482ms',
        durationMs: 482,
        status: 'error',
        attributes: { 'http.status': 500, 'http.mimetype': 'application/json', 'client.ip': '192.168.12.5' }
      },
      {
        id: 'span-auth',
        name: 'gRPC SessionValidate',
        serviceName: 'auth-service',
        parentSpanId: 'span-root',
        startTime: '4ms',
        endTime: '22ms',
        durationMs: 18,
        status: 'ok',
        attributes: { 'auth.strategy': 'jwt', 'user.id': 'usr-92831' }
      },
      {
        id: 'span-payment',
        name: 'POST /charge-async',
        serviceName: 'checkout-microservice',
        parentSpanId: 'span-root',
        startTime: '30ms',
        endTime: '478ms',
        durationMs: 448,
        status: 'error',
        attributes: { 'retry.attempts': 3, 'exception.type': 'ConnectionException' }
      },
      {
        id: 'span-db-query',
        name: 'UPDATE customer_ledger',
        serviceName: 'postgres-aurora',
        parentSpanId: 'span-payment',
        startTime: '110ms',
        endTime: '445ms',
        durationMs: 335,
        status: 'error',
        attributes: { 'db.sql': 'UPDATE ledger SET active=1 WHERE cust_id=?', 'error.message': 'Connection pool exhausted, query queue timeout' }
      }
    ]
  },
  {
    traceId: 'tr-ingest-8402ff',
    rootServiceName: 'hadoop-master-node',
    totalDurationMs: 125,
    timestamp: '2026-06-13T08:21:40Z',
    status: 'ok',
    spans: [
      {
        id: 'span-h-root',
        name: 'IngestBatchRaw',
        serviceName: 'hadoop-master',
        startTime: '0ms',
        endTime: '125ms',
        durationMs: 125,
        status: 'ok',
        attributes: { 'batch.records': 45000, 'pipeline.routing': 'compression-lz4' }
      },
      {
        id: 'span-spanner-fetch',
        name: 'SpannerBatchRead',
        serviceName: 'spanner-graph',
        parentSpanId: 'span-h-root',
        startTime: '12ms',
        endTime: '38ms',
        durationMs: 26,
        status: 'ok',
        attributes: { 'spanner.session': 'session-3882bbd', 'read.rows': 4120 }
      },
      {
        id: 'span-upload-bucket',
        name: 'GCS PUT Object',
        serviceName: 'raw-pipeline-bucket',
        parentSpanId: 'span-h-root',
        startTime: '45ms',
        endTime: '122ms',
        durationMs: 77,
        status: 'ok',
        attributes: { 'bucket.uri': 'gs://gcp-uncompressed-raw-pipeline-bucket/batch-7712.json', 'file.size_bytes': 4581102 }
      }
    ]
  }
];

// Threshold-based customizable alert rules
export const initialAlertRules: AlertRule[] = [
  {
    id: 'rule-cpu-critical',
    name: 'Severe VM CPU Breaching 90%',
    provider: 'all',
    resourceType: 'vm',
    metric: 'cpu',
    operator: 'gt',
    threshold: 90,
    evaluationWindowMin: 5,
    severity: 'critical',
    notificationChannels: { email: true, slack: true, teams: false, webhook: true },
    isActive: true
  },
  {
    id: 'rule-rds-connections',
    name: 'RDS DB Connections High Warning',
    provider: 'aws',
    resourceType: 'database',
    metric: 'cpu', // Will match connections logically in engine
    operator: 'gt',
    threshold: 800,
    evaluationWindowMin: 3,
    severity: 'warning',
    notificationChannels: { email: false, slack: true, teams: false, webhook: false },
    isActive: true
  },
  {
    id: 'rule-gcs-ingest-spike',
    name: 'Object Storage Network Traffic Influx',
    provider: 'gcp',
    resourceType: 'all',
    metric: 'network_spike',
    operator: 'gt',
    threshold: 400, // MB/s
    evaluationWindowMin: 10,
    severity: 'warning',
    notificationChannels: { email: true, slack: false, teams: true, webhook: false },
    isActive: true
  },
  {
    id: 'rule-budget-breach',
    name: 'Enterprise Cloud Daily Cost Spike',
    provider: 'all',
    resourceType: 'all',
    metric: 'cost_spike',
    operator: 'gt',
    threshold: 50, // % cost increase
    evaluationWindowMin: 60,
    severity: 'critical',
    notificationChannels: { email: true, slack: true, teams: true, webhook: true },
    isActive: true
  }
];

// Active Incident incidents
export const initialIncidents: ActiveIncident[] = [
  {
    id: 'inc-1',
    ruleId: 'rule-cpu-critical',
    name: 'Severe VM CPU Breaching 90%',
    resourceId: 'res-aws-vm-2',
    resourceName: 'aws-prod-checkout-microservice',
    provider: 'aws',
    metricName: 'CPU Utilization',
    currentValue: 98,
    thresholdValue: 90,
    severity: 'critical',
    timestamp: '2026-06-13T08:24:10Z',
    status: 'active',
    aiRecommendation: 'High heap allocation is triggering frequent full JVM Garbage Collection (GC) sweeps on this service. Suggest taking heap dumps, scaling from m5.large to m5.xlarge, or enabling EKS HPA to divide requests.'
  },
  {
    id: 'inc-2',
    ruleId: 'rule-rds-connections',
    name: 'RDS DB Connections High Warning',
    resourceId: 'res-aws-db',
    resourceName: 'aws-prod-postgres-aurora',
    provider: 'aws',
    metricName: 'DB Connections Count',
    currentValue: 954,
    thresholdValue: 800,
    severity: 'warning',
    timestamp: '2026-06-13T08:24:45Z',
    status: 'acknowledged',
    aiRecommendation: 'Active connections are lingering in the WaitState. This points to connection pooling starvation. Recommend enabling Proxy SQL pooling or scaling the Aurora Instance configuration and analyzing blocking SQL writes.'
  }
];

// Detailed Cost Metrics breakdown
export const initialCostMetrics: CostMetric[] = [
  // AWS spending
  { provider: 'aws', service: 'Amazon EC2', amount: 5240, month: 'June', project: 'Checkout Core', department: 'Commerce', region: 'us-east-1' },
  { provider: 'aws', service: 'Amazon RDS', amount: 4800, month: 'June', project: 'Checkout Core', department: 'Commerce', region: 'us-east-1' },
  { provider: 'aws', service: 'Amazon EKS', amount: 3200, month: 'June', project: 'Microservice Container Mesh', department: 'Infrastructure', region: 'us-east-1' },
  { provider: 'aws', service: 'Amazon S3', amount: 1540, month: 'June', project: 'Enterprise Reporting logs', department: 'Enterprise Ops', region: 'us-east-1' },

  // GCP spending
  { provider: 'gcp', service: 'Google Kubernetes Engine', amount: 3800, month: 'June', project: 'Analytics Pipeline', department: 'Business Intel', region: 'us-central1' },
  { provider: 'gcp', service: 'Cloud Spanner', amount: 6200, month: 'June', project: 'Core Customer Database', department: 'Operations', region: 'us-central1' },
  { provider: 'gcp', service: 'Cloud Storage', amount: 2450, month: 'June', project: 'Datalake Big Data', department: 'Business Intel', region: 'us-central1' },

  // Azure spending
  { provider: 'azure', service: 'Azure Virtual Machines', amount: 1400, month: 'June', project: 'CRM Integrator', department: 'Enterprise Marketing', region: 'westeurope' },
  { provider: 'azure', service: 'Azure Cosmos DB', amount: 3900, month: 'June', project: 'Global Sales CRM', department: 'Enterprise Sales', region: 'westeurope' }
];

// Resource Rightsizing Guidelines
export const initialRightsizingRecommendations: RightsizingRecommendation[] = [
  {
    id: 'opt-1',
    resourceId: 'res-aws-vm-1',
    resourceName: 'aws-prod-k8s-node-1',
    provider: 'aws',
    resourceType: 'Virtual Machine',
    currentConfiguration: 't3.xlarge (4 vCPUs, 16 GiB Memory)',
    recommendedConfiguration: 't3.large (2 vCPUs, 8 GiB Memory)',
    estimatedMonthlySavings: 135.20,
    reasoning: 'Average CPU is under 12% with a max peak of 24% throughout the past 30 days. Current configuration is consistently over-provisioned.',
    confidenceRating: 'high'
  },
  {
    id: 'opt-2',
    resourceId: 'res-gcp-vm-bigdata',
    resourceName: 'gcp-hadoop-master-node',
    provider: 'gcp',
    resourceType: 'Virtual Machine',
    currentConfiguration: 'n2-standard-16 (16 vCPUs, 64 GiB Memory)',
    recommendedConfiguration: 'n2-standard-8 (8 vCPUs, 32 GiB Memory)',
    estimatedMonthlySavings: 384.50,
    reasoning: 'RAM saturation never exceeded 31% in trailing metrics. Down-stepping the configuration cuts costs with zero runtime SLA impact.',
    confidenceRating: 'medium'
  },
  {
    id: 'opt-3',
    resourceId: 'res-aws-db',
    resourceName: 'aws-prod-postgres-aurora',
    provider: 'aws',
    resourceType: 'Database',
    currentConfiguration: 'db.r6g.2xlarge (8 vCPUs, 64 GiB Memory)',
    recommendedConfiguration: 'db.r6g.xlarge (4 vCPUs, 32 GiB Memory)',
    estimatedMonthlySavings: 450.00,
    reasoning: 'Unused read replicas detected during night schedules. Consider enabling Serverless Autoscale mode for automatic sleep intervals.',
    confidenceRating: 'low'
  }
];

// Compliance and Security Posture Checks
export const initialSecurityPostureChecks: SecurityPostureCheck[] = [
  {
    id: 'sec-1',
    provider: 'aws',
    category: 'Network',
    title: 'Port 22 SSH open directly to global address range 0.0.0.0/0',
    description: 'Found open SSH ingress routing rules in production EC2 security group, allowing unauthenticated brute-force attacks.',
    severity: 'high',
    complianceStandards: ['ISO 27001', 'SOC 2'],
    status: 'failed',
    resourceId: 'res-aws-vm-2'
  },
  {
    id: 'sec-2',
    provider: 'azure',
    category: 'Encryption',
    title: 'Cosmos DB Storage account does not force TLS 1.2 minimum encryption',
    description: 'The Cosmos API ledger endpoint accepts outdated SSL and TLS 1.0 connections, violating data transfer regulations.',
    severity: 'medium',
    complianceStandards: ['SOC 2', 'GDPR', 'HIPAA'],
    status: 'failed',
    resourceId: 'res-azure-cosmos'
  },
  {
    id: 'sec-3',
    provider: 'aws',
    category: 'IAM',
    title: 'Highly-privileged Admin access policy assigned to developer role',
    description: 'EKS cluster developer role holds wildcards (*:*) actions instead of restricted namespaces credentials mapping.',
    severity: 'high',
    complianceStandards: ['ISO 27001', 'SOC 2'],
    status: 'warning',
    resourceId: 'res-aws-k8s'
  },
  {
    id: 'sec-4',
    provider: 'gcp',
    category: 'Logging',
    title: 'BigData Storage bucket data manipulation logging disabled',
    description: 'Audit logs tracking object creation, replacement, and decryption are omitted inside bucket rules configuration.',
    severity: 'medium',
    complianceStandards: ['ISO 27001', 'GDPR', 'HIPAA'],
    status: 'failed',
    resourceId: 'res-gcp-bucket'
  },
  {
    id: 'sec-5',
    provider: 'aws',
    category: 'Data Storage',
    title: 'Billing statements storage bucket has AES-256 asset encryption enabled',
    description: 'Asset encryption strictly satisfies cloud regulations on cold file storage and prevents raw partition reads.',
    severity: 'low',
    complianceStandards: ['ISO 27001', 'SOC 2', 'GDPR', 'HIPAA'],
    status: 'passed',
    resourceId: 'res-aws-s3-1'
  }
];

// System Audit Logs of staff actions
export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'aud-1',
    timestamp: '2026-06-13T08:21:40Z',
    username: 'admin@cloudobserve.corp',
    role: 'Super Admin',
    action: 'Cloud Integration: connected account (gcp-core-analytics-prod)',
    status: 'success',
    details: 'Service Account JSON uploaded. Successfully tested credential authorization and synced GKE clusters metadata.',
    ipAddress: '192.168.1.110'
  },
  {
    id: 'aud-2',
    timestamp: '2026-06-13T08:15:10Z',
    username: 'ops-lead@cloudobserve.corp',
    role: 'Operator',
    action: 'Alert Rule Modified: Severe VM CPU Breaching 90%',
    status: 'success',
    details: 'Changed threshold rating from 85% to 90% and attached Slack webhook target.',
    ipAddress: '192.168.1.144'
  },
  {
    id: 'aud-3',
    timestamp: '2026-06-13T07:44:12Z',
    username: 'viewer-staff@cloudobserve.corp',
    role: 'Viewer',
    action: 'CSV Report Download: June Cloud Costs Summary',
    status: 'success',
    details: 'Queried aggregated costs matrix across 3 active clouds for department Commerce.',
    ipAddress: '10.230.12.87'
  }
];
