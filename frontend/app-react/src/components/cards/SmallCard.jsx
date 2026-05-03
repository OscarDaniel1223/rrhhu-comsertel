import Card from 'react-bootstrap/Card';

export default function SmallCard({ title, icon, count, color }) {
    return (
        <div className="card shadow-sm " style={{ borderBottom: `3px solid #4a82fcff` }}>
            <div className="card-body">
                <small >{title}</small>

                <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="fs-3 fw-bold">{count}</span>
                    <i className={`${icon} text-${color} fs-4`}></i>
                </div>
            </div>
        </div>
    );
}