#!/bin/sh
envsubst '${PORT}' < /etc/nginx/http.d/default.conf > /etc/nginx/http.d/default.conf.tmp
mv /etc/nginx/http.d/default.conf.tmp /etc/nginx/http.d/default.conf
exec supervisord -c /etc/supervisord.conf