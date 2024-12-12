export interface Product {
  id: string;
  name: string;
  type: string;
}

export interface FormProps {
  products: Product[];
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  isMorningShift: boolean;
  setIsMorningShift: (value: boolean) => void;
  shiftAmount: string;
  setShiftAmount: (value: string) => void;
  selectedHour: string;
  setSelectedHour: (value: string) => void;
  selectedMinute: string;
  setSelectedMinute: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formatNumber: (value: string) => string;
} 

