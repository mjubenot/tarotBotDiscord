const Player = require('./player.js').Player;
const Round = require('./round.js').Round;

var Game = function(){
    this.players=[];
    this.rounds=[];
    this.dateCreation=new Date().getDate();
    this.numberOfRound=1;

}


Game.prototype.addPlayer = function (player){
    if(!(player instanceof Player)){
        player=new Player(player);
    }
    this.players.push(player);
    while(player.score.length<this.rounds.length+1){
        player.score.push(player.score[player.score.length-1]);
    }
};

Game.prototype.addRound = function (round){
    if(round instanceof Round){
        this.rounds.push(round);
        var baseValue=(round.isWon)?round.mise+round.ecartScore:-round.mise-round.ecartScore;
        this.findPlayersByRound(round).forEach(function(player,index){
            if(index==round.indexOfPlayerWhoTook || index==round.indexOfPlayerCalled){
                if(round.indexOfPlayerCalled == round.indexOfPlayerWhoTook){
                    player.score.push(player.score[player.score.length-1]+baseValue*4);
                } else {
                    if(index == round.indexOfPlayerWhoTook){
                        player.score.push(player.score[player.score.length-1]+baseValue*2);
                    } else {
                        player.score.push(player.score[player.score.length-1]+baseValue);
                    }
                }
            } else {    
                player.score.push(player.score[player.score.length-1]-baseValue);
            }
        },this);

        this.players.forEach((player) => {
            while(player.score.length<this.rounds.length+1){
                player.score.push(player.score[player.score.length-1]);
            }
        });
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
    },this);
    return playersInRound;
}

Game.prototype.listPlayerString = function (){
    var toReturn="";
    this.players.forEach(function(player){
        toReturn+=player.name+", ";
    },this);
    return toReturn;
};

exports.Game=Game;
