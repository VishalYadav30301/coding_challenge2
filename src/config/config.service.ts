export default () => {
    return {
        db:{
            uri: process.env.MONGO_URI
        },
        jwt:{
            secret: process.env.JWT_SECRET,
            expiry: process.env.JWT_EXPIRY
        },
        AWS:{
            AWS_REGION:process.env.AWS_REGION,
            AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
            AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME


    },
    mail:{
            user: process.env.user,
            pass : process.env.pass
    },
    redis:{
        redisHost: process.env.redisHost,
        redisPort: process.env.redisPort
    }
}
}