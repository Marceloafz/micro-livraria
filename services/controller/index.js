const express = require('express');
const shipping = require('./shipping');
const inventory = require('./inventory');
const reviews = require('./reviews');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Retorna a lista de produtos da loja via InventoryService
 */
app.get('/products', (req, res, next) => {
    inventory.SearchAllProducts(null, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data.products);
        }
    });
});

/**
 * Consulta o frete de envio no ShippingService
 */
app.get('/shipping/:cep', (req, res, next) => {
    shipping.GetShippingRate(
        {
            cep: req.params.cep,
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'something failed :(' });
            } else {
                res.json({
                    cep: req.params.cep,
                    value: data.value,
                });
            }
        }
    );
});

/**
 * Retorna as avaliações (e a média) de um livro via ReviewsService
 */
app.get('/reviews/:productId', (req, res, next) => {
    reviews.GetReviews({ product_id: parseInt(req.params.productId, 10) }, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data);
        }
    });
});

/**
 * Cadastra uma nova avaliação via ReviewsService
 * body: { product_id, author, rating (1-5), comment }
 */
app.post('/reviews', (req, res, next) => {
    const { product_id, author, rating, comment } = req.body || {};
    reviews.AddReview({ product_id, author, rating, comment }, (err, data) => {
        if (err) {
            console.error(err);
            const invalid = err.code === 3; // INVALID_ARGUMENT
            res.status(invalid ? 400 : 500).send({ error: invalid ? err.details : 'something failed :(' });
        } else {
            res.status(201).json(data);
        }
    });
});

/**
 * Inicia o router
 */
app.listen(3000, () => {
    console.log('Controller Service running on http://127.0.0.1:3000');
});
