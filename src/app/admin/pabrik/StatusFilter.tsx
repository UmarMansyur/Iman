
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface StatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ selectedStatus, onStatusChange }) => {
  const statuses = ["Aktif", "Tidak Aktif", "Belum Verifikasi"];

  return (
    <div className="flex gap-2">
      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="px-4 py-3 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 w-[180px]">
          <SelectValue placeholder="Pilih Status" />
        </SelectTrigger>
        <SelectContent>
        <SelectItem value="Semua">Semua</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusFilter; 