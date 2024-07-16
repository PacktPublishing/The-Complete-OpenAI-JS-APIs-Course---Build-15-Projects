const fs = require('fs');
const {parse} = require("csv-parse")

//array where we will store the parse book data.
let books = [];
const booksFilePath = 'books_data.csv';

fs.createReadStream(booksFilePath)
    // piping the read stream into the parse function
    .pipe(parse({
        columns: [
            'Title','description','authors','image','previewLink','publisher','publishedDate','infoLink','categories','ratingsCount'
        ],
        delimiter: ',',
        quote: '"', 
        quote_empty: true,
        quote_escape: '"',
        relax_column_count: true
    }))
    .on('data', function(row){
        books.push(row);
    })
    .on('end', function(){
        //convert books array to JSON format
        const booksJSON = JSON.stringify(books);

        //json filePath
        const filePath = 'books_data.json';

        try {
            fs.writeFileSync(filePath, booksJSON, 'utf-8');
        } catch (error) {
            console.error('Error writing JSON file:', err);
        }



    })