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
<br/><br/><br/><br/>

### Usage
Start by importing your data and defining schema for it. You may use the "Suggest a schema" button to have an LLM build a schema from the uploaded files. You have the option to select Neo4j, Metta or Mork as the writer type.
<br/><br/>
<img width="1391" height="786" alt="image" src="https://github.com/user-attachments/assets/f40412fe-148b-4388-8457-340d5576004b" />
<br/>

<br/>
Once the data is imported, you will be redirected to the dashboard where you will see a summary of the newly created Atomspace.
<br/><br/>
<img width="1391" height="786" alt="image" src="https://github.com/user-attachments/assets/f80d427b-5200-401c-a414-785955057dfa" />
<br/>

<br/>
You may then use the graphical query builder to query your Atomspace and visualize the results.
<br/><br/>
<img width="1391" height="786" alt="image" src="https://github.com/user-attachments/assets/74c8ba57-25dd-40d4-97d5-1912dbb98bac" />
<br/>
<img width="1391" height="786" alt="image" src="https://github.com/user-attachments/assets/740c89db-82af-42a3-bb98-aa5f12d39fc7" />
<br/>

<br/>
All previously run annotation queries are stored and listed.
<br/><br/>
<img width="1391" height="786" alt="image" src="https://github.com/user-attachments/assets/0feae652-a287-48c6-bef3-239b00319f2e" />
<br/>

<br/>
You may switch between your cutom Atomspaces and your new queries will be run aganinst the selected Atomspace.
<br/><br/>
<img width="1391" height="786" alt="image" src="https://github.com/user-attachments/assets/8d500bf9-f00d-4664-8946-20c177dd88d4" />
<br/>
<br/>
<br/>
<br/>
