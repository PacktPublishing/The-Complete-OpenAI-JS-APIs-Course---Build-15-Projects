const sqlite3 = require('sqlite3').verbose();

const getEmbedding = require('./getEmbedding.js');


const createEmbeddings = async (chunks, table_name) => {
    // Get the absolute path to the SQLite database file
    const dbPath = "backend/PDF_data/embeddings.db";

    // Create or open the SQLite database
    const db = new sqlite3.Database(dbPath);

    try {
        // Delete the "embeddings_text_embedding_ada_002" table if it exists
        // const delete_table_query = `DROP TABLE IF EXISTS ${table_name}`;
        // const deleteTable = () => {
        //     return new Promise((resolve, reject) => {
        //         db.run(delete_table_query, error => {
        //             if (error) { reject(error); } else {
        //                 resolve();
        //             }
        //         })
        //     })
        // }
        // await deleteTable();

        // Create the ${table_name} table
        const create_table_query = `
        CREATE TABLE IF NOT EXISTS ${table_name} (
          id INTEGER PRIMARY KEY,
          text TEXT,
          embedding TEXT
        )
      `;
        const createTable = () => {
            return new Promise((resolve, reject) => {
                db.run(create_table_query, error => {
                    if (error) { reject(error); } else {
                        resolve();
                    }
                })
            })
        }
        await createTable();

        // Prepare the SQL statement for inserting data into the table
        const stmt = db.prepare(`INSERT INTO ${table_name} (text, embedding) VALUES (?, ?)`)

        for (let i = 0; i < chunks.length; i++) {
            //calculate embedding of the book's description
            const text = chunks[i];
            const embedding = await getEmbedding(text);


            // Insert the data into the embeddings_text_embedding_ada_002 table
            const insertData = (text, embedding) => {
                return new Promise((resolve, reject) => {
                    stmt.run(text, JSON.stringify(embedding), (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });
            };
            await insertData(text, embedding);
            console.log(`embedding ${i} inserted into the table.`);
        }

        // Finalize the statement
        stmt.finalize();
        console.log('Embeddings created and stored in SQLite database.');
    } catch (error) {
        console.error('Error creating embeddings:', error);
    } finally {
        // Close the database connection
        db.close();
    }
};


 module.exports = createEmbeddings;


