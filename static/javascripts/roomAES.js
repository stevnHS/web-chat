let myPK = null;
/* ------------------------
Opening Page
------------------------ */ 
$(window).on('load',function(){
    $('#exampleModal').modal('show');
});

// 獲得使用者私鑰，並更新合約
$("#btn-go").click(function() {
	if($("#key").val() == "") {
		return;
	}
	$("#exampleModal").modal("hide");
	var key = CryptoJS.PBKDF2($("#key").val(), "", {keySize: 256 / 32}).toString();
	myPK = ec.keyFromPrivate(key);

	const bnX = myPK.getPublic().getX().toString(16);
	const bnY = myPK.getPublic().getY().toString(16);
	const hexStringPublicKey = '04' + bnX.toString(16) + bnY.toString(16);

	(async()=>{
		const user = await daiContract.getUser(currentAccount);
		if(user=='') {
			$('#createModal').modal('show');
			$("#btnCreate").click(async() => {
				if($('#name').val()=='') { return; }
				const name = $("#name").val()
				const createAccount = await daiContract.createAccount(hexStringPublicKey, name);
				$('#createModal').modal('hide');
			});
			$('#name').keypress(async(event) => {
				if (event.which == 13) {
					if($('#name').val()=='') { return; }
					const name = $("#name").val()
					const createAccount = await daiContract.createAccount(hexStringPublicKey, name);
					$('#createModal').modal('hide');
				}
			});
			  
		}else if(user!=hexStringPublicKey){
			const user = await daiContract.setUser(hexStringPublicKey);
		}
	})();

});
$('#key').keypress((event) => {
	if (event.which == 13) {
		if($("#key").val() == "") {
			return;
		}
		$("#exampleModal").modal("hide");
		var key = CryptoJS.PBKDF2($("#key").val(), "", {keySize: 256 / 32}).toString();
		myPK = ec.keyFromPrivate(key);
	
		const bnX = myPK.getPublic().getX().toString(16);
		const bnY = myPK.getPublic().getY().toString(16);
		const hexStringPublicKey = '04' + bnX.toString(16) + bnY.toString(16);
	
		(async()=>{
			const user = await daiContract.getUser(currentAccount);
			if (user == '') {
				$('#createModal').modal('show');
				$("#btnCreate").click(async () => {
					if ($('#name').val() == '') { return; }
					const name = $("#name").val()
					const createAccount = await daiContract.createAccount(hexStringPublicKey, name);
					$('#createModal').modal('hide');
				});
				$('#name').keypress(async (event) => {
					if (event.which == 13) {
						if ($('#name').val() == '') { return; }
						const name = $("#name").val()
						const createAccount = await daiContract.createAccount(hexStringPublicKey, name);
						$('#createModal').modal('hide');
					}
				});

			}else if(user!=hexStringPublicKey){
				const user = await daiContract.setUser(hexStringPublicKey);
			}
		})();
	}
});

// ----------------------------------------------------------
// Contract
const daiAddress = "0x660c4E3BaEeDAD7091071AEa2063e9ac8CB1420c";
const daiAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ts",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "content",
				"type": "string"
			}
		],
		"name": "Send",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "pk",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "createAccount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "friend_key",
				"type": "address"
			}
		],
		"name": "getUser",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getUserList",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "addr",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					}
				],
				"internalType": "struct Database.user[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "friend_key",
				"type": "address"
			}
		],
		"name": "readMessage",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "msg",
						"type": "string"
					}
				],
				"internalType": "struct Database.message[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "friend_key",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_msg",
				"type": "string"
			}
		],
		"name": "sendMessage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "pk",
				"type": "string"
			}
		],
		"name": "setUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
// The Contract object
const daiContract = new ethers.Contract(daiAddress, daiAbi, signer);


// -----------------------------------------------------------
// ECDH的共享密鑰
const EC = elliptic.ec;
const ec = new EC('secp256k1');

// 載入用戶列表
(async()=>{
    const userList = await daiContract.getUserList();
    console.log(userList);

    $.each(userList, function(index, value) {
		console.log(value.addr);
		if (currentAccount.toLowerCase() != value.addr.toLowerCase()) {
			$('#userList').append('<button type="button" class="btn btn-secondary w-100 item-user" data-index="' + index +'">' + value.name + '</button>');
		}
    });

	$('.item-user').on('click', function() {
		var index = $(this).data('index');
		var value = userList[index];

		// 點擊
		$('#username').text(value.name);

		(async() =>{
			// 建立加密通道
			const user = await daiContract.getUser(value.addr);
			const userKey = ec.keyFromPublic(user, 'hex');
			const ssKey = myPK.derive(userKey.getPublic());
			
			// 列印訊息
			const read = await daiContract.readMessage(value.addr);
			$("#messages").empty();

			for (var i = 0; i < read.length; i++) {
				var message_sender = read[i].sender; 
				var message = read[i].msg;
				var date = new Date(read[i].timestamp * 1000);

				var month = ('0'+(date.getMonth()+1)).slice(-2);
				var day = ('0'+date.getDate()).slice(-2);
				var hours = ('0'+date.getHours()).slice(-2);
				var minutes = ('0'+date.getMinutes()).slice(-2);

				var time = month + "/" + day+ " " + hours + ":" + minutes;

				var bytes  = CryptoJS.AES.decrypt(message, ssKey.toString(16));
				var decrypted = bytes.toString(CryptoJS.enc.Utf8);

				if(currentAccount.toLowerCase() != message_sender.toLowerCase())	
					$("#messages").append('<div class="d-flex justify-content-start mb-4"><div class="msg_cotainer">' + decrypted + ' <div class="msg_time">' + time + '</div></div></div>');
				else			// 我的我的我的我的
					$("#messages").append('<div class="d-flex justify-content-end mb-4"><div class="msg_cotainer_send">' + decrypted + ' <div class="msg_time_send">' + time + '</div></div></div>');
			}

			// 發送訊息 I
			$("#message").keypress(function (event) {
				if (event.which == 13) {
					// 獲取輸入的訊息
					var message = $(this).val();
					if(message!='') {
						var ciphertext = CryptoJS.AES.encrypt(message, ssKey.toString(16)).toString();
						send(value.addr, ciphertext)
						$("#message").val("");
					}
				}
			});

			// 發送訊息 II
			$('#send').on('click', function () {
				var message = $('#message').val();
				if(message!='') {
					var ciphertext = CryptoJS.AES.encrypt(message, ssKey.toString(16)).toString();
					send(value.addr, ciphertext)
					$("#message").val("");
				}	
			});

			// 監聽合約的事件
			daiContract.on("Send", async(sender, to, ts, content) => {
				var bytes  = CryptoJS.AES.decrypt(content, ssKey.toString(16));
				var decrypted = bytes.toString(CryptoJS.enc.Utf8);
				const current = await signer.getAddress();

				var date = new Date(ts * 1000);
				var month = ('0'+(date.getMonth()+1)).slice(-2);
				var day = ('0'+date.getDate()).slice(-2);
				var hours = ('0'+date.getHours()).slice(-2);
				var minutes = ('0'+date.getMinutes()).slice(-2);
				var time = month + "/" + day+ " " + hours + ":" + minutes;
				if(sender == current && to == value.addr)
					$("#messages").append('<div class="d-flex justify-content-end mb-4"><div class="msg_cotainer_send">' + decrypted + ' <div class="msg_time_send">' + time + '</div></div></div>');
				if(sender == value.addr, to == current)
					$("#messages").append('<div class="d-flex justify-content-start mb-4"><div class="msg_cotainer">' + decrypted + ' <div class="msg_time">' + time + '</div></div></div>');
			});
		})();
	});
})();

/**----------------------------------------------------------------
 * 可呼叫函式
 */

  
// // event handlers
// daiContract.on("Send",(sender,ts,content)=>{
//     console.log("event handler");
    
//     $("#messages").append("<li class='list-group-item'>" + content + "</li>");
// });


// 按 Enter 發送
const send = async(to,m) =>{
   	const send = await daiContract.sendMessage(to,m);
}



// Generate keys
var key1 = ec.genKeyPair();
var key2 = ec.genKeyPair();

var shared1 = key1.derive(key2.getPublic());
var shared2 = key2.derive(key1.getPublic());

// (假設已完成交換)
// alice 對訊息加密
var ciphertext = CryptoJS.AES.encrypt("測試 ， AES加密訊息", shared1.toString(16)).toString();
console.log(ciphertext);

// bob 解密
var bytes  = CryptoJS.AES.decrypt(ciphertext, shared2.toString(16));
var decrypted = bytes.toString(CryptoJS.enc.Utf8);

console.log(decrypted);
