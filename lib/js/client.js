var username,socket,tbxUsername,tbxMsg,divChat;
         function window_onload(){
                    divChat = document.getElementById('divChat');//获取聊天窗口id
                    tbxUsername = document.getElementById('tbxUsername');//获取用户名id
                    tbxMsg = document.getElementById('tbxMsg');//获取发送信息id
                    tbxUsername.focus();
                    tbxUsername.select();
                }
                 //发送消息函数
                function addMsg(msg){
                    divChat.innerHTML  += msg +'<br/>';
                    //当聊天内容大于聊天窗口的时候，出现滚动条
                    if (divChat.scrollHeight > divChat.clientHeight) {
                        divChat.scrollTop = divChat.scrollHeight  - divChat.clientHeight;
                    }
                }

                function btnLogin(){
                    if (tbxUsername.value.trim() == '' ){
                             alert('请输入用户名');
                             return;
                        }
                        username = tbxUsername.value.trim();
                        socket = io.connect();//socket作为连接服务器的对象
                        socket.on('connect', function() {
                                    addMsg('你已加入群聊,可以开始聊天了');
                                    //监听sendClients事件获取用户列表
                                    socket.on('sendClients',function(names){
                                        var right = document.getElementById('right');
                                        var str = '<ol>';
                                        names.forEach(function(name){
                                            str += "<li >"  + name + '</li>';
                                        });
                                        right.innerHTML = "用户列表<br/>";
                                        right.innerHTML += str+'</ol>';
                                    });
                                   //监听chat事件获取聊天信息
                                    socket.on('chat',function(data){
                                        addMsg(data.user + '说：' + data.msg);
                                    });
                                   //自己退出群聊，清空用户列表，聊天窗口以及按钮的变化
                                    socket.on('disconnect',function(){
                                        addMsg('你已退出群聊');
                                        document.getElementById('btnSend').disabled = true;
                                        document.getElementById('btnLogout').disabled = true;
                                        document.getElementById('btnLogin').disabled = "";
                                        var right = document.getElementById('right');
                                         right.innerHTML = "用户列表：";
                                    });
                                   //别的用户退出群聊
                                    socket.on('logout',function(name){
                                       addMsg("<small style='color:#ccc;font-size:12px'>" + name + ' 已退出群聊 </small>');
                                    });
                                    //别的用户登录
                                    socket.on('login',function(name){
                                        addMsg("<small style='color:#ccc;font-size:12px'>" + name + ' 已加入群聊 </small>');
                                    });
                                     //用户重复
                                    socket.on('duplicate',function(){
                                        alert('该用户名已被占用');
                                        document.getElementById('btnSend').disabled = true;
                                        document.getElementById('btnLogout').disabled = true;
                                        document.getElementById('btnLogin').disabled = "";
                                    });
                        });
                       //服务器发生错误
                        socket.on('error',function(err){
                            addMsg("与服务器之间的连接发生错误");
                            socket.disconnect();
                            socket.removeAllListeners('connect');
                            io.sockets = {};
                        });
                         //向服务器发送login事件加入群聊
                        socket.emit('login',username);
                        document.getElementById('btnSend').disabled = "";
                        document.getElementById('btnLogout').disabled = "";
                        document.getElementById('btnLogin').disabled =true;
                    }

                    function btnSend(){
                        var msg =  tbxMsg.value;
                        if (msg.length>0) {
                            socket.emit('chat',{user:username,msg:msg});
                            tbxMsg.value = '';
                        }
                    }
                    //单击退出调用函数
                    function btnLogout(){
                        socket.emit('logout',username);
                        socket.disconnect();
                        socket.removeAllListeners('connect');
                        io.sockets = {};
                      //addMsg("<small style='color:#ccc;font-size:12px'>已退出群聊 </small>");
                         document.getElementById('btnSend').disabled ='disabled';
                         document.getElementById('btnLogout').disabled = 'disabled';
                         document.getElementById('btnLogin').disabled = "";
                         var right = document.getElementById('right');
                         right.innerHTML = "用户列表：";
                    }
                   //关闭页面时调用函数
                    function window_onunload(){
                        socket.emit('logout',username);
                        socket.disconnect();
                    }