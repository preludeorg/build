# Operator Server

Operator Server is an authoring and testing application designed specifically for TTPs.

## Get started

Install the requirements and start the server:

```
pip install -r requirements.txt
python server.py
```

To do development, you must run the dev server so the client source can be compiled and served. You can do this
automatically by running these commands in a separate terminal:

```
cd client
yarn run dev
```

## Advanced

### Back End

Built on top of the Vertebrae framework, the backend is structured in the standard design (Routes, Services, databases).

The backend leverages one database:

- S3: file storage contains all source and compiled code samples.

### Front End

The front end (FE) is a minimal dependency GUI that uses React and Vite to serve and build the source code.
