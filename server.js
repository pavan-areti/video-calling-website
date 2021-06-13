var webSocketServ = require('ws').Server;

var wss = new webSocketServ({
  port: process.env.PORT || 9090
})

var users = {};
wss.on('connection',function(conn){
  console.log("user connected");

  conn.on('message',function(message){
    var data;
    try{
      data = JSON.parse(message);
    }
    catch(e){
      console.log("Invalid Json");
      data = {};
    }

    switch (data.type){
      case "login":
          if(users[data.name]){
          sendToAllUsers(conn,{
            type:"login",
            success: false
          })
          }
         else{
          users[data.name]=conn;
          conn.name =  data.name;
          // console.log(conn.name);
          sendToAllUsers(conn,{
            type:"login",
            success: true
          })
        }
        // console.log(users[data.name]);
       break;
      case "offer":
          console.log(data);
          var connect = users[data.name];
          console.log(connect);
          if(connect != null){
            conn.otherUser = data.name;
            sendToAllUsers(connect,{
              type:"offer",
              offer:data.offer,
              name:conn.name,
            });
          }
          break;
      case "answer":

          var connect = users[data.name];

          if(connect!=null){
            conn.otherUser = data.name;
            sendToAllUsers(connect,{
              type:"answer",
              answer:data.answer
            })
          }
          break;
      case "candidate":
        var connect = users[data.name];
        if(connect !=null){
          sendToAllUsers(connect,{
            type:"candidate",
            candidate:data.candidate
          })
        }
        break;
        case "reject":
          var connect = users[data.name];
          if(connect !=null){
            sendToAllUsers(connect,{
              type:"reject",
              name:conn.name
            })
          }
          break;
          case "accept":
            var connect = users[data.name];
            if(connect !=null){
              sendToAllUsers(connect,{
                type:"accept",
                name:conn.name
              })
            }
            break;
          case "leave":
              // var connect = users[data.name];
              // connect.otherUser = null;
              if(connect !=null){
                sendToAllUsers(connect,{
                  type:"leave",
                })
              }
            break;

            default:
             sendToAllUsers(conn,{
               type:"error",
               message:"command not found "+data.type
             });
            break;
    }
  })
  conn.on('close',function(){
    console.log("closed");

    if(conn.name){
      delete users[conn.name];
      if(conn.otherUser){
        var connect = users[conn.otherUser];
        connect.otherUser = null;
        if(conn !=null){
          sendToAllUsers(connect,{
            type:"leave"
          });
        }
      }
    }

  })
  // conn.send({"hello world"})
})

function sendToAllUsers(connection,message){
  connection.send(JSON.stringify(message))
}
