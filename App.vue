<template>
  <div id="app">
    <div v-if="this.$route.path !== '/Play'">
      <header>
        <nav>
          <ul>
            <li class="nav-item">
              <!--img class="logo" src="../../assets/images/CryHavoc.png" aria-hidden="true"-->
              <router-link :to="{name: 'Home' }">CHBS</router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{name:'NewGame'}">New Game</router-link>
            </li>
            <li class="nav-item">Load Saved Game</li>
            <li class="nav-item">
              <router-link :to="{name: 'AuthorUnit' }">Unit Author</router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{name: 'AuthorBoard' }">Board Author</router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{name: 'AuthorGame' }">Game Author</router-link>
            </li>
          </ul>
        </nav>
      </header>
    </div>
    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
//import HomePage from './Home/HomePage.vue';
//import Router from './router';
/*
import UnitAuthor from './Author/UnitAuthor.vue';
import BoardAuthor from './Author/BoardAuthor.vue';
import NewGame from './Play/NewGame.vue';
import LoadSaved from './Play/LoadSaved.vue';
*/
export default {
  name: "app"
  //components: {
  //HomePage,
  //},
};
</script>

<style>
body {
  background: linear-gradient(to bottom, #555, #999);
  background-attachment: fixed;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}
.mainish {
  margin: 0 auto;
  background-color: white;
  width: 1024px;
  min-height: 300px;
  padding: 30px;
}
header {
  background-color: #999;
  padding-left: 30px;
  padding-right: 30px;
  width: 1024px;
  margin: 0 auto;
}
ul {
  padding: 3px;
  display: flex;
}
.nav-item {
  display: inline-block;
  padding: 5px 10px;
  font-size: 25px;
  border-right: 1px solid #bbb;
}
.logo {
  height: 20px;
}
</style>
