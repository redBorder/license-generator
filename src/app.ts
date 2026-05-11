// License generator API
// Copyright (C) 2017  Eneo Tecnología
// Author: Diego Fernández Barrera
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import "./polyfills.js";
import express from "express";
import log4js from "log4js";
import rambdaFantasy from "ramda-fantasy";
import "reflect-metadata";
import SwaggerExpress from "swagger-express-mw";
import * as util from "util";
import { DataSource } from "typeorm";
import { License } from "./entity/license.js";
import { IContext } from "./util.js";

import config from "./config.js";

const appLogger = log4js.getLogger("[app]");
const apiLogger = log4js.getLogger("[api]");
const app = express();

const dataSource = new DataSource({
  database: config.db.database,
  entities: [License],
  host: config.db.host,
  password: config.db.password,
  port: Number(config.db.port),
  synchronize: true,
  type: "mariadb",
  username: config.db.username,
});

dataSource.initialize().then((connection) => {
  appLogger.info("Connected to the database");

  const ctx: IContext = {
    dbConnection: connection,
    entity: License,
    key: config.key,
    logger: apiLogger,
    sensors: config.sensors,
  };

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/docs", express.static("docs"));

  app.use((req: any, res, next) => {
    appLogger.debug(`[request] ${req.method} ${req.url} body: ${JSON.stringify(req.body)}`);
    req.ctx = ctx;
    next();
  });

  SwaggerExpress.create(config.api, (err, swaggerExpress) => {
    if (err) {
      appLogger.error("SwaggerExpress.create error:", util.inspect(err, { depth: null }));
      throw err;
    }

    swaggerExpress.register(app);
    app.listen(config.api.port, () => {
      console.log(`\nLicense generator started successfully!`);
      console.log(`Listening on port: ${config.api.port}`);
      console.log(`Environment: ${config.env}`);
      console.log(`Documentation: http://localhost:${config.api.port}/docs`);
      console.log(`To request a license, use the following command:`);
      console.log(`curl -X POST http://localhost:${config.api.port}/api/v1/licenses \\`);
      console.log(`     -H 'Content-Type: application/json' \\`);
      console.log(`     -d '{"cluster_uuid": "your-cluster-uuid-here"}'\n`);
    });
  });
}).catch((error) => {
  appLogger.error("General error:", util.inspect(error, { depth: null }));
});

export default app;
