const {Matrix} = require('ml-matrix');

const cosineSimilarity = (vector1, vector2) => {
  // console.log(Matrix);
  const dotProduct = Matrix.rowVector(vector1).mmul(Matrix.rowVector(vector2).transpose()).get(0, 0);
  const magnitude1 = Math.sqrt(Matrix.rowVector(vector1).mmul(Matrix.rowVector(vector1).transpose()).get(0, 0));
  const magnitude2 = Math.sqrt(Matrix.rowVector(vector2).mmul(Matrix.rowVector(vector2).transpose()).get(0, 0));

  return dotProduct / (magnitude1 * magnitude2);
};

module.exports = cosineSimilarity;
