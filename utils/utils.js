function capitalize(s)
{
    return s[0].toUpperCase() + s.slice(1);
}

function reactToThenCallSetTimeout(message,emojiSet,index,messageState){
    message.react(emojiSet[index]).then((messageReaction)=> {
        index++;
        if(index==emojiSet.length-1){
            setTimeout(reactToWithMessageReady.bind(null, messageReaction.message,emojiSet,index,messageState)    
            ,500);
        } else {
            setTimeout(reactToThenCallSetTimeout.bind(null, messageReaction.message,emojiSet,index,messageState)    
            ,500);
        }
    })
}

function reactToWithMessageReady(message,emojiSet,index,messageState){
    message.react(emojiSet[index]).then((message)=> {
        messageState.isMessageReady=true;
    }); 
}

function reactEmojiSetTo(message,emojiSet,messageState){
   messageState.isMessageReady=false;
   reactToThenCallSetTimeout(message,emojiSet,0,messageState);
}

function sendEmbedMessage(message,client,title,fields,footer){

        message.channel.send({embed: {
        color: 3447003,
        author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
        },
        title: title,
        fields: fields,
        footer: {
            text: footer
        }
    }});
}

function getLines(content,start,end){
    let toReturn="";
    for(i=start;i<end && i<=content.split("  \n").length;i++){
        toReturn+=content.split("  \n")[i-1]+"  \n";
    }
    return toReturn;
}

exports.capitalize=capitalize;
exports.reactEmojiSetTo=reactEmojiSetTo;
exports.getLines=getLines;
exports.sendEmbedMessage=sendEmbedMessage;