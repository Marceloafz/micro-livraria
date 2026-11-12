const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const seed = require('./reviews.json');

const packageDefinition = protoLoader.loadSync('proto/reviews.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const reviewsProto = grpc.loadPackageDefinition(packageDefinition);

const reviews = [...seed];
let nextId = reviews.reduce((max, r) => Math.max(max, r.id), 0) + 1;

const server = new grpc.Server();

server.addService(reviewsProto.ReviewsService.service, {
    GetReviews: (call, callback) => {
        const productId = call.request.product_id;
        const list = reviews.filter((r) => r.product_id === productId);
        const total = list.length;
        const average = total ? list.reduce((sum, r) => sum + r.rating, 0) / total : 0;

        callback(null, { product_id: productId, average, total, reviews: list });
    },

    AddReview: (call, callback) => {
        const { product_id, author, rating, comment } = call.request;

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'rating deve ser um inteiro entre 1 e 5',
            });
        }

        const review = {
            id: nextId++,
            product_id,
            author: author || 'Anônimo',
            rating,
            comment: comment || '',
        };
        reviews.push(review);
        callback(null, review);
    },
});

const address = process.env.REVIEWS_BIND || '0.0.0.0:3003';
server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Reviews Service running at ${address}`);
    server.start();
});
