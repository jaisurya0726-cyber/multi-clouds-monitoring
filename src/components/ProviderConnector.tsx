import React, { useState } from 'react';
import {
  Key,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cloud,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';
import { CloudAccount, CloudProvider, ConnectionType } from '../types';

interface ProviderConnectorProps {
  accounts: CloudAccount[];
  onAddAccount: (account: Partial<CloudAccount>) => void;
  onDeleteAccount: (id: string) => void;
  onTriggerAuditLog: (action: string) => void;
}

export default function ProviderConnector({
  accounts,
  onAddAccount,
  onDeleteAccount,
  onTriggerAuditLog
}: ProviderConnectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [provider, setProvider] = useState<CloudProvider>('aws');
  const [accountName, setAccountName] = useState('');
  const [region, setRegion] = useState('');

  // AWS specific
  const [roleArn, setRoleArn] = useState('');
  const [externalId, setExternalId] = useState('');

  // Azure specific
  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [secretKey, setSecretKey] = useState('');

  // GCP specific
  const [projectId, setProjectId] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [saJsonFileContent, setSaJsonFileContent] = useState('');
  const [saFileName, setSaFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Form states
  const [isConnecting, setIsConnecting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processGcpFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processGcpFile(files[0]);
    }
  };

  const processGcpFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setFormError('Invalid file type. Please upload a valid service account JSON credentials file.');
      return;
    }
    setSaFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.project_id && parsed.client_email) {
          setProjectId(parsed.project_id);
          setClientEmail(parsed.client_email);
          setSaJsonFileContent(text);
          setFormError('');
        } else {
          setFormError('JSON format is missing required "project_id" or "client_email" keys.');
        }
      } catch (err) {
        setFormError('Error parsing credentials JSON. Please verify syntax.');
      }
    };
    reader.readAsText(file);
  };

  const handleConnectAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!accountName.trim()) {
      setFormError('Please provide a descriptive connection name.');
      return;
    }
    if (!region.trim()) {
      setFormError('Please specify the primary target cloud deployment region.');
      return;
    }

    // Provider specific validation checks
    if (provider === 'aws') {
      if (!roleArn.startsWith('arn:aws:iam::') || roleArn.split('/').length < 2) {
        setFormError('Please specify a valid AWS IAM Role ARN: arn:aws:iam::[AccountID]:role/[RoleName]');
        return;
      }
      if (!externalId.trim()) {
        setFormError('IAM Trust relationship requires a secure external ID validation key.');
        return;
      }
    } else if (provider === 'azure') {
      if (!tenantId.match(/^[0-9a-f-]{36}$/i) || !clientId.match(/^[0-9a-f-]{36}$/i)) {
        setFormError('Please ensure Tenant ID & Client UUID specifications match valid Microsoft GUID structures.');
        return;
      }
      if (!secretKey.trim()) {
        setFormError('Azure Client Credentials requires service principal password/secret key.');
        return;
      }
    } else if (provider === 'gcp') {
      if (!projectId.trim() || !clientEmail.trim() || !saJsonFileContent.trim()) {
        setFormError('Please upload your Google Cloud Platform service account credential JSON descriptor.');
        return;
      }
    }

    setIsConnecting(true);

    // Simulate Cloud Provider Trust Handshake Connection Validation check
    setTimeout(() => {
      setIsConnecting(false);

      const isSuccess = Math.random() < 0.92; // 8% drift simulation failure rate

      if (!isSuccess) {
        setFormError(`Connection Attempt Failed: The credentials supplied did not authorize with the provider's STS endpoint. Please audit cloud roles permissions policies.`);
        onTriggerAuditLog(`Cloud account connection attempt failed for: ${accountName}`);
        return;
      }

      // Populate connection models
      const newAccountObj: Partial<CloudAccount> = {
        id: `acc-${provider}-${Math.random().toString(36).slice(2, 7)}`,
        name: accountName,
        provider,
        connectionType:
          provider === 'aws'
            ? 'iam_role'
            : provider === 'azure'
            ? 'service_principal'
            : 'service_account_json',
        status: 'connected',
        region,
        credentials: {
          roleArn: provider === 'aws' ? roleArn : undefined,
          externalId: provider === 'aws' ? externalId : undefined,
          tenantId: provider === 'azure' ? tenantId : undefined,
          clientId: provider === 'azure' ? clientId : undefined,
          projectId: provider === 'gcp' ? projectId : undefined,
          clientEmail: provider === 'gcp' ? clientEmail : undefined,
          hasKeyJson: provider === 'gcp',
          secretKeyMasked: provider === 'azure' ? '•••••••••••••••••••••••••••••' : undefined
        },
        createdAt: new Date().toISOString()
      };

      onAddAccount(newAccountObj);
      onTriggerAuditLog(`Connected Cloud Account Successfully: ${accountName} (${provider.toUpperCase()})`);

      // Reset form variables
      setAccountName('');
      setRegion('');
      setRoleArn('');
      setExternalId('');
      setTenantId('');
      setClientId('');
      setSecretKey('');
      setProjectId('');
      setClientEmail('');
      setSaJsonFileContent('');
      setSaFileName('');
      setShowAddForm(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="cloud-account-connector-view">
      {/* Overview Intro Banner */}
      <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2" id="provider-connector-heading">
            <Cloud className="h-4 w-4 text-blue-500" /> Secure Cloud Account Integrations
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Associate active IAM roles, OAuth service secrets, and API access agents safely with full-mesh secure storage.
          </p>
        </div>

        <button
          id="btn-show-add-form"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-750 text-white font-bold px-4 py-2 rounded text-xs transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          {showAddForm ? 'Close Connector Panel' : 'Connect New Cloud Account'}
        </button>
      </div>

      {showAddForm && (
        <form
          id="add-cloud-account-form"
          onSubmit={handleConnectAccount}
          className="p-5 rounded-lg border border-[#2D333B] bg-[#151921] space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#2D333B] pb-3">
            <h3 className="text-xs font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
              <Key className="h-3.5 w-3.5 text-blue-500" /> Authenticated Provider Trust Boundary Setup
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">STS Validation Layer Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Choose Cloud Platform Provider */}
            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                Target Cloud Provider
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#0B0E14] p-1 rounded border border-[#2D333B] select-none">
                {(['aws', 'azure', 'gcp'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setProvider(p);
                      setRegion(p === 'aws' ? 'us-east-1' : p === 'azure' ? 'westeurope' : 'us-central1');
                    }}
                    className={`py-1.5 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${
                      provider === p
                        ? 'bg-[#2D333B] text-blue-400 font-bold border border-blue-500/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Info Tips based on provider */}
              <div className="mt-4 p-3.5 rounded bg-[#0B0E14] border border-[#2D333B] text-[11px] text-gray-400 space-y-2 leading-relaxed">
                <span className="text-[11px] font-bold text-[#E0E0E0] block flex items-center gap-1 uppercase tracking-wider">
                  <Lock className="h-3.5 w-3.5 text-blue-500" /> STS Protocol Instructions
                </span>
                {provider === 'aws' && (
                  <p>
                    Create a cross-account IAM Role within your AWS management console. Grant a read-only policy
                    restricted permission matrix and configure dynamic trust relations applying the secure external ID.
                  </p>
                )}
                {provider === 'azure' && (
                  <p>
                    Provision an Azure App Directory Registration (Service Principal). Assign Reader/Monitoring
                    Read-Only roles within the Azure portal subscription access panel.
                  </p>
                )}
                {provider === 'gcp' && (
                  <p>
                    Download a private credentials key JSON for your restricted GCP Service Account. Drag and drop
                    that JSON directly below to parse project fields.
                  </p>
                )}
              </div>
            </div>

            {/* Inputs forms */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                    Connection Identifier Name
                  </label>
                  <input
                    type="text"
                    id="input-acc-name"
                    required
                    placeholder="e.g. AWS Production Billing Cluster"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    className="w-full text-xs bg-[#0B0E14] border border-[#2D333B] focus:border-blue-500 rounded p-2.5 text-white outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                    Target Primary Ingress Region
                  </label>
                  <input
                    type="text"
                    id="input-region"
                    required
                    placeholder="e.g. us-east-1, westeurope"
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    className="w-full text-xs bg-[#0B0E14] border border-[#2D333B] focus:border-blue-500 rounded p-2.5 text-white outline-none font-mono"
                  />
                </div>
              </div>

              {provider === 'aws' && (
                <div className="p-4 rounded bg-[#0B0E14] border border-[#2D333B] space-y-3">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 flex items-center gap-1">
                        Cross-Account AWS IAM Role Arn <HelpCircle className="h-3 w-3 text-slate-500" />
                      </label>
                      <input
                        type="text"
                        id="input-role-arn"
                        placeholder="e.g. arn:aws:iam::123456789012:role/CloudObserveAuditRole"
                        value={roleArn}
                        onChange={e => setRoleArn(e.target.value)}
                        className="w-full text-xs font-mono bg-[#151921] border border-[#2D333B] focus:border-blue-500 rounded p-2.5 text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1 mt-3">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                        STS External Validation ID
                      </label>
                      <input
                        type="text"
                        id="input-external-id"
                        placeholder="e.g. co-ext-secure-9218fb"
                        value={externalId}
                        onChange={e => setExternalId(e.target.value)}
                        className="w-full text-xs font-mono bg-[#151921] border border-[#2D333B] focus:border-blue-500 rounded p-2.5 text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {provider === 'azure' && (
                <div className="p-4 rounded bg-[#0B0E14] border border-[#2D333B] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                        Tenant Active Directory UUID
                      </label>
                      <input
                        type="text"
                        id="input-tenant-id"
                        placeholder="e.g. d647e3a9-bf02-4afc-a434-7a38914c67a5"
                        value={tenantId}
                        onChange={e => setTenantId(e.target.value)}
                        className="w-full text-xs font-mono bg-[#151921] border border-[#2D333B] focus:border-blue-500 rounded p-2.5 text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                        Client App ID UUID
                      </label>
                      <input
                        type="text"
                        id="input-client-id"
                        placeholder="e.g. 8cb385b0-13ad-42ca-8b01-e23f03baff8c"
                        value={clientId}
                        onChange={e => setClientId(e.target.value)}
                        className="w-full text-xs font-mono bg-[#151921] border border-[#2D333B] focus:border-blue-500 rounded p-2.5 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                      Client Secure password secret
                    </label>
                    <input
                      type="password"
                      id="input-secret-key"
                      placeholder="Enter secret credential configuration password"
                      value={secretKey}
                      onChange={e => setSecretKey(e.target.value)}
                      className="w-full text-xs bg-[#151921] border border-[#2D333B] focus:border-blue-500 rounded p-2.5 text-white outline-none"
                    />
                  </div>
                </div>
              )}

              {provider === 'gcp' && (
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                    IAM Credentials JSON Payload Upload
                  </label>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    id="gcp-drop-zone"
                    className={`border-2 border-dashed rounded p-5 text-center transition-all ${
                      isDragOver
                        ? 'border-blue-500 bg-[#1C212B]'
                        : 'border-[#2D333B] bg-[#0B0E14] hover:bg-[#151921]'
                    }`}
                  >
                    <FileText className="h-6 w-6 text-blue-500 mx-auto opacity-70 animate-pulse" />
                    <p className="text-xs text-slate-300 mt-2 font-semibold">
                      {saFileName ? `Attached: ${saFileName}` : 'Drag & drop private Service Account key file (.json)'}
                    </p>
                    <span className="text-[10px] text-gray-500 block mt-1">
                      or click manual browse targets to parse credential structures
                    </span>

                    <input
                      type="file"
                      id="gcp-json-file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('gcp-json-file')?.click()}
                      className="mt-3 bg-[#1C212B] hover:bg-[#2D333B] text-slate-350 px-3 py-1.5 rounded text-[11px] font-semibold transition-all border border-[#2D333B] cursor-pointer"
                    >
                      Browse credential json
                    </button>
                  </div>

                  {projectId && (
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded bg-[#0B0E14] border border-[#2D333B] text-[11px] font-mono">
                      <div>
                        <span className="text-gray-550">Auto Project ID:</span>
                        <div className="text-gray-300 mt-0.5">{projectId}</div>
                      </div>
                      <div>
                        <span className="text-gray-550">Client Email:</span>
                        <div className="text-gray-300 mt-0.5 max-w-xs truncate">{clientEmail}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formError && (
                <div className="flex items-start gap-2 p-3 rounded bg-[#251216] border border-red-500/20 text-xs text-red-450 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  id="btn-form-cancel"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-form-submit"
                  disabled={isConnecting}
                  className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-750 text-white font-bold px-5 py-2 rounded text-xs transition-shadow cursor-pointer disabled:opacity-50"
                >
                  {isConnecting ? 'Verifying Cloud Accounts...' : 'Establish Secure Connection'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Grid of existing cloud integrations */}
      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-6">
        Currently Connected Multi-Cloud Tenancies ({accounts.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="accounts-integration-grid">
        {accounts.map(acc => (
          <div
            key={acc.id}
            id={`card-acc-${acc.id}`}
            className="p-5 rounded-lg border border-[#2D333B] bg-[#151921] hover:border-gray-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
          >
            {/* Provider and Delete buttons */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded border ${
                  acc.provider === 'aws'
                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                    : acc.provider === 'gcp'
                    ? 'border-blue-500/20 bg-blue-500/10 text-blue-400'
                    : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400'
                }`}>
                  <Cloud className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {acc.provider === 'aws' ? 'Amazon Web Services' : acc.provider === 'gcp' ? 'Google Cloud' : 'Azure Cloud'}
                  </h4>
                  <h3 className="text-sm font-semibold text-white mt-0.5">{acc.name}</h3>
                </div>
              </div>

              <button
                id={`btn-del-acc-${acc.id}`}
                onClick={() => {
                  if (confirm(`Disable integration credentials and stop monitoring for ${acc.name}?`)) {
                    onDeleteAccount(acc.id);
                    onTriggerAuditLog(`Disconnected and terminated cloud credentials integration: ${acc.name}`);
                  }
                }}
                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                title="Remove connection credentials"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Credential Spec breakdown */}
            <div className="bg-[#0B0E14] p-3.5 rounded border border-[#2D333B]/60 text-[11px] font-mono space-y-1.5 text-gray-400">
              {acc.provider === 'aws' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auth Method:</span>
                    <span className="text-gray-300">IAM Role Delegation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trust Role:</span>
                    <span className="text-gray-300 max-w-[180px] truncate" title={acc.credentials.roleArn}>
                      {acc.credentials.roleArn?.split('/').pop()}
                    </span>
                  </div>
                </>
              )}
              {acc.provider === 'azure' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auth Method:</span>
                    <span className="text-gray-300">Service Principal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client UUID:</span>
                    <span className="text-gray-300 max-w-[150px] truncate">{acc.credentials.clientId}</span>
                  </div>
                </>
              )}
              {acc.provider === 'gcp' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auth Method:</span>
                    <span className="text-gray-300">Service Account Keyfile</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Email:</span>
                    <span className="text-gray-300 max-w-[180px] truncate" title={acc.credentials.clientEmail}>
                      {acc.credentials.clientEmail}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between pt-1 border-t border-[#2D333B]/40">
                <span className="text-gray-600">Ingress Target:</span>
                <span className="text-gray-500 uppercase">{acc.region}</span>
              </div>
            </div>

            {/* Connection health meter status */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2D333B]/30">
              <span className="text-[10px] text-gray-500">Connected: {new Date(acc.createdAt).toLocaleDateString()}</span>
              {acc.status === 'connected' ? (
                <span className="flex items-center gap-1 text-emerald-400 font-bold uppercase text-[9.5px] bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Fully Synced
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-400 font-bold uppercase text-[9.5px] bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20 animate-pulse">
                  <AlertCircle className="h-2.5 w-2.5" /> Access Denied
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
