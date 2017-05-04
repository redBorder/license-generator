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

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { suite, test } from "mocha-typescript";
import * as NodeRSA from "node-rsa";
import * as rambdaFantasy from "ramda-fantasy";
import * as sinon from "sinon";

chai.use(chaiAsPromised);
const expect = chai.expect;

const IO = rambdaFantasy.IO;
const Either = rambdaFantasy.Either;

import {
  add30Days,
  addSignature,
  encodeInfo,
  findLicense,
  getUnixEpoch,
  printLicense,
  requestHandler,
  safeURLBase64Encode,
  sendError,
  sendResponse,
  storeOnDB,
} from "../api/controllers/licenses";

const Maybe = rambdaFantasy.Maybe;

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTCpvKe4eCZ0FPqri0cb2JZfXJ/DgYSF6vUp
wmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb1/3j+skZ6UtW+5u09lHNsj6tQ5
1s1SPrCBkedbNf0Tp0GbMJDyR4e9T04ZZwIDAQABAoGAFijko56+qGyN8M0RVyaRAXz++xTqHBLh
3tx4VgMtrQ+WEgCjhoTwo23KMBAuJGSYnRmoBZM3lMfTKevIkAidPExvYCdm5dYq3XToLkkLv5L2
pIIVOFMDG+KESnAFV7l2c+cnzRMW0+b6f8mR1CJzZuxVLL6Q02fvLi55/mbSYxECQQDeAw6fiIQX
GukBI4eMZZt4nscy2o12KyYner3VpoeE+Np2q+Z3pvAMd/aNzQ/W9WaI+NRfcxUJrmfPwIGm63il
AkEAxCL5HQb2bQr4ByorcMWm/hEP2MZzROV73yF41hPsRC9m66KrheO9HPTJuo3/9s5p+sqGxOlF
L0NDt4SkosjgGwJAFklyR1uZ/wPJjj611cdBcztlPdqoxssQGnh85BzCj/u3WqBpE2vjvyyvyI5k
X6zk7S0ljKtt2jny2+00VsBerQJBAJGC1Mg5Oydo5NwD6BiROrPxGo2bpTbu/fhrT8ebHkTz2epl
U9VQQSQzY1oZMVX8i1m5WUTLPz2yLJIBQVdXqhMCQBGoiuSoSjafUhV7i1cEGpb88h5NBYZzWXGZ
37sJ5QsW+sJyoNde3xH8vdXhzU7eT82D6X/scw9RZz+/6rCJ4p0=
-----END RSA PRIVATE KEY-----`;

const LICENSE = {
  encoded_info: "eyJtZXNzYWdlIjoiSGVsbG8gd29ybGQifQ==",
  id: "0",
  info: { uuid: "Hello world" },
  signature: "C3g6DVIoEldLG53Dr1Ofj_JiCg_9ONyuXEVE1PeM",
};

@suite
class LicensesTest {

  @test("encode text using base64")
  public safeURLBase64Encode() {
    const encoded = safeURLBase64Encode(
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, " +
      "mollit anim id est laborum.");
    expect(encoded).to.eq(
      "TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2ljaW5n" +
      "IGVsaXQsIG1vbGxpdCBhbmltIGlkIGVzdCBsYWJvcnVtLg==");
  }

  @test("embed 'encoded_info' on a license")
  public encodeInfo() {
    const baseLicense = {
      encoded_info: "",
      id: "0",
      info: { uuid: "Hello world" },
      signature: "",
    };
    const license = encodeInfo(baseLicense);
    expect(license.encoded_info)
      .to.eq("eyJ1dWlkIjoiSGVsbG8gd29ybGQifQ==");
  }

  @test("sign a license using a rsa key")
  public addSignature() {
    const key = new NodeRSA(privateKey);
    const license = addSignature(key, LICENSE);
    expect(license.signature)
      .to.eq("NBLguIM2kdTig9ZnKfgFbY-Ghra4x4wu9akEoQrIbH8bC5btrpZekHcYLbAxPF" +
      "1pA8gCieU8v4uz9_C2jcjZJrPfqyLcgZmvGk27ZEiTO6uZQs_XwmwprYxuWpGHhFkRerM" +
      "C3g6DVIoEldLG53Dr1Ofj_JiCg_9ONyuXEVE1PeM=");
  }

  @test("get Unix epoch from a date")
  public getUnixEpoch() {
    const date = new Date("1990-04-29T00:00:00");
    expect(getUnixEpoch(date)).to.eq(641347200);
  }

  @test("add 30 days to a given date")
  public add30Days() {
    const date = new Date("1990-04-29T00:00:00");
    expect(add30Days(date).getTime() / 1000).to.eq(643939200);
  }

  @test("send a license")
  public sendLicense() {
    const res = { send: () => { return; } };

    const mock = sinon.mock(res);
    mock.expects("send").calledWith(LICENSE);

    sendResponse(res, LICENSE).runIO();

    mock.verify();
  }

  @test("print a license")
  public printLicense() {
    const logger = { debug: () => { return; } };

    const mock = sinon.mock(logger);
    mock.expects("debug").calledWith(LICENSE);

    printLicense(Maybe.of(logger), LICENSE).runIO();

    mock.verify();
  }

  @test("send an error")
  public sendError() {
    const res = { send: () => { return; } };
    const mock = sinon.mock(res);

    mock.expects("send").calledWith("Hello");

    sendError(res, "Hello").runIO();

    mock.verify();
  }

  @test("find a license on the database which exists")
  public findLicenseFound() {
    const repository = {
      findOneById: () => new Promise((resolve) => resolve(LICENSE)),
    };
    const mock = sinon.mock(repository);
    const connection = { getRepository: () => repository };

    expect(findLicense(undefined, connection, LICENSE).runIO())
      .to.eventually.deep.equal(Either.Left(LICENSE));
  }

  @test("find a license on the database which does not exists")
  public findLicenseNotFound() {
    const repository = {
      findOneById: () => new Promise((resolve) => resolve(undefined)),
    };
    const mock = sinon.mock(repository);
    const connection = { getRepository: () => repository };

    expect(findLicense(undefined, connection, LICENSE).runIO())
      .to.eventually.deep.equal(Either.Right(LICENSE));
  }

  @test("store a license on the database")
  public storeOnDB() {
    const repository = {
      persist: () => new Promise((resolve) => resolve()),
    };
    const mock = sinon.mock(repository);
    const connection = { getRepository: () => repository };

    expect(storeOnDB(undefined, connection, LICENSE).runIO())
      .deep.equal(LICENSE);
  }

  @test("handle a request from a new cluster")
  public request() {
    const repository = {
      findOneById: () => new Promise((resolve) => resolve(undefined)),
      persist: () => new Promise((resolve) => resolve(42)),
    };
    const connection = { getRepository: () => repository };
    const repositoryMock = sinon.mock(repository);
    const res = { send: () => { return; } };
    const resMock = sinon.mock(res);

    const req = {
      dbConnection: connection,
      swagger: {
        params: { cluster_info: { value: { cluster_uuid: "test_uuid" } } },
      },
    };

    const opts = {
      key: new NodeRSA(privateKey),
      logger: Maybe.Nothing(),
    };

    requestHandler(opts, req, res);

    resMock.verify();
  }

  @test("handle a request from the same cluster")
  public requestAgain() {
    const repository = {
      findOneById: () => new Promise((resolve) => resolve(LICENSE)),
      persist: () => new Promise((resolve) => resolve()),
    };
    const connection = { getRepository: () => repository };
    const repositoryMock = sinon.mock(repository);
    const res = { send: () => { return; } };
    const resMock = sinon.mock(res);

    const req = {
      dbConnection: connection,
      swagger: {
        params: { cluster_info: { value: { cluster_uuid: "test_uuid" } } },
      },
    };

    const opts = {
      key: new NodeRSA(privateKey),
      logger: Maybe.Nothing(),
    };

    requestHandler(opts, req, res);

    resMock.verify();
  }
}
