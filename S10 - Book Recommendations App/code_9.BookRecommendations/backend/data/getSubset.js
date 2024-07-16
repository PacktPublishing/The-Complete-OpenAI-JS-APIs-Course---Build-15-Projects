const getSubset = ({bookData, size}) => {
    const books = bookData
      .filter((book) => book['categories'] === "['Science']")
      .filter((book) => book['description'].length > 100)
      .filter((book) => !book['description'].includes(' een'))
      .filter((book) => !book['description'].includes(' un '))
      .filter((book) => !book['description'].includes(' una '))
      .filter((book) => !book['description'].includes(' Trieste '))
      .slice(0, size);
  
    return books;
  };
  
  module.exports = getSubset;