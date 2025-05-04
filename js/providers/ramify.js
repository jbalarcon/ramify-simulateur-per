export const getNetReturn = profile => ({
  defensif: 0.021,
  equilibré: 0.061,
  agressif: 0.1051
})[profile];

export const getGrossReturn = profile => ({
  defensif: 0.028,
  equilibré: 0.0723,
  agressif: 0.1166
})[profile]; 