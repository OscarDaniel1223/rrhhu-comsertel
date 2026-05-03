import Card from 'react-bootstrap/Card';

import ReviewsTables from '../tables/ReviewsTables';
import useFillTable from '../../hooks/useFillTable';
import { reviewsTableServices } from '../../services/tables/reviewsTableServices';

export default function ReviewsCard() {
    const dataReviews = useFillTable(reviewsTableServices, 10000);

    return (

        <div style={{ overflowY: "auto", maxHeight: "400px" }} className="row">
            <div className="col-12">
                <Card style={{ width: "100%" }} className="shadow-sm">
                    <Card.Body>
                        <h3 >Reseñas de este mes</h3>
                        {dataReviews.length > 0 ? (
                            <ReviewsTables data={dataReviews} />
                        ) : (
                            <p>No hay reseñas</p>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}
