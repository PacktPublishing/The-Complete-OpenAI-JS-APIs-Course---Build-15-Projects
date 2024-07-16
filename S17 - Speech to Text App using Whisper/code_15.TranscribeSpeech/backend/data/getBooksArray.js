const fs = require('fs');

const getBooksArray = () => {
    try {
        //read json file
        const filePath = 'books_data.json';
        jsonData = fs.readFileSync(filePath, 'utf-8');
        const dataArray = JSON.parse(jsonData);
        return dataArray;
    } catch (error) {
        console.error('Error parsing JSON file:', err);
        return [];
    }
}

module.exports = getBooksArray;