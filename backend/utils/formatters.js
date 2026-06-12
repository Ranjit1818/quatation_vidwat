// Number → words (Indian format)
function numberToWordsIndian(num) {
  const belowTwenty = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  const convertTwoDigits = (n) => {
    if (n < 20) return belowTwenty[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + belowTwenty[n % 10] : "");
  };

  const convertThreeDigits = (n) => {
    let word = "";
    if (Math.floor(n / 100) > 0) {
      word += belowTwenty[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 0) word += convertTwoDigits(n);
    return word.trim();
  };

  if (num === 0) return "Zero";

  let result = "";
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  if (crore) result += convertThreeDigits(crore) + " Crore ";
  if (lakh) result += convertThreeDigits(lakh) + " Lakh ";
  if (thousand) result += convertThreeDigits(thousand) + " Thousand ";
  if (hundred) result += convertThreeDigits(hundred);

  return result.trim();
}

module.exports = {
  numberToWordsIndian,
};
