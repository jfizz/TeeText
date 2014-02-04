var n = 'asdf';

n = parseInt(n, 10);

console.log(n);
console.log(isInt(n));

function isInt(n) {

	return typeof n === 'number' && n % 1 === 0;

}