require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PrismaClient } = require('@prisma/client');
const { MongoClient } = require('mongodb');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { swaggerOptions } = require('./config/swagger');

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger documentation
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ms-contracts', timestamp: new Date().toISOString() });
});

// Routes
const contractRoutes = require('./routes/contractRoutes');
const validationRoutes = require('./routes/validationRoutes');

app.use('/api/contracts', contractRoutes);
app.use('/api/validations', validationRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// MongoDB connection (for CQRS)
let mongoClient;
async function connectMongo() {
  try {
    mongoClient = new MongoClient(process.env.COSMOSDB_URI);
    await mongoClient.connect();
    console.log('✅ Connected to Cosmos DB (MongoDB)');
  } catch (error) {
    console.error('❌ Cosmos DB connection error:', error);
  }
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 ms-contracts running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  
  // Connect to databases
  await connectMongo();
  
  console.log('✅ ms-contracts ready!');
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await prisma.$disconnect();
  if (mongoClient) await mongoClient.close();
  process.exit(0);
});

module.exports = { app, prisma, getMongoClient: () => mongoClient };
