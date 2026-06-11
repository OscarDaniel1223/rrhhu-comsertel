export default function Header({ title, subtitle }) {
    return (
        <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="p-4 shadow-sm">

                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">{title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-0">{subtitle}</p>
            </div>
        </div>
    );
}