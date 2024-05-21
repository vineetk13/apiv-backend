const admin = require('./firebaseAdmin')


const authVerify = async (req, res, next) => {
    const idToken = req.headers.authorization

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken)
        if (decodedToken) {
            req.body.user = decodedToken.uid
            return next()
        } else {
            return res.status(401).send("Unauthorized user")
        }
    } catch(e) {
        console.log('Unauthorized user: ', e)
        return res.status(401).send("Unauthorized user")
    }
}

module.exports = authVerify