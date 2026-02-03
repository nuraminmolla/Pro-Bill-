
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const numberToWords = (num: number): string => {
  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const convertGroup = (nStr: string): string => {
    const n = parseInt(nStr, 10);
    if (n === 0) return '';
    if (n < 20) return a[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return b[tens] + (ones !== 0 ? ' ' + a[ones] : '');
  };

  const inWords = (n: number): string => {
    if (n === 0) return 'zero ';
    let str = '';
    const nStr = n.toString().padStart(9, '0');
    
    const crore = nStr.substring(0, 2);
    const lakh = nStr.substring(2, 4);
    const thousand = nStr.substring(4, 6);
    const hundred = nStr.substring(6, 7);
    const lastTwo = nStr.substring(7, 9);

    if (parseInt(crore, 10) > 0) str += convertGroup(crore) + 'crore ';
    if (parseInt(lakh, 10) > 0) str += convertGroup(lakh) + 'lakh ';
    if (parseInt(thousand, 10) > 0) str += convertGroup(thousand) + 'thousand ';
    if (parseInt(hundred, 10) > 0) str += a[parseInt(hundred, 10)] + 'hundred ';
    if (parseInt(lastTwo, 10) > 0) {
      if (str !== '') str += 'and ';
      str += convertGroup(lastTwo);
    }
    return str;
  };

  const [whole] = num.toFixed(2).split('.');
  const result = 'INR ' + inWords(parseInt(whole, 10)) + 'ONLY';
  return result.toUpperCase().replace(/\s+/g, ' ').trim();
};
