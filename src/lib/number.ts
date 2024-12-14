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
  return {
    slop: `${slop.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
    pack: `${number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
    bal: `${bal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
    karton: `${karton.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
  };
}
