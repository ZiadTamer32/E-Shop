const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "E-commerce API",
    description: "E-commerce API documentation"
  },
  host: "localhost:3000",
  schemes: ["http"]
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["server.js", "./Routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
