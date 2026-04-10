export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

  const numToWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 ? numToWords(n % 100) : '');
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 ? numToWords(n % 1000) : '');
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 ? numToWords(n % 100000) : '');
    return numToWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 ? numToWords(n % 10000000) : '');
  };

  const whole = Math.floor(num);
  const decimal = Math.round((num - whole) * 100);
  
  if (whole === 0) return 'Zero Rupees';
  
  let words = numToWords(whole) + 'Rupees';
  if (decimal > 0) {
    words += ' and ' + (decimal < 20 ? a[decimal] : b[Math.floor(decimal / 10)] + a[decimal % 10]) + 'Paise';
  }
  return words + ' Only';
}
