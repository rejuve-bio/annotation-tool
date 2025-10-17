# Custom Atomspace Builder

### Instruction to run
First create an .env file and define the LOADER_URL and ANNOTATION_URL variables.

#### Run locally in development mode

```shellscript
npm run dev
```

#### Run in production mode using docker

```sh
docker build -t custom-atomspace-tool .
```

```sh
docker run -p 3000:3000 --env-file .env -d custom-atomspace-tool
```

Finally, navigate to https://localhost:3000 in your browser.
