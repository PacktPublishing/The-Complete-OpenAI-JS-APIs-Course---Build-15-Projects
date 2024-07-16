const cosineSimilarity = require("./cosineSimilarity");


const findNearestNeighbors = ({ embedding, embeddings, k }) => {

    //add similarities to the embeddings array
    const similarities = embeddings.map((item) => {
        const similarity = cosineSimilarity(embedding, JSON.parse(item.embedding));
        return {
            similarity,
            text: item.text
        }
    });

    // Sort similarities in descending order
    similarities.sort((a,b) => b.similarity - a.similarity);

    // Get nearest neighbors
    const nearestNeighbours = similarities.slice(0, k);

    return nearestNeighbours;

}



module.exports = findNearestNeighbors;