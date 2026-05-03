import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DoubleLineChart({ data }) {
    return (
        <LineChart
            style={{ width: '100%', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
            responsive
            data={data}
            margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-3)" />
            <XAxis dataKey="name" name="Semana" tick={{ fill: 'var(--color-text-3)' }} />
            <YAxis width="auto" name="Ventas" tick={{ fill: 'var(--color-text-3)' }} />
            <Tooltip
                cursor={{
                    stroke: 'var(--color-border-2)',
                }}
                contentStyle={{
                    backgroundColor: 'var(--color-surface-raised)',
                    borderColor: 'var(--color-border-2)',
                }}
            />
            <Legend />
            <Line
                type="monotone"
                dataKey="pv"
                name="Ingresos mes anterior"
                stroke="var(--color-chart-1)"
                dot={{
                    fill: 'var(--color-surface-base)',
                }}
                activeDot={{ r: 8, stroke: 'var(--color-surface-base)' }}
            />
            <Line
                type="monotone"
                dataKey="uv"
                name="Ingresos este mes"
                stroke="var(--color-chart-2)"
                dot={{
                    fill: 'var(--color-surface-base)',
                }}
                activeDot={{ stroke: 'var(--color-surface-base)' }}
            />

        </LineChart>
    );
}