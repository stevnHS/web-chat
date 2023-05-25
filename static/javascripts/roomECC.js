let myKey = null;
// ----------------------------------------------------------
// Contract
const daiAddress = "0x7fE1A1704b71352b98056C1f1b9768C6EF56F1fC";
const daiAbi = [
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
				"internalType": "struct DatabaseECC.user[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const daiContract = new ethers.Contract(daiAddress, daiAbi, signer);

(async()=>{
    const current = await signer.getAddress();
    const user = await daiContract.getUser(current);
    
    if(user=='') {          //新用戶
        $('#createModal').modal('show');

        $("#btnCreate").click(async() => {
            const name = $("#name").val()
            if(name=='') return;

            const keyPair = eccryptoJS.generateKeyPair();
            var privateKey = keyPair.privateKey.toString('hex');
            var publicKey = keyPair.publicKey.toString('hex');
            
            var blob = new Blob([privateKey], {type: "text/plain;charset=utf-8"});
            var anchor = document.createElement('a');
            anchor.download = name + '_ecc.txt';
            anchor.href = (window.URL || window.webkitURL).createObjectURL(blob);
            anchor.click();

            $('#createModal').modal('hide');
            const createAccount = await daiContract.createAccount(publicKey, name);
        });
        $('#name').keypress(async(event) => {
            if(event.which == 13){
                const name = $("#name").val()
                if(name=='') return;
                const keyPair = eccryptoJS.generateKeyPair();
                var privateKey = keyPair.privateKey.toString('hex');
                var publicKey = keyPair.publicKey.toString('hex');
                
                var blob = new Blob([privateKey], {type: "text/plain;charset=utf-8"});
                var anchor = document.createElement('a');
                anchor.download = name + '_ecc.txt';
                anchor.href = (window.URL || window.webkitURL).createObjectURL(blob);
                anchor.click();

                $('#createModal').modal('hide');
                const createAccount = await daiContract.createAccount(publicKey, name);
            }
        });
    }
})(); 

$(window).on('load',function(){
    $('#exampleModal').modal('show');
});

$("#btn-go").click(function() {
    const fileInput = $($('#file'));
    const file = fileInput[0].files[0];
    const reader = new FileReader();
    reader.readAsText(file, 'utf-8');

    reader.onload = function(e) {
        var pemContent = e.target.result;
        myKey = eccryptoJS.hexToBuffer(pemContent);
        $('#exampleModal').modal('hide');
    }

});


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
			const user = await daiContract.getUser(value.addr); //對象的ECC公鑰
		
			var publicKey = eccryptoJS.hexToBuffer(user);

			// 列印訊息
			$("#messages").empty();

			// 發送訊息 I
			$("#message").keypress((event) => {
				if (event.which == 13) {
					// 獲取輸入的訊息
					var message = $('#message').val();
					if(message!='') {
						let date = new Date();
						var month = ('0'+(date.getMonth()+1)).slice(-2);
						var day = ('0'+date.getDate()).slice(-2);
						var hours = ('0'+date.getHours()).slice(-2);
						var minutes = ('0'+date.getMinutes()).slice(-2);
						var time = month + "/" + day+ " " + hours + ":" + minutes;
						
						(async() =>{
							const encrypted = await eccryptoJS.encrypt(publicKey, eccryptoJS.utf8ToBuffer(message));         // 對方公鑰加密

							let data = JSON.stringify({
								iv: encrypted.iv.toString('hex'),
								ciphertext: encrypted.ciphertext.toString('hex'),
								mac: encrypted.mac.toString('hex'),
								ephemPublicKey: encrypted.ephemPublicKey.toString('hex')
							});

							send(value.addr, data)
						})();

						$("#messages").append('<div class="d-flex justify-content-end mb-4"><div class="msg_cotainer_send">' + message + ' <div class="msg_time_send">' + time + '</div></div></div>');
						$("#message").val("");
					}	
				}
			});

			// 發送訊息 II
			$('#send').on('click', () => {
				var message = $('#message').val();
				if(message!='') {
					let date = new Date();
					var month = ('0'+(date.getMonth()+1)).slice(-2);
					var day = ('0'+date.getDate()).slice(-2);
					var hours = ('0'+date.getHours()).slice(-2);
					var minutes = ('0'+date.getMinutes()).slice(-2);
					var time = month + "/" + day+ " " + hours + ":" + minutes;
					(async() =>{
						const encrypted = await eccryptoJS.encrypt(publicKey, eccryptoJS.utf8ToBuffer(message));         // 對方公鑰加密

						let data = JSON.stringify({
							iv: encrypted.iv.toString('hex'),
							ciphertext: encrypted.ciphertext.toString('hex'),
							mac: encrypted.mac.toString('hex'),
							ephemPublicKey: encrypted.ephemPublicKey.toString('hex')
						});

						send(value.addr, data)
					})();

					$("#messages").append('<div class="d-flex justify-content-end mb-4"><div class="msg_cotainer_send">' + message + ' <div class="msg_time_send">' + time + '</div></div></div>');
					$("#message").val("");  
				}	
			});

			// 監聽合約的事件
			daiContract.on("Send", async(sender, to, ts, content) => {
				console.log('收：' + content);
				const current = await signer.getAddress();

				// 資料接收
				let encryptedContent = JSON.parse(content);
				encryptedContent = {
					iv: eccryptoJS.hexToBuffer(encryptedContent.iv),
					ciphertext: eccryptoJS.hexToBuffer(encryptedContent.ciphertext),
					mac: eccryptoJS.hexToBuffer(encryptedContent.mac),
					ephemPublicKey: eccryptoJS.hexToBuffer(encryptedContent.ephemPublicKey)
				}

				const decrypted = await eccryptoJS.decrypt(myKey, encryptedContent);  // 自己的私鑰解密
				var date = new Date(ts * 1000);
				var month = ('0'+(date.getMonth()+1)).slice(-2);
				var day = ('0'+date.getDate()).slice(-2);
				var hours = ('0'+date.getHours()).slice(-2);
				var minutes = ('0'+date.getMinutes()).slice(-2);
				var time = month + "/" + day+ " " + hours + ":" + minutes;

				if(sender == value.addr && to == current)
					$("#messages").append('<div class="d-flex justify-content-start mb-4"><div class="msg_cotainer">' + decrypted.toString() + ' <div class="msg_time">' + time + '</div></div></div>');

			});
		})();
	});
})();

// // 按 Enter 發送
const send = async(to,m) =>{
   	const send = await daiContract.sendMessage(to,m);
}

// ECC 加密
(async()=>{
    const keyPair = eccryptoJS.generateKeyPair();
    hex = keyPair.privateKey.toString('hex')

    var pri = eccryptoJS.hexToBuffer(hex);
    const str = '你好';
    const msg = eccryptoJS.utf8ToBuffer(str);
    
    const encrypted = await eccryptoJS.encrypt(keyPair.publicKey, msg);         // 對方公鑰加密

    // ----------------------------------------------
    // 資料傳輸...
    let data = JSON.stringify({
        iv: encrypted.iv.toString('hex'),
        ciphertext: encrypted.ciphertext.toString('hex'),
        mac: encrypted.mac.toString('hex'),
        ephemPublicKey: encrypted.ephemPublicKey.toString('hex')
    });
    
    // ----------------------------------------------
    // 資料接收
    let encryptedContent = JSON.parse(data);
    encryptedContent = {
        iv: eccryptoJS.hexToBuffer(encryptedContent.iv),
        ciphertext: eccryptoJS.hexToBuffer(encryptedContent.ciphertext),
        mac: eccryptoJS.hexToBuffer(encryptedContent.mac),
        ephemPublicKey: eccryptoJS.hexToBuffer(encryptedContent.ephemPublicKey)
    }
    // ----------------------------------------------

    const decrypted = await eccryptoJS.decrypt(pri, encryptedContent);  // 對方私鑰解密
    console.log(decrypted.toString()==str);
})();
