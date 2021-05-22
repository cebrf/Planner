<template>
  <div>
    <div class="board-title pl-3 h3 text-dark mb-0"
      @mouseover="showBoardEditBtn = true"
      @mouseleave="showBoardEditBtn = false">
      {{ (typeof(this.$store.state.board) !== 'undefined') ? this.$store.state.board.name : "Doard is deleted" }}
      <span class="edit-icon action-icon" v-show="showBoardEditBtn">
        <font-awesome-icon @click="editBoardName" :icon="edit" size="xs"/>
      </span>
      <span class="delete-icon action-icon" v-show="showBoardDeleteBtn">
        <font-awesome-icon @click="deleteBoard" :icon="del" size="xs"/>
      </span>
      <input 
          type="email" 
          v-model="user_email"
          name="user_email"
          value="User email"
          >
      <button v-on:click="sendEmail"> Send invite </button>
      <button class="leaveBtn" v-show="showLeaveBoardBtn" v-on:click="leaveBoard"> Leave board </button>
    </div>
    <Container @drop="onDrop" orientation="horizontal" class="boards" v-if="(typeof(this.$store.state.board) !== 'undefined')">
      <Draggable v-for="list in orderedList" :key="list.id">
        <List :id="list.id" :title="list.title" :cards="list.cards"/>
      </Draggable>
      <AddListButton/>
    </Container>
  </div>
</template>

<script>
  import {faPenAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
  import List from '../components/ui/List'
  import AddListButton from "../components/ui/AddListButton";
  import { Container, Draggable } from "vue-smooth-dnd";

  export default {
    name: "Board",
    created(){
      this.$store.dispatch('fetchLists', this.$route.params.id)
      this.$store.dispatch('currentBoard', this.$route.params.id)
    },
    beforeDestroy(){
      this.$store.state.boardListener()
      this.$store.state.listListener()
    },
    components: {
      List,
      AddListButton,
      Container,
      Draggable
    },
    computed: {
      orderedList: {
        get() {
          if (typeof(this.$store.state.board) !== 'undefined')
            return this.$store.getters.orderedList;
          else {
            console.log("board is deleted");
            return null;
          }
        }
      },
      edit() {
        return faPenAlt
      },
      del() {
        return faTrashAlt
      }
    },
    data() {
      return {
        showBoardEditBtn: false,
        showBoardDeleteBtn: (this.$store.getters.isBoardCreator(this.$route.params.id)),
        showLeaveBoardBtn: !(this.$store.getters.isBoardCreator(this.$route.params.id)),
        user_email: ''
      }
    },
    methods: {
      sendEmail: function () {
        this.$store.dispatch('addUserInBoard', {
          email: this.user_email,
          boardId: this.$route.params.id
        });

        this.$store.dispatch('sendInvite', {
          email: this.user_email,
          boardId: this.$route.params.id
        });
      },
      leaveBoard: function () {
        if(confirm("Do you really want to leave this board?")){
          this.$store.dispatch('leaveBoard', this.$route.params.id);

          this.$router.push('/');
        }
      },
      editBoardName() {
        // TODO
      },
      deleteBoard() {
        if(confirm("Do you really want to delete?")){
          console.log("Deleted", this.$route.params.id);

          this.$store.dispatch('deleteBoard', {
            boardId: this.$route.params.id
          });

          this.$router.push('/');
        } else {
          console.log("NOT deleted", this.$route.params.id);
        }
      },
      onDrop (dropResult) {
        const { removedIndex, addedIndex } = dropResult;

        if(removedIndex !== addedIndex){
          let originalArray = this.$store.state.board.lists;

          const movedItem = originalArray.find((item, index) => index === removedIndex);
          const remainingItems = originalArray.filter((item, index) => index !== removedIndex);

          const reorderedItems = [
            ...remainingItems.slice(0, addedIndex),
            movedItem,
            ...remainingItems.slice(addedIndex)
          ];

          this.$store.dispatch('updateBoard',{ boardId: this.$route.params.id, newLists: reorderedItems});
        }
      }
    }
  }
</script>

<style scoped>
  .board-title{
    margin-left: 1.0rem;
    padding: 1.0rem;
    display: inline-block;
  }

  .leaveBtn{
    text-align: right;
  }

  .boards{
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    align-items: flex-start;
    padding: 0.5rem 2rem 1rem 2rem;
    height: calc(100vh - 4rem - 33px);
  }

  .action-icon{
    margin-left: 1.0rem;
  }

  .action-icon:hover {
    background: rgba(211, 215, 217, 0.7);
    cursor: pointer;
  }
</style>