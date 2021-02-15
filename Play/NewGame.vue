<template>
  <div class="my_main" id="new-game">
    <a href="/home" class="link-btn">Home</a>
    <input type="file" 
      @change="handleFileChange" 
      name="file-chooser" 
      id="file-btn" 
      class="custom-file-input"
      accept=".json"/>
  </div>
</template>

<script>
import BSBoard from '../game-js/GameBoard.js'
import {BSGame, GameSingleton} from "../game-js/GameBase.js"

export default {
  name: 'NewGame',
  props: {
    msg: String,
  },
  props: {
    value: File,
    selectedFile: String
  },
  data: function() {
    return { 
      mGameBoard : null 
      }
  },
  methods: {
    testGameBaseLoad : function(){
      //let theGame = GameSingleton.getInstance(); 
      //let started = theGame.isStarted();
      //if(!started)
        //theGame.init();
    },
    handleFileChange(e) {
      //this.$emit('input', e.target.files[0]);
      //this.selected      let theGame = GameSingleton.getInstance(); 
      let theGame = GameSingleton.getInstance(); 
      let started = theGame.isStarted();
      if(!started)
      {
        theGame.setGameFile(e.target.files[0]);
        theGame.init();
      }
      //File = e.target.files[0];
      //var a = 0;

      //a++;
      // Whenever the file changes, emit the 'input' event with the file data.
      //var file = e.target.files[0];
    }
  },
  mounted (){
    //this.testGameBaseLoad();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1{
    color: olivedrab;
    text-align: center;
    font-size: 50px;
}
.my_main {
  margin: auto;
  padding: 20px;
}
.custom-file-input::-webkit-file-upload-button {
  visibility: hidden;
}
.custom-file-input::before {
  content: 'Scenario';
  display: inline-block;
  background: -webkit-linear-gradient(top, #f9f9f9, #e3e3e3);
  border: 1px solid #999;
  border-radius: 3px;
  padding: 5px 8px;
  outline: none;
  white-space: nowrap;
  -webkit-user-select: none;
  cursor: pointer;
  text-shadow: 1px 1px #fff;
  font-weight: 700;
  font-size: 10pt;
}
.custom-file-input:hover::before {
  border-color: black;
}
.custom-file-input:active::before {
  background: -webkit-linear-gradient(top, #e3e3e3, #f9f9f9);
}
.link-btn{
  display: inline-block;
  background: -webkit-linear-gradient(top, #f9f9f9, #e3e3e3);
  border: 1px solid #999;
  border-radius: 3px;
  padding: 5px 8px;
  outline: none;
  white-space: nowrap;
  -webkit-user-select: none;
  cursor: pointer;
  text-shadow: 1px 1px #fff;
  font-weight: 700;
  font-size: 10pt;
}

</style>
