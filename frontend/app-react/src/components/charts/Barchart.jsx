import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts';


export default function Barchart({ data, height }) {
    return (
        <BarChart style={{ width: '100%', height: height }}
            responsive
            data={data}>
            <XAxis dataKey="name" />
            <YAxis

                allowDecimals={false}
                width={100}
            />
            <Tooltip />
            <Bar dataKey="value" name="Ventas" fill="#5ea1eeff" />
        </BarChart>
    );
}