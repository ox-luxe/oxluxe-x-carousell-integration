require("dotenv").config(); // ALLOWS ENVIRONMENT VARIABLES TO BE SET ON PROCESS.ENV SHOULD BE AT TOP
const crypto = require('crypto');

const SIG_HEADER_NAME = process.env.SIG_HEADER_NAME;
const API_SECRET_KEY = process.env.API_SECRET_KEY;
const sigHashAlg = 'sha256';

function validatePayload(req, res, next) {

    if(req.method == "POST"){
        if (!req.rawBody) {
            return next('Request body empty')
        }

        const body = req.rawBody;
        const hmacHeader = req.get(SIG_HEADER_NAME);
        
        //Create a hash based on the parsed body
        const hash = crypto
            .createHmac(sigHashAlg, API_SECRET_KEY)
            .update(body, "utf8", "hex")
            .digest("base64");

        // Compare the created hash with the value of the X-Shopify-Hmac-Sha256 Header
        if (hash !== hmacHeader) {
            return next(`Request body digest (${hash}) did not match ${SIG_HEADER_NAME} (${hmacHeader})`)
        } 

    }
    
    return next()

}

module.exports = validatePayload;