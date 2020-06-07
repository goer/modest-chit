<template>
  <div>
    <div class="columns">
      <div class="column">
        <h3>Live.CHAT</h3>
      </div>
      <div class="column">
        <button class="btn" style="background-color:black; color:white;">
          <i class="las la-user"></i>
          {{this.ownerid}}
          <i class="las la-home"></i>
          {{this.roomid}}
        </button>
      </div>
    </div>

    <div class="control columns">
      <div class="column">
        <!-- <button class="btn" @click="getRemoteStreams()">Chat</button> -->
        <button class="btn btn-lg" @click="showDialogStopVideo()">
          <i class="las la-power-off"></i>
        </button>
        <button class="btn btn-lg" @click="showDialogStat()">
          <i class="las la-signal"></i>
        </button>
        <!-- <button class="btn btn-lg" @click="switchFull()">
          <i class="las la-sync"></i> 
        </button>-->
        <button class="btn btn-lg" @click="voiceOnOf()">
          <div v-if="this.localStream && this.localStream.event">
            <i v-if="!this.localStream.event.isAudioMuted" class="las la-microphone"></i>
            <i v-if="this.localStream.event.isAudioMuted" class="las la-microphone-slash"></i>
          </div>
        </button>
        <button class="btn btn-lg" @click="videoOnOf()">
          <i v-if="!this.isVideoMuted" class="las la-video"></i>
          <i v-if="this.isVideoMuted" class="las la-video-slash"></i>
        </button>
      </div>
    </div>

    <div class="columns col-oneline">
      <div class="column">
        <span class="videocontainer" v-for="v in this.list_videoStreams" :key="v">
          <video
            class="videoremote"
            @click="chooseVideo(v)"
            autoplay
            playsinline
            volume="100"
            height="100px"
            :ref="v"
            :id="v"
            :srcObject.prop="videoChat.getStreamById(v).stream"
          ></video>
        </span>
      </div>
    </div>

    <div>
      <video class="full" ref="full" autoplay playsinline muted volume="100" width="100%"></video>
    </div>
    <Dialog ref="dialogStat" :isActive="false" :message="mainScreenStatJson"/>
    <Dialog ref="dialogIsContinue" :isActive="false" message="Do you want to continue ?"/>
  </div>
</template>
<script>
import VideoChat from "./webrtc.js";
import Dialog from "./components/Dialog.vue";

export default {
  components: {
    Dialog
  },
  async beforeDestroy() {
    console.log("Before destroy, size:");
    await this.stopVideo();
  },
  beforeCreate() {},
  async beforeMount() {
    this.roomid = this.$route.params.roomid;
    this.ownerid = this.$route.params.userid;
    console.log("params", this.$route.params);

    console.log("create roomid", this.roomid);
    if (!this.roomid || this.roomid === undefined) {
      this.$router.push(-1);
      return false;
    }
    if (!this.ownerid || this.ownerid === undefined) {
      this.$router.push(-1);
      return false;
    }
  },
  async mounted() {
    this.startCall();
  },
  props: {},
  data() {
    return {
      // userid: "",
      roomid: "",
      ownerid: "",
      ownertype: "user",
      room: {},
      owner: {},
      videoChat: new VideoChat(),
      localStream: {},
      // remoteStream: {},
      isWaiting: false,
      isLocalStreamFull: true,
      isContinue: 0,
      isAudioMuted: true,
      isVideoMuted: false,
      mainScreenId: "",
      mainScreenStat: "",
      mainScreenStatJson: "",
      // list_remoteStream: {},
      list_videoStreams: []
    };
  },
  watch: {
    // "videoChat.remoteStreams": () => {
    //   console.log("change remoteStreams", this.videoChat.remoteStreams);
    // }
  },
  computed: {
    // list_remoteStream: ()=>{
    //   if(this.videoChat && this.videoChat.remoteStreams)
    //     return Object.assign({},this.videoChat.remoteStreams)
    //   return {};
    // }
  },
  methods: {
    // getRemoteStreams() {
    //   // this.list_remoteStream = Object.assign({}, this.videoChat.remoteStreams);
    //   // console.log(
    //   //   "list_RemoteStreams",
    //   //   Object.keys(this.list_remoteStream).length,
    //   //   this.list_remoteStream
    //   // );
    // },
    goBack() {
      console.log("goBack");
      this.$router.push("/home");
    },
    updateListVideo() {
      this.list_videoStreams = this.videoChat.videoList.getListVideo();
      console.log("listVideo", this.list_videoStreams);
    },
    showMainScreen() {
      var msid = this.videoChat.videoList.getMainScreen();
      var mss = this.videoChat.getStreamById(msid);
      console.log("showMainScreen", msid, mss);
      this.mainScreenId = msid;
      if (this.videoChat.stat) this.mainScreemStat = this.videoChat.stat[msid];
      this.setVideo("full", mss);
    },
    chooseVideo(v) {
      console.log("renderVideo", v);
      this.videoChat.videoList.chooseValue(v);
      this.drawVideoList();
    },
    showDialogRef(name, message = "", onOk = null, onClose = null) {
      this.$refs[name].onOk = () => {
        this.$refs[name].isActive = false;
      };
      this.$refs[name].onClose = () => {
        this.$refs[name].isActive = false;
      };
      if (onOk) {
        this.$refs[name].onOk = onOk;
      }
      if (onClose) {
        this.$refs[name].onClose = onClose;
      }
      if (message) {
        this.$refs[name].message = message;
      }
      this.$refs[name].isActive = true;
    },
    showDialogStat() {
      var data = this.videoChat.getStreamById(this.mainScreenId);
      var x = this.videoChat.stats[data.userid];
      this.mainScreenStatJson = JSON.stringify(x);
      console.log("stat:", data.userid, x);
      this.showDialogRef("dialogStat", this.mainScreenStatJson);
    },
    drawVideoList() {
      this.updateListVideo();
      this.showMainScreen();
    },
    async startCall() {
      console.log("startCall");

      if (!this.videoChat) return false;

      this.videoChat.onNewLocalStream = async (event, data) => {
        console.log("onNewLocalStream", data);
        this.localStream = data;
        this.drawVideoList();
        //await this.setupLocalStream();
      };
      this.videoChat.onNewRemoteStream = async (event, data) => {
        console.log("onNewRemoteStream", data);
        this.drawVideoList();
        // this.getRemoteStreams();
        // if (this.videoChat.getRemotesCount() === 1) {
        //   this.remoteStream = data;
        //   //await this.setupRemoteStream();
        // }
      };
      this.videoChat.onRemoteEnded = (i, stream) => {
        console.log("videoChat.onRemoteEnded", i, stream);
        this.updateListVideo();
        // this.getRemoteStreams();
        //this.showFirstRemoteStream();
      };
      this.videoChat.onRemoteEmpty = () => {
        console.log("videoChat.onRemoteEmpty");
        //this.goBack();
      };

      this.videoChat.join(this.ownerid, this.roomid);
    },

    // showFirstRemoteStream() {
    //   // var fs = this.getFirstStream();
    //   // if (fs) {
    //   //   this.remoteStream = Object.assign({}, this.videoChat.remoteStreams[fs]);
    //   //   this.setupRemoteStream();
    //   // }
    // },
    // getFirstStream() {
    //   // var ks = Object.keys(this.videoChat.remoteStreams);
    //   // if (ks) {
    //   //   return ks[0];
    //   // }
    //   // return ks;
    // },
    
    async chargeUser() {
      if (this.ownertype === "user") {
        console.log("user has been charged");
      }
      return false;
    },
    showDialogStopVideo() {
      if (this.ownertype === "user") {
        this.showDialogRef("dialogIsContinue", "Do you want to Exit ?", () => {
          this.$refs.dialogIsContinue.isActive = false;
          this.goBack();
        });
      }
    },
    showDialogContinue() {},
    startTimer() {},
    stopTimer() {},
    // switchFull() {
    //   // this.isLocalStreamFull = !this.isLocalStreamFull;
    //   // this.drawVideo();
    // },
    // drawVideo() {
    //   // if (this.isLocalStreamFull) {
    //   //   this.setVideo("full", this.localStream);
    //   //   this.setVideo("mini", this.remoteStream);
    //   // } else {
    //   //   this.setVideo("mini", this.localStream);
    //   //   this.setVideo("full", this.remoteStream);
    //   // }
    // },
    async stopVideo() {
      this.videoChat.stopLocalStream();
    },
    setVideo(name, data) {
      console.log("setVideo", name, data);
      if (!data) {
        console.log("setVideo data invalid");
        return false;
      }
      this.$refs[name].id = data.id;
      this.$refs[name].srcObject = data.stream;
      this.$refs[name].muted = data.muted;
    },
    //async setupLocalStream() {
    // console.log("setupLocalStream", this.localStream);
    // this.setVideo("full", this.localStream);
    // this.userid = this.localStream.event.userid;
    //},
    // showRemoteStream(data) {
    //   // this.remoteStream = Object.assign({}, data);
    //   // this.setupRemoteStream();
    // },
    // async setupRemoteStream() {
    // console.log("setupRemoteStream", this.remoteStream);
    // this.setVideo("mini", this.remoteStream);
    //},
    voiceOnOf() {
      if (this.isAudioMuted) {
        this.localStream.stream.unmute("audio");
        // this.localStream.stream.volume = 100;
        this.isAudioMuted = false;
      } else {
        this.localStream.stream.mute("audio");
        // this.localStream.stream.volume = 0;
        this.isAudioMuted = true;
      }
      console.log("voice status", this.localStream.event);
    },
    videoOnOf() {
      if (this.isVideoMuted) {
        this.localStream.stream.unmute("video");
        this.isVideoMuted = false;
      } else {
        this.localStream.stream.mute("video");
        this.isVideoMuted = true;
      }
      console.log("video status", this.localStream.event);
    }
  }
};
</script>
<style lang="css" scoped>
.videocontainer {
  position: relative;
}
.videoremotetext {
  position: absolute;
  top: 8px;
  left: 20px;
  color: red;
}
.videoremote {
  margin: 4px;
  border-radius: 20px;
}
.btn {
  border-radius: 100px;
  margin: 4px;
  /* opacity: 50%; */
}

.control {
  position: fixed;
  right: 0;
  bottom: 0;
  /* margin-left: 20%; */
}
.full {
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: -100;
  /* background: url(polina.jpg) no-repeat; */
  background-size: cover;
}
</style>
