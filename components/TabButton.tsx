
import React from 'react';

interface TabButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  icon: React.FC<{ className?: string }>;
}

export const TabButton: React.FC<TabButtonProps> = ({ onClick, isActive, children, icon: Icon }) => {
  const baseClasses = "flex items-center space-x-2 px-4 py-2 text-sm sm:text-base font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-secondary whitespace-nowrap";
  const activeClasses = "bg-brand-secondary text-white shadow-md";
  const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </button>
  );
};
