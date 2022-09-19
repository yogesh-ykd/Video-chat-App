const socket=io('/');

const mypeer=new Peer(undefined,{
    path: '/peerjs',
    host:'/',
    port:'443'
})

mypeer.on('open',(id)=>{
    socket.emit('join-room',Room_id,id);
})

const peers={}

let myvideostream;

const video_grid=document.getElementById('video-grid');

const myvideo=document.createElement('video');
myvideo.muted=true;

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then((stream)=>{
    myvideostream=stream;
    addVideoStream(myvideo,stream);

    mypeer.on('call',(call)=>{
        call.answer(stream);
        const video=document.createElement('video');
        call.on('stream',userStream=>{
            addVideoStream(video,userStream);
        })
    })

    socket.on('user-connected',(peer_id)=>{
        setTimeout(() => {
            // user joined
            connectToNewUser(peer_id, stream)
          }, 1000)
    })
})

socket.on('user-disconnected', (peer_id) => {
    if (peers.peer_id) peers.peer_id.close()
  })

const send_button=document.getElementById('send_button');
const input_message=document.getElementById('input_message');
send_button.addEventListener('click',function(e){
    e.preventDefault();
    if(input_message.value){
        socket.emit('message',input_message.value);
        input_message.value='';
    }
})

const main_chat_middle=document.getElementById('main_chat_middle');

socket.on('message-to-all',(msg)=>{
    const t=document.createElement('p');
    t.innerHTML=msg;
    main_chat_middle.appendChild(t);
})

function addVideoStream(video,stream){
    video.srcObject=stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play();
    })
    video_grid.append(video);
}

function connectToNewUser(peer_id,stream){
    const call=mypeer.call(peer_id,stream);
    const video=document.createElement('video');
    call.on('stream',userStream=>{
        addVideoStream(video,userStream);
    })
    call.on('close',()=>{
        video.remove();
    })
    peers.peer_id=call;
}

function muteunmute(){
    const enabled=myvideostream.getAudioTracks()[0].enabled;
    if(enabled){
        myvideostream.getAudioTracks()[0].enabled=false;
        setunmutebutton();
    }
    else
    {
        setmutebutton();
        myvideostream.getAudioTracks()[0].enabled=true;
    }
}

function setmutebutton(){
    const html=`<i class="fas fa-microphone"></i>
    <span>Mute</span>`;
    document.querySelector('.main_mute_button').innerHTML=html;
}

function setunmutebutton(){
    const html=`<i style="color:red;" class="fas fa-microphone-slash"></i>
    <span>Unmute</span>`;
    document.querySelector('.main_mute_button').innerHTML=html;
}

function playstop(){
    const enabled=myvideostream.getVideoTracks()[0].enabled;
    if(enabled){
        myvideostream.getVideoTracks()[0].enabled=false;
        setstopbutton();
    }
    else
    {
        setplaybutton();
        myvideostream.getVideoTracks()[0].enabled=true;
    }
}

function setplaybutton(){
    const html=`<i class="fas fa-video"></i>
    <span>Stop Video</span>`;
    document.querySelector('.main_video_button').innerHTML=html;
}

function setstopbutton(){
    const html=`<i style="color:red;" class="fas fa-video-slash"></i>
    <span>Play Video</span>`;
    document.querySelector('.main_video_button').innerHTML=html;
}
