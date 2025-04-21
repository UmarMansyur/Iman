/* eslint-disable @typescript-eslint/no-explicit-any */
const formatNumber = (value: any) => {
  const number = value.replace(/\D/g, '');
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatWithComma = (value: string) => {
  const cleanValue = value.replace(/[^\d,]/g, '');
  const parts = cleanValue.split(',');
  let integerPart = parts[0];
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.length > 1 ? `${integerPart},${parts[1]}` : integerPart;
};

const formatNumberWithComma = (value: string) => {
  if (!value) return '';
  const stringValue = value.toString();
  const parts = stringValue.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.length > 1 ? `${parts[0]},${parts[1]}` : parts[0];
};

const parseFormattedNumber = (value: string) => {
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};


const toNumber = (value: string) => {
  return parseFloat(value.replace(/\./g, '').replace(/,/g, '.'));
};

const toRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'decimal', currency: 'IDR' }).format(value);
};

export { formatNumber, formatWithComma, formatNumberWithComma, parseFormattedNumber, toNumber, toRupiah };