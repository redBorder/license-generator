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

import * as log4js from "log4js";
import * as R from "ramda";
import * as rambdaFantasy from "ramda-fantasy";
import * as SwaggerExpress from "swagger-express-mw";
import * as util from "util";
import * as uuid from "uuid/v4";

import config from "../../config";
import { catchP, then } from "../../util";

import { License } from "../../entity/license";

const IO = rambdaFantasy.IO;
const Maybe = rambdaFantasy.Maybe;
const Either = rambdaFantasy.Either;

const logger = log4js.getLogger("[licenses]");

interface IKey {
  sign(data: string): string;
}

/////////////
// Helpers //
/////////////

// safeURLBase64Encode :: string -> string
export const safeURLBase64Encode = (data: string): string =>
  new Buffer(data)
    .toString("base64")
    .replace(/\//g, "_")
    .replace(/\+/g, "-");

// encodeInfo :: License -> License
export const encodeInfo = (license: License): License =>
  R.assoc(
    "encoded_info",
    safeURLBase64Encode(JSON.stringify(license.info)),
    license);

// addSignature :: License -> License
export const addSignature = R.curry((key: IKey, license: License): License =>
  R.assoc(
    "signature",
    safeURLBase64Encode(key.sign(license.encoded_info)),
    license),
);

// sendLicense :: Responder -> string -> IO string
export const sendResponse = R.curry((res, message) => IO(() => {
  return res.send(message), message;
}));

// sendError :: Responder -> License -> IO License
export const sendError = R.curry((res, error: string) => IO(() =>
  res.send({ message: error }),
));

// printLicense :: Logger -> License -> IO License
export const printLicense = R.curry((maybeLogger, license: License) => IO(() => {
  maybeLogger.map((log) =>
    log.debug(
      `Generated new license: \n${util.inspect(license, { colors: true })}`,
    ));

  return license;
}));

// addDays :: number -> Date -> Date
export const addDays = R.curry((days: number, date: Date): Date =>
  new Date((date.getTime() / 1000 + 60 * 60 * 24 * days) * 1000),
);

// add30Days :: Date -> Date
export const add30Days = addDays(30);

// getUnixEpoch :: Date -> number
export const getUnixEpoch = (date: Date): number =>
  Math.floor(date.getTime() / 1000);

// findLicense :: DBConnection -> string -> IO Promise(Either(Entity, Entity))
export const findLicense = R.curry((entity, connection, license: License) =>
  IO(() => {
    return new Promise((resolve, reject) =>
      connection
        .getRepository(entity)
        .findOneById(license.id)
        .then((exists) =>
          resolve(exists ? Either.Left(license) : Either.Right(license)))
        .catch(reject));
  }));

// storeOnDb :: Entity -> DBConnection -> License -> IO Promise(License)
export const storeOnDB: any = R.curry((entity, connection, license) => IO(() => {
  return connection.getRepository(entity).persist(license), license;
}));

const objToString = (obj) => obj.toString();

//////////////////////////
// High order functions //
//////////////////////////

// computeExpireTimestamp :: Date -> number
export const computeExpireTimestamp = R.compose(getUnixEpoch, add30Days);

export const requestHandler = R.curry((opts, req, res) => {
  R.pipe(
    R.pipe(
      R.assocPath(["id"], req.swagger.params.cluster_info.value.cluster_uuid),
      R.assocPath(["info", "uuid"], uuid()),
      R.assocPath(["info", "cluster_uuid"],
        req.swagger.params.cluster_info.value.cluster_uuid),
      R.assocPath(["info", "expire_at"], computeExpireTimestamp(new Date())),
      R.assocPath(["info", "limit_bytes"], 9223372036854775000),
      R.assocPath(["info", "sensors"], opts.sensors),
      R.assocPath(["created_at"], new Date().toISOString()),

      findLicense(opts.entity, req.dbConnection),
      IO.runIO.bind(this),
    ),

    // For either.Right genereate a license
    R.pipe(
      then(R.map(encodeInfo)),
      then(R.map(addSignature(opts.key))),
      then(R.chain(printLicense(opts.logger))),
      then(R.chain(storeOnDB(opts.entity, req.dbConnection))),
      then(R.chain(
        R.pipe(
          R.dissoc("id"),
          JSON.stringify,
          safeURLBase64Encode,
          sendResponse(res),
        )),
      )),

    // For either.Left return an error
    R.pipe(
      then((either) => either.isLeft
        ? sendError(res, "Already generated a demo license for this cluster")
        : either),
    ),

    then(IO.runIO.bind(this)),
    catchP(logger.error.bind(logger)),
  )(new License());
});

/////////////////////
// Impure handlers //
/////////////////////

export const request = requestHandler({
  entity: License,
  key: config.key,
  logger: Maybe.of(logger),
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
  },
});
