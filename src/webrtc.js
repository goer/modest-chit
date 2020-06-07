window.getExternalIceServers = true;
import RTCMultiConnection from "rtcmulticonnection";
import getStats from "getstats";
import VideoList from "./videolist.js";

class VideoChat {
  constructor() {
    this.rtcmConnection = new RTCMultiConnection();

    this.rtcmConnection.that = this;

    this.rtcmConnection.socketURL =
      "https://rtcmulticonnection.herokuapp.com:443/";
    this.rtcmConnection.autoCreateMediaElement = false;
    this.rtcmConnection.enableLogs = false;
    this.rtcmConnection.iceServers = [
      { url: "stun:stun4.l.google.com:19302" },
      {
        url: "turn:dev.e-kasbon.co.id:3478",
        username: "123",
        credential: "123"
      },
      {
        url: "turn:numb.viagenie.ca:3478",
        username: "fonetix@gmail.com",
        credential: "goer1thea"
      }
    ];

    this.rtcmConnection.codecs.video = "H.264";

    this.rtcmConnection.session = {
      audio: true,
      video: true
    };

    this.rtcmConnection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true
    };

    this.rtcmConnection.mediaConstraints = {
      video: true,
      audio: true
    };

    this.rtcmConnection.onstream = this.onNewStream;
    this.rtcmConnection.onstreamended = this.onStreamEnded;

    this.localStream = null;
    this.remoteStreams = {};

    this.userid = null;
    this.roomid = null;

    this.rtcmConnection.onNewLocalStream = this.onNewLocalStream;
    this.rtcmConnection.onNewRemoteStream = this.onNewRemoteStream;

    this.videoList = new VideoList();

    this.stats = {};

    //this.getStat();
  }

  stopGetStat(userid) {
    this.stats[userid].result.nomore();
  }
  getStat(userid) {
    var peer = this.rtcmConnection.peers[userid].peer;
    if (!peer) return false;
    var that = this;
    getStats(
      peer,
      function(result) {
        if (!result || !result.connectionType) return;
        that.stats[userid] = { result };
        console.debug("getStat result:", that.stats);
      },
      30000
    );
  }

  getStat_old() {
    var that = this;
    this.rtcmConnection.multiPeersHandler.onPeerStateChanged = function(state) {
      //console.log("getStat:", state, this, that);
      //var peerx = that.rtcmConnection.peers[state.userid].peer;
      //console.log("peer:", peerx);
      if (
        state.iceConnectionState.search(/disconnected|closed|failed/gi) ===
          -1 &&
        !that.rtcmConnection.isConnected
      ) {
        that.rtcmConnection.isConnected = true;

        var peer = that.rtcmConnection.peers[state.userid].peer;
        getStats(
          peer,
          function(result) {
            if (!result || !result.connectionType) return;

            that.stats[state.userid] = { result };
            console.debug("getStat result:", that.stats);
            // "relay" means TURN server
            // "srflx" or "prflx" means STUN server
            // "host" means neither STUN, nor TURN
            // console.debug(
            //   "Incoming stream is using:",
            //   state.userid,
            //   result.connectionType.remote.candidateType
            // );
            // console.debug(
            //   "Outgoing stream is using:",
            //   state.userid,
            //   result.connectionType.local.candidateType
            // );

            // // user external ip-addresses
            // console.debug(
            //   "Remote user ip-address:",
            //   state.userid,
            //   result.connectionType.remote.ipAddress
            // );
            // console.debug(
            //   "Local user ip-address:",
            //   state.userid,
            //   result.connectionType.local.ipAddress
            // );

            // // UDP is a real media port; TCP is a fallback.
            // console.debug(
            //   "Peers are connected on port:",
            //   state.userid,
            //   result.connectionType.transport
            // );
          },
          5000
        );
        return;
      }
    };
  }

  join(userid, roomid) {
    //console.log('funcs',this.onNewLocalStream)

    this.userid = userid;
    this.roomid = roomid;

    this.rtcmConnection.userid = this.userid;
    this.rtcmConnection.openOrJoin(this.roomid);
    console.log("join userid:", this.userid, "roomid: ", this.roomid);
  }

  async stopLocalStream() {
    console.log("stopLocalStream", this.localStream);
    if (this.localStream)
      if (this.localStream.stream) {
        // disconnect with all users
        await this.rtcmConnection.getAllParticipants().forEach(pid => {
          this.rtcmConnection.disconnectWith(pid);
        });
        this.localStream.stream.stop();
        this.remoteStreams = {};
        this.rtcmConnection.closeSocket();
      }
  }

  onNewLocalStream(event, data) {
    console.log("base onNewLocalStream", event, data);
    return true;
  }

  onNewRemoteStream(event, data) {
    console.log("base onNewRemoteStream", event, data);
    return true;
  }

  getStreamById(id) {
    if (this.localStream.id === id) return this.localStream;
    var s = this.remoteStreams[id];
    return s;
  }

  onNewStream(event) {
    //var that = this

    console.log("onNewStream");

    // if (event.type === "local") {
    //   event.mediaElement.muted = true;
    //   event.mediaElement.volume = 0;
    // } else {
    //   event.mediaElement.muted = false;
    //   event.mediaElement.volume = 100;
    // }

    var data = {
      event: event,
      id: event.streamid,
      stream: event.stream,
      userid: event.userid
    };

    this.that.videoList.addVideo(data.id);

    if (event.type === "local") {
      console.log("local !!!!", data);
      data.muted = true;
      this.that.localStream = data;
      this.that.onNewLocalStream(event, data);
      console.log("local ok");
    } else {
      console.log("remote", data);
      this.that.getStat(data.userid);
      data.muted = false;
      this.that.remoteStreams[data.id] = data;
      this.that.onNewRemoteStream(event, data);
    }
  }

  onRemoteEnded(id, stream) {
    console.log("onRemoteEnded", id, stream);
    var data = this.that.getStreamById(id);
    this.that.endGetStat(data.userid);
  }

  onRemoteEmpty() {
    console.log("onRemoteEmpty");
  }

  getRemotesCount() {
    return Object.keys(this.remoteStreams).length;
  }

  onStreamEnded(event) {
    console.log("Stream End streamid:" + event.streamid);
    this.that.videoList.removeValue(event.streamid);
    if (event.type === "local") {
      console.log("local");
    } else {
      console.log("remote");
      delete this.that.remoteStreams[event.streamid];
      this.that.onRemoteEnded(
        event.streamid,
        this.that.remoteStreams[event.streamid]
      );
      if (this.that.getRemotesCount() <= 0) this.that.onRemoteEmpty();
    }
  }
}

// module.exports.VideoChat = VideoChat
export default VideoChat;
