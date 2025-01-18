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

const parseFormattedNumber = (value: string) => {
  return Number(value.replace(/\./g, '').replace(',', '.'));
};

export { formatNumber, formatWithComma, parseFormattedNumber };