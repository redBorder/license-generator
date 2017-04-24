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

import * as SwaggerExpress from "swagger-express-mw";
import * as express from "express";
import * as log4js from "log4js";

import config from "./config";

const logger = log4js.getLogger('[app]');
const app = express();

SwaggerExpress.create(config.api, (err, swaggerExpress) => {
  if (err) throw err;

  swaggerExpress.register(app);
  app.listen(config.api.port, () =>
    logger.info(`Listen on ${config.api.port}`));
});

export default app;
