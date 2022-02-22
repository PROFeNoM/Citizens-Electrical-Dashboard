# Citizen Electrical Dashboard — Server

## Install the dependencies

Install PNPM if needed:

```bash
npm i -g pnpm
```

Then install the project dependencies:

```bash
pnpm i
```

## Start the database

```bash
docker-compose up
```

## Init database

```bash
pnpm build
pnpm init-db
```

## Run the server in watch mode

```bash
pnpm watch
```
