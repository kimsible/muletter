# muletter

A minimalist email list driven by a Web API running on a database-less Node.js app using a JSON file as data storage.

## Requirements

You need a http web server or a cloud hosting to deploy muletter.

**Persistent storage** is obviously required to keep JSON file data integrity.


## Getting Start

Set **environment variables** on remote server :
```yaml
KEY authorization-key
PORT optional server port
HOST optional server host
STORAGE optional server storage path
```
## API Reference

**Add email**

|Request|Body|
|:------|:---|
|`POST /`|`email <string>`|

Example :
```http
POST /
user@provider.com
```
```text
user@provider.com
```

**Remove email**

|Request|
|-------|
|`DELETE /:id`|

Example :
```http
DELETE /ky8857XlEj1NXFHh
```

**Export emails**

|Request|Headers|
|:------|:------|
|`GET /`|`Authorization: Basic :key`|

Example :
```http
GET /
Authorization: Basic rltZ/0p/1sdQp+P2wBd9u9iZh97bn9dg
```
```
user1@provider.com
user2@provider.com
user3@provider.com
```

**Export emails with IDs**

|Request|Headers|
|:------|:------|
|`GET /?verbose`|`Authorization: Basic :key`|

Example :
```http
GET /?verbose
Authorization: Basic rltZ/0p/1sdQp+P2wBd9u9iZh97bn9dg
```

```json
[
  {
    "email": "user1@provider.com",
    "_id": "857XlEj1N8FHhXky"
  },
  {
    "email": "user1@provider.com",
    "_id": "7XlEky885j1NXFHh"
  },
  {
    "email": "user3@provider.com",
    "_id": "NHhky8XF857XlEj1"
  }
]
```

**Send letter to email list via SMTP**

|Request|Headers|Body|
|:------|:------|:---|
|`PUT /`|`Authorization: Basic :key`| `{ smtp, message, unsubscribe }` |

_message_: nodemailer email message fields [https://nodemailer.com/message](https://nodemailer.com/message)

_smtp_: nodemailer smtp connection [https://nodemailer.com/smtp](https://nodemailer.com/smtp)

_unsubscribe_ (optionnal): unsubscribe list header mailto


Example :
```json
PUT /
Authorization: Basic rltZ/0p/1sdQp+P2wBd9u9iZh97bn9dg

{
  "smtp": "smtps://username:password@smtp.example.com",
  "message": {
    "from": "sender@server.com",
    "subject": "Message title",
    "text": "Plaintext version of the message",
    "html": "<p>HTML version of the message</p>"
  },
  "unsubscribe": "unsubscribe@server.com"
}
```

**Errors**

|Code|Type|Description
|:---|:------|:-------
|401|`Unauthorized Error`|wrong API access key or bad authorization header
|405|`Method Not Allowed`|using not allowed method HEAD, OPTIONS, PATCH ...
|409|`Conflict Error`|invalid email
|500|`Internal Server Error`|unexpected server error
