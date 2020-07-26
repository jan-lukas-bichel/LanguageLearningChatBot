# Main bot

This part of the project takes care of the mediation between Telegram, cloudconvert, and the satellite for file transfers.
It also persists the user data in a database.

## Installation

Make sure you have [Node.js](https://nodejs.org) installed. The package manager `npm` comes with it.

Then open a terminal in the root directory of this repository and run

```bash
npm install
```

to install all necessary dependencies for this project.

## Building

The [TypeScript](https://typescriptlang.org) compiler is used to build this project.
It can be invoked using

```bash
npm run build
```

## Lint

This project enforces linting rules using [ESLint](https://eslint.org/).
Simply run

```bash
npm run lint
```

to make sure everything in the code looks pretty.

## Running in production

The command

```bash
npm start
```

runs the project after it was built.
Only a few logs are emitted, among them are error logs.

This is the command GAE will run when you deploy the project later on.

## Running with all logs

Execute

```bash
npm run debug
```

to run the built project with all logs.
This is nice for debugging.

## Deployment

### Initial setup

#### App Engine

This project runs on GCP, the [Google Cloud Platform](https://cloud.google.com).
It (ab)uses an App Engine Frontend instance with autoscaling fixed to 1 because that's included in the free plan.
As stated above, all data is stored in a Cloud Firestore database.

First, you need to

1. [create a GCP project](https://cloud.google.com/resource-manager/docs/creating-managing-projects),
1. [set up your development environment](https://cloud.google.com/appengine/docs/standard/nodejs/setting-up-environment), and
1. [prepare your project for App Engine usage](https://cloud.google.com/appengine/docs/standard/nodejs/console).

The last step includes enabling your project for billing.
Note that the deployment of this bot is completely free as long as the bot's traffic stays within the [free quota](https://cloud.google.com/free) of GCP.

#### Database

You need to create a Firestore database, obtain a keyfile containing credentials and save that file in the root folder of this repository.
The name of the keyfile should be `firestore-keyfile.json` because that name is excluded in `.gitignore`.

You can just follow two sections from the a tutorial page, namely those:

1. [Creating a Cloud Firestore database](https://cloud.google.com/firestore/docs/quickstart-servers#create_a_in_native_mode_database)
1. [Setting up authentication](https://cloud.google.com/firestore/docs/quickstart-servers#set_up_authentication)

#### Environment variables and tokens

Create a file called `.env` in the root directory of this repository.
It will contain all of the variables that the bot will pick up automatically when it starts.

Use the format

```bash
VARIABLE_NAME=variable-value
```

inside the `.env` file.

Three environment variables need to be set for this bot to work.

1. You need to create a bot using [@BotFather](https://telegram.me/BotFather) and write its token to a variable named `BOT_API_TOKEN`
1. You need to supply your personal CloudConvert account as a backup account for the bot.
   All users of your bot will share the conversion minutes from that account until they submit their own API key.
   Add the API key of your personal account to a variable called `CLOUD_CONVERT_API_TOKEN`.
1. **Optional.**
   The bot is able to send error logs to a chat on Telegram, for example a private channel that contains the debug log.
   Set the ID of this chat in a variable with the name `ADMIN_ID`.

It usually makes sense to create two bots using [@BotFather](https://t.me/BotFather), one for production and one for development.

This bot runs with webhooks but it will automatically switch to long polling mode if `NODE_ENV` is set to `development`.
(If `NODE_ENV` is not set at all, the bot will fall back to `development`.)
This way, you can host the bot efficiently (webhooks) and still use it locally (long polling).

You can save a second set of credentials in the `.env` file.
They should have the same names as above just with `_DEV` appended, i.e. `BOT_API_TOKEN_DEV`, `CLOUD_CONVERT_API_TOKEN_DEV`, and `ADMIN_ID_DEV`.
Whenever the bot runs in development mode, the development values will be taken.

### Roll out new version

After performing the initial setup, you can easily deploy a new production version of the currently checked out source code by running

```bash
gcloud app deploy
```

### Logs

Logs will be written to stdout and to `./logs/cloudconvert-bot.log`.
This file can be configured by `LOG_FILE` and `LOG_FILE_DEV`, respectively.

Logging is done through log4js.
Thus, the log levels of this library are supported.
They can be configured via `LOG_LEVEL` and `LOG_LEVEL_DEV`, respectively.

## Software architecture

The bots uses [Telegraf.js](https://telegraf.js.org) as the framework for the bot.
Make sure you understand how the framework is used, including how middleware works.

### Which code does what

Basically, in `src/app.ts`, we start the bot which is in `src/bot/bot.ts`.
It loads all sorts of middleware from the controllers in `src/bot/controllers` to handle the various different kinds of messages.
The controllers do IO (database and replying) and control models in `src/bot/models`.
The models do the actual file conversions and generally the communication with cloudconvert.com.
The packages `src/bot/{helpers,middlewares}` are of supportive nature and only provide various utilities.

### How and which data is stored

Each chat has a session state.
Think of it like an object that contains everything the bot remembers about this chat.
Session middleware handles the loading and storing of that data for us.
The shape of the session state—including all available fields—is defined in the `SessionData` interface in `src/bot/models/task-context.ts`.

The session data can be used to store partial information about the task we need to perform, such as when only a file was received but the target format is yet to be determined by the user.

In addition, the bot collects a log of successfull conversions in a separate collection.
This includes the chat ID, source and target format, timestamp, and a boolean indicating if the conversion was triggered automatically using auto-conversions.

A third log collection saves the chat type for each seen chat ID.

Both logs are never queried and may be emptied at any time.

No files are ever accessed by the bot because they transferred exclusively by the satellite.
(The satellite does not store files permanently.)
