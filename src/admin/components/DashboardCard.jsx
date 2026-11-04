import React from 'react';

export default function DashboardCard({
  title,
  value,
  subtext,
  icon,
  trend,
  trendPositive = true,
  bgColor = "bg-white",
  borderColor = "border-stone-200"
}) {
  return (
    <div className={`p-5 rounded-2xl border ${borderColor} ${bgColor} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{title}</p>
          <h4 className="text-2xl font-bold font-serif text-[#2e2a26]">{value}</h4>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#FAF6F0] border border-stone-200/80 flex items-center justify-center text-[#3a4d39] group-hover:scale-105 transition-transform">
          {icon}
        </div>
      </div>
      
      {(subtext || trend) && (
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>{subtext}</span>
          {trend && (
            <span className={`inline-flex items-center font-medium ${
              trendPositive ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

