# mombot

A discord bot for mom

# Node

Version 16.13.1 is recommended

# Config file - config.js

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
},
"ps5": {
"guildId": "guildId which is also mainchannelid"
},
"oxford": {
"appid": "appid",
"key": "appkey"
},
"getproxy": {
"host": "hostname",
"key": "key"
},
"mealdb": {
"key": "key"
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
id  
 guildid  
 userid  
 names  
 channels  
 message  
 time  
 PRIMARY KEY (id)
}

# Add MOM without the hassel

May need to add seperate elevated roles.
https://discord.com/oauth2/authorize?client_id=846779816736849920&permissions=0&scope=bot%20applications.commands
