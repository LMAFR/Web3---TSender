export function calculateTotal(amountsString: string): number {
    const amountsArray = amountsString.split(/[\n,]+/).map((amt) => parseFloat(amt.trim()));
    const total = amountsArray.reduce((acc, curr) => acc + (isNaN(curr) ? 0 : curr), 0);
    return total;
}