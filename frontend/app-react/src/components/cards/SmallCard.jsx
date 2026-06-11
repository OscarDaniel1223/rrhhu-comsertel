const colorMap = {
    primary: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-cyan-600 dark:text-cyan-400',
};

export default function SmallCard({ title, icon, count, color }) {
    const textColorClass = colorMap[color] || '';
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-b-[3px] border-b-[#4a82fc] rounded-lg shadow-sm hover:shadow-md p-4 transition-all duration-200">
            <small className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</small>

            <div className="flex justify-between items-center mt-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{count}</span>
                <i className={`${icon} ${textColorClass} text-2xl`}></i>
            </div>
        </div>
    );
}