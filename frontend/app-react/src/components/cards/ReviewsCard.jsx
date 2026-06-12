import ReviewsTables from '../tables/ReviewsTables';
import useFillTable from '../../hooks/useFillTable';
import { reviewsTableServices } from '../../services/tables/reviewsTableServices';

export default function ReviewsCard() {
    const dataReviews = useFillTable(reviewsTableServices, 10000);

    return (
        <div className="w-full max-h-[400px] overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Reseñas de este mes</h3>
                {dataReviews.length > 0 ? (
                    <ReviewsTables data={dataReviews} />
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No hay reseñas</p>
                )}
            </div>
        </div>
    );
}
