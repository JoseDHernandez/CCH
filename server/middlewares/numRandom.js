export function NumberRandom(Nmin, Nmax, Leng, Incl) {
  let numeros = [];
  if (Incl.length > 0) {
    Incl.forEach((element) => {
      numeros.push(element);
    });
    console.log(Incl);
  }
  while (numeros.length < Leng) {
    let numeroAleatorio = Math.floor(Math.random() * (Nmax - Nmin + 1)) + Nmin;
    if (numeros.indexOf(numeroAleatorio) === -1) {
      numeros.push(numeroAleatorio);
    }
  }

  return numeros;
}

export function generateUniqueArrays(count, Nmin, Nmax, Leng) {
  const uniqueArrays = [];

  while (uniqueArrays.length < count) {
    const newArray = NumberRandom(Nmin, Nmax, Leng, []);
    if (!uniqueArrays.some((arr) => arraysAreEqual(arr, newArray))) {
      uniqueArrays.push(newArray);
    }
  }

  return uniqueArrays;
}
function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}
