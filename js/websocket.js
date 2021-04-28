ws = new WebSocket("ws://irc-ws.chat.twitch.tv:80");

ws.onmessage = function (event) {
    if(event["data"].includes("PING :tmi.twitch.tv")){
        ws.send("PONG")
    }
    if(event["data"].includes("PRIVMSG")){

        var message = parseMessage(event["data"])

        renderMessage(message)

        count = 0;

        console.log(message)

    }
};

ws.onopen = function(event){
    ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership")
    ws.send(twitch.key)
    ws.send("NICK "+twitch.channel)
    ws.send("JOIN #"+twitch.channel) 
}

function parseMessage(data){

    var message = {}

    var obj = data.split(";")

    if(obj.length == 16){
        var offset = 1;
    }
    else{
        var offset = 0
    }

    console.log(obj)

    message.user = obj[4].split("=")[1]
    message.color = obj[3].split("=")[1]
    message.text = obj[14+offset].split("PRIVMSG #s_earl :")[1]

    var emotes = obj[5+offset].split("=")[1]
    emotes = emotes.split("/")

    message.emotes = []


    if(obj[5+offset].length != 7){

    for(i=0;i<emotes.length;i++){

        emote = {}

        console.log(emotes[i])

        emote.id = emotes[i].split(",")[0].split(":")[0]
        emote.lower = emotes[i].split(",")[0].split(":")[1].split("-")[0]
        emote.upper = emotes[i].split(",")[0].split(":")[1].split("-")[1]

        message.emotes.push(emote)

    }}

    return message

}

function renderMessage(message){
    
    for(var i = 0; i < message.emotes.length; i++){
        
        message.emotes[i].replace = message.text.substring(message.emotes[i].lower, Number(message.emotes[i].upper)+1);
        
    }
    
    for(var i = 0; i < message.emotes.length; i++){
        
        message.text = message.text.replaceAll(message.emotes[i].replace, " <img src='https://static-cdn.jtvnw.net/emoticons/v2/"+message.emotes[i].id+"/default/light/1.0' style='height:20px;vertical-align: middle;position: relative;'> ")
        
    }
    
    
    

    var html = "";

    html += "<div class='chatMessage slideDown'>"

        html += "<p class='comment' ><b style='color:"+message.color+"'>"+message.user+"</b>: "
        html += message.text+"</p>"

    html += "</div>"

    $(".main").append(html)

    setTimeout(function() {
        $(".slideDown").addClass("slideUp")  
    }, 100);
    
    console.log(message)

}

function cullMessages(){

    if(count == 30){

        $(".chatMessage").first().slideUp(function() { $(this).remove(); } );
        count = 0;

    }

    count++

    if($(".chatMessage").length > 5){

        $(".chatMessage").first().slideUp(function() { $(this).remove(); } );

    }

}

//All this is real bad
var count = 0;
setInterval(function() {
    cullMessages()
}, 1000);
