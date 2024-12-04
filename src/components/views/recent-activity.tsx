import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";


const RecentActivity = () => (
  <Card>
    <CardHeader>
      <CardTitle>Aktivitas Terbaru</CardTitle>
    </CardHeader>
    <CardContent>
      <ul>
        <li>Pengguna baru: John Doe - 2 jam yang lalu</li>
        <li>Pabrik baru: PT. XYZ - 3 jam yang lalu</li>
      </ul>
    </CardContent>
  </Card>
);

export default RecentActivity;