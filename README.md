# mombot

A discord bot for mom

# Node

Version 16.13.1 is recommended

# config file - config.js

{
"prefix": "$",
"color": "RANDOM",
"testing": {
"usedev": true,
"prefix": "!"
},
"tokens": {
"dev": "botdevtoken",
"prod": "botprodtoken",
"weather": "weathertoken"
},
"sql": {
"host": "localhost",
"username": "username",
"password": "password",
"database": "database"
},
"web": {
"url": "url",
"port": portnum,
"dburl": "dburl/url"
}
}

# Database - Tables / Columns

guild {
guildid
name
owner  
PRIMARY KEY (guildid)
}

prison {
guildid
prisonid  
PRIMARY KEY (guildid)  
}

hello {
guildid
helloid
PRIMARY KEY (guildid)  
}

remind {
tbd
}
