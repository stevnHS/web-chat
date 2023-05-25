let myKey = new JSEncrypt();
// ----------------------------------------------------------
// Contract
const daiAddress = "0x03B01068f5e70a21AF7dEaFc7e712545a894a127";
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
				"internalType": "struct Database.user[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
// The Contract object
const daiContract = new ethers.Contract(daiAddress, daiAbi, signer);

(async()=>{
    const current = await signer.getAddress(); 
    const user = await daiContract.getUser(current);
    
    if(user=='') {          //新用戶
        $('#createModal').modal('show');

        $("#btnCreate").click(async() => {
            const name = $("#name").val()
            if(name=='') return;
            var crypt = new JSEncrypt({default_key_size: 1024});
            crypt.getKey();
            var privateKey = crypt.getPrivateKey();
            
            var blob = new Blob([privateKey], {type: "text/plain;charset=utf-8"});
            var anchor = document.createElement('a');
            anchor.download = name + '_rsa.pem';
            anchor.href = (window.URL || window.webkitURL).createObjectURL(blob);
            anchor.click();

            $('#createModal').modal('hide');
            const createAccount = await daiContract.createAccount(crypt.getPublicKeyB64(), name);
        });
        $('#name').keypress(async(event) => {
            if(event.which == 13){
                const name = $("#name").val()
                if(name=='') return;
                var crypt = new JSEncrypt({default_key_size: 1024});
                crypt.getKey();
                var privateKey = crypt.getPrivateKey();
                
                var blob = new Blob([privateKey], {type: "text/plain;charset=utf-8"});
                var anchor = document.createElement('a');
                anchor.download = name + '.pem';
                anchor.href = (window.URL || window.webkitURL).createObjectURL(blob);
                anchor.click();
                
                $('#createModal').modal('hide');
                const createAccount = await daiContract.createAccount(crypt.getPublicKeyB64(), name);
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
        myKey.setPrivateKey(pemContent)
        $('#exampleModal').modal('hide');
    }

});


// 載入用戶列表
(async()=>{
	const current = await signer.getAddress();
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
			// TODO: 建立加密通道
			const user = await daiContract.getUser(value.addr); //對象的RSA公鑰
			var crypt = new JSEncrypt();
			crypt.setPublicKey(user);

			// 列印訊息
			$("#messages").empty();

			// 發送訊息 I
			$("#message").keypress(function (event) {
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
						
						send(value.addr, crypt.encrypt(message))

						$("#messages").append('<div class="d-flex justify-content-end mb-4"><div class="msg_cotainer_send">' + message + ' <div class="msg_time_send">' + time + '</div></div></div>');
						$("#message").val("");
					}	
				}
			});

			// 發送訊息 II
			$('#send').on('click', function () {
				var message = $('#message').val();
				if(message!='') {
					let date = new Date();
					var month = ('0'+(date.getMonth()+1)).slice(-2);
					var day = ('0'+date.getDate()).slice(-2);
					var hours = ('0'+date.getHours()).slice(-2);
					var minutes = ('0'+date.getMinutes()).slice(-2);
					var time = month + "/" + day+ " " + hours + ":" + minutes;
					
					send(value.addr, crypt.encrypt(message))
					$("#messages").append('<div class="d-flex justify-content-end mb-4"><div class="msg_cotainer_send">' + message + ' <div class="msg_time_send">' + time + '</div></div></div>');
					$("#message").val("");
				}	
			});

			// 監聽合約的事件
			daiContract.on("Send", async(sender, to, ts, content) => {
				console.log('收到一個event');
				
				var decrypted = myKey.decrypt(content);
				var date = new Date(ts * 1000);
				var month = ('0'+(date.getMonth()+1)).slice(-2);
				var day = ('0'+date.getDate()).slice(-2);
				var hours = ('0'+date.getHours()).slice(-2);
				var minutes = ('0'+date.getMinutes()).slice(-2);
				var time = month + "/" + day+ " " + hours + ":" + minutes;

				if(sender == value.addr && to == current)
					$("#messages").append('<div class="d-flex justify-content-start mb-4"><div class="msg_cotainer">' + decrypted + ' <div class="msg_time">' + time + '</div></div></div>');

			});
		})();
	});
})();




// 按 Enter 發送
const send = async(to,m) =>{
   	const send = await daiContract.sendMessage(to,m);
}

/**
 * RSA encryption
 */
var encrypt = new JSEncrypt();
encrypt.setPublicKey('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtNFOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4gwQco1KRMDSmXSMkDwIDAQAB');

var encrypted = encrypt.encrypt('hello world');

var decrypt = new JSEncrypt();
decrypt.setPrivateKey('MIICXQIBAAKBgQDlOJu6TyygqxfWT7eLtGDwajtNFOb9I5XRb6khyfD1Yt3YiCgQ\
WMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76xFxdU6jE0NQ+Z+zEdhUTooNR\
aY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4gwQco1KRMDSmXSMkDwIDAQAB\
AoGAfY9LpnuWK5Bs50UVep5c93SJdUi82u7yMx4iHFMc/Z2hfenfYEzu+57fI4fv\
xTQ//5DbzRR/XKb8ulNv6+CHyPF31xk7YOBfkGI8qjLoq06V+FyBfDSwL8KbLyeH\
m7KUZnLNQbk8yGLzB3iYKkRHlmUanQGaNMIJziWOkN+N9dECQQD0ONYRNZeuM8zd\
8XJTSdcIX4a3gy3GGCJxOzv16XHxD03GW6UNLmfPwenKu+cdrQeaqEixrCejXdAF\
z/7+BSMpAkEA8EaSOeP5Xr3ZrbiKzi6TGMwHMvC7HdJxaBJbVRfApFrE0/mPwmP5\
rN7QwjrMY+0+AbXcm8mRQyQ1+IGEembsdwJBAN6az8Rv7QnD/YBvi52POIlRSSIM\
V7SwWvSK4WSMnGb1ZBbhgdg57DXaspcwHsFV7hByQ5BvMtIduHcT14ECfcECQATe\
aTgjFnqE/lQ22Rk0eGaYO80cc643BXVGafNfd9fcvwBMnk0iGX0XRsOozVt5Azil\
psLBYuApa66NcVHJpCECQQDTjI2AQhFc1yRnCU/YgDnSpJVm1nASoRUnU8Jfm3Oz\
uku7JUXcVpt08DFSceCEX9unCuMcT72rAQlLpdZir876');
var decrypted = decrypt.decrypt(encrypted);
