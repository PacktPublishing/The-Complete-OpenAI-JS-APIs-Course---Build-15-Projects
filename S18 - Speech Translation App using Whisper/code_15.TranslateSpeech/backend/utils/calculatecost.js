const {encode} = require('gpt-3-encoder');

const calculateCost = (texts) => {
    const totalTokens = texts.reduce( (acc, text) => acc + encode(text).length, 0);
    const costPer1000Tokens = 0.0001;
    const cost = ((totalTokens * costPer1000Tokens)/1000).toFixed(2);
    return cost;
}

// const texts = [
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//     'This is text 1',
//     'Another example of text',
//     'Some more text to calculate cost',
//     'Lorem ipsum dolor sit amet',
//   ];

//   console.log(calculateCost(texts));

module.exports = calculateCost;
