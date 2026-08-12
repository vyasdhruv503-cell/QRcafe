import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: 'amber' | 'indigo' | 'emerald' | 'blue' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'amber',
}) => {
  const colors = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#E2DCD5] shadow-xs flex items-center justify-between transition-all hover:border-[#D4C9BD]">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-[#1C130E] tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-stone-500 font-medium mt-1">{subtitle}</p>}
      </div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
