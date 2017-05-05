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
import * as rambdaFantasy from "ramda-fantasy";

const IO = rambdaFantasy.IO;

export interface IContext {
  dbConnection: any;
  entity: any;
  key: any;
  logger: any;
  sensors: object;
}

// then :: Fn -> Promise -> Promise
export const then: any = R.curry((fn, promise: Promise<any>) =>
  promise.then((obj: any): any => fn(obj)));

// catchP :: Fn -> Promise -> Promise
export const catchP: any = R.curry((fn, promise: Promise<any>) =>
  promise.catch((obj) => fn(obj)));

// runIO :: IO a -> a
export const runIO: any = (io) => io.runIO();

// errorLog :: Logger -> string -> IO ()
export const errorLog: any = R.curry((logger, message) => IO(() =>
  logger.map(logger.error(message))));
