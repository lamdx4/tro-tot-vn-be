import "reflect-metadata"

import 'dotenv/config';

import express from 'express';

import routerConfig from '@/web/routers/router-config.js';

import '@/web/routers/router-config';

import '@/infras';

const app = express();

app.use(express.json());

app.use(routerConfig);

app.listen(Number(process.env.PORT), '0.0.0.0', () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
