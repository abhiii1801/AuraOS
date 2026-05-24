import { Database, GitCommit, FileText, HardDrive, FolderOpen } from 'lucide-react';

export default function VaultKPIs({ kpis }) {
  const Stat = ({ label, value, icon: Icon, colorClass, bgClass }) => (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`p-3 rounded-2xl mb-4 ${bgClass}`}>
        <Icon size={24} className={colorClass} strokeWidth={2} />
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{value}</h3>
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider text-center">{label}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex items-center">
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-50 w-full">
        <Stat label="Total Notes" value={kpis.total_notes.toLocaleString()} icon={FileText} colorClass="text-aura-purple" bgClass="bg-aura-purple/10" />
        <Stat label="Connections" value={kpis.total_connections.toLocaleString()} icon={GitCommit} colorClass="text-emerald-500" bgClass="bg-emerald-500/10" />
        <Stat label="Projects" value={kpis.projects} icon={FolderOpen} colorClass="text-blue-500" bgClass="bg-blue-500/10" />
        <Stat label="This Week" value={`+${kpis.new_this_week}`} icon={Database} colorClass="text-orange-500" bgClass="bg-orange-500/10" />
        <Stat label="Vault Size" value={kpis.storage_used} icon={HardDrive} colorClass="text-gray-500" bgClass="bg-gray-500/10" />
      </div>
    </div>
  );
}