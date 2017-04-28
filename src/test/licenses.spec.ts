import { expect } from "chai";
import { suite, test } from "mocha-typescript";

import * as NodeRSA from "node-rsa";
import * as rambdaFantasy from "ramda-fantasy";
import * as sinon from "sinon";

import {
  add30Days,
  addSignature,
  encodeInfo,
  getUnixEpoch,
  printLicense,
  requestHandler,
  safeURLBase64Encode,
  sendLicense,
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
      info: { message: "Hello world" },
      signature: "",
    };
    const license = encodeInfo(baseLicense);
    expect(license.encoded_info)
      .to.eq("eyJtZXNzYWdlIjoiSGVsbG8gd29ybGQifQ==");
  }

  @test("sign a license using a rsa key")
  public addSignature() {
    const key = new NodeRSA(privateKey);

    const baseLicense = {
      encoded_info: "eyJtZXNzYWdlIjoiSGVsbG8gd29ybGQifQ==",
      info: { message: "Hello world" },
      signature: "",
    };
    const license = addSignature(key, baseLicense);
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
    const license = {
      encoded_info: "eyJtZXNzYWdlIjoiSGVsbG8gd29ybGQifQ==",
      info: { message: "Hello world" },
      signature: "C3g6DVIoEldLG53Dr1Ofj_JiCg_9ONyuXEVE1PeM",
    };
    const res = { send: () => { return; } };

    const mock = sinon.mock(res);
    mock.expects("send").calledWith(license);

    sendLicense(res, license).runIO();

    mock.verify();
  }

  @test("print a license")
  public printLicense() {
    const license = {
      encoded_info: "eyJtZXNzYWdlIjoiSGVsbG8gd29ybGQifQ==",
      info: { message: "Hello world" },
      signature: "C3g6DVIoEldLG53Dr1Ofj_JiCg_9ONyuXEVE1PeM",
    };
    const logger = { debug: () => { return; } };

    const mock = sinon.mock(logger);
    mock.expects("debug").calledWith(license);

    printLicense(Maybe.of(logger), license).runIO();

    mock.verify();
  }

  @test("handle a request")
  public request() {
    const license = {
      encoded_info: "eyJtZXNzYWdlIjoiSGVsbG8gd29ybGQifQ==",
      info: { message: "Hello world" },
      signature: "C3g6DVIoEldLG53Dr1Ofj_JiCg_9ONyuXEVE1PeM",
    };

    const req = {
      swagger: {
        params: { cluster_info: { value: { cluster_uuid: "test_uuid" } } },
      },
    };

    const res = { send: () => { return; } };
    const mock = sinon.mock(res);

    const opts = {
      logger: Maybe.Nothing(),
      pem: new NodeRSA(privateKey),
    };

    requestHandler(opts, req, res);
  }
}
