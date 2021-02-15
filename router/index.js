import Vue from 'vue';
import Router from 'vue-router';
import HomePage from '../Home/HomePage.vue';
import UnitAuthor from '../Author/Unit/UnitAuthor.vue';
import BoardAuthor from '../Author/Board/BoardAuthor.vue';
import GameAuthor from '../Author/Game/GameAuthor.vue';
import NewGame from '../Play/NewGame.vue'

Vue.use(Router);


export default new Router({
    routes: 
    [
        {
            path: '/', 
            name: 'Home',
            component: HomePage, 
        },
        {
            path: '/Play', 
            name: 'NewGame',
            component: NewGame, 
        },
        {
            path: '/Author/Unit', 
            name: 'AuthorUnit',
            component: UnitAuthor, 
        },
        {
            path: '/Author/Board', 
            name: 'AuthorBoard',
            component: BoardAuthor, 
        },
        {
            path: '/Author/Game', 
            name: 'AuthorGame',
            component: GameAuthor, 
        },
    ],
});
