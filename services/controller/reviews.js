const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/reviews.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const ReviewsService = grpc.loadPackageDefinition(packageDefinition).ReviewsService;
const client = new ReviewsService(
    process.env.REVIEWS_HOST || '127.0.0.1:3003',
    grpc.credentials.createInsecure()
);

module.exports = client;
