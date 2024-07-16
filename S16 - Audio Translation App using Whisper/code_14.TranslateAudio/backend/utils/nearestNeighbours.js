const cosineSimilarity = require("./cosineSimilarity");


const findNearestNeighbors = async ({ embedding, embeddings, k }) => {

    //add similarities to the embeddings array
    const similarities = embeddings.map((item) => {
        const similarity = cosineSimilarity(embedding, JSON.parse(item.embedding));
        return {
            similarity,
            title: item.title,
            text: item.text, 
            authors: item.authors, 
            image: item.image, 
            infoLink: item.infoLink, 
            publisher: item.publisher
        }
    });

    // Sort similarities in descending order
    similarities.sort((a,b) => b.similarity - a.similarity);

    // Get nearest neighbors
    const nearestNeighbours = similarities.slice(0, k);

    return nearestNeighbours;

}



module.exports = findNearestNeighbors;