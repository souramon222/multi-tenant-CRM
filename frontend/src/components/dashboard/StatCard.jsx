import React from 'react';

const StatCard = ({ title, value, subtext, icon, colorClass, bgColorClass, hoverBgColorClass }) => {
    return (
        <div className="bg-card rounded-lg p-5 shadow-sm border border-main group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] sm:text-xs text-muted uppercase tracking-widest font-bold font-sans">{title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-main mt-1.5">{value}</p>
                    <p className="text-[10px] sm:text-xs text-muted mt-1.5 font-medium">{subtext}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${bgColorClass} flex items-center justify-center ${hoverBgColorClass} transition-colors`}>
                    {React.cloneElement(icon, { size: 22, className: colorClass })}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
