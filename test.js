/*
  A bot that welcomes new guild members when they join
*/

// Import the discord.js module
const Discord = require('discord.js');

const commandPrefix = '!';

// Create an instance of a Discord client
const client = new Discord.Client();

// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'MzI0OTAzNTk1NDExNTA1MTUy.DCQgLQ.kJ2qmh7_PZrKIh8DXglls4VIcw8';

var currentGame;
var currentRound;
var botState="default";

var Player = function(name){
    this.score=[0];
    this.name=name;
}

var Game = function(){
    this.players=[];
    this.dateCreation=new Date().getDate();


}

var Round = function(owner){
    this.owner=owner;
    this.indexOfPlayerWhoTook;
    this.indexOfPlayerCalled;
    this.isWon;
    this.ecartScore;
}

Game.prototype.addPlayer = function (player){
    if(player instanceof Player){
        this.players.push(player);
    } else {
        this.players.push(new Player(player));
    }
};

Game.prototype.doesPlayerExist = function (playerToTest){
    var exist=false;
    this.players.forEach(function(player){
        if(player.name===playerToTest){
            exist=true;
        }
    });
    return exist;
}

Game.prototype.listPlayerString = function (){
    var toReturn="";
    this.players.forEach(function(player){
        toReturn+=player.name+", ";
    },this);
    return toReturn;
};

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
  console.log('I am ready!');
});

//client.on('debug', console.log)

client.on('message', message => {
    eval("DecisionalTree"+capitalize(botState)+"(message)");
});


function DecisionalTreeDefault(message){
  // If the message is "ping"
  if(message.content.charAt(0) != commandPrefix ){
      return;
  }
  var messageSplit=message.content.slice(1).split(" ");
  command=messageSplit[0];
  if (command === 'ping') {
      var hey=new Date().getTime()-message.createdTimestamp;
    // Send "pong" to the same channel
    message.channel.send('Pong! Your ping (or mine, I don\'t know yet) is '+hey +'ms !');
  }

  if(command === 'newGame'){
    currentGame=new Game();
    message.channel.send('Game created. To add players, type !addPlayer *name*. You can add several players by putting a space beetween each name :). But please be careful, you won\'t be able to remove player once added without creating a new game');
  }

  if(command === 'addPlayer'){
    for(i=1;i<messageSplit.length && currentGame!=null;i++){
        currentGame.addPlayer(messageSplit[i]);
    }
    message.channel.send("Player(s) added");
  }

  if(command === 'scoreboard'){
          var fields=[];
    for(i=0;i<currentGame.numberOfRound && currentGame!=null;i++){
        var embedValue='';
        for(j=0;j<currentGame.players.length && currentGame!=null;j++){
            embedValue+=currentGame.players[j].name+': '+currentGame.players[j].score+'  ';
        }
         fields.push({
            name: "Round "+i,
            value: embedValue
            });
    }

    message.channel.send({embed: {
        color: 3447003,
        author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
        },
        title: "Scoreboard",
        fields: fields,
        timestamp: new Date(),
        footer: {
            text: "\"Donc t'as annoncé une garde sans avec le petit et un roi ?\" \"Bah ouais pourquoi?\" "
        }
    }});
  }

  if(command === 'newRound'){
    if(currentRound!=null){
         message.channel.send("Hey, "+currentRound.owner+" is creating a Round right now, you have to wait. You're free to blame him tho ;).");
         return;
    }
    currentRound=new Round(message.author);
    if(messageSplit.length!=6){
      message.channel.send("To add a new round, please use this command with the name of the 5 players that played this round");
      message.channel.send("The users in the game are: "+currentGame.listPlayerString());
      return;
    }

    for(i=1;i<messageSplit.length && currentGame!=null;i++){
      if(!currentGame.doesPlayerExist(messageSplit[i])){
        message.channel.send("The player **"+messageSplit[i]+"** does not exist :/");
        message.channel.send("The users in the game are: **"+currentGame.listPlayerString()+"**");
        return;
      }
    }

    var toSend="Who took this round? ";
        currentGame.players.forEach(function(player,index){
        toSend+="**"+(index+1)+"**: "+player.name+"  "
    });
    message.channel.send(toSend)
    .then((message) => {
        setTimeout(function(){message.react("1⃣");},500);
        setTimeout(function(){message.react("2⃣");},1000);
        setTimeout(function(){message.react("3⃣");},1500);
        setTimeout(function(){message.react("4⃣");},2000);
        setTimeout(function(){message.react("5⃣");},2500);
        setTimeout(function(){message.react("❌");},3000);
        new Discord.ReactionCollector(message,
        (emoji) => {
            if(emoji.users.last().id != currentRound.owner.id && emoji.users.last().id != "324903595411505152"){
                emoji.remove(emoji.users.last()).then((messageReaction) => {
                    console.log(messageReaction.count)
                })
                .catch(function() {
                    console.log("Erreur lors de la supression de la réaction non autorisée");
                });
                console.log("hey");
            }else {
                return emoji;
            }
        }).on("collect",(emoji) => {
            console.log(emoji.message.author.id);
        });
    }).catch(function() {
        console.log("Erreur lors de l'envoie du message");
    });

  }

  if(command === 'test'){
    message.channel.send("!newGame");
    setTimeout(function(){message.channel.send("!addPlayer 1 2 3 4 5");},500);
    //setTimeout(function(){message.channel.send("!newRound lui moi eux elles ils");},1000);
  }
}

function capitalize(s)
{
    return s[0].toUpperCase() + s.slice(1);
}

// Log our bot in
client.login(token);