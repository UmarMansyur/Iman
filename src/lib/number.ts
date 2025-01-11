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

export function convert(totalPack: number): {
  slop: string;
  pack: string;
  bal: string;
  karton: string;
} {
  // Validasi input
  if (totalPack <= 0 || isNaN(totalPack)) {
    return {
      slop: "0",
      pack: "0",
      bal: "0",
      karton: "0",
    };
  }

  // Perhitungan
  const slop = totalPack / 10;
  const bal = slop / 20;
  const karton = bal / 4;

  // Fungsi pembantu untuk memformat angka
  const formatNumber = (value: number): string =>
    value < 1000 ? value.toFixed(2).toString() : splitNumber(value);

  return {
    slop: formatNumber(slop),
    pack: formatNumber(totalPack),
    bal: formatNumber(bal),
    karton: formatNumber(karton),
  };
}



export function formatCurrency(number: number): string {
  // return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return number.toLocaleString('id-ID', { style: 'decimal', currency: 'IDR' });
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
