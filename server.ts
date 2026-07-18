/**
 * Multi-Cloud Monitoring Platform - Full Stack Server
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ES module path resolution equivalents to CommonJS variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-initialized Gemini Client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      try {
        geminiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
        console.log('Gemini AI Client successfully initialized.');
      } catch (err) {
        console.error('Failed to initialize GoogleGenAI client:', err);
      }
    } else {
      console.warn('GEMINI_API_KEY environment variable is dummy or missing. Gemini AI will run in simulation mode.');
    }
  }
  return geminiClient;
}

const app = express();
const PORT = 3000;

// Body parser middleware
app.use(express.json());

// API: Health status check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiStatus: !!process.env.GEMINI_API_KEY ? 'present' : 'simulated'
  });
});

// API: Multi-Cloud Gemini Analysis & Recommendations
app.post('/api/gemini/analyze', async (req, res) => {
  const { type, payload, customPrompt } = req.body;

  if (!type || !payload) {
    return res.status(400).json({ error: 'Missing type or payload argument' });
  }

  // Construct context-aware AI prompts based on item type
  let systemText = 'You are a Senior Principal Cloud Architect, Reliability Specialist, and Security Auditor. You explain cloud occurrences and provide clear, actionable suggestions.';
  let promptText = '';

  switch (type) {
    case 'log':
      systemText = 'You are an SRE Cloud Operator. Analyze this infrastructure log error and suggest the single most probable root cause and immediate corrective command line procedures in markdown.';
      promptText = `Analyze this cloud telemetry log:\nSource Provider: ${payload.provider}\nService: ${payload.service}\nLog Level: ${payload.level}\nMessage: ${payload.message}\nTelemetry Payload: ${payload.payload}`;
      break;

    case 'recommendation':
      systemText = 'You are a Cloud FinOps Optimizer. Evaluate the provided system performance metrics and configuration, detailing how to resize safely and secure maximum budget savings without causing latency spikes.';
      promptText = `Analyze this rightsizing recommendation:\nResource: ${payload.resourceName}\nProvider: ${payload.provider}\nResource Type: ${payload.resourceType}\nCurrent Rig: ${payload.currentConfiguration}\nRecommended Rig: ${payload.recommendedConfiguration}\nEst. Savings: $${payload.estimatedMonthlySavings}/mo\nAudit Reasoning: ${payload.reasoning}`;
      break;

    case 'alert':
      systemText = 'You are an Incident Handler. Determine initial triage recommendations and incident control steps based on this active critical monitoring alert.';
      promptText = `Analyze this active cloud outage alert:\nIncident: ${payload.name}\nResource: ${payload.resourceName}\nProvider: ${payload.provider}\nMetric: ${payload.metricName}\nCurrent Value: ${payload.currentValue} (Threshold: ${payload.thresholdValue})\nSeverity: ${payload.severity}\nTime triggered: ${payload.timestamp}`;
      break;

    case 'trace':
      systemText = 'You are an Application Performance Observability Master. Triage this OpenTelemetry trace path, pinpointing which node or transaction is the bottleneck or generator of errors, and how to scale code / databases to solve it.';
      promptText = `Analyze this transaction trace flow metrics:\nTrace ID: ${payload.traceId}\nTrigger Node: ${payload.rootServiceName}\nTotal Duration: ${payload.totalDurationMs}ms\nStatus: ${payload.status}\nDetailed Tracing Nodes:\n${JSON.stringify(payload.spans, null, 2)}`;
      break;

    case 'chat':
    default:
      systemText = 'You are CloudObserve AI, a senior multi-cloud copilot. Answer queries on cost budgets, AWS/Azure/GCP credentials setup, IAM roles, k8s reliability, and general FinOps optimization concisely and professionally with markdown diagrams or code blocks.';
      promptText = customPrompt || `General query about: ${JSON.stringify(payload)}`;
  }

  const client = getGeminiClient();

  if (client) {
    try {
      console.log(`Sending dynamic query to Gemini (${type})...`);
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          systemInstruction: systemText,
          temperature: 0.2
        }
      });

      const textResult = response.text || 'No recommendation could be generated by the model.';
      return res.json({ analysis: textResult, source: 'gemini' });
    } catch (err: any) {
      console.error('Error invoking Gemini model API:', err);
      // Fallback gracefully to high-quality simulated SRE response if key is failing at runtime
      return res.json({
        analysis: getSimulatedAnalysis(type, payload),
        source: 'simulated_fallback',
        error: err.message
      });
    }
  } else {
    // Return high-quality, professional, context-rich simulation matching SRE/FinOps standards
    return res.json({
      analysis: getSimulatedAnalysis(type, payload),
      source: 'simulated'
    });
  }
});

// High-fidelity fallback/offline simulated analysis mapping directly to seed details
function getSimulatedAnalysis(type: string, payload: any): string {
  if (type === 'log') {
    return `### 📊 SRE Diagnostic Triage (Simulated)
**Potential Root Cause:** Out Of Memory (OOM) killer triggered by heap exhaustion.
**Detailed Impact:** The NodeJS instance in the target container exceeded the available allocated RAM boundary (~2GB anonymized RSS) and was terminated cleanly by the Linux kernel scheduler.
**Immediate Remediation Playbook:**
1. **Vertical Scale-up & Rightsize:** Step-up target container spec within your Kubernetes/ECS definition to at least 4GB memory limits.
2. **Node Heap Argument Adjustment:** Override Node.js runtime parameters using \`--max-old-space-size=3072\` to match container limits.
3. **Audit Garbage Collection:** Inspect the event loop logs around \`${payload.timestamp || 'now'}\` to check for circular object leaks.`;
  }

  if (type === 'recommendation') {
    return `### 💸 FinOps Rightsizing Assessment (Simulated)
**Optimization Safe-Path for \`${payload.resourceName}\`:**
- **Performance Clearance:** Historical metrics show the CPU has maintained an average utilization of under 15% with zero peaks over 25%. Down-stepping will not trigger SLA penalties.
- **Action Plan:** Go to AWS console or GCP cluster engine, execute instance group resize command:
  \`\`\`bash
  # For GCP Resource Resize
  gcloud compute instances set-machine-type ${payload.resourceName} --machine-type=n2-standard-8
  \`\`\`
- **Projected Return:** Reduces idle infrastructure waste immediately, securing a **$${payload.estimatedMonthlySavings || '135'}** budget release monthly. Confidence is **HIGH**.`;
  }

  if (type === 'alert') {
    return `### 🚨 Active Incident Outage Plan (Simulated)
**Triage level: CRITICAL - Triggered on \`${payload.resourceName}\`**
- **SRE Actions Queue:**
  1. Navigate to the **Observability -> Log Aggregations** log filters set to resource \`${payload.resourceId}\`.
  2. The alert indicates current metrics are holding at **${payload.currentValue}%** which is far above the safe limit of **${payload.thresholdValue}%**.
  3. Execute automated traffic redirect: route all ingress checkout requests to replica-set secondary pools to avoid dropping checkout transactions.
  4. Initiate rollback metrics if this is correlated with a recent release trace.`;
  }

  if (type === 'trace') {
    return `### ⛓️ Distributed Trace Bottleneck Report (Simulated)
**Identified Slow-Path Node:** \`postgres-aurora\` (Directly handles \`UPDATE customer_ledger\`).
**Trace diagnostics:**
- Total duration: \`${payload.totalDurationMs}ms\`. The database call took \`335ms\`, consuming **${Math.round(335 / payload.totalDurationMs * 100)}%** of the entire call-tree latency.
- **Error Source:** \`Connection pool exhausted, query queue timeout\` exception thrown by the driver.
**Actions:**
1. Scale pool configuration boundary on container nodes: increase pool size from 10 to 50 minimum.
2. Ensure you have closed all async SQL database client connections in the middleware code paths.
3. Setup an AWS RDS Proxy pooler in front of Aurora postgres to handle high concurrency.`;
  }

  return `### 💡 CloudObserve Multi-Cloud CoPilot Solution
- Verify service role boundary configurations (IAM, Service Accounts configurations) are attached.
- Review cost optimization profiles regularly to detect orphaned static resources.
- Use the **Centralized Alerts Module** to route threshold metrics via standard Webhooks directly to target operational channels (e.g. Slack/Teams).`;
}

// Prepare static serving or Vite dev mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running server in development mode. Mounting Vite...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running server in production mode. Serving static files...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server launched and ready! Listening on HTTP port ${PORT}`);
  });
}

startServer();
