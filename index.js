require('dotenv').config();
const express = require('express');
const accountRouter = require('./routers/Accounts');
const productRouter = require('./routers/Products');
const orderRouter = require('./routers/Orders');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({
        code: 0,
        message: "Hello there, welcome to my Shop"
    });
});

app.use('/product', productRouter);
app.use('/account', accountRouter);
app.use('/order', orderRouter);

const port = process.env.PORT || 3000;
mongoose.connect('mongodb://127.0.0.1:27017/lab89', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(port, () => {
        console.log('http://localhost:' + port);
    });
}).catch(e => console.log('Failed to connect to MongoDB'));


