// Passenger loads its startup file with require(). Keep this bridge CommonJS
// and import the ES module asynchronously so top-level await is supported.
module.exports = import('./index.js').catch(error => {
  console.error('No se pudo iniciar NigDiz:', error);
  process.exit(1);
});
