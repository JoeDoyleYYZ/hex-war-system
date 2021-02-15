<template>
  <div id="board-div-id">
    Select Board Size:&emsp;&emsp;&emsp;
    <select name="BoardSize" id="boardSizeId">
        <option value="Tiny">Tiny</option>
        <option value="Small">Small</option>
        <option value="Medium">Medium</option>
        <option value="Large">Large</option>
        <option value="Extra Large">Extra Large</option>
        <option value="Gigantic">Gigantic</option>
    </select>
    <br>
    Select Image Underlay:&emsp;&emsp;&emsp;
    <input type="file" id="bgrdFileId" accept=".jpg,.png"/>
    <br>
    Background Transparency:&emsp;&emsp;&emsp;
    <input type="range"  min="0" max="100" value="50" id="bgtransparency">
    <br>
    <button id="start-paint-id" v-on:click="startPaint">Define Terrain</button>
    <br>
    Select Terrain Brush: &emsp;&emsp;&emsp;
    <select name="terrain-type" id="terrain-type-id">
      <option value="none">None</option>  
      <option value="Forest" checked>Forest</option>
      <option value="Clearing">Clearing</option>
      <option value="Mountain">Mountain</option>
      <option value="Town">Town</option>
      <option value="Fortification">Fortification</option>
      <option value="Sea">Sea</option>
      <option value="Low Hill">Low Hill</option>
      <option value="Medium Hill">Medium Hill</option>
      <option value="High Hill">High Hill</option>
      <option value="Road">Road</option>
      <option value="River">River</option>
      <option value="Marsh">Marsh</option>
      <option value="Desert">Desert</option>
    </select>
    <input type="image" src="http://localhost:8082/images/city.jpg" alt="Submit" width="24" height="24">City</image> 
  </div>
</template>

<script>
import {initBoardCreation} from '../../game-js/Initialize.js';
export default {
  name: 'BoardAuthor',
  props: {
    selectedFile: String
  },
  data: function() {
    return { 
      }
  },
  methods: {
    startPaint(){
      initBoardCreation();
    }
  },
  mounted (){
  },

} 
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1{
    color: olivedrab;
    text-align: center;
    font-size: 50px;
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
</style>
