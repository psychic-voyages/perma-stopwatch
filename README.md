Project uses PostgreSQL, Node, Vite.

1. Clone the repo
2. `cd ./perma-stopwatch`
3. Run the commands:
  - `createdb perma_stopwatch`
  - `echo "DATABASE_URL=http://localhost:5432/perma_stopwatch" > .env
    - This step assumes you have `trust` set on local hosts, adapt to authentication required by your machine
  - `npm i`
  - `npm run db:init`
    - Again, you may run into auth errors with this command, adapt it and `schema.sql` to satisfy your db requirements
  - `npm run server`
  - `npm run client:dev`

Your server should now be running!
