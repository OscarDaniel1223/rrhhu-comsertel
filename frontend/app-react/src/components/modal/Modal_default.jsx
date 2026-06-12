export default function Modal_default({ show, onHide, title, children }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop oscuro */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
                onClick={onHide}
            ></div>
            
            {/* Contenedor del Modal */}
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 transition-all transform scale-100 duration-200 z-10 overflow-hidden">
                {/* Cabecera */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {title}
                    </h3>
                    <button 
                        onClick={onHide} 
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                    >
                        <i className="bi bi-x-lg text-lg"></i>
                    </button>
                </div>
                
                {/* Cuerpo */}
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {children}
                </div>
            </div>
        </div>
    );
}