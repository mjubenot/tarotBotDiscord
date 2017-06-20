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

const emojisPlayerChoice= {
    "1⃣":{
        name:"1",
        indexValue:0
    },
    "2⃣":{
        name:"2",
        indexValue:1
    },
    "3⃣":{
        name:"3",
        indexValue:2
    },
    "4⃣":{
        name:"4",
        indexValue:3
    },
    "5⃣":{
        name:"5",
        indexValue:4
    },
    "❌":{
        name:"Cancel",
        indexValue:-1
    },
}

const emojisYesNo= {
    "✅":{
        name:"Yes"
    },
    "❌":{
        name:"No"
    },
}

var currentGame;
var currentRound;
var botState="default";

var Player = function(name){
    this.score=[0];
    this.name=name;
}

var Game = function(){
    this.players=[];
    this.rounds=[];
    this.dateCreation=new Date().getDate();
    this.numberOfRound=1;

}

var Round = function(owner,players){
    var playersSliced=players.slice(0);
    playersSliced.shift();
    this.owner=owner;
    this.players=playersSliced;
    this.indexOfPlayerWhoTook;
    this.indexOfPlayerCalled;
    this.isWon;
    this.ecartScore;
    this.state=0;
}

Game.prototype.addPlayer = function (player){
    if(player instanceof Player){
        this.players.push(player);
    } else {
        this.players.push(new Player(player));
    }
};

Game.prototype.addRound = function (round){
    if(round instanceof Round){
        this.rounds.push(round);
        
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

Game.prototype.findPlayerByName = function (playerName){
    var playerFound=null;
    this.players.forEach(function(player){
        if(player.name===playerName){
            playerFound=player;
        }
    });
    return playerFound;
}

Game.prototype.findPlayersByRound = function (round){
    var playersInRound=[];
    round.players.forEach(function(player){
        playersInRound.push(this.findPlayerByName(player));
    });
    return playersInRound;
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
    currentRound=new Round(message.author,messageSplit);
    if(messageSplit.length!=6){
      message.channel.send("To add a new round, please use this command with the name of the 5 players that played this round");
      message.channel.send("The users in the game are: "+currentGame.listPlayerString());
      currentRound=null;
      return;
    }

    for(i=1;i<messageSplit.length && currentGame!=null;i++){
      if(!currentGame.doesPlayerExist(messageSplit[i])){
        message.channel.send("The player **"+messageSplit[i]+"** does not exist :/");
        message.channel.send("The users in the game are: **"+currentGame.listPlayerString()+"**");
        currentRound=null;
        return;
      }
    }

    var toSend="Who took this round? ";
    currentGame.players.forEach(function(player,index){
        toSend+="**"+(index+1)+"**: "+player.name+"  "
    });
    message.channel.send(toSend)
    .then((message) => {
        for(var i=0;i<Object.keys(emojisPlayerChoice).length;i++){
            setTimeout(reactTo.bind(null, message,Object.keys(emojisPlayerChoice)[i])
                
            ,i*500);
        }
        new Discord.ReactionCollector(message,
        (emoji) => {
            if(emoji.users.last().id != currentRound.owner.id && emoji.users.last().id != "324903595411505152"){
                emoji.remove(emoji.users.last()).then((messageReaction) => {

                })
                .catch(function() {
                    console.log("Erreur lors de la supression de la réaction non autorisée");
                });
            } else {
                return emoji;
            }
        }).on("collect",(emoji) => {
            if(emoji.users.last().id == currentRound.owner.id){
                if(currentRound.state != 2 && emojisPlayerChoice[emoji._emoji.name]!=null && emojisPlayerChoice[emoji._emoji.name].name=="Cancel"){
                    currentRound=null;
                    emoji.message.clearReactions();
                    emoji.message.edit("Round cancelled by"+emoji.users.last());
                    return;
                }
                switch(currentRound.state){
                    case 0:
                        forEdit="**"+currentRound.players[emojisPlayerChoice[emoji._emoji.name].indexValue]+"** took  \nWho was called ? ";
                        currentGame.players.forEach(function(player,index){
                            forEdit+="**"+(index+1)+"**: "+player.name+"  "
                        });
                        emoji.message.edit(forEdit);
                        currentRound.state++;
                        break;

                    case 1:
                        currentRound.indexOfPlayerWhoTook=emojisPlayerChoice[emoji._emoji.name].indexValue;
                        forEdit=emoji.message.content.split("  \n")[0]+"  \n**"+currentRound.players[emojisPlayerChoice[emoji._emoji.name].indexValue]+"** was called  \nDid they won? ";
                        emoji.message.edit(forEdit);
                        emoji.message.clearReactions().then((message) => {
                            for(var i=0;i<Object.keys(emojisYesNo).length;i++){
                                setTimeout(reactTo.bind(null, message,Object.keys(emojisYesNo)[i]),i*1000);
                            }
                         });
                        currentRound.state++;
                        break;

                    case 2:
                        currentRound.isWon=(emojisYesNo[emoji._emoji.name].name=="Yes")?true:false;
                        currentRound.indexOfPlayerCalled=emojisPlayerChoice[emoji._emoji.name].indexValue;
                        emoji.message.clearReactions().then((message) => {
                            for(var i=0;i<Object.keys(emojisPlayerChoice).length;i++){
                                setTimeout(reactTo.bind(null, message,Object.keys(emojisPlayerChoice)[i]),i*500);
                            }
                         });
                        forEdit=emoji.message.content.split("  \n")[0]+"  \n";
                        forEdit+=emoji.message.content.split("  \n")[1]+"  \n";
                        forEdit+=(emojisYesNo[emoji._emoji.name].name=="Yes")?"They **won**  \n":"They **lost**  \n";
                        forEdit+="By how many points? (emoji * 10)";
                        emoji.message.edit(forEdit);
                        currentRound.state++;
                        break;

                    case 3:
                        currentRound.ecartScore=(emojisPlayerChoice[emoji._emoji.name].indexValue+1)*10;
                        emoji.message.clearReactions().then((message) => {
                            for(var i=0;i<Object.keys(emojisYesNo).length;i++){
                                setTimeout(reactTo.bind(null, message,Object.keys(emojisYesNo)[i]),i*1000);
                            }
                         });
                        forEdit=emoji.message.content.split("  \n")[0]+"  \n";
                        forEdit+=emoji.message.content.split("  \n")[1]+"  \n";
                        forEdit+=emoji.message.content.split("  \n")[2]+"  \n";
                        forEdit+=emoji.message.content.split("  \n")[3]+" by **"+(emojisPlayerChoice[emoji._emoji.name].indexValue+1)*10+"** points  \n";
                        forEdit+="Does everything seems right to you ?";
                        emoji.message.edit(forEdit);
                        currentRound.state++;
                        break;
                    
                    case 4:
                        forEdit=emoji.message.content.split("  \n")[0]+"  \n";
                        forEdit+=emoji.message.content.split("  \n")[1]+"  \n";
                        forEdit+=emoji.message.content.split("  \n")[2]+"  \n";
                        forEdit+=emoji.message.content.split("  \n")[3]+"  \n";
                        forEdit+="Round validated";
                        currentRound.state++;
                        break;
                }

                emoji.remove(emoji.users.last()).then((messageReaction) => {

                })
                .catch(function() {
                    console.log("Erreur lors de la supression de la réaction non autorisée");
                });
                if(currentRound.state==5){
                    currentGame.addRound(currentRound);
                }
            }
        });
    }).catch(function(error) {
        console.log(error);
        console.log("Erreur lors de l'envoi du message");
    });

  }

  if(command === 'test'){
    message.channel.send("!newGame");
    setTimeout(function(){message.channel.send("!addPlayer 1 2 3 4 5");},500);
    //setTimeout(function(){message.channel.send("!newRound 1 2 3 4 5");},1000);
  }
}

function capitalize(s)
{
    return s[0].toUpperCase() + s.slice(1);
}

function reactTo(message,value){
    message.react(value);
}

// Log our bot in
client.login(token);