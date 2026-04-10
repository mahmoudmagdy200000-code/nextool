import React from 'react';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

interface ProgressWidgetProps {
  contacted: number;
  totalSaved: number;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ contacted, totalSaved }) => {
  const progressPercentage = totalSaved > 0 ? Math.round((contacted / totalSaved) * 100) : 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center min-w-[260px] relative overflow-hidden">
      <div className="flex justify-between items-end mb-3 relative z-10">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Outreach Progress</h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold text-slate-900">{contacted}</span>
            <span className="text-sm font-semibold text-slate-500">/ {totalSaved}</span>
          </div>
        </div>
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
          <TrendingUp size={20} />
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 relative z-10">
        <div 
          className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none">
         <CheckCircle2 size={120} />
      </div>
    </div>
  );
};
