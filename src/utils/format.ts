/* eslint-disable @typescript-eslint/no-explicit-any */
const formatNumber = (value: any) => {
  const number = value.replace(/\D/g, '');
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export { formatNumber };