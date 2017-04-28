[![Build Status](https://travis-ci.org/redBorder/license-generator.svg?branch=master)](https://travis-ci.org/redBorder/license-generator)
[![Coverage Status](https://coveralls.io/repos/github/redBorder/license-generator/badge.svg?branch=master)](https://coveralls.io/github/redBorder/license-generator?branch=master)
[![Documentation](https://img.shields.io/badge/api-documentation-blue.svg)](https://redborder.github.io/license-generator/)

# License Generator

## Overview

This is the **redBorder License Generator**. It's a simple script for generating
demo licenses using a RESTful API.

The API can be used to request demo licenses valid for 30 days for a
cluster. **Only one license per cluster is allowed**.

## Install

Just clone the repo and then:

```bash
npm install
npm run build
```

### Using Docker

```bash
docker run -d -p 3000:3000 redBorder/license-generator
```

## Usage

First, you need to run the server:

```bash
env PRIVATE_KEY="PRIVATE KEY GOES HERE" npm run app
```

To get a license you can simply `POST` to the `/api/v1/licenses` sending a
cluster UUID.

```
POST /api/v1/licenses
Content-Type: application/json

{"cluster_uuid": "dfe7e4a8-5d2d-4835-b381-926085802e98"}
```

You can test it with curl:

```bash
curl -X POST \
  http://localhost:3000/api/v1/licenses \
  -H 'content-type: application/json' \
  -d '{"cluster_uuid": "dfe7e4a8-5d2d-4835-b381-926085802e98"}'
```
