// call 설정
const  { CallClient , VideoStreamRenderer , LocalVideoStream }  =  require ( '@azure/communication-calling' ) ;
const { AzureCommunicationTokenCredential } = require('@azure/communication-common');


let call;
let callAgent;
let tokenCredential = "";
const userToken = document.getElementById("token-input");
const calleeInput = document.getElementById("callee-id-input");
const submitToken = document.getElementById("token-submit");
const callButton = document.getElementById("call-button");
const hangUpButton = document.getElementById("hang-up-button");
const acceptCallButton = document.getElementById('accept-call-Button');

/* 클라이언트 인증 */
submitToken.addEventListener("click", async () => {
    const callClient = new CallClient();
    const userTokenCredential = userToken.value;
    try {
        tokenCredential = new AzureCommunicationTokenCredential(userTokenCredential);
        callAgent = await callClient.createCallAgent(tokenCredential);
        callButton.disabled = false;
        submitToken.disabled = true;
    } catch (error) {
        window.alert("Please submit a valid token!");
    }
})

/* 호출 시작 */
callButton.addEventListener("click", () => {
    // start a call
    const userToCall = calleeInput.value;

    // To call an Azure Communication Services communication user, use {communicationUserId: 'ACS_USER_ID'}.
    // To call echo bot, use {id: '8:echo123'}.
    call = callAgent.startCall([{ id: userToCall }], {  });
    // Subscribe to the call's properties and events.

    // toggle button states
    hangUpButton.disabled = false;
    callButton.disabled = true;
});

/* 호출 종료 */
hangUpButton.addEventListener("click", () => {
    // end the current call
    call.hangUp({ forEveryone: true });

    // toggle button states
    hangUpButton.disabled = true;
    callButton.disabled = false;
    submitToken.disabled = false;
});


// Subscribe to a call obj.
// Listen for property changes and collection udpates.
const subscribeToCall = (call) => {
    try {
        // Inspect the initial call.id value.
        console.log(`Call Id: ${call.id}`);
        //Subsribe to call's 'idChanged' event for value changes.
        call.on('idChanged', () => {
            console.log(`Call Id changed: ${call.id}`); 
        });

        // Inspect the initial call.state value.
        console.log(`Call state: ${call.state}`);
        // Subscribe to call's 'stateChanged' event for value changes.
        call.on('stateChanged', async () => {
            console.log(`Call state changed: ${call.state}`);
            if(call.state === 'Connected') {
                callButton.disabled = false;
                acceptCallButton.disabled = true;
            } else if (call.state === 'Disconnected') {
                acceptCallButton.disabled = false;
                callButton.disabled = false;
                console.log(`Call ended, call end reason={code=${call.callEndReason.code}, subCode=${call.callEndReason.subCode}}`);
            }   
        });

        call.localVideoStreams.forEach(async (lvs) => {
            localVideoStream = lvs;
            //await displayLocalVideoStream();
        });
        call.on('localVideoStreamsUpdated', e => {
            e.added.forEach(async (lvs) => {
                localVideoStream = lvs;
                //await displayLocalVideoStream();
            });
            e.removed.forEach(lvs => {
               removeLocalVideoStream();
            });
        });
        
    } catch (error) {
        console.error(error);
    }
}