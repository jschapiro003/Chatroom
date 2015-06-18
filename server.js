
var mongo = require('mongodb').MongoClient,
	client = require('socket.io').listen(1870).sockets;

mongo.connect('mongodb://127.0.0.1/chat',function(err,db){

	if(err) throw err;

	client.on('connection',function(socket){
		
		var collection = db.collection('messages'),
			sendStatus = function(s){

				socket.emit('status',s);

			};
		console.log('new user entered the room')
		//emit all messages

		collection.find().limit(100).sort({_id:1}).toArray(function(err,res){

			if(err) throw err;
			socket.emit('output',res);
		});

		//wait for input
		socket.on('input',function(data){

			var name = data.name,
				message = data.message,
				whitespacePattern=/^\s*$/;

				if(whitespacePattern.test(name) || whitespacePattern.test(message)){
					
					sendStatus('Name and message is required.');

				}else {

					collection.insert({name:name, message: message},function(){
						//emit latest message to all clients
						client.emit('output',[data]);

						sendStatus({

							message: "message sent",
							clear:true
						});
					});

				}

		});

	});
	
})
