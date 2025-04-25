const config = {
    port: process.env.PORT || 3000,
    db: {
        uri: process.env.DB_URI || 'mongodb://localhost:27017/mydatabase',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    apiVersion: 'v1',
};

module.exports = config;