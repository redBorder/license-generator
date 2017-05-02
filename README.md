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

A mariadb instance running is required. Just clone the repo and then:

```bash
npm install
npm run build
```

### Configuration

The configuration is done using environment variables:

- `DB_DATABASE ("licenses")`: Name of the database.
- `DB_HOST ("mariadb")`: Hostname where the database is running.
- `DB_PASSWORD ("qwerty")`: Password for the database connection.
- `DB_PORT (3306)`: Port for the connection to the database.
- `DB_USERNAME ("root")`: Username for the connection to the database.
- `LOG_LEVEL ("info")`: Allowed: ["error", "warn", "info", "debug", "trace"].
- `PORT (3000)`: Por to listen for HTTP connections.
- `PRIVATE_KEY ("")`: Private key for signing licenses. Should be on PEM format
and must be separate by '\n' chars. Example:
```
-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTCpvKe4eCZ0FPqri0cb2JZfXJ/DgYSF6vUp\n...
```

### Using Docker

Running with docker compose:

```yaml
version: '2'

services:
  server:
    image: redborder/license-generator
    environment:
      - PRIVATE_KEY="<your private key here>"

  mariadb:
    image: mariadb
    environment:
      - MYSQL_DATABASE="licenses"
      - MYSQL_ROOT_PASSWORD=qwerty
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

For more information check [documentation](https://redborder.github.io/license-generator/).
