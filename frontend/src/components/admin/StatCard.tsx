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
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-stone-900">{value}</h3>
        {subtitle && <p className="text-xs text-stone-500 mt-1">{subtitle}</p>}
      </div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
