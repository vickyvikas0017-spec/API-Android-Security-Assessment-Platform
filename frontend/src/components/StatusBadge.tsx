import React from 'react';

interface StatusBadgeProps {
  label: string;
  type?: 'severity' | 'status' | 'method' | 'generic';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, type = 'status' }) => {
  const norm = (label || '').toLowerCase();

  let colorClasses = 'bg-gray-100 text-gray-800 border-gray-200';

  if (type === 'severity') {
    if (norm === 'critical') colorClasses = 'bg-red-50 text-red-700 border-red-200 font-semibold';
    else if (norm === 'high') colorClasses = 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
    else if (norm === 'medium') colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    else if (norm === 'low') colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
    else colorClasses = 'bg-gray-50 text-gray-600 border-gray-200';
  } else if (type === 'method') {
    if (norm === 'get') colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
    else if (norm === 'post') colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 font-bold';
    else if (norm === 'put') colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
    else if (norm === 'patch') colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
    else if (norm === 'delete') colorClasses = 'bg-red-50 text-red-700 border-red-200 font-bold';
  } else {
    if (norm === 'verified' || norm === 'allowed' || norm === 'completed' || norm === 'tested' || norm === 'implemented') {
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (norm === 'vulnerable' || norm === 'denied' || norm === 'not implemented') {
      colorClasses = 'bg-red-50 text-red-700 border-red-200 font-semibold';
    } else if (norm === 'in progress' || norm === 'pending' || norm === 'not verified') {
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${colorClasses}`}>
      {label}
    </span>
  );
};

