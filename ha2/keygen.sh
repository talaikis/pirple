#!/bin/bash

openssl req -newkey rsa:4096 -new -nodes -x509 -days 3650 -keyout certs/key.pem -out certs/cert.pem
openssl dhparam -outform PEM -out certs/dhparam.pem 4096
openssl genrsa -des3 -out certs/private.pem 2048
openssl rsa -in certs/private.pem -outform PEM -pubout -out certs/public.pem