require("dotenv").config(); // ALLOWS ENVIRONMENT VARIABLES TO BE SET ON PROCESS.ENV SHOULD BE AT TOP

const express = require("express");
const bodyParser = require('body-parser');
const validatePayload = require('./middlewares/validate');

const app = express();

// Middlewares
app.use(bodyParser.json( // Parse incoming request bodies in a middleware before your handlers
  {
      verify: (req, res, buf, encoding) => {
          if (buf && buf.length) {
              req.rawBody = buf.toString(encoding || 'utf8');
          }
      },
  }
)); 
app.use("/healthcheck", (req, res, next) => {
  res.send('Thanks for checking in!');
})

// validatePayload checks if incoming payload is indeed from Shopify 
app.use("/listing", validatePayload, require("./routes/listingRoutes"));
app.use("/order", validatePayload, require("./routes/orderRoutes"));

// Global Error Handler. IMPORTANT function params MUST start with err
app.use((err, req, res, next) => {
  console.log(err.stack);
  console.log(err.name);
  console.log(err.code);

  res.status(500).json({
    message: "Something went rely wrong",
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
