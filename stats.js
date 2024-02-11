export function mean(arr) {
    let sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}
export function median(arr) {
    arr.sort((a, b) => a - b);
    const middleIndex = Math.floor(arr.length / 2);
    if (arr.length % 2 === 0) {
        return (arr[middleIndex - 1] + arr[middleIndex]) / 2;
    } else {
        return arr[middleIndex];
    }
}
export function stdev(arr) {
    const m = mean(arr);
    arr = arr.map((v) => {return (v - m) ** 2});
    let sum = arr.reduce((a, b) => a + b, 0);
    return Math.sqrt(sum / arr.length);
}
export function roundToDec(num,dec) {
    return Math.round(num * (10 ** dec)) / (10 ** dec);
}