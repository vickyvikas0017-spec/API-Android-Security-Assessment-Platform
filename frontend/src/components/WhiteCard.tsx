import React from 'react';

interface WhiteCardProps {
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const WhiteCard: React.FC<WhiteCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className="p-5 bg-white">{children}</div>
    </div>
  );
};

