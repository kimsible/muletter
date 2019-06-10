# muletter

A minimalist email list driven by a Web API running on a database-less Node.js app using a JSON file as data storage.

## Requirements

You need a http web server or a cloud hosting to deploy muletter.

**Persistent storage** is obviously required to keep JSON file data integrity.


## Getting Start

Generate an **API access key** locally :
```bash
npm run key

> KEY : rltZ/0p/1sdQp+P2wBd9u9iZh97bn9dg
```

Set **environment variables** on remote server :
```
KEY authorization-key
PORT optional server port
HOST optional server host
STORAGE optional server storage path
```

And locally into `.env` :
```
KEY=authorization-key
URL=server-url
```

Export emails :
```bash
npm run export

> user1@provider.com
  user2@provider.com
  user3@provider.com
  ...
```

## API Reference

**Add email**

|Request|
|:------|
|`POST /:email`

Example :
```http
POST /user@provider.com

> user@provider.com
```


**Remove email**

|Request|Headers|
|-------|-------|
|`DELETE /:email`|`Authorization: Basic :key`|

Example :
```http
DELETE /user@provider.com
Authorization: Basic rltZ/0p/1sdQp+P2wBd9u9iZh97bn9dg

> user@provider.com
```

**Export emails**

|Request|Headers|
|:------|:------|
|`GET /`|`Authorization: Basic :key`|

Example :
```http
GET /
Authorization: Basic rltZ/0p/1sdQp+P2wBd9u9iZh97bn9dg

> user1@provider.com
  user2@provider.com
  user3@provider.com
  ...
```

**Errors**

|Code|Type|Description
|:---|:------|:-------
|401|`Unauthorized Error`|wrong API access key or bad authorization header
|405|`Method Not Allowed`|using not allowed method HEAD, PUT, PATCH ...
|409|`Conflict Error`|invalid email
|500|`Internal Server Error`|unexpected server error
