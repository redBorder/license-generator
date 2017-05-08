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

import * as express from "express";
import * as log4js from "log4js";
import * as rambdaFantasy from "ramda-fantasy";
import "reflect-metadata";
import * as SwaggerExpress from "swagger-express-mw";
import { createConnection } from "typeorm";
import { License } from "./entity/license";
import { IContext } from "./util";

import config from "./config";

const Maybe = rambdaFantasy.Maybe;

const appLogger = log4js.getLogger("[app]");
const apiLogger = log4js.getLogger("[api]");
const app = express();

createConnection({
  autoSchemaSync: true,
  driver: {
    database: config.db.database,
    host: config.db.host,
    password: config.db.password,
    port: config.db.port,
    type: "mariadb",
    username: config.db.username,
  },
  entities: [License],
}).then((connection) => {
  appLogger.info("Connected to the database");

  const ctx: IContext = {
    dbConnection: connection,
    entity: License,
    key: config.key,
    logger: apiLogger,
    sensors: config.sensors,
  };

  app.use((req: any, res, next) => {
    req.ctx = ctx;
    next();
  });

  SwaggerExpress.create(config.api, (err, swaggerExpress) => {
    if (err) { throw err; }

    swaggerExpress.register(app);
    app.listen(config.api.port, () =>
      appLogger.info(`Listen on ${config.api.port}`));
  });
}).catch((error) => appLogger.error(error));

export default app;
