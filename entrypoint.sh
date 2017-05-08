#!/bin/bash

HOST=${DB_HOST:-mariadb}
PORT=${DB_PORT:-3306}

./wait-for-it.sh -h $HOST -p $PORT -- npm run app
