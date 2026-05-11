// @ts-nocheck
// License generator API
// Copyright (C) 2017  Eneo Tecnología
// Author: Diego Fernández Barrera

// @ts-ignore
declare module "ramda-fantasy";
// @ts-ignore
declare module "mocha-typescript";

import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import NodeRSA from "node-rsa";
import rambdaFantasy from "ramda-fantasy";
import * as sinon from "sinon";
import { suite, test } from "mocha-typescript";

chai.use(chaiAsPromised);
const expect = chai.expect;

const IO = rambdaFantasy.IO;
const Either = rambdaFantasy.Either;
const Maybe = rambdaFantasy.Maybe;

import {
  addDays,
  addSignature,
  encodeInfo,
  findLicense,
  getUnixEpoch,
  printLicense,
  request,
  safeURLBase64Encode,
  sendError,
  sendResponse,
  storeOnDB,
} from "../api/controllers/licenses.js";

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

const LICENSE: any = {
  encoded_info: "eyJtZXNzYWdlIjoiSGVsbG8gd29ybGQifQ==",
  id: "0",
  info: { uuid: "Hello world" },
  signature: "C3g6DVIoEldLG53Dr1Ofj_JiCg_9ONyuXEVE1PeM",
};

const SENSORS = {
  199: 100,
  191: 100,
  999: 100,
  217: 100,
  187: 100,
  227: 100,
  219: 100,
  221: 100,
  223: 100,
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
    const license = encodeInfo(LICENSE);
    expect(license.encoded_info)
      .to.eq("eyJ1dWlkIjoiSGVsbG8gd29ybGQifQ==");
  }

  @test("sign a license using a rsa key")
  public addSignature() {
    const key = new NodeRSA(privateKey);
    const license: any = (addSignature as any)(key, LICENSE);
    expect(license.signature)
      .to.eq("NBLguIM2kdTig9ZnKfgFbY-Ghra4x4wu9akEoQrIbH8bC5btrpZekHcYLbAxPF" +
      "1pA8gCieU8v4uz9_C2jcjZJrPfqyLcgZmvGk27ZEiTO6uZQs_XwmwprYxuWpGHhFkRerM" +
      "C3g6DVIoEldLG53Dr1Ofj_JiCg_9ONyuXEVE1PeM=");
  }

  @test("get Unix epoch from a date")
  public getUnixEpoch() {
    const date = new Date("Tue, 29 May 1990 0:00:00 GMT");
    expect(getUnixEpoch(date)).to.eq(643939200);
  }

  @test("add 30 days to a given date")
  public add30Days() {
    const date = new Date("Tue, 29 May 1990 0:00:00 GMT");
    expect(addDays(30, date).getTime() / 1000).to.eq(646531200);
  }

  @test("send a license")
  public sendLicense() {
    const res = { send: () => { return; } };

    const mock = sinon.mock(res);
    mock.expects("send").once().withArgs(LICENSE);

    (sendResponse as any)(res, LICENSE).runIO();

    mock.verify();
  }

  @test("print a license")
  public printLicense() {
    const logger = { debug: () => { return; } };

    const mock = sinon.mock(logger);
    mock.expects("debug").once().withArgs(sinon.match.string);

    (printLicense as any)(Maybe.of(logger), LICENSE).runIO();

    mock.verify();
  }

  @test("send an error")
  public sendError() {
    const res = { send: () => { return; } };
    const mock = sinon.mock(res);

    mock.expects("send").once().withArgs({ message: "Hello" });

    (sendError as any)(res, "Hello").runIO();

    mock.verify();
  }

  @test("find a license on the database which exists")
  public findLicenseFound() {
    const repository = {
      findOneBy: () => Promise.resolve(LICENSE),
    };
    const connection = { getRepository: () => repository };

    return expect((findLicense as any)(undefined, connection, LICENSE).runIO())
      .to.eventually.deep.equal(Either.Left(LICENSE));
  }

  @test("find a license on the database which does not exists")
  public findLicenseNotFound() {
    const repository = {
      findOneBy: () => Promise.resolve(undefined),
    };
    const connection = { getRepository: () => repository };

    return expect((findLicense as any)(undefined, connection, LICENSE).runIO())
      .to.eventually.deep.equal(Either.Right(LICENSE));
  }

  @test("store a license on the database")
  public storeOnDB() {
    const repository = {
      save: (l) => Promise.resolve(l),
    };
    const connection = { getRepository: () => repository };

    return expect((storeOnDB as any)(undefined, connection, LICENSE).runIO())
      .to.eventually.deep.equal(LICENSE);
  }

  @test("handle a request from a new cluster")
  public request() {
    const repository = {
      findOneBy: () => Promise.resolve(undefined),
      save: (l) => Promise.resolve(l),
    };
    const connection = { getRepository: () => repository };
    const res = { send: () => { return; } };
    const resMock = sinon.mock(res);

    const req = {
      ctx: {
        dbConnection: connection,
        entity: class { },
        key: new NodeRSA(privateKey),
        sensors: SENSORS,
        logger: { debug: () => { return; } },
      },
      swagger: {
        params: { cluster_info: { value: { cluster_uuid: "test_uuid", organization_uuid: "org_uuid" } } },
      },
    };

    resMock.expects("send").once();

    request(req, res);
  }

  @test("handle a request from the same cluster")
  public requestAgain() {
    const repository = {
      findOneBy: () => Promise.resolve(LICENSE),
      save: (l) => Promise.resolve(l),
    };
    const connection = { getRepository: () => repository };
    const res = { send: () => { return; } };
    const resMock = sinon.mock(res);

    const req = {
      ctx: {
        dbConnection: connection,
        entity: class { },
        key: new NodeRSA(privateKey),
        sensors: SENSORS,
        logger: { debug: () => { return; } },
      },
      swagger: {
        params: { cluster_info: { value: { cluster_uuid: "test_uuid", organization_uuid: "org_uuid" } } },
      },
    };

    resMock.expects("send").once().withArgs({ message: "Already generated a demo license for this cluster" });

    request(req, res);
  }
}
