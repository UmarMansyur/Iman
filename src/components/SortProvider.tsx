import { SortContext, SortOrder } from "@/lib/context";
import { createContext, useContext, useState } from "react";

export default function SortProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState({ sortBy: "", sortOrder: "clear" as SortOrder });
  const SortContext = createContext<{ sortBy: string, sortOrder: SortOrder, setSort: (sortBy: string, sortOrder: SortOrder) => void } | null>(null);
  return <SortContext.Provider value={{ sortBy: filters.sortBy, sortOrder: filters.sortOrder as SortOrder, setSort: (sortBy: string, sortOrder: SortOrder) => setFilters({ ...filters, sortBy, sortOrder }) }}>
    {children}
  </SortContext.Provider>;
}

export function useSort() {
  return useContext(SortContext);
}
  
