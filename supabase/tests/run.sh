#!/bin/bash
# Test the migrations on a throwaway local Postgres (16+): bash supabase/tests/run.sh
set -e
cd "$(dirname "$0")"
D=$(mktemp -d); trap 'pg_ctl -D "$D" stop -m fast >/dev/null 2>&1; rm -rf "$D"' EXIT
PATH=$(ls -d /usr/lib/postgresql/*/bin | tail -1):$PATH
initdb -D "$D" -A trust -U postgres >/dev/null
pg_ctl -D "$D" -o "-k $D -p 5498 -c listen_addresses=" -l "$D/log" start >/dev/null
psql -h "$D" -p 5498 -U postgres -q -v ON_ERROR_STOP=1 -f mock_auth.sql $(printf -- '-f %s ' ../migrations/*.sql) -f rooms_test.sql -f progress_test.sql 2>&1 | grep -E 'ok:|FAILED|ERROR|PASSED'
