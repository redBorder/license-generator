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
  LOG_LEVEL: joi.string()
    .allow(["error", "warn", "info", "debug", "trace"])
    .default("info"),
  NODE_ENV: joi.string()
    .allow(["development", "production", "test"])
    .default("development"),
  PORT: joi.number()
    .default(3000),
  PRIVATE_KEY: joi.string()
    .allow([""])
    .default(""),
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
  env: envVars.NODE_ENV,
  key: envVars.PRIVATE_KEY ?
    new NodeRSA(envVars.PRIVATE_KEY.replace(/\\n/g, "\n")) : undefined,
  logger: {
    level: envVars.LOG_LEVEL,
  },
};

export default config;
