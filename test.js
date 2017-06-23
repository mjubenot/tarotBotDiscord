const Discord = require('discord.js');
const config = require('./conf/config.json');
const Game = require('./class/game.js').Game;
const Player = require('./class/player.js').Player;
const Round = require('./class/round.js').Round;
const utils = require('./utils/utils.js');
const emojis=config.emojis;

const client = new Discord.Client();


var currentGame;
var currentRound;
var states={
    botState:"default",
    messageState:{
        messageReady:false
    }
};
var isMessageReady=true;

client.on('ready', () => {
    console.log("I'm ready!")
    currentGame=new Game();
});

client.on('message', message => {
    eval("DecisionalTree"+utils.capitalize(states.botState)+"(message)");
});


function DecisionalTreeDefault(message){
  if(message.content.charAt(0) != config.commandPrefix ){
      return;
  }
  var messageSplit=message.content.slice(1).split(" ");
  command=messageSplit[0];
  if (command === 'ping') {
      var hey=new Date().getTime()-message.createdTimestamp;
    // Send "pong" to the same channel
    message.channel.send('Pong! Your ping (or mine, I don\'t know yet) is '+hey +'ms !');
  }

  if(command == "help"){

    message.channel.send("To add players, type !addPlayer *name*. You can add several players by putting a space beetween each name :). But please be careful, you won\'t be able to remove player once added without creating a new game  \n  \nTo add a round, type !newRound with the name of the 5 players that played this round  \n  \nType !scoreboard to see .... the scoreboard.  \n  \nIf you want to reset the game, type !newGame")
    
  }

  if(command === 'newGame'){
    currentGame=new Game();
    message.channel.send('Game created.');
  }

  if(command === 'addPlayer'){
    for(i=1;i<messageSplit.length && currentGame!=null;i++){
        currentGame.addPlayer(messageSplit[i]);
    }
    message.channel.send("Player(s) added");
  }


  if(command === 'scoreboard'){
    var fields=[];
    if(currentGame.players.length==0){
         message.channel.send("No players yet :(");
         return;
    }
    for(i=0;i<currentGame.rounds.length+1 && currentGame!=null;i++){
        var embedValue='';
        for(j=0;j<currentGame.players.length && currentGame!=null;j++){
            embedValue+=currentGame.players[j].name+': '+currentGame.players[j].score[i]+'  ';
        }
         fields.push({
            name: "Round "+i,
            value: embedValue
            }); 
    }

    utils.sendEmbedMessage(message,client,"Scoreboard",fields,"\"Donc t'as annoncé une garde sans avec le petit et un roi ?\" \"Bah ouais pourquoi?\"");
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
    currentGame.findPlayersByRound(currentRound).forEach(function(player,index){
        toSend+="**"+(index+1)+"**: "+player.name+"  "
    });
    
    message.channel.send(toSend)
    .then((message) => {
        utils.reactEmojiSetTo(message,Object.keys(emojis.choosePlayer),states.messageState);
        new Discord.ReactionCollector(message,(emoji) => {return emoji;})
        .on("collect",(emoji) => {
            if(emoji.users.last().id == currentRound.owner.id && states.messageState.isMessageReady){
                if(currentRound.state != 3 && emojis.choosePlayer[emoji._emoji.name]!=null && emojis.choosePlayer[emoji._emoji.name].name=="Cancel"){
                    currentRound=null;
                    emoji.message.clearReactions();
                    emoji.message.edit(emoji.message.content+"  \nRound cancelled by"+emoji.users.last());
                    return;
                }
                switch(currentRound.state){
                    case 0:
                    
                        currentRound.indexOfPlayerWhoTook=emojis.choosePlayer[emoji._emoji.name].indexValue;
                        forEdit="**"+currentRound.players[emojis.choosePlayer[emoji._emoji.name].indexValue]+"** took  \nWho was called ? ";
                        currentGame.findPlayersByRound(currentRound).forEach(function(player,index){
                            forEdit+="**"+(index+1)+"**: "+player.name+"  "
                        });
                        emoji.message.edit(forEdit);
                        currentRound.state++;
                        break;

                    case 1:
                        currentRound.indexOfPlayerCalled=emojis.choosePlayer[emoji._emoji.name].indexValue;

                        forEdit=utils.getLines(emoji.message.content,1,2);
                        forEdit+="**"+currentRound.players[emojis.choosePlayer[emoji._emoji.name].indexValue]+"** was called   \n";
                        forEdit+="What did they took? ";

                        for(var i=0;i<Object.keys(emojis.chooseStake).length-1;i++){
                            forEdit+=""+Object.keys(emojis.chooseStake)[i]+": "+emojis.chooseStake[Object.keys(emojis.chooseStake)[i]].name+"  "
                        }
                        emoji.message.clearReactions().then((message) => {
                            utils.reactEmojiSetTo(message,Object.keys(emojis.chooseStake),states.messageState);
                         });
                        emoji.message.edit(forEdit);
                        currentRound.state++;
                        break;

                    case 2:
                        currentRound.mise=emojis.chooseStake[emoji._emoji.name].stake;
                        forEdit=utils.getLines(emoji.message.content,1,3);
                        forEdit+="A **"+emojis.chooseStake[emoji._emoji.name].name+"** was taken  \n";
                        forEdit+="Did they won? ";
                        emoji.message.edit(forEdit);


                        emoji.message.clearReactions().then((message) => {
                            utils.reactEmojiSetTo(message,Object.keys(emojis.yesOrNo),states.messageState);
                         });
                        currentRound.state++;
                        break;

                    case 3:
                        currentRound.isWon=(emojis.yesOrNo[emoji._emoji.name].name=="Yes")?true:false;
                        emoji.message.clearReactions().then((message) => {
                            utils.reactEmojiSetTo(message,Object.keys(emojis.chooseEcart),states.messageState);
                         });
                        forEdit=utils.getLines(emoji.message.content,1,4);

                        forEdit+=(emojis.yesOrNo[emoji._emoji.name].name=="Yes")?"They **won**  \n":"They **lost**  \n";

                        forEdit+="By how many points? (emoji * 10)";
                        emoji.message.edit(forEdit);
                        currentRound.state++;
                        break;

                    case 4:
                        currentRound.ecartScore=emojis.chooseEcart[emoji._emoji.name].value;
                        emoji.message.clearReactions().then((message) => {
                            utils.reactEmojiSetTo(message,Object.keys(emojis.yesOrNo),states.messageState);
                         });
                        forEdit=utils.getLines(emoji.message.content,1,4);
                        forEdit+=emoji.message.content.split("  \n")[3]+" by **"+emojis.chooseEcart[emoji._emoji.name].value+"** points  \n";
                        forEdit+="Does everything seems right to you ?";
                        emoji.message.edit(forEdit);
                        currentRound.state++;
                        break;
                    
                    case 5:
                        forEdit=utils.getLines(emoji.message.content,1,5);
                        forEdit+="Round validated and added by "+currentRound.owner;
                        emoji.message.edit(forEdit);
                        emoji.message.clearReactions()
                        currentRound.state++;
                        break;
                }

                emoji.remove(emoji.users.last())
                .catch(function() {
                    console.log("Erreur lors de la supression de la réaction non autorisée");
                });
                if(currentRound.state==6){
                    currentGame.addRound(currentRound);
                    currentRound=null;
                }
            } else if(emoji.users.last().id!=config.botId) {
                emoji.remove(emoji.users.last())
                .catch(function() {
                    console.log("Erreur lors de la supression de la réaction non autorisée");
                });
            }
        });
    }).catch(function(error) {
        console.log(error);
        console.log("Erreur lors de l'envoi du message");
    });

  }

  if(command === 'test'){
    message.channel.send("!newGame");
    setTimeout(function(){message.channel.send("!addPlayer victor mathieu smaug thomas lau²");},500);
    setTimeout(function(){message.channel.send("newRound victor mathieu smaug thomas lau²");},1000);
  }
}


// Log our bot in
client.login(config.token);