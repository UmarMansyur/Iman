/* eslint-disable @typescript-eslint/no-explicit-any */
// buatkan fungsi untuk jika angkanya sampai di atas 1 juta maka rubah ke 1jt
// buatkan fungsi untuk jika angkanya sampai di atas 1000000000 maka rubah ke 1M
// buatkan fungsi untuk jika angkanya sampai di atas 1000000000000 maka rubah ke 1T
// buatkan fungsi untuk jika angkanya sampai di atas 1000000000000000 maka rubah ke 1Tk

export function formatNumber(number: number): string {
  let result = "";
  if (number >= 1000000000000000) {
    result = `${number / 1000000000000000}Tk`;
  } else if (number >= 1000000000000) {
    result = `${number / 1000000000000}T`;
  } else if (number >= 1000000000) {
    result = `${number / 1000000000}M`;
  } else if (number >= 1000000) {
    result = `${number / 1000000}jt`;
  } else {
    result = `${number}`;
  }

  // split number 3 digit
  result = result.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return result;
}


export function splitNumber(number: number): string {
  let result = "";
  result = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return result;
}

export function convert(number: number): {
  slop: string;
  pack: string;
  bal: string;
  karton: string;
} {
  const slop = number / 10 || 0;
  const bal = slop / 4 || 0;
  const karton = bal / 8 || 0;

  const splitSlop = slop < 1000 ? slop.toString() : splitNumber(slop);
  const splitPack = number < 1000 ? number.toString() : splitNumber(number);
  const splitBal = bal < 1000 ? bal.toString() : splitNumber(bal);
  const splitKarton = karton < 1000 ? karton.toString() : splitNumber(karton);

  return {
    slop: splitSlop,
    pack: splitPack,
    bal: splitBal,
    karton: splitKarton,
  };
}


export function formatCurrency(number: number): string {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


export function parseCurrency(number: string): number {
  if(!number) {
    return 0;
  }
  return parseInt(number.replace(/[^0-9]/g, ''));
}


export function formatCurrencyInput(e: any) {
  const value = e.target.value;
  return parseCurrency(value);
}
