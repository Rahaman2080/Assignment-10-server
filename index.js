const express = require('express');
const cors = require('cors');
require('dotenv').config();
const datas = require('./data.json');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-jb2p8kn-shard-00-00.rbzmehy.mongodb.net:27017,ac-jb2p8kn-shard-00-01.rbzmehy.mongodb.net:27017,ac-jb2p8kn-shard-00-02.rbzmehy.mongodb.net:27017/?ssl=true&replicaSet=atlas-k8xnp7-shard-0&authSource=admin&retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const productCollection = client.db("ProductDB").collection('prducts');
        const myCartCollection = client.db('MyCartDB').collection('Mycart')

        app.get('/brands', (req, res) => {
            res.send(datas)
        })


        app.get('/products', async (req, res) => {
            const cursor = productCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/productdetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        app.get("/products/:brand", async (req, res) => {
            const brandName = req.params.brand;
            const query = { brand: (brandName) };
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // get data for update
        app.get('/productsById/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            // console.log(newProduct);
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        // put data for update
        app.put('/productsById/:id', async (req, res) => {
            const id = req.params.id;
            const products = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateProduct = {
                $set: {
                    brand: products.brand,
                    image: products.image,
                    name: products.name,
                    price: products.price,
                    rating: products.rating,
                    type: products.type,
                    details: products.details
                }
            }
            const result = await productCollection.updateOne(filter, updateProduct, options);
            res.send(result);
        })

        // My cart collection get and post
        app.get('/mycart', async (req, res) => {
            const cursor = myCartCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/addcart', async (req, res) => {
            const cart = req.body;
            // console.log(cart);
            const result = await myCartCollection.insertOne(cart);
            res.send(result);
        })

        // delete option
        app.delete('/mycart/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id) }
            const result = await myCartCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('Brand Shop is Running');
})

app.listen(port, () => {
    console.log(`Brand shop server is running on port: ${port}`);
})