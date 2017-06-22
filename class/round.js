var Round = function(owner,players){
    var playersSliced=players.slice(0);
    playersSliced.shift();
    this.owner=owner;
    this.players=playersSliced;
    this.indexOfPlayerWhoTook;
    this.indexOfPlayerCalled;
    this.isWon;
    this.mise;
    this.ecartScore;
    this.state=0;
}

exports.Round=Round;
