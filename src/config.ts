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

import * as joi from "joi";
import * as NodeRSA from "node-rsa";

const envVarsSchema = joi.object({
  DB_DATABASE: joi.string()
    .default("licenses"),
  DB_HOST: joi.string()
    .default("mariadb"),
  DB_PASSWORD: joi.string()
    .default("qwerty"),
  DB_PORT: joi.string()
    .default(3306),
  DB_USERNAME: joi.string()
    .default("root"),

  LOG_LEVEL: joi.string()
    .allow(["error", "warn", "info", "debug", "trace"])
    .default("info"),

  NODE_ENV: joi.string()
    .allow(["development", "production", "test"])
    .default("development"),

  PORT: joi.number()
    .default(3000),

  PRIVATE_KEY: joi.string()
    .required(),
}).unknown()
  .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);
if (error) { throw new Error(`Config validation error: ${error.message}`); }

const config = {
  api: {
    appRoot: ".",
    configDir: ".",
    port: envVars.PORT,
    swaggerFile: "api.yaml",
  },
  db: {
    database: envVars.DB_DATABASE,
    host: envVars.DB_HOST,
    password: envVars.DB_PASSWORD,
    port: envVars.DB_PORT,
    username: envVars.DB_USERNAME,
  },
  env: envVars.NODE_ENV,
  key: envVars.PRIVATE_KEY ?
    new NodeRSA(envVars.PRIVATE_KEY.replace(/\\n/g, "\n")) : undefined,
  logger: {
    level: envVars.LOG_LEVEL,
  },
  sensors: {
    199: 100,
    191: 100,
    999: 100,
    217: 100,
    187: 100,
    227: 100,
    219: 100,
    221: 100,
    223: 100,
    event: 100,
    flow: 100,
    social: 100,
    vault: 100,
  },
};

export default config;
