import { Button } from "../ui/button";


const QuickActions = () => (
  <div className="flex gap-2 mt-4">
    <Button variant="default" className="bg-blue-600">Tambah Pengguna</Button>
    <Button variant="secondary">Tambah Pabrik</Button>
  </div>
);

export default QuickActions;