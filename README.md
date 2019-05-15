# MeetUp

CSCI4140 project - Meet Up 

Interest / Tutorial Class Matching Platform

Group 3 CHAN PAK SHING, YAU TSZ YAN

## Installation

NodeJS is the prerequisite for using this project. After you have installed it, use the following command to install the package.

```bash
npm install
```

## Initialise Database

A Microsoft SQL Server is required. After a database is created, run the provided [sql script](https://github.com/ytyau/meetUp/blob/master/CreateTable.sql) to create the required tables and triggers.

## System Configuration

The system configuration is stored in [config.json](https://github.com/ytyau/meetUp/blob/master/config.json). Here is the explanation of those attributes.
* dbHost: The hostname of your database. It should be a Microsoft SQL Server
* dbPort: It should be an integer specifying the database port that you use
* dbAcc: The account name of the database
* dbPwd: The password of the database
* dbName: The databae name
* fromGmail: The Gmail account to send out registration and notification mail. You must allow less secure apps to access your Gmail account. See the documentation [here](https://support.google.com/accounts/answer/6010255?hl=zh-Hant).
* gmailPwd: The password of gmail

## Github Repository
[https://github.com/ytyau/meetUp](https://github.com/ytyau/meetUp)

## Commit Hash
60e9796