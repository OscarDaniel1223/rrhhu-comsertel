import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
export default function Linechart({ data }) {


  return (
    <LineChart style={{ width: '100%', height: '250px' }} responsive data={data}>
      <CartesianGrid stroke="#f5f5f5" />
      <XAxis dataKey="name" />
      <YAxis allowDecimals={false} width={100} />
      <Tooltip />
      <Line type="monotone" dataKey="value" name="Ventas" stroke="#5ea1eeff" yAxisId={0} />
    </LineChart>
  );
}