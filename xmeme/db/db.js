const mongoose = require('mongoose');

//Mongoose Connection with DB
mongoose.connect(process.env.DB_CONN_STRING, 
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected Successfully');
    }).catch((ex) => {
        console.log(ex);
    });

