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
import * as util from "util";
import * as uuid from "uuid/v4";

import config from "../../config";

const IO = rambdaFantasy.IO;
const Maybe = rambdaFantasy.Maybe;

const logger = log4js.getLogger("[licenses]");

interface ILicense {
  info: object;
  encoded_info: string;
  signature: string;
}

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
export const encodeInfo = (license: ILicense): ILicense =>
  R.assoc(
    "encoded_info",
    safeURLBase64Encode(JSON.stringify(license.info)),
    license);

// addSignature :: License -> License
export const addSignature = R.curry((key: IKey, license: ILicense): ILicense =>
  R.assoc(
    "signature",
    safeURLBase64Encode(key.sign(license.encoded_info)),
    license));

// sendLicense :: Responder -> License -> IO License
export const sendLicense = R.curry((res, license: ILicense) => IO(() => {
  return res.send(license), license;
}));

// printLicense :: Logger -> License -> IO ()
export const printLicense = R.curry((maybeLogger, license: ILicense) => IO(() =>
  maybeLogger.map((log) =>
    log.debug(
      `Generated new license: \n${util.inspect(license, { colors: true })}`,
    )),
));

// addDays :: number -> Date -> Date
export const addDays = R.curry((days: number, date: Date): Date =>
  new Date((date.getTime() / 1000 + 60 * 60 * 24 * days) * 1000),
);

// add30Days :: Date -> Date
export const add30Days = addDays(30);

// getUnixEpoch :: Date -> number
export const getUnixEpoch = (date: Date): number =>
  Math.floor(date.getTime() / 1000);

// computeExpireTimestamp :: Date -> number
export const computeExpireTimestamp = R.compose(getUnixEpoch, add30Days);

//////////////////////////
// High order functions //
//////////////////////////

export const requestHandler = R.curry((opts, req, res) => {
  const buildLicense = R.pipe(
    R.assocPath(["info", "uuid"], uuid()),
    R.assocPath(["info", "cluster_uuid"],
      req.swagger.params.cluster_info.value.cluster_uuid),
    R.assocPath(["info", "expire_at"], computeExpireTimestamp(new Date())),
    R.assocPath(["info", "limit_bytes"], 9223372036854775000),
    R.assocPath(["info", "sensors"], opts.sensorList),
    R.assocPath(["created_at"], new Date().toISOString()),
  );

  const signLicense = R.pipe(
    encodeInfo,
    addSignature(opts.pem),
    sendLicense(res),
    R.chain(printLicense(opts.logger)),
    IO.runIO.bind(this),
  );

  R.pipe(buildLicense, signLicense)({});
});

/////////////////////
// Impure handlers //
/////////////////////

export const request = requestHandler({
  logger: Maybe.of(logger),
  pem: config.key,
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
