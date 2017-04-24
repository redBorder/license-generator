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

import * as R from "ramda";
import * as log4js from "log4js";
import * as rambdaFantasy from "ramda-fantasy";
import * as uuid from "uuid/v4";
import * as NodeRSA from "node-rsa";
import * as base64url from "base64-url";

import config from "../../config";

const IO = rambdaFantasy.IO;

const logger = log4js.getLogger('[licenses]');
const key = new NodeRSA(config.key);

interface License {
  info: object,
  encoded_info: string,
  signature: string,
};

/////////////
// Helpers //
/////////////

// generateUUID :: () -> IO string
const generateUUID = () =>
  IO(() => uuid());

// generateInfo :: string -> string -> Object
const generateInfo: any = R.curry((cluster_uuid: string, uuid: string) =>
  ({
    "uuid": uuid,
    "expire_at": new Date(2099, 12, 31, 23, 59, 59, 0).getTime() / 1000,
    "limit_bytes": 9223372036854775807,
    "cluster_uuid": cluster_uuid,
    "sensors": {
      "199": 100,
      "191": 100,
      "999": 100,
      "217": 100,
      "187": 100,
      "227": 100,
      "219": 100,
      "221": 100,
      "223": 100
    }
  }));

// addEncodedInfo :: License -> License
const addEncodedInfo = (license: License) =>
  R.merge(license, { encoded_info: base64url.encode(JSON.stringify(license)) });

// addSignature :: License -> License
const addSignature = R.curry((key: any, license: License) =>
  R.merge(license, { signature: base64url.encode(key.sign(license.encoded_info)) }));

// addCreationDate :: License -> License
const addCreationDate = R.curry((date: Date, license: License) =>
  R.merge(license, { created_at: date.toISOString() })
);

//////////////
// Handlers //
//////////////

const request = (req, res) => R.pipe(
  generateUUID,
  IO.runIO.bind(this),
  generateInfo(req.swagger.params.cluster_info.value.cluster_uuid),
  addEncodedInfo,
  addSignature(key),
  addCreationDate(new Date()),
  res.send.bind(res),
)(undefined);

export = { request };
